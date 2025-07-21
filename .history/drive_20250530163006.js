require("dotenv").config();
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { logger } = require("./utils");

async function uploadToDrive(auth, pdfPath) {
  const drive = google.drive({ version: "v3", auth });
  const fileMetadata = {
    name: path.basename(pdfPath),
    mimeType: "application/pdf",
    parents: [process.env.FOLDER_ID],
  };
  const media = {
    mimeType: "application/pdf",
    body: fs.createReadStream(pdfPath),
  };
  
  logger.info(`Uploading ${pdfPath} to Google Drive...`);
  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id",
  });
    
  logger.info(`Upload complete. File ID: ${response.data.id}`);
  return response.data.id;
}

async function shareFileAndGetUrl(authClient, fileId) {
  const drive = google.drive({ version: "v3", auth: authClient });
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });
  return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
}

module.exports = {
  uploadToDrive,
  shareFileAndGetUrl
};
