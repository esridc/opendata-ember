import { moduleForModel, test } from 'ember-qunit';

moduleForModel('dataset', 'Unit | Model | dataset', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
});
