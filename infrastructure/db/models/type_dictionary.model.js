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
    },
    type: {
      type: Sequelize.STRING,
    }
  }, {
    tableName: 'type_dictionary',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['name', 'type']
      }
    ]
  });
}

module.exports = {
  init,
  model: () => TypeDictionary,
};
