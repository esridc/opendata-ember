import DS from 'ember-data';

export default DS.Model.extend({

  advancedQueryCapabilities: DS.attr('string'),
  commentsEnabled: DS.attr('boolean'),
  content: DS.attr(),
  coverage: DS.attr('string'),
  createdAt: DS.attr('date'),
  currentVersion: DS.attr('number'),
  description: DS.attr('string'),
  displayField: DS.attr('string'),
  extent: DS.attr(),//{}
  fields: DS.attr(),//[]
  geometryType: DS.attr('string'),
  itemName: DS.attr('string'),
  itemType: DS.attr('string'),
  landingPage: DS.attr('string'),
  licenseInfo: DS.attr('string'),
  mainGroupThumbnailUrl: DS.attr('string'),
  mainGroupDescription: DS.attr('string'),
  mainGroupTitle: DS.attr('string'),
  maxRecordCount: DS.attr('number'),
  metadata: DS.attr(),//{}
  metadataUrl: DS.attr('string'),
  name: DS.attr('string'),
  objectIdField: DS.attr('string'),
  orgId: DS.attr('string'),
  owner: DS.attr('string'),
  public: DS.attr('boolean'),
  quality: DS.attr('number'),
  recordCount: DS.attr('number'),
  serviceSpatialReference: DS.attr(),//{}
  supportedExtensions: DS.attr('string'),
  supportsAdvancedQueries: DS.attr('boolean'),
  tags: DS.attr(),//[]
  //title: DS.attr('string'),
  thumbnailUrl: DS.attr('string'),
  type: DS.attr('string'),
  updatedAt: DS.attr('date'),
  url: DS.attr('string'),
  useStandardizedQueries: DS.attr('boolean'),
  views: DS.attr('number'),
  //relatedDatasets: DS.hasMany('dataset',{ inverse: null, async:true }),
  site: DS.hasMany('site',{ inverse: null, async:true }),
  organization: DS.belongsTo('organization',{ inverse: null, async:true }),
  group: DS.hasMany('group',{ inverse: null, async:true })

});
