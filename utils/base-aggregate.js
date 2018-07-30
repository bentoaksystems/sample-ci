const Rx = require('rx');
const errors = require('./errors.list');
module.exports = class BaseAggregate {

  constructor(refList) {
    this.version = 0;
    this.observable = new Rx.Subject();
    if (refList && refList.length) {
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


  checkVersion(oldVersion, list) {
    this.version++;

    const expectedVersion = oldVersion + 1;
    if (expectedVersion !== this.version)
      throw new Error(errors.aggregateVersionChanged)

    this.commit(list)
    if (this.refList && this.refList.length)
      this.observable.onNext();

  }

  commit(list) {
    const index = list.findIndex(x => x.id === this.id);
    if (index > -1) {
      list.splice(index, 1);
      list.push(this);
    }

  }








}