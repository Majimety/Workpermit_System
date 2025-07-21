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
    const fileName = `สถานีไฟฟ้า/${safeSubstationCode}.pdf`;
    const pdfPath = await createPdf(data, fileName);

    const fileId = await uploadToDrive(client, pdfPath);
    console.log("Uploaded PDF to Google Drive with ID:", fileId);

    fs.unlinkSync(pdfPath);
    console.log(`Deleted local file: ${pdfPath}`);

    res.status(200).send("Success");
  } catch (err) {
    console.error("Error processing update:", err);
    res.status(500).send("Internal Server Error");
  }
});


app.listen(3000, () => console.log("Server listening on port 3000"));
