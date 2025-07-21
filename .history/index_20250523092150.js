const express = require("express");
const { getSheetData } = require("./sheets");
const { createPdf } = require("./pdf");
const { uploadToDrive } = require("./drive");
const { google } = require("googleapis");
const fs = require("fs");

const app = express();
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets.readonly"],
});

app.post("/sheet-updated", async (req, res) => {
  try {
    const client = await auth.getClient();
    const rowNumber = req.body.triggerRow || 2;
    const data = await getSheetData(client, rowNumber);

    const safeSubstationCode = data.FORM_SUBSTATION.replace(/[<>:"/\\|?*\s]+/g, "_");
    const safeNameSupervisor1 = data.FORM_SV1.replace(/[<>:"/\\|?*\s]+/g, "_");
    const fileName = `สถานีไฟฟ้า/${safeSubstationCode}/${safeNameSupervisor1}.pdf`;
    const pdfPath = await createPdf(data, fileName);

    const fileId = await uploadToDrive(client, pdfPath);
    console.log("Uploaded PDF to Google Drive with ID:", fileId);
    const driveUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    // อัปเดต URL ไปยัง Google Sheets
    const sheets = google.sheets({ version: "v4", auth: client });
    await sheets.spreadsheets.values.update({
      spreadsheetId: "YOUR_SPREADSHEET_ID", // 🔁 เปลี่ยนเป็นของคุณ
      range: `Permit Form!AC${rowNumber}`,   // 🔁 คอลัมน์ที่ต้องการเก็บลิงก์ (เช่น AC)
      valueInputOption: "RAW",
      requestBody: {
        values: [[driveUrl]],
      },
    });
    console.log(`Updated Google Sheet with PDF URL: ${driveUrl}`);


    
    const mainDir = path.join(__dirname, "สถานีไฟฟ้า");
    try {
      if (fs.existsSync(mainDir)) {
        fs.rmSync(mainDir, { recursive: true, force: true });
        console.log(`Deleted folder: ${mainDir}`);
      }
    } catch (err) {
      console.error(`Failed to delete folder: ${mainDir}`, err);
    }

    res.status(200).send("Success");
  } catch (err) {
    console.error("Error processing update:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => console.log("Server listening on port 3000"));
