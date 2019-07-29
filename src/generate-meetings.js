import { flatten } from 'lodash';
import { readParticipants, readMeetings, writeMeetings } from './read-and-write-spreadsheets';

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

function getBlockListScore(email1, email2, participants) {
  const person1 = participants.filter(participant => participant.email === email1)[0];
  const person2 = participants.filter(participant => participant.email === email2)[0];

  const person2InPerson1sList =
    person1.blockList.map(name => name.toLowerCase()).indexOf(person2.fullName.toLowerCase()) !==
    -1;

  const person1InPerson2sList =
    person2.blockList.map(name => name.toLowerCase()).indexOf(person1.fullName.toLowerCase()) !==
    -1;

  return person2InPerson1sList || person1InPerson2sList ? 5 : 0;
}

function getScoredMeetings(allPossibleMeetings, pastMeetingsPerPerson, participants) {
  const possibleMeetingsScored = allPossibleMeetings.map(meeting => {
    const person1 = meeting[0];
    const person2 = meeting[1];

    const pastMeetingPart = pastMeetingsPerPerson[person1].filter(person => person === person2)
      .length;

    const blockListPart = getBlockListScore(person1, person2, participants);

    const randomPart = Math.random();

    const score = pastMeetingPart + blockListPart + randomPart;

    return [meeting, score];
  });

  return possibleMeetingsScored;
}

function chooseMeetingsBasedOnScore(possibleMeetingsScored) {
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
      meetingsArray.push([person1, person2, scoredSortedMeetings[i][1]]);
    }
  }
  return meetingsArray;
}

export default function generateMeetings() {
  const participants = readParticipants();
  const pastMeetings = readMeetings();

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

  const possibleMeetingsScored = getScoredMeetings(
    allPossibleMeetings,
    pastMeetingsPerPerson,
    participants
  );

  let meetingsArray = chooseMeetingsBasedOnScore(possibleMeetingsScored);

  // The block below will try to re-score and re-pick the meetings five times
  // if there's a meeting between people who have already met. This is not very efficient or
  // elegant, but will get the job done as long as the number of people participating
  // doesn't get too high. Should be rewritten if performance becomes an issue.
  for (let i = 0; i < 5; i += 1) {
    const meetingScores = meetingsArray.map(meeting => meeting[2]);
    const highestScore = Math.max(...meetingScores);
    if (highestScore > 1) {
      meetingsArray = chooseMeetingsBasedOnScore(
        getScoredMeetings(allPossibleMeetings, pastMeetingsPerPerson, participants)
      );
    } else {
      break;
    }
  }

  const meetingsArrayWithResponsiblePersonShuffled = meetingsArray.map(meeting =>
    Math.random() >= 0.5 ? [meeting[0], meeting[1]] : [meeting[1], meeting[0]]
  );

  writeMeetings(meetingsArrayWithResponsiblePersonShuffled);
}
