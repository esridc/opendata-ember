import Ember from 'ember';
import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  pathForType: function(type) {
    let camelized = Ember.String.camelize(type);
    return Ember.String.pluralize(camelized);
  },

  urlForFindRecord: function (id/*, modelName, snapshot*/)  {
    console.log('Dataset Adapter: urlForFindRecord called id: ' + id );
    let host = this.get('host');
    console.log('bob');
    console.log(host + '/api/v2/datasets/' + id);
    return host + '/api/v2/datasets/' + id;
  }

});
