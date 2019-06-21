import { flatten } from 'lodash';
import { getParticipants, getMeetings } from './get-data-from-spreadsheet';

function generatePossibleMeetings(list) {
  const pairs = new Array((list.length * (list.length - 1)) / 2);
  let pos = 0;

  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      pairs[(pos += 1)] = [list[i], list[j]];
    }
  }
  return pairs;
}

export default function generateMeetings() {
  const participants = getParticipants();
  const pastMeetings = getMeetings();

  const rowPersonIds = participants.map(participant => participant.email);

  const pastMeetingsPerPerson = {};

  rowPersonIds.forEach(rowPersonId => {
    const pastMeetingsOfRowPerson = pastMeetings.filter(meeting => {
      return meeting.indexOf(rowPersonId) !== -1;
    });
    const pastMeetingsOfRowPersonCleaned = flatten(pastMeetingsOfRowPerson).filter(
      person => person !== rowPersonId
    );

    pastMeetingsPerPerson[rowPersonId] = pastMeetingsOfRowPersonCleaned;
  });

  const allPossibleMeetings = generatePossibleMeetings(rowPersonIds);

  const possibleMeetingsScored = allPossibleMeetings.map(meeting => {
    const person1 = meeting[0];
    const person2 = meeting[1];

    const pastMeetingPart = pastMeetingsPerPerson[person1].filter(person => person === person2)
      .length;

    const randomPart = Math.random();

    const score = pastMeetingPart + randomPart;

    const meetingWithScoresAndDecision = [meeting, score];
    return meetingWithScoresAndDecision;
  });

  const scoredSortedMeetings = possibleMeetingsScored.sort((a, b) => (a[1] > b[1] ? 1 : -1));

  const meetingsThisRound = {};
  const meetingsArray = [];

  for (let i = 0; i < scoredSortedMeetings.length; i += 1) {
    if (!scoredSortedMeetings[i] || !scoredSortedMeetings[i][0]) {
      break;
    }
    const person1 = scoredSortedMeetings[i][0][0];
    const person2 = scoredSortedMeetings[i][0][1];

    if (!meetingsThisRound[person1] && !meetingsThisRound[person2]) {
      meetingsThisRound[person1] = person2;
      meetingsThisRound[person2] = person1;
      meetingsArray.push([person1, person2]);
    }
  }

  if (true) {
    Logger.log(meetingsArray);
  }
}
