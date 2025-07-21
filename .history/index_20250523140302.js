const express = require("express");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { getSheetData } = require("./sheets");
const { createPdf } = require("./pdf");
const { uploadToDrive } = require("./drive");
const {
  sanitizeFilename,
  formatSafeThaiDateTimeForFilename
} = require("./utils");

require("dotenv").config();

const app = express();
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets.readonly",
  ],
});

app.post("/sheet-updated", async (req, res) => {
  try {
    const rowNumber = parseInt(req.body.triggerRow) || 2;
    const client = await auth.getClient();

    const data = await getSheetData(client, rowNumber);
    const pdfPath = await generatePdfFile(data);
    const fileId = await uploadToDrive(client, pdfPath);

    if (!fileId) throw new Error("Upload failed");

    const driveUrl = await shareFileAndGetUrl(client, fileId);
    await deleteOldFileIfExists(client, rowNumber);
    await updateSheetWithUrl(client, rowNumber, driveUrl);
    cleanTempFolder();

    res.status(200).send("Success");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

function generatePdfFile(data) {
  const safeDateTime = formatSafeThaiDateTimeForFilename();
  const safeSubstationCode = sanitizeFilename(data.FORM_SUBSTATION);
  const safeNameSupervisor1 = sanitizeFilename(data.FORM_SV1);
  const filePath = `temp/${safeSubstationCode}/${safeNameSupervisor1}_${safeDateTime}.pdf`;
  return createPdf(data, filePath);
}

async function shareFileAndGetUrl(authClient, fileId) {
  const drive = google.drive({ version: "v3", auth: authClient });
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });
  return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
}

async function deleteOldFileIfExists(authClient, rowNumber) {
  const sheets = google.sheets({ version: "v4", auth: authClient });
  const range = `Permit Form!AF${rowNumber}`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range,
  });

  const existingUrl = res.data.values?.[0]?.[0];
  if (existingUrl?.includes("drive.google.com")) {
    const match = existingUrl.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    const oldFileId = match?.[1];

    if (oldFileId) {
      const drive = google.drive({ version: "v3", auth: authClient });
      try {
        await drive.files.delete({ fileId: oldFileId });
        console.log(`Deleted old file: ${oldFileId}`);
      } catch (err) {
        console.warn(`Failed to delete old file: ${oldFileId}`, err.message);
      }
    }
  }
}

async function updateSheetWithUrl(authClient, rowNumber, url) {
  const sheets = google.sheets({ version: "v4", auth: authClient });
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: `Permit Form!AF${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [[url]] },
  });
}

function cleanTempFolder() {
  try {
    const tempRoot = path.join(__dirname, "temp");
    if (fs.existsSync(tempRoot)) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn("Failed to clean temp folder:", err.message);
  }
}

app.listen(3000, () => console.log("Server listening on port 3000"));
