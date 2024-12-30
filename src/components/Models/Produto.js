const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produto = sequelize.define('Produto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: sequelize.literal('auth.uid()'),
  },
  nome: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  preco: {
    type: DataTypes.NUMERIC,
    allowNull: false,
  },
  estoque: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  created_at: {
    type: DataTypes.TIMESTAMP,
    defaultValue: sequelize.literal('now()'),
  },
  codigo: {
    type: DataTypes.TEXT,
  },
  descricao: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'produtos',
  timestamps: false,
});

module.exports = Produto;