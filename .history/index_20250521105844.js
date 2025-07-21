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
  const substationCode = data.FORM_SUBSTATION.replace(/\s+/g, "_");
  const fileName = `FORM_SUBSTATION_${substationCode}.pdf`;
  const pdfPath = await createPdf(data, fileName);
  const fileId = await uploadToDrive(client, pdfPath);
  console.log("Uploaded PDF to Google Drive with ID:", fileId);
})();
