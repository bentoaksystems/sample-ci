module.exports = class BaseAggregate {

  constructor(refList) {
  }

  rollback(id, list, pre) {
    const index = list.findIndex(x => x.id === id);
    if (index > -1) {
      list.splice(index, 1);
      list.push(pre);
    }
  }








}