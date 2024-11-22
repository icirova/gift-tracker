import React from 'react';
import PropTypes from 'prop-types';

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
      <h2>Seznam dárků</h2>
      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Jméno</th>
            <th>Dárek</th>
            <th>Cena</th>
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
