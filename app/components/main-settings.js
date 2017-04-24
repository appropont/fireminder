import Ember from 'ember';


const fields = [
  'enableDesktopNotifications',
  'enableEmailNotifications',
  'emailRecipient',
  'emailDomain',
  'emailKey',
  'enableSMSNotifications',
  'smsRecipient',
  'smsSender',
  'smsTwilioId',
  'smsTwilioToken',
];

export default Ember.Component.extend({

  enableDesktopNotifications: true,

  enableEmailNotifications: false,
  emailRecipient: '',
  emailDomain: '',
  emailKey: '',

  enableSMSNotifications: false,
  smsReceipient: '',
  smsSender: '',
  smsId: '',
  smsToken: '',

  actions: {
    toggleNotifications(type) {
      this.set(`enable${type}Notifications`, !this.get(`enable${type}Notifications`));
      console.log('desktop', this.get('enableDesktopNotifications'));
    },
    saveSettings() {
      const values = {};
      fields.map((field) => {
        values[field] = this.get(field);
      });
      this.get('save')(values);
    },
    cancel() {
      this.get('cancel')();
    }
  },

  didInsertElement() {
    console.log('didInsert Settings', this.get('settings').content);
    const settings = this.get('settings').content;
    fields.map((field) => {
      if(settings[field] || settings[field] === false) {
        this.set(field, settings[field]);
      }
  })
  }

});
