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

// function getBlockListScore(person1Id, person2Id, participants) {
//   const person1 = participants.filter(participant => participant.email === person1Id)[0];
//   const person2 = participants.filter(participant => participant.email === person2Id)[0];

//   const person2InPerson1sList =
//     person1.blockList.map(name => name.toLowerCase()).indexOf(person2.fullName.toLowerCase()) !==
//     -1;

//   const person1InPerson2sList =
//     person2.blockList.map(name => name.toLowerCase()).indexOf(person1.fullName.toLowerCase()) !==
//     -1;

//   return person2InPerson1sList || person1InPerson2sList ? 5 : 0;
// }

function getTypeAScore(person1Id, person2Id, participants) {
  const p1TypeAObj = participants[person1Id].optionalTypeValues.typeA;
  const p2TypeAObj = participants[person2Id].optionalTypeValues.typeA;

  const score = Object.keys(p1TypeAObj).reduce((total, curr) => {
    if (p1TypeAObj[curr] === p2TypeAObj[curr]) {
      return total + 5;
    }
    return total;
  }, 0);

  return score;
}

function getScoredMeetings(allPossibleMeetings, pastMeetingsPerPerson, participants) {
  const meetingsLog = [];
  const possibleMeetingsScored = allPossibleMeetings.map(meeting => {
    const person1Id = meeting[0];
    const person2Id = meeting[1];

    const pastMeetingsScore =
      pastMeetingsPerPerson[person1Id].filter(person => person === person2Id).length * 5;

    const typeAScore = getTypeAScore(person1Id, person2Id, participants);

    // TODO change to part b
    // const blockListPart = getBlockListScore(person1Id, person2Id, participants);

    const randomPart = Math.random();
    const score = pastMeetingsScore + typeAScore + randomPart;

    meetingsLog.push(
      `[${meeting}]: pastMeetingsScore=${pastMeetingsScore}, typeAScore=${typeAScore}, randomPart=${randomPart}`
    );

    return [meeting, score];
  });

  Logger.log(`getScoredMeetings() LOG:\n${meetingsLog.join('\n')}`);

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

  const allParticipantIds = Object.keys(participants);

  const pastMeetingsPerPerson = {};

  allParticipantIds.forEach(singleParticipantId => {
    const pastMeetingsOfParticipant = pastMeetings.filter(meeting => {
      return meeting.indexOf(singleParticipantId) > -1;
    });

    const pastMeetingsOfParticipantCleaned = []
      .concat(...pastMeetingsOfParticipant)
      .filter(id => id !== singleParticipantId);

    pastMeetingsPerPerson[singleParticipantId] = pastMeetingsOfParticipantCleaned;
  });

  const allPossibleMeetings = generatePossibleMeetings(allParticipantIds);

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
