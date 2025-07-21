const { getSheetData } = require("./sheets");
const { createPdf } = require("./pdf");
const { uploadToDrive } = require("./drive");
const { google } = require("googleapis");
const fs = require("fs");

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets.readonly"],
});

(async () => {
  const client = await auth.getClient();
  const data = await getSheetData(client);

  const safeSubstationCode = data.FORM_SUBSTATION.replace(/[<>:"/\\|?*\s]+/g, "_");
  const fileName = `FORM_SUBSTATION_${safeSubstationCode}.pdf`;

  const pdfPath = await createPdf(data, fileName);
  const fileId = await uploadToDrive(client, pdfPath);

  fs.unlinkSync(pdfPath);
  console.log(`Deleted local file: ${pdfPath}`);
  
  console.log("Uploaded PDF to Google Drive with ID:", fileId);
})();
