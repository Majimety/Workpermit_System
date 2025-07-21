const axios = require("axios");
const path = require("path");

async function createPdf(data, fileName = "output.pdf") {
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

  const filePath = path.join(__dirname, fileName);
  fs.writeFileSync(filePath, response.data);
  return filePath;
}
module.exports = { createPdf };
