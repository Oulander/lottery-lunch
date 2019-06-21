import { getParticipants } from './get-data-from-spreadsheet';

export default function generateMeetings() {
  const participants = getParticipants();
  //   const pastMeetings = getMeetings();

  const participantIds = participants.map(participant => participant.email);

  // const scoringMatrix = new DataFrame([], ['id', ...participantIds]);

  participantIds.forEach(rowId => {
    Logger.log(rowId);
    // const row = new Row();
    // row.set('id', rowId);
    // participantIds.forEach(colId => row.set(colId, 1));
    // scoringMatrix.push(row);
  });

  // Logger.log(scoringMatrix.toArray());
}
