import { keyBy } from 'lodash';
import {
  readMeetings,
  readSettings,
  readParticipants,
  writeEmailSent
} from './read-and-write-spreadsheets';

function replacePlaceholders(inputString, person1, person2) {
  const placeHoldersToReplace = [
    { '{person1.firstName}': person1.firstName },
    { '{person2.firstName}': person2.firstName },
    { '{person1.lastName}': person1.lastName },
    { '{person2.lastName}': person2.lastName },
    { '{person1.fullName}': person1.fullName },
    { '{person2.fullName}': person2.fullName },
    { '{personWithInitiative}': person1.fullName }
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
  const participants = keyBy(readParticipants(), 'email');

  const meetings = readMeetings();

  const settings = readSettings();

  const quotaErrorMessage = `Your email send quota is full, try again tomorrow or have another person run the 'Send emails' script!`;

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

      //   const htmlBody = `
      //   <html>
      //   <p>
      //     Hellurei, <strong>${person1.firstName}</strong> ja <strong>${person2.firstName}</strong>! Taas
      //     jyrähtää käyntiin eksponentiaalinen tällijakso!
      //   </p>

      //   <p>
      //     Tässä teidän tälliparinne yhteystiedot:
      //   </p>

      //   <ul>
      //     <li>
      //       ${person1.fullName},&nbsp;${person1.phone},${person1.email}&nbsp;&nbsp;&nbsp;&nbsp;<--&nbsp;aloitevastuussa*
      //     </li>
      //     <li>${person2.fullName},&nbsp;${person2.phone},${person2.email}</li>
      //   </ul>

      //   <p>Iloista tälläilyä!</p>

      //   <p>Terkuin,<br />Eksponentiaalinen tällibotti</p>

      //   <p>
      //     <small
      //       >* Tämän henkilön tehtävänä on ottaa yhteyttä tällipariin ajan ja paikan sopimiseksi. Toki
      //       myös toinenkin henkilö saa halutessaan ottaa kopin yhteydenpidon aloittamisesta :)
      //     </small>
      //   </p>
      //   <p>
      //     <small
      //       >Jos haluat jäädä tauolle tälleistä, voit päivittää tietosi
      //       <a href="https://forms.gle/GpeFnmc9pa3R82kJ8">täällä</a>.<br />
      //       Onko sinulla palautetta tai kehitysideoita tällityökalun suhteen? Laita niitä tulemaan
      //       työkalun kehittäjälle <a href="mailto:oula.antere@gmail.com">Oulalle</a>!
      //     </small>
      //   </p>
      // </html>
      //   `;

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

      Logger.log(htmlBody);

      if (false) {
        const emailQuotaRemaining = MailApp.getRemainingDailyQuota();
        if (emailQuotaRemaining >= 2) {
          GmailApp.sendEmail(person1email, subject, '', options1);
          if (false) {
            GmailApp.sendEmail(person2email, subject, '', options2);
          }
          const timestamp = new Date().toString();
          writeEmailSent(i + 2, timestamp);
        } else {
          writeEmailSent(i + 2, quotaErrorMessage);
        }
      }
    }
  }
}
