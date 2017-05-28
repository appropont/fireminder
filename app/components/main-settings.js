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
  smsRecipient: '',
  smsSender: '',
  smsTwilioId: '',
  smsTwilioToken: '',

  actions: {
    toggleNotifications(type) {
      this.set(`enable${type}Notifications`, !this.get(`enable${type}Notifications`));
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
    },
    loadExternalLink(link) {
      require('electron').shell.openExternal(link);
    }
  },

  didInsertElement() {
    const settings = this.get('settings').content;
    fields.map((field) => {
      if(settings[field] || settings[field] === false) {
        this.set(field, settings[field]);
      }
    })
  },

  invalidEmailRecipient: false,
  invalidEmailDomain: false,
  invalidEmailKey: false,

  invalidSMSRecipient: false,
  invalidSMSSender: false,
  invalidSMSTwilioID: false,
  invalidSMSTwilioToken: false,


  shouldDisableSave: true,

  formFieldsChanged: Ember.observer(
    ...fields,
    function() {
      this.set('shouldDisableSave', !this.formIsValid());
    }
  ),

  // This form validation is "boilerplatey" and repetitious, but seemed simpler and quicker than trying to use ember-changeset as far as MVP status is concerned.
  // TODO: Revisit ember-changeset as an option for form validation

  // Moving the individual validation results into computed properties might also be an option to reduce boilerplate.
  formIsValid() {

    let invalidEmailSettings = false;
    if(this.get('enableEmailNotifications')) {

      const emailRecipient = this.get('emailRecipient');
      const emailDomain = this.get('emailDomain');
      const emailKey = this.get('emailKey');

      this.set('invalidEmailRecipient', (
        !emailRecipient ||
        emailRecipient === ''
      ));
      this.set('invalidEmailDomain', (
        !emailDomain ||
        emailDomain === ''
      ));
      this.set('invalidEmailKey', (
        !emailKey ||
        emailKey === ''
      ));

      if(this.get('invalidEmailRecipient') || this.get('invalidEmailDomain') || this.get('invalidEmailKey')) {
        invalidEmailSettings = true;
      }

    } else {
      this.set('invalidEmailRecipient', false);
      this.set('invalidEmailDomain', false);
      this.set('invalidEmailKey', false);
    }

    let invalidSMSSettings = false;
    if(this.get('enableSMSNotifications')) {

      const smsRecipient = this.get('smsRecipient');
      const smsSender = this.get('smsSender');
      const smsTwilioId = this.get('smsTwilioId');
      const smsTwilioToken = this.get('smsTwilioToken');

      this.set('invalidSMSRecipient', (
        !smsRecipient ||
        smsRecipient === ''
      ));
      this.set('invalidSMSSender', (
        !smsSender ||
        smsSender === ''
      ));
      this.set('invalidSMSTwilioId', (
        !smsTwilioId ||
        smsTwilioId === ''
      ));
      this.set('invalidSMSTwilioToken', (
        !smsTwilioToken ||
        smsTwilioToken === ''
      ));

      if(
        this.get('invalidSMSRecipient') ||
        this.get('invalidSMSSender') ||
        this.get('invalidSMSTwilioId') ||
        this.get('invalidSMSTwilioToken')
      ) {
        invalidSMSSettings = true;
      } else {
        this.set('invalidSMSRecipient', false);
        this.set('invalidSMSSender', false);
        this.set('invalidSMSTwilioId', false);
        this.set('invalidSMSTwilioToken', false);
      }
    }
    return !(invalidEmailSettings || invalidSMSSettings);
  }

});
