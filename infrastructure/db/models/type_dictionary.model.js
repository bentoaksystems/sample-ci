const Sequelize = require('sequelize');

let TypeDictionary;
const init = (seq) => {
  TypeDictionary = seq.define('type_dictionary', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    name: {
      type: Sequelize.STRING,
      unique: 'notDuplicatedTypeIndex',
    },
    type: {
      type: Sequelize.STRING,
      unique: 'notDuplicatedTypeIndex'
    }
  }, {
    tableName: 'type_dictionary',
    timestamps: false,
    underscored: true,
  });
}

module.exports = {
  init,
  model: () => TypeDictionary,
};
