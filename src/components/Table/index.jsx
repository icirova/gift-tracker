import React from 'react';
import PropTypes from 'prop-types';
import './style.css';

const Table = ({ gifts, onSummaryUpdate }) => {
  // Počet dárků
  const totalItems = gifts.length;
  // Součet ceny dárků
  const totalPrice = gifts.reduce((sum, gift) => sum + gift.price, 0);

  // Předání souhrnné hodnoty do rodičovské komponenty (Summary)
  React.useEffect(() => {
    onSummaryUpdate(totalItems, totalPrice);
  }, [gifts, onSummaryUpdate]); // pouze závislost na gifts a onSummaryUpdate

  return (
    <div>
      <h2 className='subtitle'>Seznam dárků</h2>
      <div className="table-container">
      <table className='table'>
        <thead>
          <tr>
            <th>Pro koho</th>
            <th>Co</th>
            <th>Za kolik</th>
          </tr>
        </thead>
        <tbody>
          {gifts.map((gift, index) => (
            <tr key={index}>
              <td>{gift.name}</td>
              <td>{gift.gift}</td>
              <td>{gift.price} Kč</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      </div>
     
  );
};

// Validace props pomocí PropTypes
Table.propTypes = {
  gifts: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      gift: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
  onSummaryUpdate: PropTypes.func.isRequired,
};

export default Table;
