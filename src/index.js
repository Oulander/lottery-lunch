import generateMeetings from './meeting-generator';

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('Lottery Lunch Menu')
    .addItem('Generate meetings', 'generateMeetings')
    .addSeparator()
    .addItem('Send emails', 'sendEmails')
    .addToUi();
}

function sendEmails() {
  SpreadsheetApp.getUi().alert('Email functionality not yet available!');
}

global.onOpen = onOpen;
global.sendEmails = sendEmails;
global.generateMeetings = generateMeetings;
