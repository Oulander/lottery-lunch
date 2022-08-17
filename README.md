# Lottery lunch pairing generator

## Usage instructions

Here's a template folder including necessary spreadsheet and form templates. Create a copy of them to your personal or organization's Google Drive:
[Google Drive Example.](https://drive.google.com/open?id=1QCP4pGlA-mGtN0qac88k1IgUi6QAOzM3)

Make sure that

- the form output points to the spreadsheet. In detail, the form answers must point to a tab called `Form responses 1`
- If your spreadsheet is in another language, rename the form response sheet to `Form responses 1`
- Read the instructions / pairing logic from spreadsheet tab called `Column types README`
- Change all necessary info from the spreadsheet tab called `settings`. Also, don't change the name of the `settings` tab.
  - Notice! Using Hungarian algorithm gives optimal lottery pairs, but it's very slow (O(n<sup>3</sup>)) with many lottery participants (e.g. 150 participants -> ~5min runtime). Based on you account (normal or GSuite), Google app script has a 6 or 30 minute execution time limit, which you can check from your spreadsheet's `Lottery Lunch Menu`.
- Don't change the name of the `meetings` tab.

Then,
1. Send the form to desired people
2. Press `Genererate meetings` button from the spreadsheet's `Lottery Lunch Menu` (new meetings should appear to the meetings tab)
3. If everything looks ok, send the mails by pressing `Send emails` button (emails are sent when a timestamps appear to the `meetings` tab

## Development instructions

You can customize the tool to suit your needs locally with JavaScript.

The development environment is based on Amit Agarwal's awesome Apps Script starter kit.
For more info:
https://github.com/labnol/apps-script-starter

### Requirements

- Node
- Text editor of your choice. VScode at least does a good job
  with syntax highlighting, autocorrection etc.

### Check that you have the required spreadsheet and form.

Copy initial form and spreadsheet to your drive from [this link.](https://drive.google.com/open?id=1QCP4pGlA-mGtN0qac88k1IgUi6QAOzM3)

Make sure that

- the form output points to the spreadsheet
- there is a `Form responses 1` sheet in the spreadsheet
- If your spreadsheet is in another language, rename the form response sheet to `Form responses 1`
- Read the instructions / pairing logic from spreadsheet tab called `Column types README`
- Change all necessary info from the spreadsheet tab called `settings` 

### Get the source code

Clone this (or the original) repo and run npm install.

```
git clone https://github.com/athenekilta/lottery-lunch.git
cd lottery-lunch
npm install
```

If you're using a fork and want to keep your version up to date with the main repo, use [these instructions.](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork)

### Enable script API and link the spreadsheet to your local code

```
Go to script.google.com --> settings, enable Google Apps Script API from settings
```

Get the script id from the spreadsheet's script editor. You can find the
script editor from the spreadsheet's toolbar at `Tools -> Script editor`. If you're unable to open script editor make sure you are signed out of ALL other Google accounts. Then ONLY sign into the account that contains the Sheet's document.

In the editor, go to `File -> Project properties` and give your project a name.
You will find your `Script ID` under the `Info` tab.

Add your script id to the `example.clasp.json` -file, and remove the `example` -prefix so that the filename will be `.clasp.json`.

```
{
  "scriptId": "your_script_id_here",
  "rootDir": "./dist",
}
```

### Build and upload your code

Build your code and check that the ./dist folder got populated

```
npm run build
```

The console output should look be similar to this

```
> apps-script-starter@3.4.1 build .../lottery-lunch
> webpack

Hash: 7514a62f1696d806a3a2
Version: webpack 4.39.3
Time: 1639ms
Built at: 11/16/2019 2:21:54 PM
          Asset       Size  Chunks             Chunk Names
appsscript.json  220 bytes          [emitted]
  code-3.4.1.js    547 KiB       0  [emitted]  main
Entrypoint main = code-3.4.1.js
[0] ./src/index.js 431 bytes {0} [built]
[1] (webpack)/buildin/global.js 472 bytes {0} [built]
[2] ./src/generate-meetings.js 4.77 KiB {0} [built]
[4] (webpack)/buildin/module.js 497 bytes {0} [built]
[5] ./src/read-and-write-spreadsheets.js 2.87 KiB {0} [built]
[6] ./src/send-emails.js 4.19 KiB {0} [built]
    + 1 hidden module
```

Login to Google with Clasp to allow pushing code to the spreadsheet from the command line. Login with the account you will be using for the lottery lunch tool. It might be convenient to create a separate lottery lunch account, especially for organizational use.

```
npx clasp login
```

Push the code to your spreadsheet

```
npm run upload
```

The console output should look be similar to this

```
? Manifest file has been updated. Do you want to push and overwrite? Yes
└─ dist/appsscript.json
└─ dist/code-3.4.1.js
```

In the future, to build the code and push it to the spreadsheet, you can combine the the build and upload steps with

```
npm run deploy
```

In your browser, refresh both the script editor and the spreadsheet pages.

If everything went smoothly, you should see the uploaded code in the
script editor, and the `Lottery Lunch Menu` should be
present in your spreadsheet.

Happy developing!

[MIT License](https://github.com/labnol/apps-script-starter/blob/master/LICENSE) (c) [Oula Antere](https://linkedin.com/in/oulaantere)
