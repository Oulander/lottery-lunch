const meetingSheetName = 'meetings';
const responseSheetName = 'Form Responses 1';

function parseParticipantRow(row) {
  const lastUpdatedColumn = 0;
  const firstNameColumn = 1;
  const lastNameColumn = 2;
  const phoneColumn = 3;
  const emailColumn = 4;
  const blockListColumn = 5;
  const isInactiveColumn = 6;

  const firstName = row[firstNameColumn].trim();
  const lastName = row[lastNameColumn].trim();

  const fullName = `${firstName} ${lastName}`;

  const participant = {
    lastUpdated: row[lastUpdatedColumn],
    firstName,
    lastName,
    fullName,
    phone: row[phoneColumn],
    email: row[emailColumn].trim().toLowerCase(),
    blockList: row[blockListColumn].split(',').map(name => name.trim()),
    isActive: !(row[isInactiveColumn].length > 0)
  };

  return participant;
}

function pickLatestParticipantDatapoint(participants) {
  const participantsToKeep = [];

  participants.forEach(participant => {
    const index = participantsToKeep.map(p => p.email).indexOf(participant.email);
    if (index === -1) {
      participantsToKeep.push(participant);
    } else {
      participantsToKeep[index] = participant;
    }
  });

  return participantsToKeep.filter(
    participant => participant.email.length > 0 && participant.isActive === true
  );
}

export function readParticipants() {
  const responseSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(responseSheetName);

  const participantRawData = responseSheet
    .getRange(2, 1, responseSheet.getLastRow(), responseSheet.getLastColumn())
    .getValues();

  const parsedParticipants = participantRawData.map(row => parseParticipantRow(row));

  const participantsArray = pickLatestParticipantDatapoint(parsedParticipants);

  return participantsArray;
}

export function readMeetings() {
  const meetingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(meetingSheetName);
  const meetingRawData = meetingSheet
    .getRange(2, 2, meetingSheet.getLastRow(), meetingSheet.getLastColumn())
    .getValues();

  const trimmedMeetingData = meetingRawData.map(meeting => {
    const firstPerson = meeting[0].replace(',', '').trim();
    const secondPerson = meeting[1].replace(',', '').trim();

    return [firstPerson, secondPerson];
  });

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
