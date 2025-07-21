require("dotenv").config();
const axios = require("axios");
const path = require("path");
const fs = require('fs');

async function createPdf(data, fileName = "output.pdf") {
  const response = await axios.post(
    process.env.PDF_API,
    {
      templateProjectPath: "sample/invc/workpermit.dito",
      templateName: "output",
      properties: {
        pdfVersion: "2.0",
      },
      data,
    },
    {
      responseType: "arraybuffer",
      headers: {
        Content: "application/json",
        Accept: "application/pdf",
      },
    },
    {
      timeout: 15000,
      responseType: "arraybuffer",
      headers: {
        Content: "application/json",
        Accept: "application/pdf",
      },
    }
  );

  const filePath = path.join(__dirname, fileName);

  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(filePath, response.data);
  return filePath;
}

module.exports = { createPdf };
