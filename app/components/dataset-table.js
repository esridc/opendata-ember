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
    
  }

});
