import Ember from 'ember';

export default Ember.Controller.extend({

  q: '',

  actions: {
    search: function() {
      this.transitionToRoute('datasets', { queryParams: { q: this.get('q') } });
    }
  }

});
