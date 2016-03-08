"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

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

    urlForFindRecord: function urlForFindRecord(id /*, modelName, snapshot*/) {
      var host = this.get('host');
      return host + '/datasets/' + id + '.json';
    }

  });

});
efineday('opendata-ember/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'opendata-ember/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App = undefined;

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

  var name = config['default'].APP.name;
  var version = config['default'].APP.version;

  exports['default'] = AppVersionComponent['default'].extend({
    version: version,
    name: name
  });

});
efineday('opendata-ember/components/dataset-table', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({

    actions: {
      setPage: function setPage(page) {
        this.setPage(page);
      },
      setSort: function setSort(sort) {
        this.setSort(sort);
      }
    },

    featureService: Ember['default'].inject.service('feature-service'),

    didInsertElement: function didInsertElement() {

      //deprecation warning with this...
      //so we set it from the outside
      //this.set('orderBy', this.get('model.objectIdField'));

      this.fetchPage();
    },

    fetchPage: function fetchPage() {
      var model = this.get('model');
      this.get('featureService').fetchPage(model, this._getPageParams()).then(this._handlePageResponse.bind(this))
      //.finally(function () { alert('all done'); })
      ['catch'](function () {
        alert('error');
      });
    },

    setPage: function setPage(page) {
      this.set('page', page);
      this.fetchPage();
    },

    setSort: function setSort(orderBy) {
      var obj = {
        page: 1,
        orderBy: orderBy,
        orderByAsc: orderBy === this.orderBy ? !this.orderByAsc : true
      };

      this.setProperties(obj);
      this.fetchPage();
    },

    perPage: 10,

    page: 1,

    orderBy: '',

    orderByAsc: true,

    sortIconClass: (function () {
      var result = 'glyphicon-chevron-';
      result += this.orderByAsc ? 'up' : 'down';
      return result;
    }).property('orderByAsc'),

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
        return feat.attributes;
      });
      this.set('data', data);
    },

    willRemoveElement: function willRemoveElement() {},

    totalCount: (function () {
      return this.get('model.recordCount');
    }).property('model'),

    supportsPagination: (function () {
      return this.get('model.advancedQueryCapabilities.supports_pagination');
    }).property('model'),

    from: (function () {
      return (this.get('page') - 1) * this.get('perPage') + 1;
      //this really depends on perPage and page but we don't want it to change until we get data
    }).property('data.[]'),

    to: (function () {
      var data = this.get('data');
      var perPage = this.get('perPage');
      var result = perPage;
      if (data) {
        result = (this.get('page') - 1) * perPage + this.get('data').length;
      }
      return result;
      //this really depends on perPage and page too but we don't want it to change until we get data
    }).property('data.[]'),

    isFirstPage: (function () {
      return this.get('page') === 1;
    }).property('page'),

    prevPage: (function () {
      return this.get('page') - 1;
    }).property('page'),

    isLastPage: (function () {
      return this.get('page') === this.get('totalPages');
    }).property('page', 'totalPages'),

    nextPage: (function () {
      return this.get('page') + 1;
    }).property('page'),

    totalPages: (function () {
      return Math.ceil(this.get('totalCount') / this.get('perPage'));
    }).property('totalCount', 'perPage'),

    pageRange: (function () {
      var totalPages = this.get('totalPages');
      var page = this.get('page');
      var start = totalPages > 10 && page > 6 ? page - 5 : 1;
      var end = totalPages > start + 9 ? start + 9 : totalPages;

      var className = undefined,
          pageRange = [];
      for (var i = start; i <= end; i++) {
        className = i === page ? 'active' : '';
        pageRange.push({ page: i, className: className });
      }
      return pageRange;
    }).property('totalPages', 'page')

  });

});
efineday('opendata-ember/components/download-button', ['exports', 'ember', 'ember-data', 'opendata-ember/config/environment'], function (exports, Ember, DS, ENV) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({

    baseUrl: (function () {
      var model = this.get('model');
      var url = ENV['default'].APP.API;
      url += DS['default'].JSONAPIAdapter.prototype.buildURL('dataset', model.get('id'));
      return url;
    }).property('model.id')

  });

});
efineday('opendata-ember/components/esri-map', ['exports', 'ember', 'esri/Map', 'esri/views/MapView', 'esri/layers/FeatureLayer', 'esri/widgets/PopupTemplate', 'esri/geometry/Extent', 'esri/renderers/SimpleRenderer'], function (exports, Ember, Map, MapView, FeatureLayer, PopupTemplate, Extent, SimpleRenderer) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({

    classNames: ['esri-map-component'],

    didInsertElement: function didInsertElement() {
      var dataset = this.get('model');

      var mapOpts = {
        basemap: 'dark-gray'
      };

      var map = new Map['default'](mapOpts);
      this.set('map', map);

      var mapViewOpts = {
        container: this.element, //reference to the DOM node that will contain the view
        map: map, //references the map object created in step 3
        height: this.element.clientHeight + 'px', //ie9 needs it expressed this way
        width: this.element.clientWidth + 'px'
      };

      var extent = undefined,
          ext = dataset.get('extent');
      if (ext && ext.coordinates) {
        var coords = ext.coordinates;
        extent = new Extent['default'](coords[0][0], coords[0][1], coords[1][0], coords[1][1], { wkid: 4326 });
      }

      if (extent) {
        mapViewOpts.extent = extent;
      } else {
        mapViewOpts.center = [-56.049, 38.485];
        mapViewOpts.zoom = 3;
      }

      var view = new MapView['default'](mapViewOpts);
      this.set('mapView', view);

      this._addDataset(map, dataset);
    },

    willRemoveElement: function willRemoveElement() {
      var view = this.get('mapView');
      if (view) {
        view.destroy();
      }

      var map = this.get('map');
      if (map) {
        map.destroy();
      }
    },

    _addDataset: function _addDataset(map, dataset) {
      var opts = this._getDatasetLayerOpts(dataset);
      var datasetLayer = new FeatureLayer['default'](dataset.get('url'), opts);
      this.set('datasetLayer', datasetLayer);
      map.add(datasetLayer);
    },

    _getDatasetInfoTemplate: function _getDatasetInfoTemplate(dataset) {
      var displayFieldName = dataset.get('displayField');
      var title = displayFieldName ? '{' + displayFieldName + '}' : 'Attributes';
      return new PopupTemplate['default']({ title: title, description: '{*}' });
    },

    _getRenderer: function _getRenderer(dataset) {
      var geometryType = dataset.get('geometryType');
      var renderer = undefined;

      //depending on the type, load in the default renderer as json
      switch (geometryType) {
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

    _getDatasetLayerOpts: function _getDatasetLayerOpts(dataset) {
      var opts = {
        minScale: 0,
        maxScale: 0,
        outFields: ['*'],
        popupTemplate: this._getDatasetInfoTemplate(dataset),
        renderer: this._getRenderer(dataset, opts)
      };

      return opts;
    },

    _createRendererFromJson: function _createRendererFromJson(rendererJson) {
      return new SimpleRenderer['default'](rendererJson);
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
    }).property('model.thumbnailUrl', 'model.mainGroupThumbnailUrl'),

    baseUrl: (function () {
      var model = this.get('model');
      var url = ENV['default'].APP.API;
      url += DS['default'].JSONAPIAdapter.prototype.buildURL('dataset', model.get('id'));
      return url;
    }).property('model.id'),

    showMap: Ember['default'].computed('model', function () {
      return this.get('model.itemType') !== 'Table';
    }),

    tagsString: (function () {
      var model = this.get('model');
      return model.get('tags').join(' | ');
    }).property('model.tags')

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
efineday('opendata-ember/helpers/and', ['exports', 'ember', 'ember-truth-helpers/helpers/and'], function (exports, Ember, and) {

  'use strict';

  var forExport = null;

  if (Ember['default'].Helper) {
    forExport = Ember['default'].Helper.helper(and.andHelper);
  } else if (Ember['default'].HTMLBars.makeBoundHelper) {
    forExport = Ember['default'].HTMLBars.makeBoundHelper(and.andHelper);
  }

  exports['default'] = forExport;

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
efineday('opendata-ember/helpers/eq', ['exports', 'ember', 'ember-truth-helpers/helpers/equal'], function (exports, Ember, equal) {

  'use strict';

  var forExport = null;

  if (Ember['default'].Helper) {
    forExport = Ember['default'].Helper.helper(equal.equalHelper);
  } else if (Ember['default'].HTMLBars.makeBoundHelper) {
    forExport = Ember['default'].HTMLBars.makeBoundHelper(equal.equalHelper);
  }

  exports['default'] = forExport;

});
efineday('opendata-ember/helpers/format-number', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.formatNumber = formatNumber;

  function formatNumber(params /*, hash*/) {
    return params.toLocaleString();
  }

  exports['default'] = Ember['default'].Helper.helper(formatNumber);

});
efineday('opendata-ember/helpers/gt', ['exports', 'ember', 'ember-truth-helpers/helpers/gt'], function (exports, Ember, gt) {

  'use strict';

  var forExport = null;

  if (Ember['default'].Helper) {
    forExport = Ember['default'].Helper.helper(gt.gtHelper);
  } else if (Ember['default'].HTMLBars.makeBoundHelper) {
    forExport = Ember['default'].HTMLBars.makeBoundHelper(gt.gtHelper);
  }

  exports['default'] = forExport;

});
efineday('opendata-ember/helpers/gte', ['exports', 'ember', 'ember-truth-helpers/helpers/gte'], function (exports, Ember, gte) {

  'use strict';

  var forExport = null;

  if (Ember['default'].Helper) {
    forExport = Ember['default'].Helper.helper(gte.gteHelper);
  } else if (Ember['default'].HTMLBars.makeBoundHelper) {
    forExport = Ember['default'].HTMLBars.makeBoundHelper(gte.gteHelper);
  }

  exports['default'] = forExport;

});
efineday('opendata-ember/helpers/is-array', ['exports', 'ember', 'ember-truth-helpers/helpers/is-array'], function (exports, Ember, is_array) {

  'use strict';

  var forExport = null;

  if (Ember['default'].Helper) {
    forExport = Ember['default'].Helper.helper(is_array.isArrayHelper);
  } else if (Ember['default'].HTMLBars.makeBoundHelper) {
    forExport = Ember['default'].HTMLBars.makeBoundHelper(is_array.isArrayHelper);
  }

  exports['default'] = forExport;

});
efineday('opendata-ember/helpers/lt', ['exports', 'ember', 'ember-truth-helpers/helpers/lt'], function (exports, Ember, lt) {

  'use strict';

  var forExport = null;

  if (Ember['default'].Helper) {
    forExport = Ember['default'].Helper.helper(lt.ltHelper);
  } else if (Ember['default'].HTMLBars.makeBoundHelper) {
    forExport = Ember['default'].HTMLBars.makeBoundHelper(lt.ltHelper);
  }

  exports['default'] = forExport;

});
efineday('opendata-ember/helpers/lte', ['exports', 'ember', 'ember-truth-helpers/helpers/lte'], function (exports, Ember, lte) {

  'use strict';

  var forExport = null;

  if (Ember['default'].Helper) {
    forExport = Ember['default'].Helper.helper(lte.lteHelper);
  } else if (Ember['default'].HTMLBars.makeBoundHelper) {
    forExport = Ember['default'].HTMLBars.makeBoundHelper(lte.lteHelper);
  }

  exports['default'] = forExport;

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
efineday('opendata-ember/helpers/not-eq', ['exports', 'ember', 'ember-truth-helpers/helpers/not-equal'], function (exports, Ember, not_equal) {

  'use strict';

  var forExport = null;

  if (Ember['default'].Helper) {
    forExport = Ember['default'].Helper.helper(not_equal.notEqualHelper);
  } else if (Ember['default'].HTMLBars.makeBoundHelper) {
    forExport = Ember['default'].HTMLBars.makeBoundHelper(not_equal.notEqualHelper);
  }

  exports['default'] = forExport;

});
efineday('opendata-ember/helpers/not', ['exports', 'ember', 'ember-truth-helpers/helpers/not'], function (exports, Ember, not) {

  'use strict';

  var forExport = null;

  if (Ember['default'].Helper) {
    forExport = Ember['default'].Helper.helper(not.notHelper);
  } else if (Ember['default'].HTMLBars.makeBoundHelper) {
    forExport = Ember['default'].HTMLBars.makeBoundHelper(not.notHelper);
  }

  exports['default'] = forExport;

});
efineday('opendata-ember/helpers/or', ['exports', 'ember', 'ember-truth-helpers/helpers/or'], function (exports, Ember, or) {

  'use strict';

  var forExport = null;

  if (Ember['default'].Helper) {
    forExport = Ember['default'].Helper.helper(or.orHelper);
  } else if (Ember['default'].HTMLBars.makeBoundHelper) {
    forExport = Ember['default'].HTMLBars.makeBoundHelper(or.orHelper);
  }

  exports['default'] = forExport;

});
efineday('opendata-ember/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, pluralize) {

	'use strict';

	exports['default'] = pluralize['default'];

});
efineday('opendata-ember/helpers/property-of', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.accessProperty = accessProperty;

  function accessProperty(params /*, hash*/) {
    return params[0][params[1]];
  }

  exports['default'] = Ember['default'].Helper.helper(accessProperty);

});
efineday('opendata-ember/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, singularize) {

	'use strict';

	exports['default'] = singularize['default'];

});
efineday('opendata-ember/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'opendata-ember/config/environment'], function (exports, initializerFactory, config) {

  'use strict';

  exports['default'] = {
    name: 'App Version',
    initialize: initializerFactory['default'](config['default'].APP.name, config['default'].APP.version)
  };

});
efineday('opendata-ember/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, setupContainer) {

  'use strict';

  exports['default'] = {
    name: 'ember-data',
    initialize: setupContainer['default']
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

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
efineday('opendata-ember/initializers/truth-helpers', ['exports', 'ember', 'ember-truth-helpers/utils/register-helper', 'ember-truth-helpers/helpers/and', 'ember-truth-helpers/helpers/or', 'ember-truth-helpers/helpers/equal', 'ember-truth-helpers/helpers/not', 'ember-truth-helpers/helpers/is-array', 'ember-truth-helpers/helpers/not-equal', 'ember-truth-helpers/helpers/gt', 'ember-truth-helpers/helpers/gte', 'ember-truth-helpers/helpers/lt', 'ember-truth-helpers/helpers/lte'], function (exports, Ember, register_helper, and, or, equal, not, is_array, not_equal, gt, gte, lt, lte) {

  'use strict';

  exports.initialize = initialize;

  function initialize() /* container, application */{

    // Do not register helpers from Ember 1.13 onwards, starting from 1.13 they
    // will be auto-discovered.
    if (Ember['default'].Helper) {
      return;
    }

    register_helper.registerHelper('and', and.andHelper);
    register_helper.registerHelper('or', or.orHelper);
    register_helper.registerHelper('eq', equal.equalHelper);
    register_helper.registerHelper('not', not.notHelper);
    register_helper.registerHelper('is-array', is_array.isArrayHelper);
    register_helper.registerHelper('not-eq', not_equal.notEqualHelper);
    register_helper.registerHelper('gt', gt.gtHelper);
    register_helper.registerHelper('gte', gte.gteHelper);
    register_helper.registerHelper('lt', lt.ltHelper);
    register_helper.registerHelper('lte', lte.lteHelper);
  }

  exports['default'] = {
    name: 'truth-helpers',
    initialize: initialize
  };

});
efineday('opendata-ember/instance-initializers/ember-data', ['exports', 'ember-data/-private/instance-initializers/initialize-store-service'], function (exports, initializeStoreService) {

  'use strict';

  exports['default'] = {
    name: "ember-data",
    initialize: initializeStoreService['default']
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
    rootURL: config['default'].rootURL,
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
efineday('opendata-ember/routes/datasets', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({

    queryParams: {
      page: {
        //as: 'other-page',
        refreshModel: true
      },
      q: {
        //as: 'other-q',
        refreshModel: true
      }
    },

    actions: {
      queryParamsDidChange: function queryParamsDidChange() /*params*/{
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

    normalizeResponse: function normalizeResponse(store, primaryModelClass, payload /*, id, requestType*/) {

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
efineday('opendata-ember/services/feature-service', ['exports', 'ember', 'esri/request'], function (exports, Ember, esriRequest) {

  'use strict';

  exports['default'] = Ember['default'].Service.extend({

    _getQueryUrl: function _getQueryUrl(dataset, params) {
      var url = dataset.get('url');
      url += '/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson';

      var supportsPagination = Ember['default'].get(dataset, 'advancedQueryCapabilities.supports_pagination');

      if (supportsPagination) {
        var perPage = params.perPage;
        url += '&resultOffset=' + (params.page - 1) * perPage;
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
      return this._request(url);
    },

    _request: function _request(url) {
      // use esri.request so it handles cors/jsonp but wrap it in an ember promise
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        var req = {
          url: url,
          callbackParamName: 'callback' //use jsonp in downlevel ie
        };
        var opts = {
          disableIdentityLookup: true
        };
        var reqHandle = new esriRequest['default'](req, opts);
        reqHandle.then(resolve, reject);
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
          "revision": "Ember@2.3.0",
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
        "revision": "Ember@2.3.0",
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
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 9,
                "column": 12
              },
              "end": {
                "line": 11,
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
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"aria-hidden","true");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element5 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createAttrMorph(element5, 'class');
            return morphs;
          },
          statements: [
            ["attribute","class",["concat",["glyphicon small ",["get","sortIconClass",["loc",[null,[10,45],[10,58]]]]," text-muted"]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 8
            },
            "end": {
              "line": 13,
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
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
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
          var element6 = dom.childAt(fragment, [1]);
          var morphs = new Array(3);
          morphs[0] = dom.createElementMorph(element6);
          morphs[1] = dom.createMorphAt(element6,1,1);
          morphs[2] = dom.createMorphAt(element6,3,3);
          return morphs;
        },
        statements: [
          ["element","action",["setSort",["get","field.name",["loc",[null,[7,33],[7,43]]]]],[],["loc",[null,[7,14],[7,45]]]],
          ["content","field.alias",["loc",[null,[8,12],[8,27]]]],
          ["block","if",[["subexpr","eq",[["get","field.name",["loc",[null,[9,22],[9,32]]]],["get","orderBy",["loc",[null,[9,33],[9,40]]]]],[],["loc",[null,[9,18],[9,41]]]]],[],0,null,["loc",[null,[9,12],[11,19]]]]
        ],
        locals: ["field"],
        templates: [child0]
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 19,
                "column": 10
              },
              "end": {
                "line": 21,
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
            ["inline","property-of",[["get","row",["loc",[null,[20,30],[20,33]]]],["get","field.name",["loc",[null,[20,34],[20,44]]]]],[],["loc",[null,[20,16],[20,46]]]]
          ],
          locals: ["field"],
          templates: []
        };
      }());
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 17,
              "column": 6
            },
            "end": {
              "line": 23,
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
          var el2 = dom.createTextNode("      \n");
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
          ["block","each",[["get","model.fields",["loc",[null,[19,18],[19,30]]]]],[],0,null,["loc",[null,[19,10],[21,19]]]]
        ],
        locals: ["row"],
        templates: [child0]
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 32,
                "column": 6
              },
              "end": {
                "line": 36,
                "column": 6
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
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","disabled");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            var el3 = dom.createTextNode("«");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
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
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 36,
                "column": 6
              },
              "end": {
                "line": 40,
                "column": 6
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
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            var el3 = dom.createTextNode("«");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element3 = dom.childAt(fragment, [1, 1]);
            var morphs = new Array(1);
            morphs[0] = dom.createElementMorph(element3);
            return morphs;
          },
          statements: [
            ["element","action",["setPage",["get","prevPage",["loc",[null,[38,32],[38,40]]]]],[],["loc",[null,[38,13],[38,42]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child2 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 47,
                "column": 6
              },
              "end": {
                "line": 51,
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
            var el1 = dom.createElement("li");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element1 = dom.childAt(fragment, [1]);
            var element2 = dom.childAt(element1, [1]);
            var morphs = new Array(3);
            morphs[0] = dom.createAttrMorph(element1, 'class');
            morphs[1] = dom.createElementMorph(element2);
            morphs[2] = dom.createMorphAt(element2,0,0);
            return morphs;
          },
          statements: [
            ["attribute","class",["concat",[["get","num.className",["loc",[null,[48,21],[48,34]]]]]]],
            ["element","action",["setPage",["get","num.page",["loc",[null,[49,32],[49,40]]]]],[],["loc",[null,[49,13],[49,42]]]],
            ["content","num.page",["loc",[null,[49,43],[49,55]]]]
          ],
          locals: ["num"],
          templates: []
        };
      }());
      var child3 = (function() {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 54,
                "column": 6
              },
              "end": {
                "line": 58,
                "column": 6
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
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","disabled");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            var el3 = dom.createTextNode("»");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
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
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.3.0",
            "loc": {
              "source": null,
              "start": {
                "line": 58,
                "column": 6
              },
              "end": {
                "line": 62,
                "column": 6
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
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            var el3 = dom.createTextNode("»");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1, 1]);
            var morphs = new Array(1);
            morphs[0] = dom.createElementMorph(element0);
            return morphs;
          },
          statements: [
            ["element","action",["setPage",["get","nextPage",["loc",[null,[60,32],[60,40]]]]],[],["loc",[null,[60,13],[60,42]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 28,
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
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("nav");
          var el2 = dom.createTextNode("\n    ");
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
          var el3 = dom.createTextNode("    ");
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
          var element4 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(3);
          morphs[0] = dom.createMorphAt(element4,1,1);
          morphs[1] = dom.createMorphAt(element4,3,3);
          morphs[2] = dom.createMorphAt(element4,5,5);
          return morphs;
        },
        statements: [
          ["block","if",[["get","isFirstPage",["loc",[null,[32,12],[32,23]]]]],[],0,1,["loc",[null,[32,6],[40,13]]]],
          ["block","each",[["get","pageRange",["loc",[null,[47,14],[47,23]]]]],[],2,null,["loc",[null,[47,6],[51,15]]]],
          ["block","if",[["get","isLastPage",["loc",[null,[54,12],[54,22]]]]],[],3,4,["loc",[null,[54,6],[62,13]]]]
        ],
        locals: [],
        templates: [child0, child1, child2, child3, child4]
      };
    }());
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": [
            "multiple-nodes",
            "wrong-type"
          ]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 66,
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
        var el2 = dom.createTextNode("Showing ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" to ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" of ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
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
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element7 = dom.childAt(fragment, [0]);
        var element8 = dom.childAt(fragment, [2, 1]);
        var morphs = new Array(6);
        morphs[0] = dom.createMorphAt(element7,1,1);
        morphs[1] = dom.createMorphAt(element7,3,3);
        morphs[2] = dom.createMorphAt(element7,5,5);
        morphs[3] = dom.createMorphAt(dom.childAt(element8, [1, 1]),1,1);
        morphs[4] = dom.createMorphAt(dom.childAt(element8, [3]),1,1);
        morphs[5] = dom.createMorphAt(fragment,4,4,contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["content","from",["loc",[null,[1,12],[1,20]]]],
        ["content","to",["loc",[null,[1,24],[1,30]]]],
        ["content","totalCount",["loc",[null,[1,34],[1,48]]]],
        ["block","each",[["get","model.fields",["loc",[null,[6,16],[6,28]]]]],[],0,null,["loc",[null,[6,8],[13,17]]]],
        ["block","each",[["get","data",["loc",[null,[17,14],[17,18]]]]],[],1,null,["loc",[null,[17,6],[23,15]]]],
        ["block","if",[["get","supportsPagination",["loc",[null,[28,6],[28,24]]]]],[],2,null,["loc",[null,[28,0],[65,7]]]]
      ],
      locals: [],
      templates: [child0, child1, child2]
    };
  }()));

});
efineday('opendata-ember/templates/components/download-button', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 15,
            "column": 0
          }
        },
        "moduleName": "opendata-ember/templates/components/download-button.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","dropdown pull-right");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","btn btn-primary");
        dom.setAttribute(el2,"type","button");
        dom.setAttribute(el2,"data-toggle","dropdown");
        dom.setAttribute(el2,"aria-haspopup","true");
        dom.setAttribute(el2,"aria-expanded","false");
        var el3 = dom.createTextNode("\n    Download\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","caret");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","dropdown-menu");
        dom.setAttribute(el2,"role","menu");
        dom.setAttribute(el2,"aria-labelledby","dLabel");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"target","_blank");
        dom.setAttribute(el4,"download","");
        var el5 = dom.createTextNode("Spreadsheet");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"target","_blank");
        dom.setAttribute(el4,"download","");
        var el5 = dom.createTextNode("KML");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"target","_blank");
        dom.setAttribute(el4,"download","");
        var el5 = dom.createTextNode("Shapefile");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        dom.setAttribute(el3,"class","divider");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"target","_blank");
        var el5 = dom.createTextNode("View in ArcGIS Online");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"target","_blank");
        var el5 = dom.createTextNode("API");
        dom.appendChild(el4, el5);
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
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3]);
        var element1 = dom.childAt(element0, [1, 0]);
        var element2 = dom.childAt(element0, [3, 0]);
        var element3 = dom.childAt(element0, [5, 0]);
        var element4 = dom.childAt(element0, [9, 0]);
        var element5 = dom.childAt(element0, [11, 0]);
        var morphs = new Array(5);
        morphs[0] = dom.createAttrMorph(element1, 'href');
        morphs[1] = dom.createAttrMorph(element2, 'href');
        morphs[2] = dom.createAttrMorph(element3, 'href');
        morphs[3] = dom.createAttrMorph(element4, 'href');
        morphs[4] = dom.createAttrMorph(element5, 'href');
        return morphs;
      },
      statements: [
        ["attribute","href",["concat",[["get","baseUrl",["loc",[null,[7,19],[7,26]]]],".csv"]]],
        ["attribute","href",["concat",[["get","baseUrl",["loc",[null,[8,19],[8,26]]]],".kml"]]],
        ["attribute","href",["concat",[["get","baseUrl",["loc",[null,[9,19],[9,26]]]],".zip"]]],
        ["attribute","href",["concat",[["get","model.landingPage",["loc",[null,[11,19],[11,36]]]]]]],
        ["attribute","href",["concat",[["get","model.url",["loc",[null,[12,19],[12,28]]]]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
efineday('opendata-ember/templates/dataset', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
          "loc": {
            "source": null,
            "start": {
              "line": 36,
              "column": 0
            },
            "end": {
              "line": 40,
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
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","container map-container");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
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
          ["inline","esri-map",[],["model",["subexpr","@mut",[["get","model",["loc",[null,[38,23],[38,28]]]]],[],[]]],["loc",[null,[38,6],[38,30]]]]
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
            "multiple-nodes",
            "wrong-type"
          ]
        },
        "revision": "Ember@2.3.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 48,
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
        var el2 = dom.createComment("");
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
        var el4 = dom.createTextNode("\n\n    ");
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
        var el5 = dom.createTextNode("\n\n        ");
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
        var el5 = dom.createTextNode("\n\n        ");
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
        var el5 = dom.createTextNode("\n\n        ");
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
        var el1 = dom.createComment("");
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
        var element3 = dom.childAt(fragment, [2, 1]);
        var element4 = dom.childAt(element3, [3, 1]);
        var morphs = new Array(12);
        morphs[0] = dom.createAttrMorph(element2, 'src');
        morphs[1] = dom.createMorphAt(dom.childAt(element1, [1]),0,0);
        morphs[2] = dom.createMorphAt(element0,3,3);
        morphs[3] = dom.createUnsafeMorphAt(dom.childAt(element3, [1, 3]),0,0);
        morphs[4] = dom.createMorphAt(dom.childAt(element4, [3]),0,0);
        morphs[5] = dom.createMorphAt(dom.childAt(element4, [7]),0,0);
        morphs[6] = dom.createMorphAt(dom.childAt(element4, [11]),0,0);
        morphs[7] = dom.createMorphAt(dom.childAt(element4, [15]),0,0);
        morphs[8] = dom.createMorphAt(dom.childAt(element4, [19]),0,0);
        morphs[9] = dom.createMorphAt(fragment,4,4,contextualElement);
        morphs[10] = dom.createMorphAt(dom.childAt(fragment, [6]),1,1);
        morphs[11] = dom.createMorphAt(fragment,8,8,contextualElement);
        return morphs;
      },
      statements: [
        ["attribute","src",["concat",[["get","thumbnailSrc",["loc",[null,[2,67],[2,79]]]]]]],
        ["content","model.name",["loc",[null,[2,89],[2,103]]]],
        ["inline","download-button",[],["model",["subexpr","@mut",[["get","model",["loc",[null,[3,26],[3,31]]]]],[],[]]],["loc",[null,[3,2],[3,33]]]],
        ["content","model.description",["loc",[null,[10,9],[10,32]]]],
        ["content","model.owner",["loc",[null,[17,12],[17,27]]]],
        ["inline","moment-from-now",[["get","model.createdAt",["loc",[null,[20,30],[20,45]]]]],[],["loc",[null,[20,12],[20,47]]]],
        ["inline","moment-from-now",[["get","model.createdAt",["loc",[null,[23,30],[23,45]]]]],[],["loc",[null,[23,12],[23,47]]]],
        ["content","tagsString",["loc",[null,[26,12],[26,26]]]],
        ["content","model.views",["loc",[null,[29,12],[29,27]]]],
        ["block","if",[["get","showMap",["loc",[null,[36,6],[36,13]]]]],[],0,null,["loc",[null,[36,0],[40,7]]]],
        ["inline","dataset-table",[],["model",["subexpr","@mut",[["get","model",["loc",[null,[44,24],[44,29]]]]],[],[]],"orderBy",["subexpr","@mut",[["get","model.objectIdField",["loc",[null,[44,38],[44,57]]]]],[],[]]],["loc",[null,[44,2],[44,59]]]],
        ["content","outlet",["loc",[null,[47,0],[47,10]]]]
      ],
      locals: [],
      templates: [child0]
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
          "revision": "Ember@2.3.0",
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
          ["inline","format-number",[["get","dataset.recordCount",["loc",[null,[5,24],[5,43]]]]],[],["loc",[null,[5,8],[5,45]]]],
          ["content","dataset.itemType",["loc",[null,[6,8],[6,28]]]],
          ["inline","format-number",[["get","dataset.views",["loc",[null,[7,24],[7,37]]]]],[],["loc",[null,[7,8],[7,39]]]],
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
        "revision": "Ember@2.3.0",
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
        "revision": "Ember@2.3.0",
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
efineday('opendata-ember/templates/datasets', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.3.0",
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
            "revision": "Ember@2.3.0",
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
          "revision": "Ember@2.3.0",
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
            "revision": "Ember@2.3.0",
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
          "revision": "Ember@2.3.0",
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
          "revision": "Ember@2.3.0",
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
            "revision": "Ember@2.3.0",
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
          "revision": "Ember@2.3.0",
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
        "revision": "Ember@2.3.0",
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
        ["inline","format-number",[["get","totalCount",["loc",[null,[2,61],[2,71]]]]],[],["loc",[null,[2,45],[2,73]]]],
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
        "revision": "Ember@2.3.0",
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
    assert.expect(1);
    assert.ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/adapters/dataset.jshint', function () {

  'use strict';

  QUnit.module('JSHint - adapters');
  QUnit.test('adapters/dataset.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'adapters/dataset.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/app.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('app.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'app.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/components/dataset-table.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/dataset-table.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'components/dataset-table.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/components/download-button.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/download-button.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'components/download-button.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/components/esri-map.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/esri-map.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'components/esri-map.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/controllers/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/application.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/controllers/dataset.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/dataset.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'controllers/dataset.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/controllers/datasets.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/datasets.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'controllers/datasets.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/controllers/index.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/index.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'controllers/index.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/helpers/format-number.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/format-number.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'helpers/format-number.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/helpers/property-of.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/property-of.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'helpers/property-of.js should pass jshint.'); 
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
    assert.expect(1);
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
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/integration/components/download-button-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('download-button', 'Integration | Component | download button', {
    integration: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.3.0',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 19
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'download-button', ['loc', [null, [1, 0], [1, 19]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'fragmentReason': false,
            'revision': 'Ember@2.3.0',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();

      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.3.0',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'download-button', [], [], 0, null, ['loc', [null, [2, 4], [4, 24]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });

});
efineday('opendata-ember/tests/integration/components/download-button-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - integration/components');
  QUnit.test('integration/components/download-button-test.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'integration/components/download-button-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/models/dataset.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/dataset.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'models/dataset.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/router.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('router.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'router.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/routes/dataset.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/dataset.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'routes/dataset.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/routes/datasets.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/datasets.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'routes/datasets.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/serializers/dataset.jshint', function () {

  'use strict';

  QUnit.module('JSHint - serializers');
  QUnit.test('serializers/dataset.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'serializers/dataset.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/services/feature-service.jshint', function () {

  'use strict';

  QUnit.module('JSHint - services');
  QUnit.test('services/feature-service.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(false, 'services/feature-service.js should pass jshint.\nservices/feature-service.js: line 49, col 27, A constructor name should start with an uppercase letter.\n\n1 error'); 
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
    assert.expect(1);
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
    assert.expect(1);
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
    assert.expect(1);
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
    assert.expect(1);
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
    assert.expect(1);
    assert.ok(true, 'unit/controllers/datasets-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/helpers/format-number-test', ['opendata-ember/helpers/format-number', 'qunit'], function (format_number, qunit) {

  'use strict';

  qunit.module('Unit | Helper | format number');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = format_number.formatNumber(42);
    assert.ok(result);
  });

});
efineday('opendata-ember/tests/unit/helpers/format-number-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/helpers');
  QUnit.test('unit/helpers/format-number-test.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'unit/helpers/format-number-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/helpers/property-of-test', ['opendata-ember/helpers/access-property', 'qunit'], function (access_property, qunit) {

  'use strict';

  qunit.module('Unit | Helper | access property');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = access_property.accessProperty(42);
    assert.ok(result);
  });

});
efineday('opendata-ember/tests/unit/helpers/property-of-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/helpers');
  QUnit.test('unit/helpers/property-of-test.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'unit/helpers/property-of-test.js should pass jshint.'); 
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
    assert.expect(1);
    assert.ok(true, 'unit/models/dataset-test.js should pass jshint.'); 
  });

});
efineday('opendata-ember/tests/unit/routes/dataset-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:dataset', 'Unit | Route | dataset', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
efineday('opendata-ember/tests/unit/routes/dataset-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/dataset-test.js should pass jshint', function(assert) { 
    assert.expect(1);
    assert.ok(true, 'unit/routes/dataset-test.js should pass jshint.'); 
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
    assert.expect(1);
    assert.ok(true, 'unit/routes/datasets/index-test.js should pass jshint.'); 
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
    assert.expect(1);
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
    assert.expect(1);
    assert.ok(true, 'unit/services/feature-service-test.js should pass jshint.'); 
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

efineday('opendata-ember/config/environment', ['ember'], function(Ember) {
  var prefix = 'opendata-ember';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  equireray("opendata-ember/tests/test-helper");
} else {
  equireray("opendata-ember/app")["default"].create({"API":"http://opendata.arcgis.com","LOG_RESOLVER":true,"LOG_ACTIVE_GENERATION":true,"LOG_TRANSITIONS":true,"LOG_TRANSITIONS_INTERNAL":true,"LOG_VIEW_LOOKUPS":true,"name":"opendata-ember","version":"0.0.0+5c727383"});
}

/* jshint ignore:end */
//# sourceMappingURL=opendata-ember.map