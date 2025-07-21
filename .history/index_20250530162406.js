const express = require("express");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const { //Sheets
  getSheetData, 
  deleteOldFileIfExists, 
  updateSheetWithUrl 
} = require("./sheets");

const { //PDF
  createPdf 
} = require("./pdf");

const { //Drive
  uploadToDrive,
  shareFileAndGetUrl
} = require("./drive");

const { //Utils
  sanitizeFilename,
  formatSafeThaiDateTimeForFilename,
  logger
} = require("./utils");

require("dotenv").config();

const app = express();
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets.readonly",
  ],
});

app.post("/sheet-updated", async (req, res) => { //When trigger
  logger.info("Received /sheet-updated request");
  try {
    const rowNumber = parseInt(req.body.triggerRow) || 2;
    logger.info(`Processing row number: ${rowNumber}`);

    const client = await auth.getClient();

    const data = await getSheetData(client, rowNumber);
    logger.info("Retrieved data from sheet");

    const pdfPath = await generatePdfFile(data);
    logger.info(`PDF generated at: ${pdfPath}`);

    const fileId = await uploadToDrive(client, pdfPath);

    if (!fileId) throw new Error("Upload failed");
    logger.info(`Uploaded PDF to Drive with fileId: ${fileId}`);

    const driveUrl = await shareFileAndGetUrl(client, fileId);
    logger.info(`Shared file and received URL: ${driveUrl}`);

    await deleteOldFileIfExists(client, rowNumber);
    logger.info("Deleted old file if existed");

    await updateSheetWithUrl(client, rowNumber, driveUrl);
    logger.info("Updated sheet with new Drive URL");

    cleanTempFolder();
    logger.info("Cleaned up temp folder");

    res.status(200).send("Success");
  } catch (err) {
    logger.error("Error processing request", err);
    res.status(500).send("Internal Server Error");
  }
});

function generatePdfFile(data) { //สร้าง pdf
  const safeDateTime = formatSafeThaiDateTimeForFilename();
  const safeNameSupervisor1 = sanitizeFilename(data.FORM_SV1);  
  const fileName = `${safeNameSupervisor1}_${safeDateTime}.pdf`;
  const dir = path.join("temp", safeNameSupervisor1);
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
    logger.warn("Failed to clean temp folder", err);
  }
}

app.listen(3000, () => {
  logger.info("Server listening on port 3000");
});