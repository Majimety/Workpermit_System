const express = require("express");
const { getSheetData } = require("./sheets");
const { createPdf } = require("./pdf");
const { uploadToDrive } = require("./drive");
const { google } = require("googleapis");
const { sanitizeFilename, formatSafeThaiDateTimeForFilename} = require("./utils");
const fs = require("fs");
const path = require("path");
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

    const safeDateTime = formatSafeThaiDateTimeForFilename();
    const safeSubstationCode = sanitizeFilename(data.FORM_SUBSTATION);
    const safeNameSupervisor1 = sanitizeFilename(data.FORM_SV1);
    const filePath = `temp/${safeSubstationCode}/${safeNameSupervisor1}_${safeDateTime}.pdf`;

    const pdfPath = await createPdf(data, filePath);
    const fileId = await uploadToDrive(client, pdfPath);

    if (!fileId) throw new Error("Upload failed");

    const drive = google.drive({ version: "v3", auth: client });
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    const driveUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    const sheets = google.sheets({ version: "v4", auth: client });
    const existingValueRes = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: `Permit Form!AF${rowNumber}`,
    });

    const existingUrl = existingValueRes.data.values?.[0]?.[0];
    if (existingUrl) {
    const match = existingUrl.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    const oldFileId = match?.[1];
      if (oldFileId) {
        try {
          await drive.files.delete({ fileId: oldFileId });
          console.log(`Deleted old file: ${oldFileId}`);
        } catch (deleteErr) {
          console.warn(`Failed to delete old file: ${oldFileId}`, deleteErr.message);
        }
      }
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID,
      range: `Permit Form!AF${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [[driveUrl]] },
    });

    const tempRoot = path.join(__dirname, "temp");
    if (fs.existsSync(tempRoot)) fs.rmSync(tempRoot, { recursive: true, force: true });
    
    res.status(200).send("Success");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => console.log("Server listening on port 3000"));
