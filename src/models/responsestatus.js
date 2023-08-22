'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ResponseStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ResponseStatus.init({
    psid: DataTypes.STRING,
    payload: DataTypes.STRING,
    responded: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'ResponseStatus',
  });
  
  return ResponseStatus;
};