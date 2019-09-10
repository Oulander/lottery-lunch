import { keyBy } from 'lodash';
import { readMeetings, readParticipants, writeEmailSent } from './read-and-write-spreadsheets';

export default function sendEmails() {
  const participants = keyBy(readParticipants(), 'email');
  const meetings = readMeetings();
  const senderName = 'Tällibotti';

  const quotaErrorMessage = 'Gmail-quota täynnä, yritä huomenna uudelleen!';

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

      const subject = `Eksponentiaalinen tällipari ${person1.firstName.toUpperCase()} ja ${person2.firstName.toUpperCase()}, aloitevastuussa ${person1.firstName.toUpperCase()}`;

      const htmlBody = `
      <html>
      <p>
        Hellurei, <strong>${person1.firstName}</strong> ja <strong>${person2.firstName}</strong>! Taas
        jyrähtää käyntiin eksponentiaalinen tällijakso!
      </p>
    
      <p>
        Tässä teidän tälliparinne yhteystiedot:
      </p>
    
      <ul>
        <li>
          ${person1.fullName},&nbsp;${person1.phone},${person1.email}&nbsp;&nbsp;&nbsp;&nbsp;<--&nbsp;aloitevastuussa*
        </li>
        <li>${person2.fullName},&nbsp;${person2.phone},${person2.email}</li>
      </ul>
    
      <p>Iloista tälläilyä!</p>
    
      <p>Terkuin,<br />Eksponentiaalinen tällibotti</p>
    
      <p>
        <small
          >* Tämän henkilön tehtävänä on ottaa yhteyttä tällipariin ajan ja paikan sopimiseksi. Toki
          myös toinenkin henkilö saa halutessaan ottaa kopin yhteydenpidon aloittamisesta :)
        </small>
      </p>
      <p>
        <small
          >Jos haluat jäädä tauolle tälleistä, voit päivittää tietosi
          <a href="https://forms.gle/GpeFnmc9pa3R82kJ8">täällä</a>.<br />
          Onko sinulla palautetta tai kehitysideoita tällityökalun suhteen? Laita niitä tulemaan
          työkalun kehittäjälle <a href="mailto:oula.antere@gmail.com">Oulalle</a>!
        </small>
      </p>
    </html>  
      `;

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
      } else {
        writeEmailSent(i + 2, quotaErrorMessage);
      }
    }
  }
}
