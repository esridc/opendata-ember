import Ember from 'ember';

export default Ember.Controller.extend({

  q: '',

  bodyClass: null,

  currentPathDidChange: function() {
    let path = this.get('currentPath');
    let parts = path.split('.');
    // var className = path.replace(/\./g, '-');
    // if (className !== parts[0]) {
    //   className += ' ' + parts[0];
    // }
    let className = 'page-' + parts[0];
    this.set('bodyClass', className);
  }.observes('currentPath'),

  actions: {
    search: function() {
      this.transitionToRoute('datasets', { queryParams: { q: this.get('q'), page: 1 } });
    }
  }

});
