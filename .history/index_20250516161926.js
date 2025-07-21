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
  const pdfPath = await createPdf(data);
  const fileId = await uploadToDrive(client, pdfPath);
  console.log("Uploaded PDF to Google Drive with ID:", fileId);
})();
