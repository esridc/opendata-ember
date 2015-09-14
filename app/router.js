import Ember from 'ember';
import config from './config/environment';

let Router = Ember.Router.extend({
  rootURL: config.rootURL,
  location: config.locationType
});

Router.map(function() {
  this.resource('datasets', function () {});
  this.resource('dataset', { path: '/datasets/:id' });
});

export default Router;
