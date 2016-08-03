import Ember from 'ember';
import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  pathForType: function(type) {
    let camelized = Ember.String.camelize(type);
    return Ember.String.pluralize(camelized);
  },

  urlForFindRecord: function (id/*, modelName, snapshot*/)  {
    Ember.debug('Dataset Adapter: urlForFindRecord called id: ' + id );
    let host = this.get('host');
    let namespace = this.get('namespace');
    return `${host}/${namespace}/datasets/${id}`;
  },

  query (store, type, query) {
    Ember.debug('>>>>> query');
    query.filter = { source: 'ESRI R&D Center' };
    return this._super(store, type, query);
  }

});
