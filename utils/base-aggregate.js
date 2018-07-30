const Rx = require('rx');
const errors = require('./errors.list');
module.exports = class BaseAggregate {

  constructor(refList) {
    this.version = 0;
    if (refList && refList.length) {
      this.observable = new Rx.Subject();
      refList.forEach(ref => {
        ref.observable.subscribe(() => {
          this.version++;
        })
      });
    }
  }

  getVersion() {
    return this.version
  }

  updateVersion() {
  }

  pubChanges() {
    this.observable.onNext();
  }

  checkVersion(oldVersion) {
    this.version++;
    const expectedVersion = oldVersion + 1;
    if (expectedVersion !== this.version)
      throw new Error(errors.aggregateVersionChnaged)
  }

  rollback(id, list, pre) {
    const index = list.findIndex(x => x.id === id);
    if (index > -1) {
      list.splice(index, 1);
      list.push(pre);
    }
  }








}