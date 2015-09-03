import Ember from 'ember';
import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  
  pathForType: function(type) {
    var camelized = Ember.String.camelize(type);
    return Ember.String.pluralize(camelized) + '.json';
  },

  urlForFindRecord: function (id/*, modelName, snapshot*/)  {
    var host = this.get('host');
    return host + '/datasets/' + id + '.json';
  }
  
});
