import { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

const Table = ({ gifts, selectedYear, onDeleteGift }) => {
  const { groupedGifts, maxTotal } = useMemo(() => {
    if (!gifts.length) {
      return { groupedGifts: [], maxTotal: 0 };
    }

    const groupedMap = gifts.reduce((acc, gift) => {
      if (!acc[gift.name]) {
        acc[gift.name] = { name: gift.name, items: [], total: 0 };
      }
      acc[gift.name].items.push(gift);
      acc[gift.name].total += gift.price;
      return acc;
    }, {});

    const groupedList = Object.values(groupedMap).sort((a, b) =>
      a.name.localeCompare(b.name, 'cs', { sensitivity: 'base' }),
    );

    const max = groupedList.reduce((maxValue, group) => Math.max(maxValue, group.total), 0);

    return { groupedGifts: groupedList, maxTotal: max };
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
              {groupedGifts.map(({ name, items, total }) => {
                const fillPercent = maxTotal
                  ? Math.max((total / maxTotal) * 100, 8)
                  : 0;

                return (
                  <Fragment key={name}>
                    {items.map((gift, index) => (
                      <tr key={gift.id}>
                        {index === 0 && (
                          <td className="table-name" rowSpan={items.length}>
                            <div className="table-name__label">{name}</div>
                            <div className="table-mini">
                              <span className="table-mini__value">{formatCurrency(total)}</span>
                              <div className="table-mini__bar" aria-hidden="true">
                                <span
                                  className="table-mini__fill"
                                  style={{ width: `${Math.min(fillPercent, 100)}%` }}
                                />
                              </div>
                            </div>
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
                );
              })}
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
