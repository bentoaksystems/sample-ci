const Rx = require('rx');

module.exports = class BaseRepository {

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
    return this.version++;
  }

  pubChanges() {
    this.observable.onNext();
  }

  rollback(id, list, pre) {
    const index = list.findIndex(x => x.id === id);
    if (index > -1) {
      list.splice(index, 1);
      list.push(pre);
    }
  }








}