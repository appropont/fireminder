import Ember from 'ember';

export default Ember.Component.extend({

  url: '',
  timer: 4,
  scheme: 'https',

  actions: {
    validateForm() {
      Ember.run.debounce(this, this.formIsValid(), 300);
    },
    setScheme(scheme) {
      console.log('set scheme', scheme);
      this.set('scheme', scheme);
    },
    addSite() {

      // validate form
      if(!this.formIsValid()) {
        return;
      }

      // call parent add function
      this.get('addSite')({
        url: this.get('url'),
        timer: this.get('timer'),
        lastChecked: 0,
        scheme: this.get('scheme'),
      });

      // reset values
      this.set('url', '');
      this.set('timer', 4);

    },
    cancel() {
      this.set('url', '');
      this.set('timer', 4);
      this.get('cancel')();
    }
  },

  // form validation logic

  invalidUrl: false,
  invalidTimer: false,

  formIsValid() {

    // start with fresh validation state
    this.set('invalidUrl', false);
    this.set('invalidTimer', false);

    // convenience variables
    const url = this.get('url');
    const timer = this.get('timer');

    // check for empty url
    if(url === '') {
      this.set('invalidUrl', true);
    }

    // check for at least one period
    if(url.indexOf('.') === -1) {
      this.set('invalidUrl', true);
    }

    // check if timer is an integer
    if(!Number.isInteger(timer)) {
      this.set('invalidTimer', true);
    }

    // check if timer is within the acceptable range
    if(timer < 1 || timer > 24) {
      this.set('invalidTimer', true);
    }

    // check flags and return false if invalid
    if(this.get('invalidUrl') || this.get('invalidTimer')) {
      return false;
    }

    return true;
  },

  isHttps: Ember.computed('scheme', function() {
    return this.get('scheme') === 'https';
  })

});
