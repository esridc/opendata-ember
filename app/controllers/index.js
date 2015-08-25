// import Ember from 'ember';
import ApplicationController from './application';

export default ApplicationController.extend({

  reopen: function () {
    console.debug('>>>>> reopen');
  }

});
