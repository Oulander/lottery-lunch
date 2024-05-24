export default function alertExecutionTimeLimit() {
  const GMAIL_USER = /(gmail|googlemail)/.test(Session.getActiveUser().getEmail());
  const ONE_SECOND = 1000;
  const ONE_MINUTE = ONE_SECOND * 60;
  const MAX_EXECUTION_TIME_MS = ONE_MINUTE * (GMAIL_USER ? 6 : 30);
  const MAX_EXECUTION_TIME_MS_MINUTES = MAX_EXECUTION_TIME_MS / 1000 / 60;
  Logger.log(`Script execution time: ${MAX_EXECUTION_TIME_MS_MINUTES} minutes.`);
  SpreadsheetApp.getUi().alert(
    `Your app script execution time limit is ${MAX_EXECUTION_TIME_MS_MINUTES} minutes`
  );
}
