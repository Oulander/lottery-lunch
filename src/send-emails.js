import {
  readMeetings,
  readSettings,
  readParticipants,
  writeEmailSent
} from './read-and-write-spreadsheets';

function generateContactDetails(person1, person2) {
  const person1Details = { Email: person1.email, ...person1.optionalTypeValues.typeContact };
  const person2Details = { Email: person2.email, ...person2.optionalTypeValues.typeContact };

  function formatContactDetails(details) {
    const formattedDetailsArr = [];
    Object.keys(details).forEach(field => {
      formattedDetailsArr.push(`<li>${field}: ${details[field]}</li>`);
    });

    return formattedDetailsArr.join('');
  }

  const person1Formatted = formatContactDetails(person1Details);
  const person2Formatted = formatContactDetails(person2Details);

  const combinedDetails = `
    <p><b>${person1.fullName}</b>:
      <ul>
        ${person1Formatted}
      </ul>
    </p>
    <p><b>${person2.fullName}</b>:
      <ul>
        ${person2Formatted}
      </ul>
    </p>
  `;

  return combinedDetails;
}

function replacePlaceholders(inputString, person1, person2) {
  const placeHoldersToReplace = [
    { '{person1.firstName}': person1.firstName },
    { '{person2.firstName}': person2.firstName },
    { '{person1.lastName}': person1.lastName },
    { '{person2.lastName}': person2.lastName },
    { '{person1.fullName}': person1.fullName },
    { '{person2.fullName}': person2.fullName },
    { '{personWithInitiative}': person1.fullName },
    { '{contactDetails}': generateContactDetails(person1, person2) }
  ];

  const replaced = placeHoldersToReplace.reduce(
    (f, s) => `${f}`.replace(Object.keys(s)[0], s[Object.keys(s)[0]]),
    inputString
  );

  return replaced;
}

function generateEmailContent(person1, person2, settings) {
  const { senderNameRaw, subjectRaw, htmlBodyRaw } = settings;

  const senderName = senderNameRaw;
  const subject = replacePlaceholders(subjectRaw, person1, person2);
  const htmlBody = replacePlaceholders(htmlBodyRaw, person1, person2);

  return { senderName, subject, htmlBody };
}

export default function sendEmails() {
  const participants = readParticipants();
  const meetings = readMeetings();
  const settings = readSettings();

  const quotaErrorMessage = `Your email send quota is full, try again tomorrow or have another person run the 'Send emails' script!`;
  const sentEmailsLog = [];

  for (let i = 0; i < meetings.length; i += 1) {
    const currentMeeting = meetings[i];
    if (
      (currentMeeting[0].length === 0 || currentMeeting[0] === quotaErrorMessage) &&
      currentMeeting[1].length > 0 &&
      currentMeeting[2].length > 0
    ) {
      const person1email = currentMeeting[1];
      const person2email = currentMeeting[2];

      const person1 = participants[person1email];
      const person2 = participants[person2email];

      const { senderName, subject, htmlBody } = generateEmailContent(person1, person2, settings);

      const basicOptions = {
        htmlBody,
        name: senderName
      };

      const options1 = {
        replyTo: person2email,
        ...basicOptions
      };

      const options2 = {
        replyTo: person1email,
        ...basicOptions
      };

      const emailQuotaRemaining = MailApp.getRemainingDailyQuota();
      if (emailQuotaRemaining >= 2) {
        GmailApp.sendEmail(person1email, subject, '', options1);
        GmailApp.sendEmail(person2email, subject, '', options2);
        const timestamp = new Date().toString();
        writeEmailSent(i + 2, timestamp);
        sentEmailsLog.push(`[${person1email}, ${person2email}]`);
      } else {
        writeEmailSent(i + 2, quotaErrorMessage);
      }
    }
  }
  Logger.log(`Emails sent succesfully: \n ${sentEmailsLog.join(', ')}`);
}
