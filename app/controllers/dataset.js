import Ember from 'ember';
import DS from 'ember-data';
import ENV from 'opendata-ember/config/environment';

export default Ember.Controller.extend({

  thumbnailSrc: function () {
    var model = this.get('model');
    var thumbnailUrl = model.get('thumbnail_url');
    var groupThumbnailUrl = model.get('main_group_thumbnail_url');
    var defaultThumbnailUrl = 'images/default-dataset-thumb.png';
    return thumbnailUrl || groupThumbnailUrl || defaultThumbnailUrl;
  }.property(),

  baseUrl: function () {
    var model = this.get('model');
    var url = ENV.APP.API;
    url += DS.JSONAPIAdapter.prototype.buildURL('dataset', model.get('id'));
    return url;
  }.property(),

  tagsString: function () {
    var model = this.get('model');
    return model.get('tags').join(' | ');
  }.property()

});
