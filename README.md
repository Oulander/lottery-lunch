# Lottery lunch pairing generator

## Installation

### Google environment

Read instructions.pdf and copy initial form to your drive from [this link.](https://drive.google.com/open?id=1QCP4pGlA-mGtN0qac88k1IgUi6QAOzM3)

Make sure that

- the form output points to the spreadsheet
- there is a `Form responses 1` sheet in the spreadsheet (or whatever that is in the language of your Google Apps)
- `Form responses 1` is the first sheet of the spreadsheet

### Development environment

TODO: Create config file that has all stuff that is specific for a single instance of this project.

Based on Amit Agarwal's awesome Apps Script starter kit.
For more info:
https://github.com/labnol/apps-script-starter

First clone the repo and run npm install.

```
git clone https://github.com/Oulander/lottery-lunch lottery-lunch-<INSERT ORGANIZATION NAME>
cd lottery-lunch
npm install
```

Login to Google

```
npx clasp login
```

Enable script API

```
Go to script.google.com --> settings, enable Google Apps Script API from settings
```

Get the script id from the spreadsheet's script editor. You can find the
script editor from the spreadsheet's toolbar at `Tools -> Script editor`.

In the editor, go to `File -> Project properties` and give your project a name.
You will find your `Script ID` under the `Info` tab.

Add your script id to the `example.clasp.json` -file, and remove the `example` -prefix so that the filename will be `.clasp.json`.

```
{
  "scriptId": "your_script_id_here",
  "rootDir": "./dist",
}
```

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

In the future you can combine the above steps with

```
npm run deploy
```

In your browser, refresh both the script editor and the spreadsheet pages.

If everything went smoothly, you should see the uploaded code in the
script editor, and the `Lottery Lunch Menu` should be
present in your spreadsheet.

Happy developing!

[MIT License](https://github.com/labnol/apps-script-starter/blob/master/LICENSE) (c) [Oula Antere](https://linkedin.com/in/oulaantere)
