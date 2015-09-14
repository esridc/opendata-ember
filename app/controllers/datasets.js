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
  q: null,
  perPage: 20,

  // These properties will be set by the parent route
  totalCount: null,
  count: null,

  // The following properties will be used for the display of the pagination links
  totalPages: function() {
    return Math.ceil(this.get('totalCount') / this.get('perPage'));
  }.property('totalCount'),

  prevPage: function() {
    return this.get('page') - 1;
  }.property('page'),

  nextPage: function() {
    return this.get('page') + 1;
  }.property('page'),

  isFirstPage: function() {
    return this.get('page') === 1;
  }.property('page'),

  isLastPage: function() {
    return this.get('page') >= this.get('totalPages');
  }.property('page', 'totalPages'),

  pageRange: function () {
    let result = Ember.A();

    let currentPage = this.get('page');
    let totalPages = this.get('totalPages');

    let start = (totalPages > 10 && currentPage > 6) ? currentPage - 5 : 1;
    let end = (totalPages > start + 9) ? start + 9 : totalPages;

    for(let i = start; i <= end; i++) {
      result.push({ page: i, className: (i === currentPage) ? 'active' : '' });
    }

    return result;
  }.property('totalPages', 'page')

});
