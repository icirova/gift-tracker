import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

const Table = ({ gifts, selectedYear }) => {
  const hasGifts = gifts.length > 0;

  return (
    <div>
      <h2 className='subtitle'>Seznam dárků {selectedYear}</h2>
      <div className="table-container">
        {hasGifts ? (
          <table className='table'>
            <thead>
              <tr>
                <th>Pro koho</th>
                <th>Co</th>
                <th>Za kolik</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map((gift) => (
                <tr key={gift.id}>
                  <td>{gift.name}</td>
                  <td>{gift.gift}</td>
                  <td>{formatCurrency(gift.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className='table-empty'>Pro vybraný rok zatím nejsou žádné záznamy.</p>
        )}
      </div>
    </div>
  );
};

Table.propTypes = {
  gifts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      year: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      gift: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
  selectedYear: PropTypes.number.isRequired,
};

export default Table;
