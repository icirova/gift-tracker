import { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

const Table = ({ gifts, selectedYear, onDeleteGift }) => {
  const groupedGifts = useMemo(() => {
    if (!gifts.length) {
      return [];
    }

    const groups = gifts.reduce((acc, gift) => {
      acc[gift.name] = acc[gift.name] ?? [];
      acc[gift.name].push(gift);
      return acc;
    }, {});

    return Object.keys(groups)
      .sort((a, b) => a.localeCompare(b, 'cs', { sensitivity: 'base' }))
      .map((name) => ({ name, items: groups[name] }));
  }, [gifts]);

  const hasGifts = groupedGifts.length > 0;

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
                <th aria-label="Akce" />
              </tr>
            </thead>
            <tbody>
              {groupedGifts.map(({ name, items }) => (
                <Fragment key={name}>
                  {items.map((gift, index) => (
                    <tr key={gift.id}>
                      {index === 0 && (
                        <td className="table-name" rowSpan={items.length}>
                          {name}
                        </td>
                      )}
                      <td>{gift.gift}</td>
                      <td>{formatCurrency(gift.price)}</td>
                      <td className="table-action">
                        <button
                          type="button"
                          className="table-delete"
                          aria-label={`Smazat dárek ${gift.gift} pro ${gift.name}`}
                          onClick={() => onDeleteGift(gift.id)}
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
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
  onDeleteGift: PropTypes.func.isRequired,
};

export default Table;
