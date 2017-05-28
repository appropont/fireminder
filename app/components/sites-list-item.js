import Ember from 'ember';

const remote = require('electron').remote;

const statusClasses = {
  LOADING: 'loading',
  UP: 'up',
  DOWN: 'down',
  ERROR: 'error',
};

export default Ember.Component.extend({

  statusClass: statusClasses.LOADING,
  timeout: null,

  actions: {
    removeSite() {
      this.get('removeSite')(this.get('site'));
    },
    updateSite() {
      this.get('updateSite')(this.get('site'));
    },
    checkUrl() {
      this.checkUrl();
    }
  },

  statusIconClass: Ember.computed('statusClass', (status) => {
    switch(status) {
      case statusClasses.DOWN:
        return 'warning sign';
      default:
        return 'circle';
    }
  }),

  checkUrl() {
    this.set('statusClass', statusClasses.LOADING);
    const site = this.get('site');
    
    // perform check with node
    remote.getGlobal('checkUrl')(`${site.scheme}://${site.url}`)
      .then((isUp) => {

        // set status
        site.status = isUp === true ? statusClasses.UP : statusClasses.DOWN;
        this.set('statusClass', site.status);

        // set last checked
        site.lastChecked = Date.now();
        this.set('site', site);

        // update site in storage
        this.get('updateSite')(this.get('site'));

        // send out notifications
        if(site.status === statusClasses.DOWN) {
          this.get('sendNotifications')(site);
        }

        // queue the next check
        this.set('timeout', setTimeout(() => {
          this.checkUrl();
        }, this.get('site').timer * 1000 * 60 * 60));
      })
      .catch((error) => {
        const site = this.get('site');
        site.status = statusClasses.ERROR;
        this.set('site', site);
        this.set('statusClass', statusClasses.ERROR);
      });

  },

  didInsertElement() {

    const site = this.get('site');

    this.set('statusClass', site.status);

    const lastChecked = site.lastChecked;
    const timer = site.timer;
    // setup timeout to check url via node
    if(lastChecked + (timer * 1000 * 60 * 60) < Date.now()) {
      this.set('statusClass', statusClasses.LOADING);
      this.checkUrl();
    }
  },
  didDestroyElement() {
    clearTimeout(this.get('timeout'));
  },
});
