import React from 'react';

const Pagination = ({ vendasPerPage, totalVendas, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalVendas / vendasPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination flex justify-center">
        {pageNumbers.map(number => (
          <li key={number} className="page-item mx-1">
            <button onClick={() => paginate(number)} className="page-link px-3 py-1 border rounded">
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;