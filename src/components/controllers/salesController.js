// controllers/salesController.js

const Produto = require('../models/Produto');
const Venda = require('../models/Venda');

const createSale = async (req, res) => {
  try {
    const { items } = req.body;

    for (const item of items) {
      const product = await Produto.findByPk(item.produto_id);
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      if (product.estoque < item.quantidade) {
        return res.status(400).json({ message: `Estoque insuficiente para o produto ${product.nome}` });
      }
    }

    for (const item of items) {
      await Produto.update(
        { estoque: sequelize.literal(`estoque - ${item.quantidade}`) },
        { where: { id: item.produto_id } }
      );
    }

    const sale = await Venda.create(req.body);
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Venda.findByPk(id);

    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    const items = sale.items;

    for (const item of items) {
      await Produto.update(
        { estoque: sequelize.literal(`estoque + ${item.quantidade}`) },
        { where: { id: item.produto_id } }
      );
    }

    await Venda.destroy({ where: { id } });

    res.status(200).json({ message: 'Venda cancelada e estoque revertido' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSale,
  cancelSale,
};