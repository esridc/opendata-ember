import Ember from 'ember';
//import FeatureService from "npm:featureservice";// - this throws errors when we try to use it

/* NOTE:
    There's tons of discussion of whether it is appropriate for 
    a component to fetch its own data. I think this post http://discuss.emberjs.com/t/should-ember-components-load-data/4218/14
    reflects my thinking. So I'm gonna try this as a component

    There are a number of other ways we could handle the data table:
      * We could use {{render}} which basically allows us to create a controller/view that is not tied to a particular route

*/

export default Ember.Component.extend({

  // NOTE: we could extract the featureservice stuff into a Ember Service...


  //classNames: ['table-div'],

  didInsertElement() {

    var model = this.get('model');
    var url = model.get('url');
    var opts = {};
    var featureService = new FeatureService(url, opts);
    featureService.pages(this._pagesCallback);
  },

  _pagesCallback: function (a, b, c, d) {
    debugger;
  },

  willRemoveElement() {
    
  }

});
