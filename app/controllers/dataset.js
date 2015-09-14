import Ember from 'ember';
import DS from 'ember-data';
import ENV from 'opendata-ember/config/environment';

export default Ember.Controller.extend({

  thumbnailSrc: function () {
    let model = this.get('model');
    let thumbnailUrl = model.get('thumbnailUrl');
    let groupThumbnailUrl = model.get('mainGroupThumbnailUrl');
    let defaultThumbnailUrl = 'images/default-dataset-thumb.png';
    return thumbnailUrl || groupThumbnailUrl || defaultThumbnailUrl;
  }.property(),

  baseUrl: function () {
    let model = this.get('model');
    let url = ENV.APP.API;
    url += DS.JSONAPIAdapter.prototype.buildURL('dataset', model.get('id'));
    return url;
  }.property(),

  tagsString: function () {
    let model = this.get('model');
    return model.get('tags').join(' | ');
  }.property()

});
