const Sequelize = require('sequelize');

let Checklist;
const init = (seq) => {
  Checklist = seq.define('checklist', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    checklist_line_ids: {
      type: Sequelize.ARRAY(Sequelize.UUID),
    }
  }, {
      tableName: 'checklist',
      timestamps: false,
      underscored: true,
    });
};

module.exports = {
  init,
  model: () => Checklist,
};
