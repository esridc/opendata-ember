import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({

  normalizeResponse: function (store, primaryModelClass, payload/*, id, requestType*/) {

    console.log(payload);

    if (Ember.isArray(payload.data)) {
      payload.data = payload.data.map(this._mapDataset);
    } else {
      payload.data = this._mapDataset(payload.data);
    }


    return payload;
  },

  _mapDataset: function (item) {
    if(!item.attributes.name){
      item.attributes.name = item.attributes.item_name;
    }

    return item;
  }

});
