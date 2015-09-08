import Ember from 'ember';

/* NOTE:
    There's tons of discussion of whether it is appropriate for 
    a component to fetch its own data. I think this post http://discuss.emberjs.com/t/should-ember-components-load-data/4218/14
    reflects my thinking. So I'm gonna try this as a component

    There are a number of other ways we could handle the data table:
      * We could use {{render}} which basically allows us to create a controller/view that is not tied to a particular route

*/

export default Ember.Component.extend({

  actions: {
    setPage(page) { this.setPage(page); },
    setSort(sort) { this.setSort(sort); }
  },

  featureService: Ember.inject.service('feature-service'),

  didInsertElement() {

    //deprecation warning with this...
    //so we set it from the outside
    //this.set('orderBy', this.get('model.objectIdField'));

    this.fetchPage();
  },

  fetchPage: function () {
    var model = this.get('model');
    this.get('featureService')
      .fetchPage(model, this._getPageParams())
        .then(this._handlePageResponse.bind(this))
        //.finally(function () { alert('all done'); })
        .catch(function () { alert('error'); });
  },

  setPage: function (page) {
    this.set('page', page);
    this.fetchPage();
  },

  setSort: function (orderBy) {
    var obj = {
      page: 1,
      orderBy: orderBy,
      orderByAsc: (orderBy === this.orderBy) ? !this.orderByAsc : true
    };
    
    this.setProperties(obj);

    this.fetchPage();
  },

  perPage: 10,

  page: 1,

  orderBy: '',

  orderByAsc: true,

  sortIconClass: function () {
    var result = 'glyphicon-chevron-';
    result += this.orderByAsc ? 'up' : 'down';
    return result;
  }.property('orderByAsc'),

  _getPageParams: function () {
    // var orderBy = this.get('orderBy');
    // if (!orderBy) {
    //   orderBy = this.get('model.objectIdField');
    // }

    return {
      perPage: this.get('perPage'),
      page: this.get('page'),
      orderBy: this.get('orderBy'),
      orderByAsc: this.get('orderByAsc')
    };
  },

  _handlePageResponse: function (response) {
    var perPage = this.get('perPage');
    var features = response.features.slice(0, perPage);
    var data = features.map(function (feat) {
      //return Object.keys(feat.attributes).map(function (attr) {
        return feat.attributes;
      //});
    });
    this.set('data', data);

    this._calculatePaging();
  },

  willRemoveElement() {
    
  },

  _calculatePaging: function () {
    //defaults - this is what will be rendered if the dataset does not support pagination
    var model = this.get('model');
    var recordCount = model.get('recordCount');
    var supportsPagination = Ember.get(model, 'advancedQueryCapabilities.supports_pagination');

    var obj = {
      from: (this.page - 1) * this.perPage + 1,
      to: (this.page - 1) * this.perPage + this.perPage,
      totalCount: recordCount, 
      supportsPagination: supportsPagination
    };

    if (supportsPagination) {
      obj.isFirstPage = this.page === 1;
      obj.prevPage = this.page - 1;
      obj.isLastPage = (this.page - 1) * this.perPage + this.data.length >= recordCount;
      obj.nextPage = this.page + 1;

      var totalPages = Math.ceil(recordCount / this.perPage);
      // don't show more than 10 pages in paginator?
      var start = (totalPages > 10 && this.page > 6) ? this.page - 5 : 1;
      var end = (totalPages > start + 9) ? start + 9 : totalPages;

      var className, pageRange = [];
      for (var i = start; i <= end; i++) {
        className = (i === this.page) ? 'active' : '';
        pageRange.push({ page: i, className: className });
      }
      obj.pageRange = pageRange;
    }
    
    this.setProperties(obj);
  }

});
