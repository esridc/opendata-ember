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
      return feat.attributes;
    });
    this.set('data', data);
  },

  willRemoveElement() {
    
  },

  totalCount: function () {
    return this.get('model.recordCount');
  }.property('model'),

  supportsPagination: function () {
    return this.get('model.advancedQueryCapabilities.supports_pagination');
  }.property('model'),

  from: function () {
    return (this.get('page') - 1) * this.get('perPage') + 1;
    //this really depends on perPage and page but we don't want it to change until we get data
  }.property('data.[]'),

  to: function () {
    var data = this.get('data');
    var perPage = this.get('perPage');
    var result = perPage; 
    if (data) {
      result = (this.get('page') - 1) * perPage + this.get('data').length;
    }
    return result;
    //this really depends on perPage and page too but we don't want it to change until we get data
  }.property('data.[]'),

  isFirstPage: function () {
    return this.get('page') === 1;
  }.property('page'),

  prevPage: function () {
    return this.get('page') - 1;
  }.property('page'),

  isLastPage: function () {
    return this.get('page') === this.get('totalPages');
  }.property('page', 'totalPages'),

  nextPage: function () {
    return this.get('page') + 1;
  }.property('page'),

  totalPages: function () {
    return Math.ceil(this.get('totalCount') / this.get('perPage'));
  }.property('totalCount', 'perPage'),

  pageRange: function () {
    var totalPages = this.get('totalPages');
    var page = this.get('page');
    var start = (totalPages > 10 && page > 6) ? page - 5 : 1;
    var end = (totalPages > start + 9) ? start + 9 : totalPages;

    var className, pageRange = [];
    for (var i = start; i <= end; i++) {
      className = (i === page) ? 'active' : '';
      pageRange.push({ page: i, className: className });
    }
    return pageRange;
  }.property('totalPages', 'page')

});
