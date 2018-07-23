const Sequelize = require('sequelize');

let Page;
const init = (seq) => {

  Page = seq.define('page', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    name: {
      type: Sequelize.STRING,
      unique: true
    },
    url: {
      type: Sequelize.STRING,
      unique: true
    }
  }, {
      tableName: 'page',
      timestamps: false,
      underscored: true
    });
}


module.exports = {
  init,
  model: () => Page
};

