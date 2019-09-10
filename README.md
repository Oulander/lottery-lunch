# Lottery lunch pairing generator

## Installation

### Google sheet

Create a google sheet (you can link a google form to it later)

TODO: An example spreadsheet with mock data.

### Development environment

TODO: Create config file that has all stuff that is specific for a single instance of this project.

Based on Amit Agarwal's awesome Apps Script starter kit.
For more info:
https://github.com/labnol/apps-script-starter

First clone the repo and run npm install.

```
git clone https://github.com/Oulander/lottery-lunch lottery-lunch
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

Create clasp.json to the root
Get script id from the spreadsheet's script editor

TODO: Add example config file

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
