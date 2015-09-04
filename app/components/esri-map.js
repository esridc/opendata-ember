import Ember from 'ember';
import Map from 'esri/Map';
import MapView from 'esri/views/MapView';
import FeatureLayer from 'esri/layers/FeatureLayer';
import PopupTemplate from 'esri/widgets/PopupTemplate';
import SpatialReference from 'esri/geometry/SpatialReference';
import Extent from 'esri/geometry/Extent';
import SimpleRenderer from 'esri/renderers/SimpleRenderer';

export default Ember.Component.extend({

  classNames: ['map-div'],

  didInsertElement() {

    var dataset = this.get('model');

    var mapOpts = {
      basemap: 'dark-gray'
    };

    var map = new Map(mapOpts);
    this.set('map', map);

    var mapViewOpts = {
      container: this.elementId,  //reference to the DOM node that will contain the view
      map: map,  //references the map object created in step 3
      height: 600
    };

    var extent, ext = dataset.get('extent');
    if (ext && ext.coordinates) {
      var coords = ext.coordinates;
      extent = new Extent(coords[0][0], coords[0][1], coords[1][0], coords[1][1], new SpatialReference({ wkid: 4326 }));
    }

    if (extent) {
      mapViewOpts.extent = extent;
    } else {
      mapViewOpts.center = [ -56.049, 38.485 ];
      mapViewOpts.zoom = 3;
    }

    var view = new MapView(mapViewOpts);
    this.set('mapView', view);

    this._addDataset(map, dataset);
  },

  willRemoveElement() {
    var view = this.get('mapView');
    if (view) {
      view.destroy();
    }

    var map = this.get('map');
    if (map) {
      map.destroy();
    }
  },

  _addDataset: function (map, dataset) {
    var opts = this._getDatasetLayerOpts(dataset);
    var datasetLayer = new FeatureLayer(dataset.get('url'), opts);
    this.set('datasetLayer', datasetLayer);
    map.add(datasetLayer);
  },

  _getDatasetInfoTemplate: function (dataset) {
    var displayFieldName = dataset.get('displayField');
    var title = displayFieldName ? '{' + displayFieldName + '}' : 'Attributes';
    return new PopupTemplate({ title: title, description: '{*}' });
  },

  _getRenderer: function(dataset, layerOptions){

    var geometryType = dataset.get('geometryType');
    var renderer;

    //depending on the type, load in the default renderer as json
    switch (geometryType){
    case 'esriGeometryPolygon':
      renderer = this._createRendererFromJson(this._defaultPolygonRenderer);
      break;
    case 'esriGeometryPoint':
      renderer = this._createRendererFromJson(this._defaultPointRenderer);
      break;
    case 'esriGeometryMultipoint':
      renderer = this._createRendererFromJson(this._defaultPointRenderer);
      break;
    case 'esriGeometryPolyline':
      renderer = this._createRendererFromJson(this._defaultLineRenderer);
      break;
    case 'esriGeometryLine':
      renderer = this._createRendererFromJson(this._defaultLineRenderer);
      break;
    default: 
      renderer = this._createRendererFromJson(this._defaultPolygonRenderer);
    }
    return renderer;
  },

  _getDatasetLayerOpts: function (dataset) {
    var opts = {
      minScale: 0,
      maxScale: 0,
      outFields: ['*'],
      popupTemplate: this._getDatasetInfoTemplate(dataset),
      renderer: this._getRenderer(dataset, opts)
    };
    
    return opts;
  },

  _createRendererFromJson: function(rendererJson){
    return new SimpleRenderer(rendererJson);
  },

  _defaultPointRenderer : {
    'type': 'simple',
    'label': '',
    'description': '',
    'symbol': {
      'color': [49,130,189,225],
      'size': 6,
      'angle': 0,
      'xoffset': 0,
      'yoffset': 0,
      'type': 'esriSMS',
      'style': 'esriSMSCircle',
      'outline': {
        'color': [220,220,220,255],
        'width': 0.6,
        'type': 'esriSLS',
        'style': 'esriSLSSolid'
      }
    }
  },

  _defaultLineRenderer :  {
    'type': 'simple',
    'symbol': {
      'color': [0,122,194,255],
      'width': 2,
      'type': 'esriSLS',
      'style': 'esriSLSSolid'
    }
  },

  _defaultPolygonRenderer :{
    'type': 'simple',
    'symbol': {
      'color': [49,130,189,225],
      'outline': {
        'color': [220,220,220,255],
        'width': 0.6,
        'type': 'esriSLS',
        'style': 'esriSLSSolid'
      },
      'type': 'esriSFS',
      'style': 'esriSFSSolid'
    }
  }

});
