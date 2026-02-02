import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './style.css';

const buildInitialState = (defaultYear, defaultName, defaultStatus) => ({
  name: defaultName ?? '',
  gift: '',
  price: '',
  year: defaultYear ?? new Date().getFullYear(),
  status: defaultStatus ?? 'bought',
});

const GiftForm = ({
  onAddGift,
  defaultYear,
  namesByYear,
  statusOptions,
  defaultStatus,
  isEditable = true,
}) => {
  const namesForYear = namesByYear[defaultYear] ?? [];
  const defaultName = namesForYear[0] ?? '';
  const [formData, setFormData] = useState(
    buildInitialState(defaultYear, defaultName, defaultStatus),
  );
  const [error, setError] = useState('');
  const allowedStatuses = useMemo(
    () => statusOptions.map((option) => option.value),
    [statusOptions],
  );
  const namesForSelectedYear = useMemo(
    () => namesByYear[formData.year] ?? [],
    [formData.year, namesByYear],
  );

  const isValid = useMemo(() => {
    if (
      namesForSelectedYear.length === 0 ||
      !namesForSelectedYear.includes(formData.name) ||
      formData.gift.trim().length <= 1 ||
      Number(formData.year) <= 0 ||
      !allowedStatuses.includes(formData.status)
    ) {
      return false;
    }

    const priceText = String(formData.price ?? '').trim();
    const priceValue = Number(priceText);
    const hasValidPrice = Number.isFinite(priceValue) && priceValue > 0;

    if (formData.status === 'bought') {
      return hasValidPrice;
    }

    return priceText === '' || hasValidPrice;
  }, [allowedStatuses, formData, namesForSelectedYear]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, year: defaultYear }));
  }, [defaultYear]);

  useEffect(() => {
    if (namesForSelectedYear.length && !namesForSelectedYear.includes(formData.name)) {
      setFormData((prev) => ({ ...prev, name: namesForSelectedYear[0] }));
    }
  }, [formData.name, namesForSelectedYear]);

  useEffect(() => {
    if (allowedStatuses.length && !allowedStatuses.includes(formData.status)) {
      setFormData((prev) => ({ ...prev, status: allowedStatuses[0] }));
    }
  }, [allowedStatuses, formData.status]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isEditable) {
      return;
    }
    if (!isValid) {
      setError('Vyplň všechna pole; u koupených dárků zadej cenu jako kladné číslo.');
      return;
    }

    const priceText = String(formData.price ?? '').trim();
    const priceValue = priceText === '' ? null : Number(priceText);

    setError('');
    onAddGift({
      ...formData,
      price: priceValue,
      year: Number(formData.year),
    });
    setFormData(buildInitialState(defaultYear, namesByYear[defaultYear]?.[0], defaultStatus));
  };

  return (
    <form className="gift-form" id="gift-form" onSubmit={handleSubmit}>
      <div className="gift-form__grid">
        <label>
          <span>Jméno</span>
          <select
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditable || namesForSelectedYear.length === 0}
          >
            {namesForSelectedYear.length === 0 ? (
              <option value="">Nejdřív přidej osobu</option>
            ) : (
              namesForSelectedYear.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))
            )}
          </select>
        </label>

         <label>
          <span>Stav</span>
          <select name="status" value={formData.status} onChange={handleChange}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Dárek</span>
          <input
            type="text"
            name="gift"
            value={formData.gift}
            onChange={handleChange}
            placeholder="Co se kupuje"
            disabled={!isEditable}
          />
        </label>
        <label>
          <span>Cena (Kč)</span>
          <input
            type="text"
            min="1"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Např. 1200"
            disabled={!isEditable}
          />
          {formData.status === 'idea' && (
            <small className="gift-form__hint">Cenu lze později editovat.</small>
          )}
        </label>
      </div>
      {error && <p className="gift-form__error">{error}</p>}
      <button type="submit" disabled={!isEditable || !isValid}>
        Přidat dárek
      </button>
    </form>
  );
};

GiftForm.propTypes = {
  onAddGift: PropTypes.func.isRequired,
  defaultYear: PropTypes.number.isRequired,
  namesByYear: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  statusOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  defaultStatus: PropTypes.string,
  isEditable: PropTypes.bool,
};

export default GiftForm;
