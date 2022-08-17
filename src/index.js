import generateMeetings from './generate-meetings';
import sendEmails from './send-emails';
import alertExecutionTimeLimit from './helper';

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Lottery Lunch Menu')
    .addItem('Generate meetings', 'generateMeetings')
    .addSeparator()
    .addItem('Send emails', 'sendEmails')
    .addSeparator()
    .addItem('Show execution time limit', 'alertExecutionTimeLimit')
    .addToUi();
}

global.onOpen = onOpen;
global.sendEmails = sendEmails;
global.generateMeetings = generateMeetings;
global.alertExecutionTimeLimit = alertExecutionTimeLimit;
