import Ember from 'ember';
import arcgisUtils from 'esri/arcgis/utils';
// import FeatureLayer from 'esri/layers/FeatureLayer';
// import Query from 'esri/tasks/query';

export default Ember.Component.extend({

  classNames: ['viewDiv'],

  didInsertElement() {
    this.set('mapid', '010f412d4d0a4e8f9ff09ead37963ac7');
    //var url = 'http://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Freeway_System/FeatureServer/1';
    arcgisUtils
    .createMap(this.get('mapid'), this.elementId)
    .then(response => {
      this.set('map', response.map);
      // var fLayer = new FeatureLayer(url);
      // this.get('map').addLayers([fLayer]);
      // var q = new Query();
      // q.where = "ROUTE_NUM = 'I10'";
      // return fLayer.selectFeatures(q);
    });
  },

  willRemoveElement() {
    var map = this.get('map');
    if (map) {
      map.destroy();
    }
  },

  onSwitchMap: function() {
    var mapid = this.get('mapid');
    var map = this.get('map');
    if (map) {
      map.destroy();
      arcgisUtils.createMap(mapid, this.elementId)
      .then((response) => {
        this.set('map', response.map);
      });
    }
  }.observes('mapid')

});
