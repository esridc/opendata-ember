import Ember from 'ember';
import Map from 'esri/map';
import FeatureLayer from 'esri/layers/FeatureLayer';
import InfoTemplate from 'esri/InfoTemplate';
import SpatialReference from 'esri/SpatialReference';
import Extent from 'esri/geometry/Extent';
import renderer from 'esri/renderer';

export default Ember.Component.extend({

  classNames: ['map-div'],

  didInsertElement() {

    var dataset = this.get('model');

    var mapOpts = {
      center: [ -56.049, 38.485 ],
      zoom: 3,
      basemap: 'dark-gray',
      smartNavigation:false,
      navigationMode: 'css-transforms',
      fitExtent:true,
      minZoom: 2,
      wrapAround180:true
    };

    var map = new Map(this.elementId, mapOpts);
    this.set('map', map);


    var onLoad = function(opts){
      opts.map.disableScrollWheelZoom();
      var ext = dataset.get('extent');
      if (ext && ext.coordinates) {
        var coords = ext.coordinates;
        var extent = new Extent(coords[0][0], coords[0][1], coords[1][0], coords[1][1], new SpatialReference({ wkid: 4326 }));
        map.setExtent(extent);
      }
    };

    map.on('load', onLoad);

    this._addDataset(map, dataset);
  },

  willRemoveElement() {
    var map = this.get('map');
    if (map) {
      map.destroy();
    }
  },

  _addDataset: function (map, dataset) {
    var opts = this._getDatasetLayerOpts(dataset);
    this.datasetLayer = new FeatureLayer(dataset.get('url'), opts);
    //apply default renderer
    if(opts.layerDefinition && opts.layerDefinition.drawingInfo){
      //apply renderers
      this.datasetLayer.setRenderer(this._createRendererFromJson(opts.layerDefinition.drawingInfo.renderer));
    }

    this.datasetLayer.on('load', this._onLoadDataset);

    map.addLayer(this.datasetLayer);
  },

  _onLoadDataset: function (evt) {
    //squash scale ranges - we need the layer to draw at all scales
    evt.layer.minScale = 0; 
    evt.layer.maxScale = 0;
  },

  _getDatasetInfoTemplate: function (dataset) {
    var displayFieldName = dataset.get('displayField');
    var title = displayFieldName ? '${' + displayFieldName + '}' : 'Attributes';
    return new InfoTemplate(title, '${*}');
  },

  _addDefaultSymbols: function(layerOptions){
    //add the layerDefinition node
    if(!layerOptions.layerDefinition){
      layerOptions.layerDefinition = {};
      layerOptions.layerDefinition.drawingInfo = {};
    }
    if(!layerOptions.layerDefinition.drawingInfo){
      layerOptions.layerDefinition.drawingInfo = {};
    }

    //depending on the type, load in the default renderer as json
    switch (layerOptions.geometryType){
    case 'esriGeometryPolygon':
      layerOptions.layerDefinition.drawingInfo.renderer = this._defaultPolygonRenderer;
      break;
    case 'esriGeometryPoint':
      layerOptions.layerDefinition.drawingInfo.renderer = this._defaultPointRenderer;
      break;
    case 'esriGeometryMultipoint':
      layerOptions.layerDefinition.drawingInfo.renderer = this._defaultPointRenderer;
      break;
    case 'esriGeometryPolyline':
      layerOptions.layerDefinition.drawingInfo.renderer = this._defaultLineRenderer;
      break;
    case 'esriGeometryLine':
      layerOptions.layerDefinition.drawingInfo.renderer = this._defaultLineRenderer;
      break;
    default: 
      layerOptions.layerDefinition.drawingInfo.renderer = this._defaultPolygonRenderer;
    }
    return layerOptions;
  },

  _getDatasetLayerOpts: function (dataset) {
    var opts = { 
      mode: FeatureLayer.MODE_AUTO,
      outFields: '*',
      infoTemplate: this._getDatasetInfoTemplate(dataset),
      geometryType: dataset.get('geometryType')
    };
    //add the default symbol
    this._addDefaultSymbols(opts);
    return opts;
  },

  _createRendererFromJson: function(rendererJson){
    var result;
    switch (rendererJson.type){
    case 'simple':
      //create the default symbol
      result = new renderer.SimpleRenderer(rendererJson);
      break;
    case 'classBreaks':
      result = new renderer.ClassBreaksRenderer(rendererJson);
      break;
    }
    return result;
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
