const express = require("express");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { //Sheets
  getSheetData, 
  deleteOldFileIfExists, 
  updateSheetWithUrl 
} = require("./sheets");
const { createPdf } = require("./pdf");
const { //Drive
  uploadToDrive,
  shareFileAndGetUrl
} = require("./drive");
const { //Utils
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

app.post("/sheet-updated", async (req, res) => { //When trigger
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

function generatePdfFile(data) { //สร้าง pdf
  const safeDateTime = formatSafeThaiDateTimeForFilename();
  const safeSubstationCode = sanitizeFilename(data.FORM_SUBSTATION);
  const safeNameSupervisor1 = sanitizeFilename(data.FORM_SV1);  
  const fileName = `${safeNameSupervisor1}_${safeDateTime}.pdf`;
  const dir = path.join("temp", safeSubstationCode);
  const filePath = path.join(dir, fileName);
  return createPdf(data, filePath);
}

function cleanTempFolder() {//ลบโฟล์เดอร์ที่สร้าง pdf เพื่อไม่ให้เปลืองพื้นที่
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
