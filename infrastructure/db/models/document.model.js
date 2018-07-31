const Sequelize = require('sequelize');

let Document;
const init = (seq) => {
  Document = seq.define('document', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    file_path: {
      type: Sequelize.STRING,
      unique: true,
    },
    uploaded_at: {
      type: Sequelize.DATE,
      defaultValue: new Date(),
    },
    context: {
      type: Sequelize.STRING,
      allowNull: false,
    }
  }, {
    tableName: 'document',
    timestamps: false,
    underscored: true,
  });
}

module.exports = {
  init,
  model: () => Document,
};
