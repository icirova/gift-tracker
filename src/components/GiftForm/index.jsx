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

const GiftForm = ({ onAddGift, defaultYear, allowedNames, statusOptions, defaultStatus }) => {
  const defaultName = allowedNames[0] ?? '';
  const [formData, setFormData] = useState(
    buildInitialState(defaultYear, defaultName, defaultStatus),
  );
  const [error, setError] = useState('');
  const allowedStatuses = useMemo(
    () => statusOptions.map((option) => option.value),
    [statusOptions],
  );

  const isValid = useMemo(() => {
    if (
      !allowedNames.includes(formData.name) ||
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
  }, [allowedNames, allowedStatuses, formData]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, year: defaultYear }));
  }, [defaultYear]);

  useEffect(() => {
    if (allowedNames.length && !allowedNames.includes(formData.name)) {
      setFormData((prev) => ({ ...prev, name: allowedNames[0] }));
    }
  }, [allowedNames, formData.name]);

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
    setFormData(buildInitialState(defaultYear, allowedNames[0], defaultStatus));
  };

  return (
    <form className="gift-form" id="gift-form" onSubmit={handleSubmit}>
      <h3>Přidej nový dárek</h3>
      <div className="gift-form__grid">
        <label>
          <span>Jméno</span>
          <select name="name" value={formData.name} onChange={handleChange}>
            {allowedNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
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
          />
          {formData.status === 'idea' && (
            <small className="gift-form__hint">Cenu lze později editovat.</small>
          )}
        </label>
        <label>
          <span>Rok</span>
          <input
            type="number"
            min="2000"
            name="year"
            value={formData.year}
            onChange={handleChange}
          />
        </label>
       
      </div>
      {error && <p className="gift-form__error">{error}</p>}
      <button type="submit" disabled={!isValid}>
        Přidat dárek
      </button>
    </form>
  );
};

GiftForm.propTypes = {
  onAddGift: PropTypes.func.isRequired,
  defaultYear: PropTypes.number.isRequired,
  allowedNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  statusOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  defaultStatus: PropTypes.string,
};

export default GiftForm;
