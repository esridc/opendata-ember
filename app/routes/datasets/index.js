import Ember from 'ember';

export default Ember.Route.extend({
  
  queryParams: {
    page: {
      refreshModel: true
    },
    q: {
      refreshModel: true
    }
  },

  model: function (params, transition) {
    // NOTE: I think this is a bug - queryParams are available on transition but params is an empty object
    console.debug('>>>>> hit model hook');
    return this.store.findQuery('dataset', transition.queryParams);
  },

  // Here, we're passing metadata to the controller
  // This method will be executed each time the model is reloaded.
  setupController: function(controller, model) {
    this._super(controller, model); // Do not forget this call
    
    // NOTE: i don't know why we can't just call controller.___
    var ctrl = this.controllerFor('datasets');
    ctrl.set('totalCount', model.meta.stats.total_count);
    ctrl.set('count', model.meta.stats.count);
  }

});
