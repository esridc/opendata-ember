import DS from 'ember-data';

export default DS.ActiveModelAdapter.extend({
  // TODO: get this from config
  host: 'http://opendatadev.arcgis.com'
});
