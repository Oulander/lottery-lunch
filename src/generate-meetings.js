import {
  readParticipants,
  readMeetings,
  writeMeetings,
  readSettings
} from './read-and-write-spreadsheets';

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

function getTypeAScore(person1, person2) {
  const p1TypeAObj = person1.optionalTypeValues.typeA;
  const p2TypeAObj = person2.optionalTypeValues.typeA;

  const score = Object.keys(p1TypeAObj).reduce((total, curr) => {
    if (p1TypeAObj[curr] === p2TypeAObj[curr]) {
      return total + 5;
    }
    return total;
  }, 0);

  return score;
}

// typeB={typeB_8=trimmed|merged}
function getTypeBScore(person1, person2) {
  const p1TypeBObj = person1.optionalTypeValues.typeB;
  const p2TypeBObj = person2.optionalTypeValues.typeB;

  const score = Object.keys(p1TypeBObj).reduce((total, curr) => {
    const p1ExclusionData = p1TypeBObj[curr].split('|');
    const p2ExclusionData = p2TypeBObj[curr].split('|');

    if (
      p1ExclusionData[0].indexOf(p2ExclusionData[1]) > -1 ||
      p2ExclusionData[0].indexOf(p1ExclusionData[1]) > -1
    ) {
      return total + 20;
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
      pastMeetingsPerPerson[person1Id].filter(person => person === person2Id).length * 10;

    const typeAScore = getTypeAScore(participants[person1Id], participants[person2Id]);
    const typeBScore = getTypeBScore(participants[person1Id], participants[person2Id]);
    const randomPart = Math.random();
    const score = pastMeetingsScore + typeAScore + typeBScore + randomPart;

    meetingsLog.push(
      `[${meeting}]: pastMeetingsScore=${pastMeetingsScore}, typeAScore=${typeAScore}, typeBScore=${typeBScore}, randomPart=${randomPart}`
    );

    return [meeting, score];
  });

  // Logger.log(`getScoredMeetings() LOG:\n${meetingsLog.join('\n')}`);

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

function dropOddPerson(participants) {
  const settings = readSettings();

  const { leftOverPerson } = settings;

  const emails = Object.keys(participants);

  const emailToDrop = leftOverPerson || emails[Math.floor(Math.random() * emails.length)];

  const { [emailToDrop]: _, ...rest } = participants;

  return rest;
}

export default function generateMeetings() {
  const participantsUnfiltered = readParticipants();
  const participants =
    participantsUnfiltered.length % 2 === 0
      ? participantsUnfiltered
      : dropOddPerson(participantsUnfiltered);
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
