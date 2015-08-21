import DS from 'ember-data';

export default DS.ActiveModelSerializer.extend({
  
  // TODO: maybe this could go on the application serializer?

  extractArray: function (store, type, payload) {
    payload = {
      datasets: payload.data
    };
    return this._super(store, type, payload);
  },

  extractMeta: function(store, type, payload) {
    if (payload && payload.metadata) {
      store.setMetadataFor(type, payload.metadata);
    }
  }

});
