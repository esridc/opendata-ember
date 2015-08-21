import DS from 'ember-data';

export default DS.Model.extend({

  displayField: DS.attr('string'),
  maxRecordCount: DS.attr('number'),
  recordCount: DS.attr('number'),
  geometryType: DS.attr('string'),
  objectIdField: DS.attr('string'),
  supportedExtensions: DS.attr('string'),
  advancedQueryCapabilities: DS.attr('string'),
  supportsAdvancedQueries: DS.attr('boolean'),
  landingPage: DS.attr('string'),
  description: DS.attr('string'),
  extent: DS.attr(),//{}
  fields: DS.attr(),//[]
  itemName: DS.attr('string'),
  type: DS.attr('string'),
  itemType: DS.attr('string'),
  license: DS.attr('string'),
  mainGroupDescription: DS.attr('string'),
  main_GroupThumbnailUrl: DS.attr('string'),
  mainGroupTitle: DS.attr('string'),
  name: DS.attr('string'),
  owner: DS.attr('string'),
  tags: DS.attr(),//[]
  thumbnailUrl: DS.attr('string'),
  sites: DS.attr(),//[]
  public: DS.attr('boolean'),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),
  url: DS.attr('string'),
  views: DS.attr('number'),
  quality: DS.attr('number'),
  coverage: DS.attr('string'),
  currentVersion: DS.attr('number'),
  commentsEnabled: DS.attr('boolean'),
  serviceSpatialReference: {},//{}
  metadataUrl: DS.attr('string'),
  orgId: DS.attr('string'),
  useStandardizedQueries: DS.attr('boolean')

});
