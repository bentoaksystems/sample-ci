const Sequelize = require('sequelize');
let Role;

const init = (seq) => {

  Role = seq.define('role', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    name: {
      type: Sequelize.STRING,
      unique: true
    }
  },{
    tableName: 'role',
    timestamps: false,
    underscored: true,
  });
}


module.exports =  {
  init,
  model: () => Role
};
