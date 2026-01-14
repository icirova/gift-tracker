import { Fragment, useMemo, useState, useLayoutEffect, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatCurrency';
import './style.css';

const Table = ({
  gifts,
  selectedYear,
  onDeleteGift,
  highlightedGiftId,
  onUpdateGift,
  availableYears,
  onYearChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [baseHeight, setBaseHeight] = useState(null);
  const [hoveredName, setHoveredName] = useState(null);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');
  const [pendingStatusId, setPendingStatusId] = useState(null);
  const containerRef = useRef(null);
  const priceInputRef = useRef(null);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasFilter = normalizedQuery.length > 0;

  const { groupedGifts, maxTotal } = useMemo(() => {
    if (!gifts.length) {
      return { groupedGifts: [], maxTotal: 0 };
    }

    const filteredGifts = normalizedQuery
      ? gifts.filter((gift) =>
          [gift.name, gift.gift, gift.status]
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
      acc[gift.name].total += gift.price ?? 0;
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

  useEffect(() => {
    if (!editingPriceId) {
      return;
    }
    const activeGift = gifts.find((gift) => gift.id === editingPriceId);
    if (!activeGift) {
      setEditingPriceId(null);
      setEditingPriceValue('');
      return;
    }
    if (activeGift.status !== 'idea') {
      setEditingPriceId(null);
      setEditingPriceValue('');
    }
  }, [editingPriceId, gifts]);

  useEffect(() => {
    if (!pendingStatusId) {
      return;
    }
    const activeGift = gifts.find((gift) => gift.id === pendingStatusId);
    if (!activeGift || activeGift.status !== 'idea') {
      setPendingStatusId(null);
    }
  }, [pendingStatusId, gifts]);

  useLayoutEffect(() => {
    if (editingPriceId && priceInputRef.current) {
      priceInputRef.current.focus();
      priceInputRef.current.select();
    }
  }, [editingPriceId]);

  const startPriceEdit = (gift) => {
    if (gift.status !== 'idea') {
      return;
    }
    setEditingPriceId(gift.id);
    setEditingPriceValue(gift.price === null ? '' : String(gift.price));
  };

  const stopPriceEdit = () => {
    setEditingPriceId(null);
    setEditingPriceValue('');
  };

  const handlePriceCommit = (gift) => {
    const trimmed = editingPriceValue.trim();
    if (!trimmed) {
      onUpdateGift(gift.id, { price: null });
      stopPriceEdit();
      return true;
    }
    const value = Number(trimmed);
    if (!Number.isFinite(value) || value <= 0) {
      return false;
    }
    onUpdateGift(gift.id, { price: value });
    stopPriceEdit();
    return true;
  };

  const beginStatusConfirm = (gift) => {
    if (gift.status !== 'idea') {
      return;
    }
    if (!Number.isFinite(gift.price) || gift.price <= 0) {
      startPriceEdit(gift);
      return;
    }
    setPendingStatusId((prev) => (prev === gift.id ? null : gift.id));
  };

  const confirmStatusBought = (gift) => {
    onUpdateGift(gift.id, { status: 'bought' });
    setPendingStatusId(null);
    if (editingPriceId === gift.id) {
      stopPriceEdit();
    }
  };

  const cancelStatusConfirm = () => {
    setPendingStatusId(null);
  };

  return (
    <div id="gift-table">
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
        <label className="table-year">
          <span>Rok</span>
          <select
            value={selectedYear}
            onChange={(event) => onYearChange(Number(event.target.value))}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
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
                  <th className="table-col-name">Jméno</th>
                  <th className="table-col-gift">Dárek</th>
                  <th className="table-col-price">Cena</th>
                  <th className="table-col-status">Stav</th>
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
                          className={`table-row${index === 0 ? ' table-row--group-start' : ''}${
                            gift.id === highlightedGiftId ? ' table-row--highlight' : ''
                          }`}
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
                            <div className="table-price__cell">
                              {gift.status === 'idea' && editingPriceId === gift.id ? (
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className="table-price__input"
                                  value={editingPriceValue}
                                  onChange={(event) => setEditingPriceValue(event.target.value)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                      event.preventDefault();
                                      handlePriceCommit(gift);
                                    }
                                    if (event.key === 'Escape') {
                                      event.preventDefault();
                                      stopPriceEdit();
                                    }
                                  }}
                                  onBlur={() => {
                                    handlePriceCommit(gift);
                                  }}
                                  placeholder="Např. 1200"
                                  ref={priceInputRef}
                                />
                              ) : gift.status === 'idea' ? (
                                <div className="table-price__edit-group">
                                  {gift.price === null ? (
                                    <button
                                      type="button"
                                      className="table-price__clickable table-price__value table-price__value--empty"
                                      onClick={() => startPriceEdit(gift)}
                                      aria-label={`Doplnit cenu pro dárek ${gift.gift}`}
                                    >
                                      —
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="table-price__clickable table-price__value"
                                      onClick={() => startPriceEdit(gift)}
                                      aria-label={`Upravit cenu pro dárek ${gift.gift}`}
                                    >
                                      {formatCurrency(gift.price)}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="table-price__edit"
                                    onClick={() => startPriceEdit(gift)}
                                    aria-label={
                                      gift.price === null
                                        ? `Doplnit cenu pro dárek ${gift.gift}`
                                        : `Upravit cenu pro dárek ${gift.gift}`
                                    }
                                  >
                                    <span className="table-price__icon" aria-hidden="true">
                                      <svg viewBox="0 0 24 24" role="presentation">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.81-8.81.92.92-8.81 8.81zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.69 1.69 3.75 3.75 1.69-1.7z" />
                                      </svg>
                                    </span>
                                  </button>
                                </div>
                              ) : (
                                <span className="table-price__value">
                                  {formatCurrency(gift.price)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="table-status">
                            <div className="table-status__control">
                              {gift.status === 'idea' ? (
                                pendingStatusId === gift.id ? (
                                  <div className="table-status__confirm">
                                    <span className="table-status__confirm-text">
                                      Koupeno? (zamkne úpravy)
                                    </span>
                                    <button
                                      type="button"
                                      className="table-status__confirm-button"
                                      onClick={() => confirmStatusBought(gift)}
                                      aria-label={`Potvrdit koupeno pro ${gift.gift}`}
                                    >
                                      Ano
                                    </button>
                                    <button
                                      type="button"
                                      className="table-status__confirm-button"
                                      onClick={cancelStatusConfirm}
                                      aria-label={`Zrušit změnu stavu pro ${gift.gift}`}
                                    >
                                      Ne
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    className={`table-status__badge table-status__badge--idea table-status__toggle`}
                                    onClick={() => beginStatusConfirm(gift)}
                                    aria-label={`Přepnout na koupeno: ${gift.gift}`}
                                  >
                                    Nápad
                                  </button>
                                )
                              ) : (
                                <span
                                  className={`table-status__badge table-status__badge--${gift.status}`}
                                >
                                  Koupeno
                                </span>
                              )}
                              <button
                                type="button"
                                className="table-delete"
                                aria-label={`Smazat dárek ${gift.gift} pro ${gift.name}`}
                                onClick={() => onDeleteGift(gift.id)}
                              >
                                &times;
                              </button>
                            </div>
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
      price: PropTypes.number,
      status: PropTypes.oneOf(['bought', 'idea']).isRequired,
    })
  ).isRequired,
  selectedYear: PropTypes.number.isRequired,
  onDeleteGift: PropTypes.func.isRequired,
  highlightedGiftId: PropTypes.string,
  onUpdateGift: PropTypes.func.isRequired,
  availableYears: PropTypes.arrayOf(PropTypes.number).isRequired,
  onYearChange: PropTypes.func.isRequired,
};

export default Table;
