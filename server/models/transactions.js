"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      transaction.belongsTo(models.User, {
        as: "user",
        foreignKey: {
          name: "userId",
        },
      });
      transaction.belongsToMany(models.Product, {
        through: {
          model: "Orders",
        },
        foreignKey: {
          name: "transactionId",
        },
      });
    }
  }
  transaction.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      attachment: DataTypes.STRING,
      postCode: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "transaction",
      tableName: "transactions",
    }
  );
  return transaction;
};
