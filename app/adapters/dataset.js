import Ember from 'ember';
import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  
  pathForType: function(type) {
    var camelized = Ember.String.camelize(type);
    return Ember.String.pluralize(camelized) + '.json';
  }
  
});
