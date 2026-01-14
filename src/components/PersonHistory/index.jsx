import { Fragment, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

const PersonHistory = ({ gifts, allowedNames }) => {
  const [selectedName, setSelectedName] = useState(allowedNames[0] ?? '');

  const groupedHistory = useMemo(() => {
    const filtered = gifts.filter(
      (gift) => gift.name === selectedName && gift.status === 'bought',
    );
    if (!filtered.length) {
      return [];
    }

    const groupedMap = filtered.reduce((acc, gift) => {
      if (!acc[gift.year]) {
        acc[gift.year] = { year: gift.year, items: [] };
      }
      acc[gift.year].items.push(gift);
      return acc;
    }, {});

    return Object.values(groupedMap)
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) =>
          a.gift.localeCompare(b.gift, 'cs', { sensitivity: 'base' }),
        ),
      }))
      .sort((a, b) => b.year - a.year);
  }, [gifts, selectedName]);

  return (
    <div className="person-history">
      <div className="person-history__toolbar">
        <label className="person-history__filter">
          <span>Osoba</span>
          <select value={selectedName} onChange={(event) => setSelectedName(event.target.value)}>
            {allowedNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {groupedHistory.length ? (
        <div className="person-history__table">
          <div className="person-history__scroll">
            <table>
              <thead>
                <tr>
                  <th>Rok</th>
                  <th>Dárek</th>
                  <th>Cena</th>
                </tr>
              </thead>
              <tbody>
                {groupedHistory.map(({ year, items }) => (
                  <Fragment key={year}>
                    {items.map((gift, index) => (
                      <tr
                        key={gift.id}
                        className={index === 0 ? 'person-history__row-group-start' : ''}
                      >
                        {index === 0 && (
                          <td className="person-history__year" rowSpan={items.length}>
                            {year}
                          </td>
                        )}
                        <td>{gift.gift}</td>
                        <td className="person-history__price">
                          {gift.price === null ? '—' : formatCurrency(gift.price)}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="person-history__empty">Pro vybranou osobu zatím nejsou žádné dárky.</p>
      )}
    </div>
  );
};

PersonHistory.propTypes = {
  gifts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      year: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      gift: PropTypes.string.isRequired,
      price: PropTypes.number,
      status: PropTypes.oneOf(['bought', 'idea']).isRequired,
    }),
  ).isRequired,
  allowedNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default PersonHistory;
