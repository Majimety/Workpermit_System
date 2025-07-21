const axios = require("axios");
const fs = require("fs");

async function createPdf(data) {
  const response = await axios.post(
    "http://dev-api.pea.co.th:42/api/pdf-producer/",
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
    }
  );

  fs.writeFileSync("output.pdf", response.data);
  return "output.pdf";
}
module.exports = { createPdf };
