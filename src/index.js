import generateMeetings from './generate-meetings';
import sendEmails from './send-emails';

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Lottery Lunch Menu')
    .addItem('Generate meetings', 'generateMeetings')
    .addSeparator()
    .addItem('Send emails', 'sendEmails')
    .addToUi();
}

global.onOpen = onOpen;
global.sendEmails = sendEmails;
global.generateMeetings = generateMeetings;
