import Ember from 'ember';
import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  
  pathForType: function(type) {
    let camelized = Ember.String.camelize(type);
    return Ember.String.pluralize(camelized) + '.json';
  },

  urlForFindRecord: function (id/*, modelName, snapshot*/)  {
    let host = this.get('host');
    return host + '/datasets/' + id + '.json';
  }
  
});
