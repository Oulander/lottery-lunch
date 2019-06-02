export default function generateMeetings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('meetingGenerator');
  const values = sheet.getRange(1, 1, 999, 999);

  if (!values) {
    Logger.log('No data found.');
    return;
  }

  const valuesTable = values.getValues();

  for (let row = 1; row <= valuesTable.length; row += 1) {
    if (row === 1) {
      const rowZero = valuesTable[0];
      let column;
      for (column = 1; column <= rowZero.length; column += 1) {
        const columnText = values.getCell(row, column).getValue();
        Logger.log(column);
        if (columnText === '') {
          break;
        }
      }

      const latestMeeting = column - 2;
      const nextMeetingNumber = latestMeeting + 1;
      const nextMeetingColumn = nextMeetingNumber + 1;

      values.getCell(row, nextMeetingColumn).setValue('moikka');
    }
  }
}
