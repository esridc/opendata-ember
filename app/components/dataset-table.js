import Ember from 'ember';
//import FeatureService from "npm:featureservice";// - this throws errors when we try to use it

/* NOTE:
    There's tons of discussion of whether it is appropriate for 
    a component to fetch its own data. I think this post http://discuss.emberjs.com/t/should-ember-components-load-data/4218/14
    reflects my thinking. So I'm gonna try this as a component

    There are a number of other ways we could handle the data table:
      * We could use {{render}} which basically allows us to create a controller/view that is not tied to a particular route

*/

export default Ember.Component.extend({

  // NOTE: we could extract the featureservice stuff into a Ember Service...


  //classNames: ['table-div'],

  didInsertElement() {

    var model = this.get('model');
    this.url = model.get('url');
    
    this.queryCapabilities = model.get('advancedQueryCapabilities');
    this.supportsPagination = this.queryCapabilities && this.queryCapabilities.supports_pagination;
    this.orderBy = model.get('objectIdField');

var self = this;
    this._fetchPage()
      //.then(this._handlePageResponse)
      .then(function (response) {
        var data = response.features.map(function (feat) {
          return Object.keys(feat.attributes).map(function (attr) {
            return feat.attributes[attr];
          });
        });
        self.set('data', data);
      })
      //.fail(function () { alert('boo'); })
      .finally(function () { alert('all done'); })
      .catch(function () { alert('error'); });

    // NOTE: this is not working...
    // var opts = {};
    // var featureService = new FeatureService(url, opts);
    // featureService.pages(this._pagesCallback);
  },

  // _pagesCallback: function (a, b, c, d) {
  //   debugger;
  // },

  perPage: 10,

  page: 0,

  orderBy: '',

  orderByAsc: true,

  _getQueryUrl: function () {
    var url = this.model.get('url');
    url += '/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson';

    if (this.supportsPagination) {
      url += '&resultOffset=' + this.page * this.perPage;
      url += '&resultRecordCount=' + this.perPage;
      //NOTE: when you pass in one of the above two parameters and orderByFields is left empty, 
      //map service uses the object-id field to sort the result. 
      //For a query layer with a pseudo column as the object-id field (e.g., FID), 
      //you must provide orderByFields; otherwise the query fails
    }

    var orderBy = this.orderBy;
    if (!this.orderByAsc) {
      orderBy += ' desc';
    }
    //NOTE: this still could fail 
    //if the oid field has changed since it was harvested by open data
    //or it is null (which should not happen...)
    url += '&orderByFields=' + orderBy;

    return url;
  },

  _fetchPage: function () {
    var url = this._getQueryUrl();

    return new Ember.RSVP.Promise(function(resolve, reject){
      Ember.$.ajax({
        url: url,
        dataType: 'json',
        success: function (response, status, xhr) {
          resolve(response);
        },
        error: function (xhr, status, error) {
          reject(new Error('getJSON: `' + url + '` failed with status: [' + status + ']'));
        }
      });
    });

  },

  // _handlePageResponse: function (response) {
  //   debugger;
  //   this.set('data', response.features);
  // },

  willRemoveElement() {
    
  }

});
