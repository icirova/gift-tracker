import { Fragment, useMemo, useState, useLayoutEffect, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Confirm from '../Confirm';
import './style.css';

const Table = ({
  gifts,
  selectedYear,
  onDeleteGift,
  highlightedGiftId,
  onUpdateGift,
  availableYears,
  onYearChange,
  isEditable,
}) => {
  const formatPriceValue = (value) => Number(value).toLocaleString('cs-CZ');
  const [searchQuery, setSearchQuery] = useState('');
  const [baseHeight, setBaseHeight] = useState(null);
  const [hoveredName, setHoveredName] = useState(null);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pendingStatusId, setPendingStatusId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const containerRef = useRef(null);
  const priceInputRef = useRef(null);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasFilter = normalizedQuery.length > 0;

  const { groupedGifts, maxTotal } = useMemo(() => {
    if (!gifts.length) {
      return { groupedGifts: [], maxTotal: 0 };
    }

    const statusFilteredGifts =
      statusFilter === 'idea'
        ? gifts.filter((gift) => gift.status === 'idea')
        : statusFilter === 'bought'
          ? gifts.filter((gift) => gift.status === 'bought')
          : gifts;

    const filteredGifts = normalizedQuery
      ? statusFilteredGifts.filter((gift) =>
          [gift.name, gift.gift, gift.status]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedQuery)),
        )
      : statusFilteredGifts;

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
  }, [gifts, normalizedQuery, statusFilter]);

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
    if (!isEditable) {
      setEditingPriceId(null);
      setEditingPriceValue('');
      setPendingStatusId(null);
      return;
    }
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

  useEffect(() => {
    if (!pendingDeleteId) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setPendingDeleteId(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [pendingDeleteId]);

  useEffect(() => {
    if (!pendingStatusId) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setPendingStatusId(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [pendingStatusId]);

  useLayoutEffect(() => {
    if (editingPriceId && priceInputRef.current) {
      priceInputRef.current.focus();
      priceInputRef.current.select();
    }
  }, [editingPriceId]);

  const startPriceEdit = (gift) => {
    if (!isEditable) {
      return;
    }
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
    if (!isEditable) {
      return;
    }
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
    if (!isEditable) {
      return;
    }
    onUpdateGift(gift.id, { status: 'bought' });
    setPendingStatusId(null);
    setPendingDeleteId(null);
    if (editingPriceId === gift.id) {
      stopPriceEdit();
    }
  };

  const cancelStatusConfirm = () => {
    setPendingStatusId(null);
  };

  const beginDeleteConfirm = (giftId) => {
    setPendingStatusId(null);
    setPendingDeleteId((prev) => (prev === giftId ? null : giftId));
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
        <label className="table-filter">
          <span>Stav</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Vše</option>
            <option value="idea">Plánováno</option>
            <option value="bought">Koupeno</option>
          </select>
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
            <table className='table' data-testid="gift-table">
              <thead>
                <tr>
                  <th className="table-col-name">Jméno</th>
                  <th className="table-col-gift">Dárek</th>
                  <th className="table-col-price">Cena (Kč)</th>
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
                          data-testid={`gift-table-row-${gift.id}`}
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
                                <span className="table-mini__value">{formatPriceValue(total)}</span>
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
                          <td className="table-price" data-testid={`gift-table-price-${gift.id}`}>
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
                                  {isEditable ? (
                                    <>
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
                                          {formatPriceValue(gift.price)}
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <span className="table-price__value">
                                      {gift.price === null ? '—' : formatPriceValue(gift.price)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="table-price__value">
                                  {formatPriceValue(gift.price)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="table-status">
                            <div className="table-status__control">
                              {gift.status === 'idea' ? (
                                pendingStatusId === gift.id ? (
                                  <Confirm
                                    className="table-status__confirm--wrap"
                                    message="Koupeno? Zamkne úpravy."
                                    onConfirm={() => confirmStatusBought(gift)}
                                    onCancel={cancelStatusConfirm}
                                  />
                                ) : isEditable ? (
                                  <button
                                    type="button"
                                    className={`table-status__badge table-status__badge--idea table-status__toggle`}
                                    data-testid={`gift-table-status-${gift.id}`}
                                    onClick={() => beginStatusConfirm(gift)}
                                    aria-label={`Přepnout na koupeno: ${gift.gift}`}
                                  >
                                    Plánováno
                                  </button>
                                ) : (
                                  <span
                                    className="table-status__badge table-status__badge--idea"
                                    data-testid={`gift-table-status-${gift.id}`}
                                  >
                                    Plánováno
                                  </span>
                                )
                              ) : (
                                <span
                                  className={`table-status__badge table-status__badge--${gift.status}`}
                                  data-testid={`gift-table-status-${gift.id}`}
                                >
                                  Koupeno
                                </span>
                              )}
                              {isEditable ? (
                                pendingDeleteId === gift.id ? (
                                  <Confirm
                                    className="table-status__confirm--wrap"
                                    message="Smazat? Odstraní dárek."
                                    onConfirm={() => {
                                      onDeleteGift(gift.id);
                                      setPendingDeleteId(null);
                                    }}
                                    onCancel={() => setPendingDeleteId(null)}
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    className="table-delete"
                                    aria-label={`Smazat dárek ${gift.gift} pro ${gift.name}`}
                                    onClick={() => beginDeleteConfirm(gift.id)}
                                  >
                                    &times;
                                  </button>
                                )
                              ) : null}
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
  isEditable: PropTypes.bool,
};

Table.defaultProps = {
  isEditable: true,
};

export default Table;
