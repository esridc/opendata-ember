import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({

  normalizeResponse: function (store, primaryModelClass, payload, id, requestType) {

    payload.meta = payload.metadata;
    delete payload.metadata;

    var d;
    payload.data = payload.data.map(function (item) {
      d = {
        id: item.id,
        attributes: {},
        type: 'Dataset'
      };

      // NOTE: seems like this ought to be done with keyForAttribute but it didn't work
      for (var p in item) {
        if (item.hasOwnProperty(p)){
          d.attributes[Ember.String.camelize(p)] = item[p];
        }
      }

      return d;
    });

    return payload;
  },

  //WTF this doesn't work?
  // keyForAttribute: function(attr, method) {
  //   debugger;
  //   return Ember.String.decamelize(attr);
  // }

});
