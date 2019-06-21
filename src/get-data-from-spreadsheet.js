function parseParticipantRow(row) {
  const lastUpdatedColumn = 0;
  const firstNameColumn = 1;
  const lastNameColumn = 2;
  const phoneColumn = 3;
  const emailColumn = 4;
  const peopleToDropColumn = 5;
  const isInactiveColumn = 6;

  const participant = {
    lastUpdated: row[lastUpdatedColumn],
    firstName: row[firstNameColumn],
    lastName: row[lastNameColumn],
    phone: row[phoneColumn],
    email: row[emailColumn].trim().toLowerCase(),
    peopleToDrop: row[peopleToDropColumn].split(',').map(name => name.trim()),
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

export function getParticipants() {
  //   const participantSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('participants');
  //   participantSheet.clear();

  const responseSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form Responses 1');

  const participantRawData = responseSheet
    .getRange(2, 1, responseSheet.getLastRow(), responseSheet.getLastColumn())
    .getValues();

  const parsedParticipants = participantRawData.map(row => parseParticipantRow(row));

  const participantsArray = pickLatestParticipantDatapoint(
    parsedParticipants,
    participant => participant.email
  );

  Logger.log(participantsArray.map(participant => [participant.firstName, participant.email]));

  return participantsArray;
}

export function getMeetings() {
  const meetingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('meetings');
  const meetingRawData = meetingSheet
    .getRange(2, 2, meetingSheet.getLastRow(), meetingSheet.getLastColumn())
    .getValues();

  return meetingRawData;
}
