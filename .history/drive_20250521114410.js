const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

async function uploadToDrive(auth, filePath) {
  const drive = google.drive({ version: "v3", auth });
  const fileMetadata = {
    name: path.basename(filePath),
    parents: ["1zP2fDwOJhAIIrYyAi2Xxehw2ErtQVMQJ"],
  };
  const media = {
    mimeType: "application/pdf",
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id",
  });

  return response.data.id;
}
module.exports = { uploadToDrive };
