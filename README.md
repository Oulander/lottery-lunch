# Lottery lunch pairing generator

## Installation

### Google environment

Read instructions.pdf and copy initial form to your drive from [this link.](https://drive.google.com/open?id=1QCP4pGlA-mGtN0qac88k1IgUi6QAOzM3)

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

Create clasp.json to the root.
Get the script id from the spreadsheet's script editor.

```
{
  "scriptId": "your_script_id_here",
  "rootDir": "./dist",
}
```
TODO: Add example clasp.json file


Build your code and check that the ./dist folder got populated

```
npm run build
```

Push the code to your spreadsheet

```
npm run upload
```

In the future you can combine the above steps with

```
npm run deploy
```

If everything went smoothly, you should see the uploaded code in the
script editor in your browser, and the `Lottery Lunch Menu` should be
present in your spreadsheet.

Happy developing!

[MIT License](https://github.com/labnol/apps-script-starter/blob/master/LICENSE) (c) [Oula Antere](https://linkedin.com/in/oulaantere)
