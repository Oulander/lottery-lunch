/* eslint-disable no-console */
import {
  readParticipants,
  readMeetings,
  writeMeetings,
  readSettings
} from './read-and-write-spreadsheets';

import writeScoredMeetingsLog from './write-logs';

const munkres = require('munkres-js'); // a.k.a Hungarian algorithm

const SETTINGS = readSettings();

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

  const totalTypeAScore = Object.keys(p1TypeAObj).reduce((total, curr) => {
    const { typeAScore } = SETTINGS;
    if (p1TypeAObj[curr] === p2TypeAObj[curr]) {
      return total + typeAScore;
    }
    return total;
  }, 0);

  return totalTypeAScore;
}

function getTypeBScore(person1, person2) {
  const p1TypeBObj = person1.optionalTypeValues.typeB;
  const p2TypeBObj = person2.optionalTypeValues.typeB;

  const totalTypeBScore = Object.keys(p1TypeBObj).reduce((total, curr) => {
    const p1ExclusionData = p1TypeBObj[curr].split('|');
    const p2ExclusionData = p2TypeBObj[curr].split('|');
    const { typeBScore } = SETTINGS;

    if (
      p1ExclusionData[0].indexOf(p2ExclusionData[1]) > -1 ||
      p2ExclusionData[0].indexOf(p1ExclusionData[1]) > -1
    ) {
      return total + typeBScore;
    }

    return total;
  }, 0);

  return totalTypeBScore;
}

function getPastMeetingScore(person1Id, person2Id, pastMeetingsPerPerson) {
  return (
    pastMeetingsPerPerson[person1Id].filter(meeting => meeting.includes(person2Id)).length * 10
  );
}

function getRandomScore(person1Id, person2Id, pastMeetingsPerPerson, mostMeetingsPerPerson) {
  const person1pastmeetings = pastMeetingsPerPerson[person1Id]
    ? pastMeetingsPerPerson[person1Id].length * 1.0
    : 0.0;
  const person2pastmeetings = pastMeetingsPerPerson[person2Id]
    ? pastMeetingsPerPerson[person2Id].length * 1.0
    : 0.0;

  if (
    mostMeetingsPerPerson === 0 ||
    (person1pastmeetings === mostMeetingsPerPerson && person2pastmeetings === mostMeetingsPerPerson)
  ) {
    return Math.random();
  }

  const person1meetingsPart = person1pastmeetings / (mostMeetingsPerPerson * 1.0);
  const person2meetingsPart = person2pastmeetings / (mostMeetingsPerPerson * 1.0);

  const combinedMeetingsPart = 1.0 - (person1meetingsPart + person2meetingsPart) / 2.0;

  const random = Math.random() * combinedMeetingsPart;

  const randomScore = (combinedMeetingsPart + random) / 2.0;

  return randomScore;
}

function getScoredMeetings(allPossibleMeetings, pastMeetingsPerPerson, participants) {
  const pastMeetingPersonEmails = Object.keys(pastMeetingsPerPerson);
  const timestamp = Utilities.formatDate(new Date(), 'GMT+1', 'dd/MM/yyyy');
  const scoredMeetingsLogArr = [];
  const scoredMeetingsByPerson = {};

  const meetingAmountsPerPerson = pastMeetingPersonEmails.map(email => {
    return pastMeetingsPerPerson[email].length;
  });

  const mostMeetingsPerPerson = Math.max(...meetingAmountsPerPerson);

  const possibleMeetingsScored = allPossibleMeetings.map(meeting => {
    const person1Id = meeting[0];
    const person2Id = meeting[1];

    const pastMeetingsScore = getPastMeetingScore(person1Id, person2Id, pastMeetingsPerPerson);
    const typeAScore = getTypeAScore(participants[person1Id], participants[person2Id]);
    const typeBScore = getTypeBScore(participants[person1Id], participants[person2Id]);
    const randomScore = getRandomScore(
      person1Id,
      person2Id,
      pastMeetingsPerPerson,
      mostMeetingsPerPerson
    );

    const score = pastMeetingsScore + typeAScore + typeBScore + randomScore;

    scoredMeetingsLogArr.push([
      timestamp,
      person1Id,
      person2Id,
      score,
      pastMeetingsScore,
      typeAScore,
      typeBScore,
      randomScore
    ]);

    scoredMeetingsByPerson[person1Id] = {
      ...scoredMeetingsByPerson[person1Id],
      [person2Id]: score
    };

    scoredMeetingsByPerson[person2Id] = {
      ...scoredMeetingsByPerson[person2Id],
      [person1Id]: score
    };

    return [meeting, score];
  });

  writeScoredMeetingsLog(scoredMeetingsLogArr);

  return [possibleMeetingsScored, scoredMeetingsByPerson];
}

function init2DMatrix(dimensions) {
  const array = [];
  for (let i = 0; i < dimensions[0]; i += 1) {
    array.push(dimensions.length === 1 ? 100 : init2DMatrix(dimensions.slice(1)));
  }
  return array;
}

/**
 * Create two dimensional matrix of participants' meeting scores.
 * Needed for Hungarian algorithm (munkres).
 *
 * @param {Array[String]} participants - participant emails
 * @param {Array[]} allPossibleMeetings - email pairs and their scores
 *
 * @returns {Array[]} Score matrix
 */
function createScoreMatrix(participants, scoredMeetingsByPerson) {
  const scoreMatrix = init2DMatrix([participants.length, participants.length]);

  for (let y = 0; y < scoreMatrix.length; y += 1) {
    for (let x = 0; x < scoreMatrix.length; x += 1) {
      if (x !== y) {
        const participant1 = participants[y];
        const participant2 = participants[x];
        const meetingScore =
          scoredMeetingsByPerson[participant1][participant2] ||
          scoredMeetingsByPerson[participant2][participant1];
        scoreMatrix[y][x] = meetingScore.toFixed(4) || NaN;
      }
    }
  }

  return scoreMatrix;
}

function chooseMeetingsBasedOnMunkresAlgorithm(participantIds, scoredMeetingsByPerson) {
  console.time('chooseMeetingsBasedOnMunkres()');
  const scoreMatrix = createScoreMatrix(participantIds, scoredMeetingsByPerson);
  Logger.log(`scoreMatrix.length: ${scoreMatrix.length}`);
  const selectedPairs = munkres(scoreMatrix); // Notice! O(n^3) time complexity
  const meetingsArr = [];
  const meetingsObj = {};

  selectedPairs.forEach(([p1Idx, p2Idx]) => {
    const p1 = participantIds[p1Idx];
    const p2 = participantIds[p2Idx];
    const paired = p1 in meetingsObj || p2 in meetingsObj;

    if (!paired) {
      meetingsArr.push([p1, p2, scoreMatrix[p1Idx][p2Idx]]);
      meetingsObj[p1] = true;
      meetingsObj[p2] = true;
    }
  });

  console.timeEnd('chooseMeetingsBasedOnMunkres()');
  return meetingsArr;
}

function chooseMeetingsBasedOnScore(possibleMeetingsScored) {
  console.time('chooseMeetingsBasedOnScore()');
  const scoredSortedMeetings = possibleMeetingsScored.sort((a, b) => (a[1] > b[1] ? 1 : -1));

  const meetingsThisRound = {};
  const meetingsArray = [];

  for (let i = 0; i < scoredSortedMeetings.length; i += 1) {
    if (!scoredSortedMeetings[i] || !scoredSortedMeetings[i][0]) {
      break;
    }
    const person1 = scoredSortedMeetings[i][0][0];
    const person2 = scoredSortedMeetings[i][0][1];
    const score = scoredSortedMeetings[i][1];

    if (!meetingsThisRound[person1] && !meetingsThisRound[person2]) {
      meetingsThisRound[person1] = person2;
      meetingsThisRound[person2] = person1;
      meetingsArray.push([person1, person2, score]);
    }
  }

  console.timeEnd('chooseMeetingsBasedOnScore()');
  return meetingsArray;
}

function dropOddPerson(participants) {
  const { leftOverPerson } = SETTINGS;
  const emails = Object.keys(participants);
  const randomEmail = emails[Math.floor(Math.random() * emails.length)];
  const emailToDrop = participants[leftOverPerson] !== undefined ? leftOverPerson : randomEmail;

  Logger.log(`Uneven number of participants,  ${emailToDrop} will be dropped out of meetings.`);

  const { [emailToDrop]: _, ...rest } = participants;

  return rest;
}

export default function generateMeetings() {
  const participantsUnfiltered = readParticipants();

  const numberOfParticipants = Object.keys(participantsUnfiltered).length;

  Logger.log(`Total ${numberOfParticipants} participants.`);

  const participants =
    numberOfParticipants % 2 === 0 ? participantsUnfiltered : dropOddPerson(participantsUnfiltered);

  const pastMeetings = readMeetings();
  const allParticipantIds = Object.keys(participants);
  const pastMeetingsPerPerson = {};

  allParticipantIds.forEach(singleParticipantId => {
    const pastMeetingsOfParticipant = pastMeetings.filter(meeting => {
      return meeting.indexOf(singleParticipantId) > -1;
    });

    const pastMeetingsOfParticipantCleaned = [...pastMeetingsOfParticipant].filter(
      id => id !== singleParticipantId
    );

    pastMeetingsPerPerson[singleParticipantId] = pastMeetingsOfParticipantCleaned;
  });

  const allPossibleMeetings = generatePossibleMeetings(allParticipantIds);

  const [possibleMeetingsScored, scoredMeetingsByPerson] = getScoredMeetings(
    allPossibleMeetings,
    pastMeetingsPerPerson,
    participants
  );

  const meetingsArray = SETTINGS.useMunkresAlgo
    ? chooseMeetingsBasedOnMunkresAlgorithm(allParticipantIds, scoredMeetingsByPerson)
    : chooseMeetingsBasedOnScore(possibleMeetingsScored);

  const meetingsArrayWithResponsiblePersonShuffled = meetingsArray.map(meeting =>
    Math.random() >= 0.5
      ? [meeting[0], meeting[1], meeting[2]]
      : [meeting[1], meeting[0], meeting[2]]
  );

  writeMeetings(meetingsArrayWithResponsiblePersonShuffled);
}
