const Sequelize = require('sequelize');

let FormField;

const init = (seq) => {
  FormField = seq.define('form_field', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    hashKey: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      // unique: true,
    },
    answerShowType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    answerSource: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    staticAnswerArray: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    answerTable: {
      type: Sequelize.STRING,
    },
    answerWhereClause: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    fieldPriority: {
      type: Sequelize.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: 'form_field',
    timestamps: false,
    underscored: true,
  })

}

module.exports = {
  init,
  model: () => FormField,
}