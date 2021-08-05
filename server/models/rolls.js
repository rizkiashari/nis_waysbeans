"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Roll extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Roll.hasOne(models.User, {
        as: "user",
        foreignKey: {
          name: "listId",
        },
      });
    }
  }
  Roll.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Roll",
      tableName: "rolls",
    }
  );
  return Roll;
};
