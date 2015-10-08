import Ember from 'ember';
import DS from 'ember-data';
import ENV from 'opendata-ember/config/environment';

export default Ember.Component.extend({

  baseUrl: function () {
    let model = this.get('model');
    let url = ENV.APP.API;
    url += DS.JSONAPIAdapter.prototype.buildURL('dataset', model.get('id'));
    return url;
  }.property('model.id')

});
