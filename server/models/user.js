"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Roll, {
        as: "rolls",
        foreignKey: {
          name: "listId",
        },
      });
      User.hasMany(models.transaction, {
        as: "transaksi",
        foreignKey: {
          name: "userId",
        },
      });
    }
  }
  User.init(
    {
      fullname: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      profile: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    }
  );
  return User;
};
