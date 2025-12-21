import { Fragment, useMemo, useState, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

const Table = ({ gifts, selectedYear }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [baseHeight, setBaseHeight] = useState(null);
  const [hoveredName, setHoveredName] = useState(null);
  const containerRef = useRef(null);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasFilter = normalizedQuery.length > 0;

  const { groupedGifts, maxTotal } = useMemo(() => {
    if (!gifts.length) {
      return { groupedGifts: [], maxTotal: 0 };
    }

    const filteredGifts = normalizedQuery
      ? gifts.filter((gift) =>
          [gift.name, gift.gift]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedQuery)),
        )
      : gifts;

    if (!filteredGifts.length) {
      return { groupedGifts: [], maxTotal: 0 };
    }

    const groupedMap = filteredGifts.reduce((acc, gift) => {
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
  }, [gifts, normalizedQuery]);

  const hasGifts = groupedGifts.length > 0;
  const emptyMessage = hasFilter
    ? 'Žádné výsledky pro zadané hledání.'
    : 'Pro vybraný rok zatím nejsou žádné záznamy.';

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || hasFilter) {
      return;
    }

    if (!containerRef.current) {
      return;
    }

    const height = containerRef.current.scrollHeight;
    setBaseHeight(height);
  }, [groupedGifts, hasFilter]);

  return (
    <div>
      <h2 className='subtitle'>Seznam dárků {selectedYear}</h2>
      <div className="table-toolbar">
        <label className="table-search">
          <span>Filtrování</span>
          <input
            type="text"
            placeholder="Hledat podle jména nebo dárku"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
      </div>
      <div
        className="table-container"
        ref={containerRef}
        style={baseHeight ? { minHeight: `${baseHeight}px` } : undefined}
      >
        {hasGifts ? (
          <div className="table-scroll">
            <table className='table'>
              <thead>
                <tr>
                  <th className="table-col-name">Pro koho</th>
                  <th className="table-col-gift">Co</th>
                  <th className="table-col-price">Za kolik</th>
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
                        <tr
                          key={gift.id}
                          className={`table-row${index === 0 ? ' table-row--group-start' : ''}`}
                          onMouseEnter={() => setHoveredName(name)}
                          onMouseLeave={() => setHoveredName(null)}
                        >
                          {index === 0 && (
                            <td
                              className={`table-name${hoveredName === name ? ' table-name--hovered' : ''}`}
                              rowSpan={items.length}
                            >
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
                          <td className="table-gift">{gift.gift}</td>
                          <td className="table-price">
                            <span className="table-price__value">{formatCurrency(gift.price)}</span>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='table-empty'>{emptyMessage}</p>
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
