import Ember from 'ember';

/* NOTE:
    There's tons of discussion of whether it is appropriate for 
    a component to fetch its own data. I think this post http://discuss.emberjs.com/t/should-ember-components-load-data/4218/14
    reflects my thinking. So I'm gonna try this as a component

    There are a number of other ways we could handle the data table:
      * We could use {{render}} which basically allows us to create a controller/view that is not tied to a particular route

*/

export default Ember.Component.extend({

  featureService: Ember.inject.service('feature-service'),

  didInsertElement() {

    var model = this.get('model');
    this.set('orderBy', model.get('objectIdField'));

    this.get('featureService')
      .fetchPage(model, this._getPageParams())
        .then(this._handlePageResponse.bind(this))
        .finally(function () { alert('all done'); })
        .catch(function () { alert('error'); });
  },

  perPage: 10,

  page: 0,

  orderBy: '',

  orderByAsc: true,

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
      return Object.keys(feat.attributes).map(function (attr) {
        return feat.attributes[attr];
      });
    });
    this.set('data', data);
  },

  willRemoveElement() {
    
  },

  _calculatePaging: function () {
    //defaults - this is what will be rendered if the dataset does not support pagination
    
    var obj = {
      isFirstPage: true,
      prevPage: 0,
      pageRange: [
        { className: '', page: 1 }, 
        { className: '', page: 2 }
      ],
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
