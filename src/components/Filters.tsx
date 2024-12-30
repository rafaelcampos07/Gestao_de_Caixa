import React from 'react';

const Filters = ({ filters, setFilters }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex space-x-4">
      <input
        type="date"
        name="date"
        value={filters.date}
        onChange={handleInputChange}
        className="input"
      />
      <select
        name="payment"
        value={filters.payment}
        onChange={handleInputChange}
        className="input"
      >
        <option value="">Todos</option>
        <option value="dinheiro">Dinheiro</option>
        <option value="pix">PIX</option>
        <option value="credito">Cartão de Crédito</option>
        <option value="debito">Cartão de Débito</option>
      </select>
      <button onClick={() => setFilters({ date: '', payment: '' })} className="btn-secondary">
        <Filter size={20} />
        Limpar Filtros
      </button>
    </div>
  );
};

export default Filters;