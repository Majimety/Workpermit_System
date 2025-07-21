require("dotenv").config();
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { logger } = require("./utils");

async function createPdf(data, fileName = "output.pdf") {
  logger.info(`Generating PDF: ${fileName}`);

  const response = await axios.post(
    process.env.PDF_API,
    {
      templateProjectPath: "sample/invc/workpermit.dito",
      templateName: "output",
      properties: { pdfVersion: "2.0" },
      data,
    },
    {
      timeout: 50000,
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/pdf",
      },
    }
  );

  const filePath = path.join(__dirname, fileName);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, response.data);

  logger.info(`PDF saved to: ${filePath}`);
  return filePath;
}

module.exports = { createPdf };
