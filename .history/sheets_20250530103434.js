require("dotenv").config();
const { google } = require("googleapis");
const { formatThaiDate, formatThaiTime } = require("./utils");

const SHEET_ID = process.env.SHEET_ID;

async function getSheetData(auth, rowNumber = 2) {
  const sheets = google.sheets({ version: "v4", auth });
  const range = `'CREATE PDF Form'!A${rowNumber}:AT${rowNumber}`;
  
  console.log("Fetching range:", range);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) throw new Error("No data found.");

  const values = rows[0];
  const startDateRaw = values[19];
  const endDateRaw = values[21];
  const dateExecutive = values[34];

  const startDate = new Date(startDateRaw);
  const endDate = new Date(endDateRaw);

  const diffTime = endDate - startDate;
  const diffDays = isNaN(diffTime) ? "" : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return {
    WP_NUM: values[0] || "",
    WP_YEAR: formatThaiDate(dateExecutive),
    FORM_SUBSTATION: values[3] || "",
    FORM_ST_IN: values[4] || "",
    FORM_SV1: values[6] || "",
    FORM_P_SV1: values[7] || "",
    FORM_ST_IN2: values[8] || "",
    FORM_SV2: values[9] || "",
    FORM_P_SV2: values[10] || "",
    FORM_ST_OUT: values[12] || "",    
    FORM_SV_OUT: values[13] || "",
    FORM_P_OUT: values[14] || "",
    FORM_NUMWORK: values[15] || "",
    FORM_STDATE: formatThaiDate(startDateRaw),
    FORM_ENDDATE: formatThaiDate(endDateRaw),
    FORM_STTIME: formatThaiTime(values[20]),
    FORM_ENDTIME: formatThaiTime(values[22]),
    FORM_SUMDAY: diffDays,
    FORM_DETAIL1: values[24] || "",
    FORM_COMMENT1: values[25] || "",
    FORM_DETAIL2: values[27] || "",
    FORM_COMMENT2: values[28] || "",
    FORM_DETAIL3: values[29] || "",
    FORM_COMMENT3: values[30] || "",
    FORM_DETAIL4: values[31] || "",
    FORM_COMMENT4: values[32] || "",
    FORM_CB_SUBSTATION: values[17] === "Substation",
    FORM_CB_UNMANSUBSTATION: values[17] === "Unmanned Substation",
    FORM_CB_AGENCY: true ,
    FORM_CB_EXTERNALAGENCY: values[11] == "TRUE",
    FORM_CB_EXTINGUISH:
      values[16] === "ดับไฟปฏิบัติงาน" ||
      values[16] === "ไม่ดับไฟปฏิบัติงาน , ดับไฟปฏิบัติงาน",
    FORM_CB_NOEXTINGUISH:
      values[16] === "ดับไฟปฏิบัติงาน" ||
      values[16] === "ไม่ดับไฟปฏิบัติงาน , ดับไฟปฏิบัติงาน",
    FORM_CB_PLAN: values[18] == "นอกแผน",
    FORM_CB_NOPLAN: values[18] == "ตามแผน",
    FORM_CB_EMERGENCY: values[18] == "กรณีฉุกเฉิน (ศูนย์ฯ พิจารณา)",
    // ---------------------------------------
    EXECUTIVE_TEMP: formatThaiDate(dateExecutive),
    FORM_EXECUTIVE: values[35] || "",
    FORM_EXECUTIVE_VACANCY: values[36] || "",
    // ---------------------------------------
    FORM_RECIPIENT: (values[37]?.match(/\(([^)]+)\)/)?.[1] || "").trim(),
    FORM_RECIPIENT_VACANCY: (values[37]?.split(")").pop() || "").trim(),
    FORM_CB_ACCEPT: values[38] == "TRUE",
    FORM_CB_DENY: values[38] == "FALSE",
    FORM_DENY_CAUSE: values[39] || "",
    FORM_TO_SIGNER: values[36] ? "อ" + values[36].substring(1) : "",
    FORM_APPROVED: values[40] || "",
    FORM_UNITS: values[41] || "",
    // ---------------------------------------
    FORM_SIGNER: (values[42]?.match(/\(([^)]+)\)/)?.[1] || "").trim(),
    FORM_SIGNER_VACANCY: (values[42]?.replace(/\([^)]+\)/, "") || "").trim(),
    // ---------------------------------------
    PERFORMANCE_REPORT: values[43] || "",
    FORM_PPSTAFF: values[44] || "",
    FORM_PPSTAFF_VACANCY: values[45] || ""
  };
}

module.exports = { getSheetData };
