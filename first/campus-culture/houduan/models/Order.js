const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  orderNo: {
    type: DataTypes.STRING,
    unique: true
  },
  modelId: DataTypes.BIGINT,
  modelType: DataTypes.STRING,
  printParam: DataTypes.JSON,
  userName: DataTypes.STRING,
  phone: DataTypes.STRING,
  price: DataTypes.FLOAT,
  orderStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  }
}, {
  tableName: 'orders',
  timestamps: true
});

module.exports = Order;