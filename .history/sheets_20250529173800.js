require("dotenv").config();
const { google } = require("googleapis");
const { formatThaiDate, formatThaiTime } = require("./utils");

const SHEET_ID = process.env.SHEET_ID;

async function getSheetData(auth, rowNumber = 2) {
  const sheets = google.sheets({ version: "v4", auth });
  const range = `'CREATE PDF Form'!A${rowNumber}:AQ${rowNumber}`;
  
  console.log("Fetching range:", range);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) throw new Error("No data found.");

  const values = rows[0];
  const startDateRaw = values[16];
  const endDateRaw = values[18];
  const dateExecutive = values[31];

  const startDate = new Date(startDateRaw);
  const endDate = new Date(endDateRaw);

  const diffTime = endDate - startDate;
  const diffDays = isNaN(diffTime) ? "" : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return {
    WP_NUM: values[0] || "",
    WP_YEAR: formatThaiDate(dateExecutive),
    FORM_SUBSTATION: values[3] || "",
    FORM_ST_IN: values[5] || "",
    FORM_ST_OUT: values[9] || "",
    FORM_SV1: values[6] || "",
    FORM_SV2: values[10] || "",
    FORM_P_SV1: values[7] || "",
    FORM_P_SV2: values[11] || "",
    FORM_NUMWORK: values[12] || "",
    FORM_STDATE: formatThaiDate(startDateRaw),
    FORM_ENDDATE: formatThaiDate(endDateRaw),
    FORM_STTIME: formatThaiTime(values[17]),
    FORM_ENDTIME: formatThaiTime(values[19]),
    FORM_SUMDAY: diffDays,
    FORM_DETAIL1: values[21] || "",
    FORM_COMMENT1: values[22] || "",
    FORM_DETAIL2: values[24] || "",
    FORM_COMMENT2: values[25] || "",
    FORM_DETAIL3: values[26] || "",
    FORM_COMMENT3: values[27] || "",
    FORM_DETAIL4: values[28] || "",
    FORM_COMMENT4: values[29] || "",
    FORM_CB_SUBSTATION: values[14] === "Substation",
    FORM_CB_UNMANSUBSTATION: values[14] === "Unmanned Substation",
    FORM_CB_AGENCY: true ,
    FORM_CB_EXTERNALAGENCY: values[8] || "",
    FORM_CB_EXTINGUISH:
      values[13] === "ดับไฟปฏิบัติงาน" ||
      values[13] === "ไม่ดับไฟปฏิบัติงาน , ดับไฟปฏิบัติงาน",
    FORM_CB_NOEXTINGUISH:
      values[13] === "ดับไฟปฏิบัติงาน" ||
      values[13] === "ไม่ดับไฟปฏิบัติงาน , ดับไฟปฏิบัติงาน",
    FORM_CB_PLAN: values[15] == "นอกแผน",
    FORM_CB_NOPLAN: values[15] == "ตามแผน",
    FORM_CB_EMERGENCY: values[15] == "กรณีฉุกเฉิน (ศูนย์ฯ พิจารณา)",
    // ---------------------------------------
    EXECUTIVE_TEMP: formatThaiDate(dateExecutive),
    FORM_EXECUTIVE: values[32] || "",
    FORM_EXECUTIVE_VACANCY: values[33] || "",
    // ---------------------------------------
    FORM_RECIPIENT: (values[34]?.match(/\(([^)]+)\)/)?.[1] || "").trim(),
    FORM_RECIPIENT_VACANCY: (values[34]?.split(")").pop() || "").trim(),
    FORM_CB_ACCEPT: values[35] == "TRUE",
    FORM_CB_DENY: values[35] == "FALSE",
    FORM_DENY_CAUSE: values[36] || "",
    FORM_TO_SIGNER: values[33] ? "อ" + values[33].substring(1) : "",
    FORM_APPROVED: values[37] || "",
    FORM_UNITS: values[38] || "",
    // ---------------------------------------
    FORM_SIGNER: (values[39]?.match(/\(([^)]+)\)/)?.[1] || "").trim(),
    FORM_SIGNER_VACANCY: (values[39]?.replace(/\([^)]+\)/, "") || "").trim(),
    // ---------------------------------------
    PERFORMANCE_REPORT: values[40] || "",
    FORM_PPSTAFF: values[41] || "",
    FORM_PPSTAFF_VACANCY: values[42] || ""
  };
}

module.exports = { getSheetData };
