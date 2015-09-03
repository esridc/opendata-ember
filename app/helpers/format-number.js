import Ember from 'ember';

export function formatNumber(params/*, hash*/) {
  return params.toLocaleString();
}

export default Ember.Helper.helper(formatNumber);
