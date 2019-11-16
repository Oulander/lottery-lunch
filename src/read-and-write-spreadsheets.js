import { pickBy } from 'lodash.pickby';

const meetingSheetName = 'meetings';
const responseSheetName = 'Form Responses 1';
const settingsSheetName = 'settings';
const optionalTypes = {
  typeA: '{type: A}',
  typeB: '{type: B}',
  typeC: '{type: C}'
};

function parseParticipantRow(participantData, columnHeaders) {
  const lastUpdatedColumn = 0;
  const emailColumn = 1;
  const isInactiveColumn = 2; // subscription field
  const firstNameColumn = 3;
  const lastNameColumn = 4;
  // optional columns -->
  const phoneColumn = 5;
  // const telegramColumn = 6;
  // const telegramColumn = 6;
  const blockListColumn = 8;

  const firstName = participantData[firstNameColumn] ? participantData[firstNameColumn].trim() : '';
  const lastName = participantData[lastNameColumn] ? participantData[lastNameColumn].trim() : '';

  const fullName = `${firstName} ${lastName}`;

  /**
   * Function which maps contact information (type: C) and optional conditions
   * for pair matching (type: A, type: B)
   * @returns {object} optional participant information
   */
  const assignOptionalValues = () => {
    const optionalValues = { typeA: {}, typeB: {}, typeC: {} };
    columnHeaders.forEach((curr, i) => {
      if (curr.indexOf(optionalTypes.typeA) > -1) {
        const key = `typeA_${i}`;
        optionalValues.typeA[key] = participantData[i] ? participantData[i] : '';
      }
      // TODO: TYPE B
      // if (curr.indexOf(optionalTypes.typeC) > -1) {
      //   const key = curr.replace(optionalTypes.typeC, '').replace(/[^0-9a-z]/gi, '');
      //   optionalValues.typeC[key] = participantData[i] ? participantData[i] : '';
      // }
      if (curr.indexOf(optionalTypes.typeC) > -1) {
        const key = curr.replace(optionalTypes.typeC, '').replace(/[^0-9a-z]/gi, '');
        optionalValues.typeC[key] = participantData[i] ? participantData[i] : '';
      }
    });
    return optionalValues;
  };

  const participant = {
    lastUpdated: participantData[lastUpdatedColumn],
    firstName,
    lastName,
    fullName,
    phone: participantData[phoneColumn],
    email: participantData[emailColumn].trim().toLowerCase(),
    blockList: participantData[blockListColumn].split(',').map(name => name.trim()),
    isActive: participantData[isInactiveColumn] === 'Subscribe',
    optionalTypeValues: assignOptionalValues()
  };

  Logger.log(participant);

  return participant;
}

function pickLatestParticipantDatapoint(participants) {
  const participantsToKeep = {};

  participants.forEach(participant => {
    if (participant.email.length > 0) {
      participantsToKeep[participant.email] = participant;
    }
  });
  Logger.log(participantsToKeep);

  const subscribedParticipants = pickBy(participantsToKeep, participant => participant.isActive);

  return subscribedParticipants;
}

export function readParticipants() {
  const responseSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(responseSheetName);

  const sheetRawData = responseSheet
    .getRange(1, 1, responseSheet.getLastRow(), responseSheet.getLastColumn())
    .getValues();

  const columnHeaderRow = sheetRawData[0];
  const participantRows = sheetRawData.slice(1);
  const parsedParticipants = participantRows.map(row => parseParticipantRow(row, columnHeaderRow));
  const participantsObject = pickLatestParticipantDatapoint(parsedParticipants);

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
    2
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

  const settingsRaw = settingsSheet.getRange(2, 2, 4, 1).getValues();

  const settings = {
    leftOverPerson: settingsRaw[0][0],
    senderNameRaw: settingsRaw[1][0],
    subjectRaw: settingsRaw[2][0],
    htmlBodyRaw: settingsRaw[3][0]
  };

  return settings;
}
