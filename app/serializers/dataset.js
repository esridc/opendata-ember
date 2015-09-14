import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({

  normalizeResponse: function (store, primaryModelClass, payload/*, id, requestType*/) {

    payload.meta = payload.metadata || {};
    delete payload.metadata;

    if (Ember.isArray(payload.data)) {
      payload.data = payload.data.map(this._mapDataset);
    } else {
      payload.data = this._mapDataset(payload.data);
    }
    

    return payload;
  },

  _mapDataset: function (item) {
    let d = {
        id: item.id,
        attributes: {},
        type: 'Dataset'
      };

      // NOTE: seems like this ought to be done with keyForAttribute but it didn't work
      for (let p in item) {
        if (item.hasOwnProperty(p)){
          d.attributes[Ember.String.camelize(p)] = item[p];
        }
      }

      return d;
  }

});
