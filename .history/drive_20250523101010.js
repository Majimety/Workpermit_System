const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

async function uploadToDrive(auth, pdfPath) {
  const drive = google.drive({ version: "v3", auth });
  const fileMetadata = {
    name: path.basename(pdfPath),
    mimeType: "application/pdf",
    parents: ["1zP2fDwOJhAIIrYyAi2Xxehw2ErtQVMQJ"],
  };
  const media = {
    mimeType: "application/pdf",
    body: fs.createReadStream(pdfPath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id",
  });

  return response.data.id;
}
module.exports = { uploadToDrive };
