import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('datasets');
  this.resource('dataset', { path: '/datasets/:id' });
});

export default Router;
