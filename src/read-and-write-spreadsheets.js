const meetingSheetName = 'meetings';
const responseSheetName = 'Form Responses 1';
const settingsSheetName = 'settings';
const typeAname = 'excludeThis';
const typeBname = 'excludeThese';
const typeContactName = 'contact';
const optionalTypes = {
  typeA: `{${typeAname}}`,
  typeB: `{${typeBname}`,
  typeContact: `{${typeContactName}}`
};

// convert spreadsheet column letter to number starting from 1
function parseColumnTypeLetterToNumber(letter) {
  let column = 0;
  const { length } = letter;
  for (let i = 0; i < length; i += 1) {
    column += (letter.charCodeAt(i) - 64) * 26 ** (length - i - 1);
  }
  return column - 1;
}

function parseParticipantRow(participantData, columnHeaders) {
  const lastUpdatedColumn = 0;
  const emailColumn = 1;
  const subscriptionColumn = 2;
  const firstNameColumn = 3;
  const lastNameColumn = 4;

  const firstName = participantData[firstNameColumn] ? participantData[firstNameColumn].trim() : '';
  const lastName = participantData[lastNameColumn] ? participantData[lastNameColumn].trim() : '';

  const fullName = `${firstName} ${lastName}`;

  const getTypeBValues = (columnHeader, i) => {
    const columnLetters = columnHeader
      .match(/\{[^}]*\} */g)[0] // get content inside curly braces
      .match(/\(([^)]+)\) */g)[0] // get content inside braces
      .replace(/[^0-9a-z]/gi, '') // replace other special characters
      .split('');

    const [first, second] = columnLetters;
    const col1 = first ? parseColumnTypeLetterToNumber(first) : '';
    const col2 = second ? parseColumnTypeLetterToNumber(second) : '';
    const str1 = col1 ? participantData[col1] : '';
    const str2 = col2 ? participantData[col2] : '';
    const merged = `${str1}${str2}`.toLowerCase();

    return `${participantData[i]}|${merged}`
      .toLowerCase()
      .split(' ')
      .join('');
  };

  /**
   * Function which maps contact information (type: contact) and optional conditions
   * for pair matching (typeA, typeB)
   * @returns {object} optional participant information
   */
  const assignOptionalValues = () => {
    const optionalValues = { typeA: {}, typeB: {}, typeContact: {} };
    columnHeaders.forEach((curr, i) => {
      if (curr.indexOf(optionalTypes.typeA) > -1) {
        const key = `${typeAname}_${i}`;
        optionalValues.typeA[key] = participantData[i] ? participantData[i] : '';
      }
      if (curr.indexOf(optionalTypes.typeB) > -1) {
        const key = `${typeBname}_${i}`;
        const value = getTypeBValues(curr, i);
        optionalValues.typeB[key] = value;
      }
      if (curr.indexOf(optionalTypes.typeContact) > -1) {
        const key = curr
          .replace(optionalTypes.typeContact, '')
          .replace(/ *\{[^}]*\} */g, '') // replace content inside curly braces, necessary if {typeA} or {typeB} exclusions on same header
          .trim();
        optionalValues.typeContact[key] = participantData[i] ? participantData[i] : '';
      }
    });
    return optionalValues;
  };

  const participant = {
    lastUpdated: participantData[lastUpdatedColumn],
    firstName,
    lastName,
    fullName,
    email: participantData[emailColumn].trim().toLowerCase(),
    isActive: participantData[subscriptionColumn] === 'Subscribe',
    optionalTypeValues: assignOptionalValues()
  };

  return participant;
}

function getSubscribedParticipants(participants) {
  const subscribedDatapoints = {};
  const unsubscribedDatapoints = {};

  participants.forEach(p => {
    if (p.isActive) {
      subscribedDatapoints[p.email] = p;
    } else {
      unsubscribedDatapoints[p.email] = p;
    }
  });

  //  delete participants if they have later unsubscription time
  Object.keys(unsubscribedDatapoints).forEach(key => {
    const unsubscribeTime = new Date(unsubscribedDatapoints[key].lastUpdated).getTime();
    const subscribeTime = subscribedDatapoints[key]
      ? new Date(subscribedDatapoints[key].lastUpdated)
      : 0;

    if (subscribeTime < unsubscribeTime) delete subscribedDatapoints[key];
  });

  Logger.log(`getSubscribedParticipants() LOG:\n${Object.keys(subscribedDatapoints)}\n`);

  return subscribedDatapoints;
}

export function readParticipants() {
  const responseSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(responseSheetName);

  const sheetRawData = responseSheet
    .getRange(1, 1, responseSheet.getLastRow(), responseSheet.getLastColumn())
    .getValues();

  const columnHeaderRow = sheetRawData[0];
  const participantRows = sheetRawData.slice(1);
  const parsedParticipants = participantRows.map(row => parseParticipantRow(row, columnHeaderRow));
  const participantsObject = getSubscribedParticipants(parsedParticipants);

  return participantsObject;
}

export function readMeetings() {
  const meetingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(meetingSheetName);
  const hasData = meetingSheet.getLastRow() > 1;

  const meetingRawData = hasData
    ? meetingSheet
        .getRange(2, 1, meetingSheet.getLastRow() - 1, meetingSheet.getLastColumn())
        .getValues()
    : [];

  const trimmedMeetingData = meetingRawData.length
    ? meetingRawData.map(meeting => {
        const firstPerson = meeting[1].replace(',', '').trim();
        const secondPerson = meeting[2].replace(',', '').trim();
        const emailSentText = meeting[0];
        return [emailSentText, firstPerson, secondPerson];
      })
    : [];

  return trimmedMeetingData;
}

export function writeMeetings(newMeetings) {
  const meetingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(meetingSheetName);
  const rangeToWrite = meetingSheet.getRange(
    meetingSheet.getLastRow() + 1,
    2,
    newMeetings.length,
    3
  );
  rangeToWrite.setValues(newMeetings);
}

export function writeEmailSent(row, stringToWrite) {
  const meetingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(meetingSheetName);
  const cellToWrite = meetingSheet.getRange(row, 1);
  cellToWrite.setValue(stringToWrite);
}

export function readSettings() {
  const settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(settingsSheetName);
  const settingsRaw = settingsSheet.getRange(2, 2, 7, 1).getValues();

  const settings = {
    typeAScore: settingsRaw[0][0] ? settingsRaw[0][0] : 5,
    typeBScore: settingsRaw[1][0] ? settingsRaw[1][0] : 5,
    leftOverPerson: settingsRaw[2][0],
    senderNameRaw: settingsRaw[3][0],
    subjectRaw: settingsRaw[4][0],
    htmlBodyRaw: settingsRaw[5][0],
    useMunkresAlgo: settingsRaw[6][0]
  };

  return settings;
}
