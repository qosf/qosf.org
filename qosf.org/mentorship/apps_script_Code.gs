/**
 * Google Apps Script web app backend for the QOSF mentorship application forms.
 *
 * It receives form POSTs and appends each submission as a row in a Google
 * Sheet that the organizers own. This is the "secure database" behind the
 * static Jekyll forms - no server for QOSF to host.
 *
 * ---------------------------------------------------------------------------
 * DEPLOYMENT (one time, by an organizer with a Google account)
 * ---------------------------------------------------------------------------
 * 1. Create a new Google Sheet. Note its ID from the URL:
 *      https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit
 * 2. Go to Extensions > Apps Script. Delete the placeholder code and paste
 *    this file's contents.
 * 3. Set SHEET_ID below to your sheet's ID.
 * 4. Click Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Authorize when prompted, then copy the Web app URL (ends in /exec).
 * 5. Paste that URL into qosf.org/_config.yml under mentorship.form_endpoint.
 *
 * The sheet is private to your Google account; only the deployed endpoint can
 * append rows. Personal data never touches the public repository.
 */

var SHEET_ID = "PASTE_YOUR_SHEET_ID_HERE";
var SHEET_NAME = "applications";

// Columns written to the sheet, in order. Mirrors the form field names.
var FIELDS = [
  "submitted_at", "role", "name", "email", "affiliation", "country",
  "timezone", "level", "interests", "availability", "capacity", "github",
  "motivation", "bio", "consent"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  var acquired = false;
  try {
    // tryLock returns false on timeout instead of throwing, so we can always
    // respond with a structured JSON payload.
    acquired = lock.tryLock(30000); // avoid two submissions writing at once
    if (!acquired) {
      return json_({ result: "error", message: "Server busy, please try again." });
    }
    var sheet = getSheet_();
    var params = (e && e.parameter) ? e.parameter : {};
    var row = FIELDS.map(function (field) {
      return params[field] !== undefined ? params[field] : "";
    });
    sheet.appendRow(row);
    return json_({ result: "success" });
  } catch (err) {
    return json_({ result: "error", message: String(err) });
  } finally {
    if (acquired) {
      lock.releaseLock();
    }
  }
}

function doGet() {
  // Simple health check so visiting the URL in a browser confirms it is live.
  return json_({ result: "ok", message: "QOSF mentorship endpoint is running." });
}

function getSheet_() {
  var book = SpreadsheetApp.openById(SHEET_ID);
  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(FIELDS); // write the header row once
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
