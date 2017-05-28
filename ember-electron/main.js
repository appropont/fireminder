const { app, BrowserWindow, protocol } = require('electron');
const { dirname, join, resolve } = require('path');
const protocolServe = require('electron-protocol-serve');

const axios = require('axios');
const superagent = require('superagent');

let mainWindow = null;

// Functions to be called from inside of the Ember app.
// Might be good to extract them to a separate file.
global.checkUrl = function(url) {
  return axios.get(url)
    .then((response) => {
      return response.status === 200;
    })
    .catch((error) => {
      return false;
    });
};

global.sendEmailNotification = function(site, settings) {
  return axios.post(`https://api.mailgun.net/v3/${settings.emailDomain}/messages`, {}, {
      auth: {
        username: 'api',
        password: settings.emailKey
      },
      params: {
        from: settings.emailRecipient,
        to: settings.emailRecipient,
        subject: `Fireminder: ${site.url} is down`,
        text: `The site appears to be down.`        
      }
    })
    .then((response) => {
      if(response.status === 200) {
        return {success: true};
      } else {
        return {error: response};
      }
    })
    .catch((error) => {
      return { error };
    })
};

global.sendSMSNotification = function(site, settings) {

  // TODO: Investigate why this code failed, possibly submit bug report to axios github.
  // Committing to repo to have a record of it to fetch later. Remove on next commit
  // This request was failing in a way that seemed consistent with not having the Content-Type set properly.
  // However, when logging the response, it was showing that the header was actually set as expected.
  // Regardless, this did not work, but the very similar superagent code below did.
  // return axios.post(`https://api.twilio.com/2010-04-01/Accounts/${settings.smsTwilioId}/Messages.json`, {}, {
  //     headers: {
  //       'Content-type': 'application/x-www-form-urlencoded'
  //     },
  //     auth: {
  //       username: settings.smsTwilioId,
  //       password: settings.smsTwilioToken,
  //     },
  //     data: {
  //       To: settings.smsRecipient,
  //       From: settings.smsSender,
  //       Body: `Fireminder: ${site.url} is down.`,
  //     },
  //   })
  //   .then((response) => {
  //     if(response.status === 200) {
  //       return {success: true};
  //     } else {
  //       console.log('non200 response: ', response)
  //       return { error: response };
  //     }
  //   })
  //   .catch((error) => {
  //     console.log('error: ', error);
  //     return { error };
  //   })

  return new Promise(function(resolve, reject) {
    try {
      superagent
        .post(`https://api.twilio.com/2010-04-01/Accounts/${settings.smsTwilioId}/Messages.json`)
        .auth(settings.smsTwilioId, settings.smsTwilioToken)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          To: settings.smsRecipient,
          From: settings.smsSender,
          Body: `Fireminder: ${site.url} is down.`,
        })
        .end(function(error, response) {
          if(error) {
            reject({ error });
          }
          if(response.statusCode < 300) {
            resolve(response.body);
          } else {
            reject({error: response });
          }
        });

    } catch(error) {
      reject({ error });
    }
  });


};

// Registering a protocol & schema to serve our Ember application
protocol.registerStandardSchemes(['serve'], { secure: true });
protocolServe({
  cwd: join(__dirname || resolve(dirname('')), '..', 'ember'),
  app,
  protocol,
});

// Uncomment the lines below to enable Electron's crash reporter
// For more information, see http://electron.atom.io/docs/api/crash-reporter/
// electron.crashReporter.start({
//     productName: 'YourName',
//     companyName: 'YourCompany',
//     submitURL: 'https://your-domain.com/url-to-submit',
//     autoSubmit: true
// });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 320,
    height: 600,
    frame: false,
});

  // If you want to open up dev tools programmatically, call
  mainWindow.openDevTools();

  const emberAppLocation = 'serve://dist';

  // Load the ember application using our custom protocol/scheme
  mainWindow.loadURL(emberAppLocation);

  // If a loading operation goes wrong, we'll send Electron back to
  // Ember App entry point
  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.loadURL(emberAppLocation);
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('Your Ember app (or other code) in the main window has crashed.');
    console.error('This is a serious issue that needs to be handled and/or debugged.');
  });

  mainWindow.on('unresponsive', () => {
    console.warn('Your Ember app (or other code) has made the window unresponsive.');
  });

  mainWindow.on('responsive', () => {
    console.warn('The main window has become responsive again.');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

// Handle an unhandled error in the main thread
//
// Note that 'uncaughtException' is a crude mechanism for exception handling intended to
// be used only as a last resort. The event should not be used as an equivalent to
// "On Error Resume Next". Unhandled exceptions inherently mean that an application is in
// an undefined state. Attempting to resume application code without properly recovering
// from the exception can cause additional unforeseen and unpredictable issues.
//
// Attempting to resume normally after an uncaught exception can be similar to pulling out
// of the power cord when upgrading a computer -- nine out of ten times nothing happens -
// but the 10th time, the system becomes corrupted.
//
// The correct use of 'uncaughtException' is to perform synchronous cleanup of allocated
// resources (e.g. file descriptors, handles, etc) before shutting down the process. It is
// not safe to resume normal operation after 'uncaughtException'.
process.on('uncaughtException', (err) => {
  console.error('An exception in the main thread was not handled.');
  console.error('This is a serious issue that needs to be handled and/or debugged.');
  console.error(`Exception: ${err}`);
});
