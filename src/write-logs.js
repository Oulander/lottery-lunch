const logsSheetName = 'logs';

export default function writeScoredMeetingsLog(scoredMeetingsLogArr) {
  const logsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(logsSheetName);
  const rangeToWrite = logsSheet.getRange(2, 1, scoredMeetingsLogArr.length, 8);
  rangeToWrite.setValues(scoredMeetingsLogArr);
}
