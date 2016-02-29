import Ember from 'ember';

export default Ember.Route.extend({

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
    queryParamsDidChange: function(/*params*/) {
      // NOTE: this should not be necessary because we are using refreshModel above
      // but it wasn't working even tho i know it can work: http://emberjs.jsbin.com/sazixodoxe#/datasets?page=
      this.refresh();
    },
    gotoDataset: function (dataset) {
      this.controllerFor('datasets').transitionToRoute('dataset', dataset);
    }
  },

  model: function (params, transition) {
    // NOTE: I think this is a bug - queryParams are available on transition but params is an empty object
    let ctrl = this.controllerFor('datasets');
    let queryParams = {
      per_page: ctrl.get('perPage')
    };
    if (transition.queryParams) {
      queryParams = Ember.merge(queryParams, transition.queryParams);
    }
    return this.store.query('dataset', queryParams);
  },

  // Here, we're passing metadata to the controller
  // This method will be executed each time the model is reloaded.
  setupController: function(controller, model) {
    this._super(controller, model); // Do not forget this call

    // NOTE: i don't know why we can't just call controller.___
    let ctrl = this.controllerFor('datasets');
    ctrl.set('totalCount', model.meta.stats.total_count);
    ctrl.set('count', model.meta.stats.count);
  }

});
