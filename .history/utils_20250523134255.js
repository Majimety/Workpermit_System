function formatThaiDate(dateStr) {//แก้วันเป็นแบบสากลไทย
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  const thaiMonthsShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${date.getDate()} ${thaiMonthsShort[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function formatThaiTime(timeStr) {//เปลี่ยน ค.ศ. -> พ.ศ.
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":");
  return hour && minute ? `${hour}.${minute}` : "";
}

function sanitizeFilename(name) {//ป้องกันไม่ให้ชื่อไฟล์มีอักขระต้องห้าม
  return name.replace(/[<>:"/\\|?*\s]+/g, "_");
}

function formatHumanDateTime(isoString) {//แปลง timestamp to human date/time
  const date = new Date(isoString);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok',
  };
  return new Intl.DateTimeFormat('th-TH', options).format(date);
}

function formatSafeThaiDateTimeForFilename(date = new Date()) {//แปลง timestamp to human date/time สำหรับไฟล์ทุกประเภท
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear() + 543;

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year}_${hours}-${minutes}`;
}

module.exports = { formatThaiDate, formatThaiTime, sanitizeFilename, formatHumanDateTime, formatSafeThaiDateTimeForFilename };
