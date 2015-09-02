"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

efineday('opendata-ember/acceptance-tests/main', ['exports', 'ember-cli-sri/acceptance-tests/main'], function (exports, main) {

	'use strict';



	exports['default'] = main['default'];

});
efineday('opendata-ember/adapters/application', ['exports', 'ember-data', 'opendata-ember/config/environment'], function (exports, DS, ENV) {

  'use strict';

  exports['default'] = DS['default'].JSONAPIAdapter.extend({
    host: ENV['default'].APP.API
  });

});
efineday('opendata-ember/adapters/dataset', ['exports', 'ember', 'opendata-ember/adapters/application'], function (exports, Ember, ApplicationAdapter) {

  'use strict';

  exports['default'] = ApplicationAdapter['default'].extend({

    pathForType: function pathForType(type) {
      var camelized = Ember['default'].String.camelize(type);
      return Ember['default'].String.pluralize(camelized) + '.json';
    },

    urlForFindRecord: function urlForFindRecord(id, modelName, snapshot) {
      var host = this.get('host');
      return host + '/datasets/' + id + '.json';
    }

  });

});
efineday('opendata-ember/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'opendata-ember/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
efineday('opendata-ember/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'opendata-ember/config/environment'], function (exports, AppVersionComponent, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = AppVersionComponent['default'].extend({
    version: version,
    name: name
  });

});
efineday('opendata-ember/components/dataset-table', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({

    featureService: Ember['default'].inject.service('feature-service'),

    didInsertElement: function didInsertElement() {

      var model = this.get('model');
      this.set('orderBy', model.get('objectIdField'));

      this.get('featureService').fetchPage(model, this._getPageParams()).then(this._handlePageResponse.bind(this))['finally'](function () {
        alert('all done');
      })['catch'](function () {
        alert('error');
      });
    },

    perPage: 10,

    page: 0,

    orderBy: '',

    orderByAsc: true,

    _getPageParams: function _getPageParams() {
      return {
        perPage: this.get('perPage'),
        page: this.get('page'),
        orderBy: this.get('orderBy'),
        orderByAsc: this.get('orderByAsc')
      };
    },

    _handlePageResponse: function _handlePageResponse(response) {
      var perPage = this.get('perPage');
      var features = response.features.slice(0, perPage);
      var data = features.map(function (feat) {
        return Object.keys(feat.attributes).map(function (attr) {
          return feat.attributes[attr];
        });
      });
      this.set('data', data);
    },

    willRemoveElement: function willRemoveElement() {},

    _calculatePaging: function _calculatePaging() {
      //defaults - this is what will be rendered if the dataset does not support pagination

      var obj = {
        isFirstPage: true,
        prevPage: 0,
        pageRange: [{ className: '', page: 1 }, { className: '', page: 2 }],
        lastPage: false,
        nextPage: 2
      };

      this.set('pagingInfo', obj);

      // var obj = {
      //   firstPage: '',
      //   lastPage: '',
      //   prevPage: 0,
      //   nextPage: 0,
      //   pages: [],
      //   showPagination: false,
      //   from: 1,
      //   to: this.collection.perPage,
      //   total: this.model.get('record_count'),
      //   sortField: this.collection.orderBy,
      //   sortClass: this.collection.orderByAsc ? 'sort_asc' : 'sort_desc',
      //   sortIconClass: this.collection.orderByAsc ? 'glyphicon-chevron-down' : 'glyphicon-chevron-up',
      // };

      // if (this.collection.supportsPagination) {
      //   var totalPages = Math.ceil(this.model.get('record_count') / this.collection.perPage);
      //   //zero based page index
      //   var page = this.collection.page;

      //   //don't show more than 10 pages in paginator?
      //   var start = (totalPages > 10 && page > 6) ? page - 5 : 1;
      //   var end = (totalPages > start + 9) ? start + 9 : totalPages;

      //   var active, pages = [];
      //   for (var i = start; i <= end; i++) {
      //     active = (i === page + 1) ? 'active' : '';
      //     pages.push({ page: i, active: active });
      //   }

      //   var total = this.model.get('record_count');
      //   var from = page * this.collection.perPage + 1;
      //   var to = page * this.collection.perPage + this.collection.perPage;
      //   to = (to <= total) ? to : total;

      //   obj = {
      //     firstPage: (page === 0) ? 'disabled' : '',
      //     lastPage: (totalPages === page + 1) ? 'disabled' : '',
      //     prevPage: page,
      //     nextPage: page + 2,
      //     pages: pages,
      //     showPagination: true,
      //     from: from,
      //     to: to,
      //     total: total,
      //     sortField: this.collection.orderBy,
      //     sortClass: this.collection.orderByAsc ? 'sort_asc' : 'sort_desc',
      //     sortIconClass: this.collection.orderByAsc ? 'glyphicon-chevron-down' : 'glyphicon-chevron-up',
      //   };
      // }

      // return obj;
    }

  });

});
efineday('opendata-ember/components/esri-map', ['exports', 'ember', 'esri/map', 'esri/layers/FeatureLayer', 'esri/InfoTemplate', 'esri/SpatialReference', 'esri/geometry/Extent', 'esri/renderer'], function (exports, Ember, Map, FeatureLayer, InfoTemplate, SpatialReference, Extent, renderer) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({

    classNames: ['map-div'],

    didInsertElement: function didInsertElement() {

      var dataset = this.get('model');

      var mapOpts = {
        basemap: 'dark-gray',
        smartNavigation: false,
        navigationMode: 'css-transforms',
        minZoom: 2,
        wrapAround180: true
      };

      var extent,
          ext = dataset.get('extent');
      if (ext && ext.coordinates) {
        var coords = ext.coordinates;
        extent = new Extent['default'](coords[0][0], coords[0][1], coords[1][0], coords[1][1], new SpatialReference['default']({ wkid: 4326 }));
      }

      if (extent) {
        mapOpts.extent = extent;
      } else {
        mapOpts.center = [-56.049, 38.485];
        mapOpts.zoom = 3;
      }

      var map = new Map['default'](this.elementId, mapOpts);
      this.set('map', map);

      var onLoad = function onLoad(opts) {
        opts.map.disableScrollWheelZoom();
        var ext = dataset.get('extent');
        if (ext && ext.coordinates) {
          var coords = ext.coordinates;
          var extent = new Extent['default'](coords[0][0], coords[0][1], coords[1][0], coords[1][1], new SpatialReference['default']({ wkid: 4326 }));
          map.setExtent(extent);
        }
      };

      map.on('load', onLoad);

      this._addDataset(map, dataset);
    },

    willRemoveElement: function willRemoveElement() {
      var map = this.get('map');
      if (map) {
        map.destroy();
      }
    },

    _addDataset: function _addDataset(map, dataset) {
      var opts = this._getDatasetLayerOpts(dataset);
      this.datasetLayer = new FeatureLayer['default'](dataset.get('url'), opts);
      //apply default renderer
      if (opts.layerDefinition && opts.layerDefinition.drawingInfo) {
        //apply renderers
        this.datasetLayer.setRenderer(this._createRendererFromJson(opts.layerDefinition.drawingInfo.renderer));
      }

      this.datasetLayer.on('load', this._onLoadDataset);

      map.addLayer(this.datasetLayer);
    },

    _onLoadDataset: function _onLoadDataset(evt) {
      //squash scale ranges - we need the layer to draw at all scales
      evt.layer.minScale = 0;
      evt.layer.maxScale = 0;
    },

    _getDatasetInfoTemplate: function _getDatasetInfoTemplate(dataset) {
      var displayFieldName = dataset.get('displayField');
      var title = displayFieldName ? '${' + displayFieldName + '}' : 'Attributes';
      return new InfoTemplate['default'](title, '${*}');
    },

    _addDefaultSymbols: function _addDefaultSymbols(layerOptions) {
      //add the layerDefinition node
      if (!layerOptions.layerDefinition) {
        layerOptions.layerDefinition = {};
        layerOptions.layerDefinition.drawingInfo = {};
      }
      if (!layerOptions.layerDefinition.drawingInfo) {
        layerOptions.layerDefinition.drawingInfo = {};
      }

      //depending on the type, load in the default renderer as json
      switch (layerOptions.geometryType) {
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

    _getDatasetLayerOpts: function _getDatasetLayerOpts(dataset) {
      var opts = {
        mode: FeatureLayer['default'].MODE_AUTO,
        outFields: '*',
        infoTemplate: this._getDatasetInfoTemplate(dataset),
        geometryType: dataset.get('geometryType')
      };
      //add the default symbol
      this._addDefaultSymbols(opts);
      return opts;
    },

    _createRendererFromJson: function _createRendererFromJson(rendererJson) {
      var result;
      switch (rendererJson.type) {
        case 'simple':
          //create the default symbol
          result = new renderer['default'].SimpleRenderer(rendererJson);
          break;
        case 'classBreaks':
          result = new renderer['default'].ClassBreaksRenderer(rendererJson);
          break;
      }
      return result;
    },

    _defaultPointRenderer: {
      'type': 'simple',
      'label': '',
      'description': '',
      'symbol': {
        'color': [49, 130, 189, 225],
        'size': 6,
        'angle': 0,
        'xoffset': 0,
        'yoffset': 0,
        'type': 'esriSMS',
        'style': 'esriSMSCircle',
        'outline': {
          'color': [220, 220, 220, 255],
          'width': 0.6,
          'type': 'esriSLS',
          'style': 'esriSLSSolid'
        }
      }
    },

    _defaultLineRenderer: {
      'type': 'simple',
      'symbol': {
        'color': [0, 122, 194, 255],
        'width': 2,
        'type': 'esriSLS',
        'style': 'esriSLSSolid'
      }
    },

    _defaultPolygonRenderer: {
      'type': 'simple',
      'symbol': {
        'color': [49, 130, 189, 225],
        'outline': {
          'color': [220, 220, 220, 255],
          'width': 0.6,
          'type': 'esriSLS',
          'style': 'esriSLSSolid'
        },
        'type': 'esriSFS',
        'style': 'esriSFSSolid'
      }
    }

  });

});
efineday('opendata-ember/controllers/application', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    q: '',

    bodyClass: null,

    currentPathDidChange: (function () {
      var path = this.get('currentPath');
      var parts = path.split('.');
      // var className = path.replace(/\./g, '-');
      // if (className !== parts[0]) {
      //   className += ' ' + parts[0];
      // }
      var className = 'page-' + parts[0];
      this.set('bodyClass', className);
    }).observes('currentPath'),

    actions: {
      search: function search() {
        this.transitionToRoute('datasets', { queryParams: { q: this.get('q'), page: 1 } });
      }
    }

  });

});
efineday('opendata-ember/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
efineday('opendata-ember/controllers/dataset', ['exports', 'ember', 'ember-data', 'opendata-ember/config/environment'], function (exports, Ember, DS, ENV) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    thumbnailSrc: (function () {
      var model = this.get('model');
      var thumbnailUrl = model.get('thumbnailUrl');
      var groupThumbnailUrl = model.get('mainGroupThumbnailUrl');
      var defaultThumbnailUrl = 'images/default-dataset-thumb.png';
      return thumbnailUrl || groupThumbnailUrl || defaultThumbnailUrl;
    }).property(),

    baseUrl: (function () {
      var model = this.get('model');
      var url = ENV['default'].APP.API;
      url += DS['default'].JSONAPIAdapter.prototype.buildURL('dataset', model.get('id'));
      return url;
    }).property(),

    tagsString: (function () {
      var model = this.get('model');
      return model.get('tags').join(' | ');
    }).property()

  });

});
efineday('opendata-ember/controllers/datasets', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    // Here, we're telling the controller that the property `page`
    // should be "bound" to the query parameter the same name.
    // We could map the parameter to a different property name if we wanted.
    queryParams: ['page', 'q'],

    // defaults
    page: 1,
    q: null,
    perPage: 20,

    // These properties will be set by the parent route
    totalCount: null,
    count: null,

    // The following properties will be used for the display of the pagination links
    totalPages: (function () {
      return Math.ceil(this.get('totalCount') / this.get('perPage'));
    }).property('totalCount'),

    prevPage: (function () {
      return this.get('page') - 1;
    }).property('page'),

    nextPage: (function () {
      return this.get('page') + 1;
    }).property('page'),

    isFirstPage: (function () {
      return this.get('page') === 1;
    }).property('page'),

    isLastPage: (function () {
      return this.get('page') >= this.get('totalPages');
    }).property('page', 'totalPages'),

    pageRange: (function () {
      var result = Ember['default'].A();

      var currentPage = this.get('page');
      var totalPages = this.get('totalPages');

      var start = totalPages > 10 && currentPage > 6 ? currentPage - 5 : 1;
      var end = totalPages > start + 9 ? start + 9 : totalPages;

      for (var i = start; i <= end; i++) {
        result.push({ page: i, className: i === currentPage ? 'active' : '' });
      }

      return result;
    }).property('totalPages', 'page')

  });

});
efineday('opendata-ember/controllers/index', ['exports', 'opendata-ember/controllers/application'], function (exports, ApplicationController) {

	'use strict';

	// import Ember from 'ember';
	exports['default'] = ApplicationController['default'].extend({});

});
efineday('opendata-ember/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
efineday('opendata-ember/helpers/ago', ['exports', 'ember', 'opendata-ember/helpers/moment-from-now'], function (exports, Ember, Helper) {

  'use strict';

  exports['default'] = Helper['default'].extend({
    compute: function compute() {
      Ember['default'].deprecate('ember-moment: `ago` helper has been renamed to `moment-from-now`');
      return this._super.apply(this, arguments);
    }
  });

});
efineday('opendata-ember/helpers/duration', ['exports', 'ember', 'opendata-ember/helpers/moment-duration'], function (exports, Ember, Helper) {

  'use strict';

  exports['default'] = Helper['default'].extend({
    compute: function compute() {
      Ember['default'].deprecate('ember-moment: `duration` helper has been renamed to `moment-duration`');
      return this._super.apply(this, arguments);
    }
  });

});
efineday('opendata-ember/helpers/moment-duration', ['exports', 'ember-moment/helpers/moment-duration'], function (exports, moment_duration) {

	'use strict';



	exports['default'] = moment_duration['default'];

});
efineday('opendata-ember/helpers/moment-format', ['exports', 'ember', 'opendata-ember/config/environment', 'ember-moment/helpers/moment-format'], function (exports, Ember, config, Helper) {

  'use strict';

  exports['default'] = Helper['default'].extend({
    globalOutputFormat: Ember['default'].get(config['default'], 'moment.outputFormat'),
    globalAllowEmpty: !!Ember['default'].get(config['default'], 'moment.allowEmpty')
  });

});
efineday('opendata-ember/helpers/moment-from-now', ['exports', 'ember', 'opendata-ember/config/environment', 'ember-moment/helpers/moment-from-now'], function (exports, Ember, config, Helper) {

  'use strict';

  exports['default'] = Helper['default'].extend({
    globalAllowEmpty: !!Ember['default'].get(config['default'], 'moment.allowEmpty')
  });

});
efineday('opendata-ember/helpers/moment-to-now', ['exports', 'ember', 'opendata-ember/config/environment', 'ember-moment/helpers/moment-to-now'], function (exports, Ember, config, Helper) {

  'use strict';

  exports['default'] = Helper['default'].extend({
    globalAllowEmpty: !!Ember['default'].get(config['default'], 'moment.allowEmpty')
  });

});
efineday('opendata-ember/helpers/moment', ['exports', 'ember', 'opendata-ember/helpers/moment-format'], function (exports, Ember, Helper) {

  'use strict';

  exports['default'] = Helper['default'].extend({
    compute: function compute() {
      Ember['default'].deprecate('ember-moment: `moment` helper has been renamed to `moment-format`');
      return this._super.apply(this, arguments);
    }
  });

});
efineday('opendata-ember/initializers/ajax', ['exports'], function (exports) {

  'use strict';

  /*globals najax, FastBoot, Ember*/
  var nodeAjax = function nodeAjax(url, type, options) {
    var adapter = this;

    return new Ember.RSVP.Promise(function (resolve, reject) {
      var hash = adapter.ajaxOptions(url, type, options);

      hash.success = function (json, textStatus, jqXHR) {
        json = adapter.ajaxSuccess(jqXHR, json);
        Ember.run(null, resolve, json);
      };

      hash.error = function (jqXHR, textStatus, errorThrown) {
        Ember.run(null, reject, adapter.ajaxError(jqXHR, jqXHR.responseText, errorThrown));
      };

      najax(hash);
    }, 'DS: RESTAdapter#ajax ' + type + ' to ' + url);
  };

  exports['default'] = {
    name: 'ajax-service',

    initialize: function initialize(application) {
      // Detect if we're running in Node. If not, there's nothing to do.
      if (typeof document === 'undefined') {
        application.register('ajax:node', {
          create: function create() {
            return nodeAjax;
          }
        });

        application.inject('adapter', 'ajax', 'ajax:node');
      }
    }
  };

});
efineday('opendata-ember/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'opendata-ember/config/environment'], function (exports, initializerFactory, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = {
    name: 'App Version',
    initialize: initializerFactory['default'](name, version)
  };

});
efineday('opendata-ember/initializers/export-application-global', ['exports', 'ember', 'opendata-ember/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
efineday('opendata-ember/initializers/fastboot', ['exports'], function (exports) {

  'use strict';

  /*globals SimpleDOM, Ember, FastBoot, URL*/

  exports['default'] = {
    name: "fast-boot",

    initialize: function initialize(registry, App) {
      // Detect if we're running in Node. If not, there's nothing to do.
      if (typeof document === 'undefined') {
        var doc = new SimpleDOM.Document();
        var domHelper = new Ember.HTMLBars.DOMHelper(doc);

        domHelper.protocolForURL = function (url) {
          var protocol = URL.parse(url).protocol;
          return protocol == null ? ':' : protocol;
        };

        domHelper.setMorphHTML = function (morph, html) {
          var section = this.document.createRawHTMLSection(html);
          morph.setNode(section);
        };

        // Disable autobooting of the app. This will disable automatic routing,
        // and routing will only occur via our calls to visit().
        App.autoboot = false;

        // This needs to be setting up renderer:main, and ideally would have a less hacked
        // up interface. In particular, the only ACTUAL swap-in here is the fake document,
        // so it would be nice if we could register just that.
        registry.register('renderer:-dom', {
          create: function create() {
            var Renderer = Ember._Renderer || Ember.View._Renderer;
            return new Renderer(domHelper, false);
          }
        });

        FastBoot.debug("resolving FastBoot promise");

        FastBoot.resolve(function (url) {
          FastBoot.debug("routing; url=%s", url);

          var promise;
          Ember.run(function () {
            promise = App.visit(url);
          });

          return promise.then(function (instance) {
            var view = instance.view;
            var title = view.renderer._dom.document.title;
            var element;

            Ember.run(function () {
              element = view.renderToElement();
            });

            var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

            return {
              body: serializer.serialize(element),
              title: title
            };
          });
        });
      }
    }
  };

});
efineday('opendata-ember/instance-initializers/clear-double-boot', ['exports'], function (exports) {

  'use strict';

  // When using `ember fastboot --serve-assets` the application output will
  // already be rendered to the DOM when the actual JavaScript loads. Ember
  // does not automatically clear its `rootElement` so this leads to the
  // "double" applications being visible at once (only the "bottom" one is
  // running via JS and is interactive).
  //
  // This removes any pre-rendered ember-view elements, so that the booting
  // application will replace the pre-rendered output

  exports['default'] = {
    initialize: function initialize(instance) {
      var originalDidCreateRootView = instance.didCreateRootView;

      instance.didCreateRootView = function () {
        Ember.$(instance.rootElement + ' .ember-view').remove();

        originalDidCreateRootView.apply(instance, arguments);
      };
    }
  };

});
efineday('opendata-ember/models/dataset', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({

    displayField: DS['default'].attr('string'),
    maxRecordCount: DS['default'].attr('number'),
    recordCount: DS['default'].attr('number'),
    geometryType: DS['default'].attr('string'),
    objectIdField: DS['default'].attr('string'),
    supportedExtensions: DS['default'].attr('string'),
    advancedQueryCapabilities: DS['default'].attr('string'),
    supportsAdvancedQueries: DS['default'].attr('boolean'),
    landingPage: DS['default'].attr('string'),
    description: DS['default'].attr('string'),
    extent: DS['default'].attr(), //{}
    fields: DS['default'].attr(), //[]
    itemName: DS['default'].attr('string'),
    type: DS['default'].attr('string'),
    itemType: DS['default'].attr('string'),
    license: DS['default'].attr('string'),
    mainGroupDescription: DS['default'].attr('string'),
    main_GroupThumbnailUrl: DS['default'].attr('string'),
    mainGroupTitle: DS['default'].attr('string'),
    name: DS['default'].attr('string'),
    owner: DS['default'].attr('string'),
    tags: DS['default'].attr(), //[]
    thumbnailUrl: DS['default'].attr('string'),
    sites: DS['default'].attr(), //[]
    'public': DS['default'].attr('boolean'),
    createdAt: DS['default'].attr('date'),
    updatedAt: DS['default'].attr('date'),
    url: DS['default'].attr('string'),
    views: DS['default'].attr('number'),
    quality: DS['default'].attr('number'),
    coverage: DS['default'].attr('string'),
    currentVersion: DS['default'].attr('number'),
    commentsEnabled: DS['default'].attr('boolean'),
    serviceSpatialReference: {}, //{}
    metadataUrl: DS['default'].attr('string'),
    orgId: DS['default'].attr('string'),
    useStandardizedQueries: DS['default'].attr('boolean')

  });

});
efineday('opendata-ember/router', ['exports', 'ember', 'opendata-ember/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.resource('datasets', function () {});
    this.resource('dataset', { path: '/datasets/:id' });
  });

  exports['default'] = Router;

});
efineday('opendata-ember/routes/dataset', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({

    model: function model(params) {
      return this.store.findRecord('dataset', params.id);
    }

  });

});
efineday('opendata-ember/routes/datasets/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({

    queryParams: {
      page: {
        refreshModel: true
      },
      q: {
        refreshModel: true
      }
    },

    actions: {
      queryParamsDidChange: function queryParamsDidChange(params) {
        // NOTE: this should not be necessary because we are using refreshModel above
        // but it wasn't working even tho i know it can work: http://emberjs.jsbin.com/sazixodoxe#/datasets?page=
        this.refresh();
      },
      gotoDataset: function gotoDataset(dataset) {
        this.controllerFor('datasets').transitionToRoute('dataset', dataset);
      }
    },

    model: function model(params, transition) {
      // NOTE: I think this is a bug - queryParams are available on transition but params is an empty object
      var ctrl = this.controllerFor('datasets');
      var queryParams = {
        per_page: ctrl.get('perPage')
      };
      if (transition.queryParams) {
        queryParams = Ember['default'].merge(queryParams, transition.queryParams);
      }
      return this.store.query('dataset', queryParams);
    },

    // Here, we're passing metadata to the controller
    // This method will be executed each time the model is reloaded.
    setupController: function setupController(controller, model) {
      this._super(controller, model); // Do not forget this call

      // NOTE: i don't know why we can't just call controller.___
      var ctrl = this.controllerFor('datasets');
      ctrl.set('totalCount', model.meta.stats.total_count);
      ctrl.set('count', model.meta.stats.count);
    }

  });

});
efineday('opendata-ember/serializers/dataset', ['exports', 'ember', 'ember-data'], function (exports, Ember, DS) {

  'use strict';

  exports['default'] = DS['default'].JSONAPISerializer.extend({

    normalizeResponse: function normalizeResponse(store, primaryModelClass, payload, id, requestType) {

      payload.meta = payload.metadata || {};
      delete payload.metadata;

      if (Ember['default'].isArray(payload.data)) {
        payload.data = payload.data.map(this._mapDataset);
      } else {
        payload.data = this._mapDataset(payload.data);
      }

      return payload;
    },

    _mapDataset: function _mapDataset(item) {
      var d = {
        id: item.id,
        attributes: {},
        type: 'Dataset'
      };

      // NOTE: seems like this ought to be done with keyForAttribute but it didn't work
      for (var p in item) {
        if (item.hasOwnProperty(p)) {
          d.attributes[Ember['default'].String.camelize(p)] = item[p];
        }
      }

      return d;
    }

  });

});
efineday('opendata-ember/services/feature-service', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Service.extend({

    _getQueryUrl: function _getQueryUrl(dataset, params) {
      var url = dataset.get('url');
      url += '/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson';

      var supportsPagination = Ember['default'].get(dataset, 'advancedQueryCapabilities.supports_pagination');

      if (supportsPagination) {
        var perPage = params.perPage;
        url += '&resultOffset=' + params.page * perPage;
        url += '&resultRecordCount=' + perPage;
        //NOTE: when you pass in one of the above two parameters and orderByFields is left empty,
        //map service uses the object-id field to sort the result.
        //For a query layer with a pseudo column as the object-id field (e.g., FID),
        //you must provide orderByFields; otherwise the query fails
      }

      var orderBy = params.orderBy;
      if (!params.orderByAsc) {
        orderBy += ' desc';
      }
      //NOTE: this still could fail
      //if the oid field has changed since it was harvested by open data
      //or it is null (which should not happen...)
      url += '&orderByFields=' + orderBy;

      return url;
    },

    fetchPage: function fetchPage(dataset, params) {

      var url = this._getQueryUrl(dataset, params);

      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        Ember['default'].$.ajax({
          url: url,
          dataType: 'json',
          success: function success(response, status, xhr) {
            resolve(response);
          },
          error: function error(xhr, status, _error) {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + status + ']'));
          }
        });
      });
    }

  });

});
efineday('opendata-ember/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 21,
              "column": 10
            },
            "end": {
              "line": 21,
              "column": 42
            }
          },
          "moduleName": "opendata-ember/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("My Open Data");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": [
            "wrong-type",
            "multiple-nodes"
          ]
        },
        "revision": "Ember@2.2.0-canary+6640ab13",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 39,
            "column": 0
          }
        },
        "moduleName": "opendata-ember/templates/application.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("[if lt IE 10]>\n      <p class=\"browsehappy\">You are using an <strong>outdated</strong> browser. Please <a href=\"http://browsehappy.com/\">upgrade your browser</a> to improve your experience.</p>\n    <![endif]");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n      ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","header");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        dom.setAttribute(el3,"id","header-search-container");
        dom.setAttribute(el3,"class","navbar-form navbar-right");
        dom.setAttribute(el3,"role","search");
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","input-group");
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"class","sr-only");
        dom.setAttribute(el5,"for","header-search");
        var el6 = dom.createTextNode("Search");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment(" <input type=\"search\" name=\"header-search\" id=\"header-search\" class=\"form-control\" placeholder=\"search\"> ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","input-group-btn");
        var el6 = dom.createTextNode("\n              ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6,"id","header-search-btn");
        dom.setAttribute(el6,"class","btn btn-default");
        dom.setAttribute(el6,"type","submit");
        var el7 = dom.createTextNode("\n                ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7,"class","glyphicon glyphicon-search");
        dom.setAttribute(el7,"aria-hidden","true");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n              ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n            ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n          ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h3");
        dom.setAttribute(el3,"class","text-muted");
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n      ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","main-region");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n      ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","footer");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-lg-12 col-md-12");
        var el4 = dom.createTextNode("\n          ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"style","float:left;");
        var el5 = dom.createTextNode("♥ from the ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"href","http://dc.esri.com/");
        var el6 = dom.createTextNode("Open Data team");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n          \n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        \n      ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [3]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element1, [1]);
        var morphs = new Array(5);
        morphs[0] = dom.createAttrMorph(element0, 'class');
        morphs[1] = dom.createElementMorph(element2);
        morphs[2] = dom.createMorphAt(dom.childAt(element2, [1]),3,3);
        morphs[3] = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
        morphs[4] = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        return morphs;
      },
      statements: [
        ["attribute","class",["concat",["container ",["get","bodyClass",["loc",[null,[6,28],[6,37]]]]]]],
        ["element","action",["search"],["on","submit"],["loc",[null,[8,14],[8,45]]]],
        ["inline","input",[],["value",["subexpr","@mut",[["get","q",["loc",[null,[11,26],[11,27]]]]],[],[]],"class","form-control","placeholder","search"],["loc",[null,[11,12],[11,71]]]],
        ["block","link-to",["index"],[],0,null,["loc",[null,[21,10],[21,54]]]],
        ["content","outlet",["loc",[null,[27,8],[27,18]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
efineday('opendata-ember/templates/components/dataset-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0-canary+6640ab13",
            "loc": {
              "source": null,
              "start": {
                "line": 8,
                "column": 12
              },
              "end": {
                "line": 10,
                "column": 12
              }
            },
            "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["content","field.alias",["loc",[null,[9,14],[9,29]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0-canary+6640ab13",
            "loc": {
              "source": null,
              "start": {
                "line": 10,
                "column": 12
              },
              "end": {
                "line": 12,
                "column": 12
              }
            },
            "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["content","field.name",["loc",[null,[11,14],[11,28]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 8
            },
            "end": {
              "line": 14,
              "column": 8
            }
          },
          "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("th");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("          ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","if",[["get","field.alias",["loc",[null,[8,18],[8,29]]]]],[],0,1,["loc",[null,[8,12],[12,19]]]]
        ],
        locals: ["field"],
        templates: [child0, child1]
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0-canary+6640ab13",
            "loc": {
              "source": null,
              "start": {
                "line": 20,
                "column": 10
              },
              "end": {
                "line": 22,
                "column": 10
              }
            },
            "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
            return morphs;
          },
          statements: [
            ["content","attr",["loc",[null,[21,16],[21,24]]]]
          ],
          locals: ["attr"],
          templates: []
        };
      }());
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 18,
              "column": 6
            },
            "end": {
              "line": 24,
              "column": 6
            }
          },
          "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","each",[["get","row",["loc",[null,[20,18],[20,21]]]]],[],0,null,["loc",[null,[20,10],[22,19]]]]
        ],
        locals: ["row"],
        templates: [child0]
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 32,
              "column": 4
            },
            "end": {
              "line": 36,
              "column": 4
            }
          },
          "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","disabled");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("«");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child3 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0-canary+6640ab13",
            "loc": {
              "source": null,
              "start": {
                "line": 38,
                "column": 8
              },
              "end": {
                "line": 38,
                "column": 56
              }
            },
            "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("«");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 36,
              "column": 4
            },
            "end": {
              "line": 40,
              "column": 4
            }
          },
          "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","link-to",[["subexpr","query-params",[],["page",["get","prevPage",["loc",[null,[38,38],[38,46]]]]],["loc",[null,[38,19],[38,47]]]]],[],0,null,["loc",[null,[38,8],[38,68]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    var child4 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0-canary+6640ab13",
            "loc": {
              "source": null,
              "start": {
                "line": 49,
                "column": 8
              },
              "end": {
                "line": 49,
                "column": 61
              }
            },
            "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["content","num.page",["loc",[null,[49,49],[49,61]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 47,
              "column": 4
            },
            "end": {
              "line": 51,
              "column": 4
            }
          },
          "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createAttrMorph(element0, 'class');
          morphs[1] = dom.createMorphAt(element0,1,1);
          return morphs;
        },
        statements: [
          ["attribute","class",["concat",[["get","num.className",["loc",[null,[48,19],[48,32]]]]]]],
          ["block","link-to",[["subexpr","query-params",[],["page",["get","num.page",["loc",[null,[49,38],[49,46]]]]],["loc",[null,[49,19],[49,47]]]]],[],0,null,["loc",[null,[49,8],[49,73]]]]
        ],
        locals: ["num"],
        templates: [child0]
      };
    }());
    var child5 = (function() {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 54,
              "column": 4
            },
            "end": {
              "line": 58,
              "column": 4
            }
          },
          "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","disabled");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("»");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child6 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0-canary+6640ab13",
            "loc": {
              "source": null,
              "start": {
                "line": 60,
                "column": 8
              },
              "end": {
                "line": 60,
                "column": 56
              }
            },
            "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("»");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 58,
              "column": 4
            },
            "end": {
              "line": 62,
              "column": 4
            }
          },
          "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","link-to",[["subexpr","query-params",[],["page",["get","nextPage",["loc",[null,[60,38],[60,46]]]]],["loc",[null,[60,19],[60,47]]]]],[],0,null,["loc",[null,[60,8],[60,68]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": [
            "multiple-nodes"
          ]
        },
        "revision": "Ember@2.2.0-canary+6640ab13",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 65,
            "column": 0
          }
        },
        "moduleName": "opendata-ember/templates/components/dataset-table.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h4");
        var el2 = dom.createTextNode("Showing  to  of ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","table-responsive");
        var el2 = dom.createTextNode("  \n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("table");
        dom.setAttribute(el2,"class","table table-striped table-bordered table-hover");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("thead");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("tr");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tbody");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","pagination");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [2, 1]);
        var element2 = dom.childAt(fragment, [4, 1]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(dom.childAt(element1, [1, 1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
        morphs[2] = dom.createMorphAt(element2,1,1);
        morphs[3] = dom.createMorphAt(element2,3,3);
        morphs[4] = dom.createMorphAt(element2,5,5);
        return morphs;
      },
      statements: [
        ["block","each",[["get","model.fields",["loc",[null,[6,16],[6,28]]]]],[],0,null,["loc",[null,[6,8],[14,17]]]],
        ["block","each",[["get","data",["loc",[null,[18,14],[18,18]]]]],[],1,null,["loc",[null,[18,6],[24,15]]]],
        ["block","if",[["get","isFirstPage",["loc",[null,[32,10],[32,21]]]]],[],2,3,["loc",[null,[32,4],[40,11]]]],
        ["block","each",[["get","pageRange",["loc",[null,[47,12],[47,21]]]]],[],4,null,["loc",[null,[47,4],[51,13]]]],
        ["block","if",[["get","isLastPage",["loc",[null,[54,10],[54,20]]]]],[],5,6,["loc",[null,[54,4],[62,11]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5, child6]
    };
  }()));

});
efineday('opendata-ember/templates/dataset', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": [
            "multiple-nodes",
            "wrong-type"
          ]
        },
        "revision": "Ember@2.2.0-canary+6640ab13",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 58,
            "column": 0
          }
        },
        "moduleName": "opendata-ember/templates/dataset.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","clearfix");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        dom.setAttribute(el2,"class","pull-left clearfix");
        var el3 = dom.createElement("img");
        dom.setAttribute(el3,"class","img-thumbnail");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","dropdown pull-right");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","btn btn-primary");
        dom.setAttribute(el3,"type","button");
        dom.setAttribute(el3,"data-toggle","dropdown");
        dom.setAttribute(el3,"aria-haspopup","true");
        dom.setAttribute(el3,"aria-expanded","false");
        var el4 = dom.createTextNode("\n      Download\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","caret");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","dropdown-menu");
        dom.setAttribute(el3,"role","menu");
        dom.setAttribute(el3,"aria-labelledby","dLabel");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"target","_blank");
        dom.setAttribute(el5,"download","");
        var el6 = dom.createTextNode("Spreadsheet");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"target","_blank");
        dom.setAttribute(el5,"download","");
        var el6 = dom.createTextNode("KML");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"target","_blank");
        dom.setAttribute(el5,"download","");
        var el6 = dom.createTextNode("Shapefile");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","divider");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"target","_blank");
        var el6 = dom.createTextNode("View in ArcGIS Online");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"target","_blank");
        var el6 = dom.createTextNode("API");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-lg-6 col-md-6");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        var el5 = dom.createTextNode("Description");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      \n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-lg-6 col-md-6");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("dl");
        dom.setAttribute(el4,"class","dl-horizontal");
        var el5 = dom.createTextNode("\n        \n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("dt");
        var el6 = dom.createTextNode("Owner:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("dd");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("dt");
        var el6 = dom.createTextNode("Created:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("dd");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        \n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("dt");
        var el6 = dom.createTextNode("Updated:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("dd");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("dt");
        var el6 = dom.createTextNode("Tags:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("dd");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        \n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("dt");
        var el6 = dom.createTextNode("Views:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("dd");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","table-container");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element1, [0]);
        var element3 = dom.childAt(element0, [3, 3]);
        var element4 = dom.childAt(element3, [1, 0]);
        var element5 = dom.childAt(element3, [3, 0]);
        var element6 = dom.childAt(element3, [5, 0]);
        var element7 = dom.childAt(element3, [9, 0]);
        var element8 = dom.childAt(element3, [11, 0]);
        var element9 = dom.childAt(fragment, [2, 1]);
        var element10 = dom.childAt(element9, [3, 1]);
        var morphs = new Array(16);
        morphs[0] = dom.createAttrMorph(element2, 'src');
        morphs[1] = dom.createMorphAt(dom.childAt(element1, [1]),0,0);
        morphs[2] = dom.createAttrMorph(element4, 'href');
        morphs[3] = dom.createAttrMorph(element5, 'href');
        morphs[4] = dom.createAttrMorph(element6, 'href');
        morphs[5] = dom.createAttrMorph(element7, 'href');
        morphs[6] = dom.createAttrMorph(element8, 'href');
        morphs[7] = dom.createUnsafeMorphAt(dom.childAt(element9, [1, 3]),0,0);
        morphs[8] = dom.createMorphAt(dom.childAt(element10, [3]),0,0);
        morphs[9] = dom.createMorphAt(dom.childAt(element10, [7]),0,0);
        morphs[10] = dom.createMorphAt(dom.childAt(element10, [11]),0,0);
        morphs[11] = dom.createMorphAt(dom.childAt(element10, [15]),0,0);
        morphs[12] = dom.createMorphAt(dom.childAt(element10, [19]),0,0);
        morphs[13] = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        morphs[14] = dom.createMorphAt(dom.childAt(fragment, [6]),1,1);
        morphs[15] = dom.createMorphAt(fragment,8,8,contextualElement);
        return morphs;
      },
      statements: [
        ["attribute","src",["concat",[["get","thumbnailSrc",["loc",[null,[2,67],[2,79]]]]]]],
        ["content","model.name",["loc",[null,[2,89],[2,103]]]],
        ["attribute","href",["concat",[["get","baseUrl",["loc",[null,[9,21],[9,28]]]],".csv"]]],
        ["attribute","href",["concat",[["get","baseUrl",["loc",[null,[10,21],[10,28]]]],".kml"]]],
        ["attribute","href",["concat",[["get","baseUrl",["loc",[null,[11,21],[11,28]]]],".zip"]]],
        ["attribute","href",["concat",[["get","model.landingPage",["loc",[null,[13,21],[13,38]]]]]]],
        ["attribute","href",["concat",[["get","model.url",["loc",[null,[14,21],[14,30]]]]]]],
        ["content","model.description",["loc",[null,[23,9],[23,32]]]],
        ["content","model.owner",["loc",[null,[30,12],[30,27]]]],
        ["inline","moment-from-now",[["get","model.createdAt",["loc",[null,[33,30],[33,45]]]]],[],["loc",[null,[33,12],[33,47]]]],
        ["inline","moment-from-now",[["get","model.createdAt",["loc",[null,[36,30],[36,45]]]]],[],["loc",[null,[36,12],[36,47]]]],
        ["content","tagsString",["loc",[null,[39,12],[39,26]]]],
        ["content","model.views",["loc",[null,[42,12],[42,27]]]],
        ["inline","esri-map",[],["model",["subexpr","@mut",[["get","model",["loc",[null,[50,19],[50,24]]]]],[],[]]],["loc",[null,[50,2],[50,26]]]],
        ["inline","dataset-table",[],["model",["subexpr","@mut",[["get","model",["loc",[null,[54,24],[54,29]]]]],[],[]]],["loc",[null,[54,2],[54,31]]]],
        ["content","outlet",["loc",[null,[57,0],[57,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
efineday('opendata-ember/templates/datasets', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 27,
              "column": 4
            },
            "end": {
              "line": 31,
              "column": 4
            }
          },
          "moduleName": "opendata-ember/templates/datasets.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","disabled");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("«");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0-canary+6640ab13",
            "loc": {
              "source": null,
              "start": {
                "line": 33,
                "column": 8
              },
              "end": {
                "line": 33,
                "column": 56
              }
            },
            "moduleName": "opendata-ember/templates/datasets.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("«");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 31,
              "column": 4
            },
            "end": {
              "line": 35,
              "column": 4
            }
          },
          "moduleName": "opendata-ember/templates/datasets.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","link-to",[["subexpr","query-params",[],["page",["get","prevPage",["loc",[null,[33,38],[33,46]]]]],["loc",[null,[33,19],[33,47]]]]],[],0,null,["loc",[null,[33,8],[33,68]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0-canary+6640ab13",
            "loc": {
              "source": null,
              "start": {
                "line": 44,
                "column": 8
              },
              "end": {
                "line": 44,
                "column": 61
              }
            },
            "moduleName": "opendata-ember/templates/datasets.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["content","num.page",["loc",[null,[44,49],[44,61]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 42,
              "column": 4
            },
            "end": {
              "line": 46,
              "column": 4
            }
          },
          "moduleName": "opendata-ember/templates/datasets.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createAttrMorph(element0, 'class');
          morphs[1] = dom.createMorphAt(element0,1,1);
          return morphs;
        },
        statements: [
          ["attribute","class",["concat",[["get","num.className",["loc",[null,[43,19],[43,32]]]]]]],
          ["block","link-to",[["subexpr","query-params",[],["page",["get","num.page",["loc",[null,[44,38],[44,46]]]]],["loc",[null,[44,19],[44,47]]]]],[],0,null,["loc",[null,[44,8],[44,73]]]]
        ],
        locals: ["num"],
        templates: [child0]
      };
    }());
    var child3 = (function() {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 49,
              "column": 4
            },
            "end": {
              "line": 53,
              "column": 4
            }
          },
          "moduleName": "opendata-ember/templates/datasets.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","disabled");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("»");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child4 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0-canary+6640ab13",
            "loc": {
              "source": null,
              "start": {
                "line": 55,
                "column": 8
              },
              "end": {
                "line": 55,
                "column": 56
              }
            },
            "moduleName": "opendata-ember/templates/datasets.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("»");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 53,
              "column": 4
            },
            "end": {
              "line": 57,
              "column": 4
            }
          },
          "moduleName": "opendata-ember/templates/datasets.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","link-to",[["subexpr","query-params",[],["page",["get","nextPage",["loc",[null,[55,38],[55,46]]]]],["loc",[null,[55,19],[55,47]]]]],[],0,null,["loc",[null,[55,8],[55,68]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": [
            "multiple-nodes"
          ]
        },
        "revision": "Ember@2.2.0-canary+6640ab13",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 60,
            "column": 0
          }
        },
        "moduleName": "opendata-ember/templates/datasets.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode("\n    Your search for ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("em");
        var el3 = dom.createTextNode("\"");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\"");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" yielded ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" datasets\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","table-responsive");
        var el2 = dom.createTextNode("  \n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("table");
        dom.setAttribute(el2,"class","table table-striped table-bordered table-hover");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("thead");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("tr");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("NAME");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("OWNER");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("RECORDS");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("LAYER TYPE");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("VIEWS");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("CREATED");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("th");
        var el6 = dom.createTextNode("UPDATED");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tbody");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","pagination");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(fragment, [4, 1]);
        var morphs = new Array(6);
        morphs[0] = dom.createMorphAt(dom.childAt(element1, [1]),1,1);
        morphs[1] = dom.createMorphAt(element1,3,3);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [2, 1, 3]),1,1);
        morphs[3] = dom.createMorphAt(element2,1,1);
        morphs[4] = dom.createMorphAt(element2,3,3);
        morphs[5] = dom.createMorphAt(element2,5,5);
        return morphs;
      },
      statements: [
        ["content","q",["loc",[null,[2,25],[2,30]]]],
        ["content","totalCount",["loc",[null,[2,45],[2,59]]]],
        ["content","outlet",["loc",[null,[19,6],[19,16]]]],
        ["block","if",[["get","isFirstPage",["loc",[null,[27,10],[27,21]]]]],[],0,1,["loc",[null,[27,4],[35,11]]]],
        ["block","each",[["get","pageRange",["loc",[null,[42,12],[42,21]]]]],[],2,null,["loc",[null,[42,4],[46,13]]]],
        ["block","if",[["get","isLastPage",["loc",[null,[49,10],[49,20]]]]],[],3,4,["loc",[null,[49,4],[57,11]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
    };
  }()));

});
efineday('opendata-ember/templates/datasets/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "fragmentReason": {
            "name": "modifiers",
            "modifiers": [
              "action"
            ]
          },
          "revision": "Ember@2.2.0-canary+6640ab13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 11,
              "column": 0
            }
          },
          "moduleName": "opendata-ember/templates/datasets/index.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(8);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          morphs[2] = dom.createMorphAt(dom.childAt(element0, [3]),0,0);
          morphs[3] = dom.createMorphAt(dom.childAt(element0, [5]),0,0);
          morphs[4] = dom.createMorphAt(dom.childAt(element0, [7]),0,0);
          morphs[5] = dom.createMorphAt(dom.childAt(element0, [9]),0,0);
          morphs[6] = dom.createMorphAt(dom.childAt(element0, [11]),0,0);
          morphs[7] = dom.createMorphAt(dom.childAt(element0, [13]),0,0);
          return morphs;
        },
        statements: [
          ["element","action",["gotoDataset",["get","dataset",["loc",[null,[2,29],[2,36]]]]],[],["loc",[null,[2,6],[2,38]]]],
          ["content","dataset.name",["loc",[null,[3,8],[3,24]]]],
          ["content","dataset.owner",["loc",[null,[4,8],[4,25]]]],
          ["content","dataset.recordCount",["loc",[null,[5,8],[5,31]]]],
          ["content","dataset.itemType",["loc",[null,[6,8],[6,28]]]],
          ["content","dataset.views",["loc",[null,[7,8],[7,25]]]],
          ["inline","moment-from-now",[["get","dataset.createdAt",["loc",[null,[8,26],[8,43]]]]],[],["loc",[null,[8,8],[8,45]]]],
          ["inline","moment-from-now",[["get","dataset.updatedAt",["loc",[null,[9,26],[9,43]]]]],[],["loc",[null,[9,8],[9,45]]]]
        ],
        locals: ["dataset"],
        templates: []
      };
    }());
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": [
            "wrong-type"
          ]
        },
        "revision": "Ember@2.2.0-canary+6640ab13",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 12,
            "column": 0
          }
        },
        "moduleName": "opendata-ember/templates/datasets/index.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","each",[["get","model",["loc",[null,[1,9],[1,14]]]]],[],0,null,["loc",[null,[1,0],[11,10]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
efineday('opendata-ember/templates/datasets/loading', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "fragmentReason": false,
        "revision": "Ember@2.2.0-canary+6640ab13",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 10,
            "column": 0
          }
        },
        "moduleName": "opendata-ember/templates/datasets/loading.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("tr");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("td");
        dom.setAttribute(el2,"colspan","7");
        dom.setAttribute(el2,"class","text-center");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","progress");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","progress-bar progress-bar-striped active");
        dom.setAttribute(el4,"role","progressbar");
        dom.setAttribute(el4,"aria-valuenow","40");
        dom.setAttribute(el4,"aria-valuemin","0");
        dom.setAttribute(el4,"aria-valuemax","100");
        dom.setAttribute(el4,"style","width: 45%");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","sr-only");
        var el6 = dom.createTextNode("65% Complete");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() { return []; },
      statements: [

      ],
      locals: [],
      templates: []
    };
  }()));

});
efineday('opendata-ember/templates/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": [
            "multiple-nodes",
            "wrong-type"
          ]
        },
        "revision": "Ember@2.2.0-canary+6640ab13",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 24,
            "column": 0
          }
        },
        "moduleName": "opendata-ember/templates/index.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","jumbotron");
        dom.setAttribute(el1,"id","hero");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        dom.setAttribute(el2,"class","page-header");
        var el3 = dom.createTextNode("My Open Data");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  \n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("form");
        var el3 = dom.createTextNode("\n  \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","input-group input-group-lg");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"class","sr-only");
        dom.setAttribute(el5,"for","search");
        var el6 = dom.createTextNode("Search");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","input-group-btn");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6,"id","search-btn");
        dom.setAttribute(el6,"class","btn btn-default");
        dom.setAttribute(el6,"type","submit");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7,"class","glyphicon glyphicon-search");
        dom.setAttribute(el7,"aria-hidden","true");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  \n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  \n    \n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"style","float:right;color:#FFF");
        var el3 = dom.createTextNode("Image ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"href","https://www.flickr.com/photos/davebloggs007/14389618573");
        var el4 = dom.createTextNode("CC Dave Bloggs");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3]);
        var morphs = new Array(3);
        morphs[0] = dom.createElementMorph(element0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [1, 1]),3,3);
        morphs[2] = dom.createMorphAt(fragment,2,2,contextualElement);
        return morphs;
      },
      statements: [
        ["element","action",["search"],["on","submit"],["loc",[null,[4,8],[4,39]]]],
        ["inline","input",[],["value",["subexpr","@mut",[["get","q",["loc",[null,[9,22],[9,23]]]]],[],[]],"class","form-control","placeholder","search for open data"],["loc",[null,[9,8],[9,81]]]],
        ["content","outlet",["loc",[null,[23,0],[23,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
efineday('opendata-ember/tests/adapters/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - adapters');
  QUnit.test('adapters/application.js should pass jshint', function(assert) { 
    assert.ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/adapters/dataset.jshint', function () {

  'use strict';

  QUnit.module('JSHint - adapters');
  QUnit.test('adapters/dataset.js should pass jshint', function(assert) { 
    assert.ok(false, 'adapters/dataset.js should pass jshint.\nadapters/dataset.js: line 11, col 46, \'snapshot\' is defined but never used.\nadapters/dataset.js: line 11, col 35, \'modelName\' is defined but never used.\n\n2 errors'); 
  });

});
efineday('opendata-ember/tests/app.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('app.js should pass jshint', function(assert) { 
    assert.ok(true, 'app.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/components/dataset-table.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/dataset-table.js should pass jshint', function(assert) { 
    assert.ok(true, 'components/dataset-table.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/components/esri-map.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/esri-map.js should pass jshint', function(assert) { 
    assert.ok(true, 'components/esri-map.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/controllers/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/application.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/controllers/dataset.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/dataset.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/dataset.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/controllers/datasets.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/datasets.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/datasets.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/controllers/index.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/index.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/index.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/helpers/resolver', ['exports', 'ember/resolver', 'opendata-ember/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
efineday('opendata-ember/tests/helpers/resolver.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/resolver.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/helpers/start-app', ['exports', 'ember', 'opendata-ember/app', 'opendata-ember/config/environment'], function (exports, Ember, Application, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
efineday('opendata-ember/tests/helpers/start-app.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/start-app.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/models/dataset.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/dataset.js should pass jshint', function(assert) { 
    assert.ok(true, 'models/dataset.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/router.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('router.js should pass jshint', function(assert) { 
    assert.ok(true, 'router.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/routes/dataset.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/dataset.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/dataset.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/routes/datasets/index.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes/datasets');
  QUnit.test('routes/datasets/index.js should pass jshint', function(assert) { 
    assert.ok(false, 'routes/datasets/index.js should pass jshint.\nroutes/datasets/index.js: line 15, col 36, \'params\' is defined but never used.\n\n1 error'); 
  });

});
efineday('opendata-ember/tests/serializers/dataset.jshint', function () {

  'use strict';

  QUnit.module('JSHint - serializers');
  QUnit.test('serializers/dataset.js should pass jshint', function(assert) { 
    assert.ok(false, 'serializers/dataset.js should pass jshint.\nserializers/dataset.js: line 6, col 71, \'requestType\' is defined but never used.\nserializers/dataset.js: line 6, col 67, \'id\' is defined but never used.\n\n2 errors'); 
  });

});
efineday('opendata-ember/tests/services/feature-service.jshint', function () {

  'use strict';

  QUnit.module('JSHint - services');
  QUnit.test('services/feature-service.js should pass jshint', function(assert) { 
    assert.ok(false, 'services/feature-service.js should pass jshint.\nservices/feature-service.js: line 42, col 46, \'xhr\' is defined but never used.\nservices/feature-service.js: line 42, col 38, \'status\' is defined but never used.\nservices/feature-service.js: line 45, col 39, \'error\' is defined but never used.\n\n3 errors'); 
  });

});
efineday('opendata-ember/tests/test-helper', ['opendata-ember/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
efineday('opendata-ember/tests/test-helper.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('test-helper.js should pass jshint', function(assert) { 
    assert.ok(true, 'test-helper.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/adapters/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('adapter:application', 'Unit | Adapter | application', {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

});
efineday('opendata-ember/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/adapters');
  QUnit.test('unit/adapters/application-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/adapters/dataset-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('adapter:dataset', 'Unit | Adapter | dataset', {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

});
efineday('opendata-ember/tests/unit/adapters/dataset-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/adapters');
  QUnit.test('unit/adapters/dataset-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/adapters/dataset-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/controllers/dataset-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:dataset', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
efineday('opendata-ember/tests/unit/controllers/dataset-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/controllers');
  QUnit.test('unit/controllers/dataset-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/controllers/dataset-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/controllers/datasets-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:datasets', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
efineday('opendata-ember/tests/unit/controllers/datasets-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/controllers');
  QUnit.test('unit/controllers/datasets-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/controllers/datasets-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/models/dataset-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('dataset', 'Unit | Model | dataset', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
efineday('opendata-ember/tests/unit/models/dataset-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/models');
  QUnit.test('unit/models/dataset-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/models/dataset-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/routes/datasets-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:datasets', 'Unit | Route | datasets', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
efineday('opendata-ember/tests/unit/routes/datasets-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/datasets-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/datasets-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/routes/datasets/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:datasets/index', 'Unit | Route | datasets/index', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
efineday('opendata-ember/tests/unit/routes/datasets/index-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes/datasets');
  QUnit.test('unit/routes/datasets/index-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/datasets/index-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/serializers/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('application', 'Unit | Serializer | application', {
    // Specify the other units that are required for this test.
    needs: ['serializer:application']
  });

  // Replace this with your real tests.
  ember_qunit.test('it serializes records', function (assert) {
    var record = this.subject();

    var serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

});
efineday('opendata-ember/tests/unit/serializers/application-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/serializers');
  QUnit.test('unit/serializers/application-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/serializers/application-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/serializers/dataset-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('dataset', 'Unit | Serializer | dataset', {
    // Specify the other units that are required for this test.
    needs: ['serializer:dataset']
  });

  // Replace this with your real tests.
  ember_qunit.test('it serializes records', function (assert) {
    var record = this.subject();

    var serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

});
efineday('opendata-ember/tests/unit/serializers/dataset-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/serializers');
  QUnit.test('unit/serializers/dataset-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/serializers/dataset-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/services/feature-service-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('service:feature-service', 'Unit | Service | feature service', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var service = this.subject();
    assert.ok(service);
  });

});
efineday('opendata-ember/tests/unit/services/feature-service-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/services');
  QUnit.test('unit/services/feature-service-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/services/feature-service-test.js should pass jshint.'); 
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

efineday('opendata-ember/config/environment', ['ember'], function(Ember) {
  return { 'default': {"modulePrefix":"opendata-ember","environment":"development","baseURL":"/","locationType":"auto","contentSecurityPolicy":{"default-src":"'none'","script-src":"* 'unsafe-inline' 'unsafe-eval' use.typekit.net connect.facebook.net maps.googleapis.com maps.gstatic.com","font-src":"* data: use.typekit.net","connect-src":"*","img-src":"*","style-src":"* 'unsafe-inline' use.typekit.net","frame-src":"s-static.ak.facebook.com static.ak.facebook.com www.facebook.com","media-src":"'self'"},"EmberENV":{"FEATURES":{}},"APP":{"API":"http://opendataqa.arcgis.com","LOG_RESOLVER":true,"LOG_ACTIVE_GENERATION":true,"LOG_TRANSITIONS":true,"LOG_TRANSITIONS_INTERNAL":true,"LOG_VIEW_LOOKUPS":true,"name":"opendata-ember","version":"0.0.0+fdd55bfb"},"contentSecurityPolicyHeader":"Content-Security-Policy-Report-Only","exportApplicationGlobal":true}};
});

if (runningTests) {
  equireray("opendata-ember/tests/test-helper");
} else {
  equireray("opendata-ember/app")["default"].create({"API":"http://opendataqa.arcgis.com","LOG_RESOLVER":true,"LOG_ACTIVE_GENERATION":true,"LOG_TRANSITIONS":true,"LOG_TRANSITIONS_INTERNAL":true,"LOG_VIEW_LOOKUPS":true,"name":"opendata-ember","version":"0.0.0+fdd55bfb"});
}

/* jshint ignore:end */
//# sourceMappingURL=opendata-ember.map