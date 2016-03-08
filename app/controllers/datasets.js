import Ember from 'ember';

export default Ember.Controller.extend({

  // Here, we're telling the controller that the property `page`
  // should be "bound" to the query parameter the same name.
  // We could map the parameter to a different property name if we wanted.
  queryParams: [
    'page',
    'q'
  ],

  // defaults
  page: 1,
  q: '',

  // These properties will be set by the parent route
  totalCount: Ember.computed('model.meta.stats.totalCount', function(){
    return this.get('model.meta.stats.totalCount');
  }),

  // The following properties will be used for the display of the pagination links
  totalPages: Ember.computed('totalCount', function() {
    let totalPages = Math.ceil(this.get('totalCount') / this.get('model.meta.queryParameters.page.size'));
    return totalPages;
  }),
  prevPage: Ember.computed('model.meta.queryParameters.page.number', function() {
    return this.get('model.meta.queryParameters.page.number') - 1;
  }),

  nextPage: Ember.computed('model.meta.queryParameters.page.number', function() {
    return this.get('model.meta.queryParameters.page.number') + 1;
  }),

  isFirstPage: Ember.computed.equal('model.meta.queryParameters.page.number', 1),

  isLastPage: Ember.computed('model.meta.queryParameters.page.number', 'totalPages', function() {
    return this.get('model.meta.queryParameters.page.number') >= this.get('totalPages');
  }),

  pageRange: Ember.computed('model.meta.queryParameters.page.number', 'totalPages', function () {
    let result = Ember.A();

    let currentPage = this.get('model.meta.queryParameters.page.number');
    let totalPages = this.get('totalPages');

    let start = (totalPages > 10 && currentPage > 6) ? currentPage - 5 : 1;
    let end = (totalPages > start + 9) ? start + 9 : totalPages;

    for(let i = start; i <= end; i++) {
      result.push({ page: i, className: (i === currentPage) ? 'active' : '' });
    }

    return result;
  })

});
