import Ember from 'ember';
import { storageFor } from 'ember-local-storage';

const remote = require('electron').remote;

export default Ember.Component.extend({

  sites: storageFor('sites'),
  settings: storageFor('settings'),

  actions: {
    toggle(id) {
      $(`#${id}`).sidebar('toggle');
    },
    addSite(site) {
      this.get('sites').addObject(site);
      this.send('toggle', 'add-site-sidebar');
    },
    updateSite(site) {
      this.get('sites').replace(site);
    },
    removeSite(site) {
      this.get('sites').removeObject(site);
    },
    saveSettings(settings) {
      for(let prop in settings) {
        if(settings[prop] || settings[prop] === false) {
          this.set(`settings.${prop}`, settings[prop]);
        }
      }
      this.send('toggle', 'settings-sidebar');
    },
    sendNotifications(site) {
      const settings = this.get('settings').content;

      if(settings.enableDesktopNotifications) {
        const notification = new Notification('Fireminder Alert', {
          body: `${site.url} is down.`
        });
      }

      if(settings.enableEmailNotifications) {
        remote.getGlobal('sendEmailNotification')(site, settings);
      }

      if(settings.enableSMSNotifications) {
        // send SMS
        remote.getGlobal('sendSMSNotification')(site, settings);
      }

    }
  }

});
