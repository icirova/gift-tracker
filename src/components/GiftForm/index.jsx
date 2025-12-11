import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './style.css';

const buildInitialState = (defaultYear) => ({
  name: '',
  gift: '',
  price: '',
  year: defaultYear ?? new Date().getFullYear(),
});

const CUSTOM_OPTION_VALUE = '__custom__';

const GiftForm = ({ onAddGift, defaultYear, existingNames }) => {
  const [formData, setFormData] = useState(buildInitialState(defaultYear));
  const [error, setError] = useState('');
  const [isCustomName, setIsCustomName] = useState(existingNames.length === 0);

  const hasExistingNames = existingNames.length > 0;

  const isValid = useMemo(() => {
    return (
      formData.name.trim().length > 1 &&
      formData.gift.trim().length > 1 &&
      Number(formData.price) > 0 &&
      Number(formData.year) > 0
    );
  }, [formData]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, year: defaultYear }));
  }, [defaultYear]);

  useEffect(() => {
    if (!hasExistingNames) {
      setIsCustomName(true);
      return;
    }

    if (existingNames.includes(formData.name)) {
      setIsCustomName(false);
    }
  }, [existingNames, formData.name, hasExistingNames]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNameSelect = (event) => {
    const { value } = event.target;
    if (value === CUSTOM_OPTION_VALUE) {
      setIsCustomName(true);
      setFormData((prev) => ({ ...prev, name: '' }));
    } else {
      setIsCustomName(false);
      setFormData((prev) => ({ ...prev, name: value }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isValid) {
      setError('Vyplň všechna pole a cenu zadej jako kladné číslo.');
      return;
    }

    setError('');
    onAddGift({
      ...formData,
      price: Number(formData.price),
      year: Number(formData.year),
    });
    setFormData(buildInitialState(defaultYear));
    if (!hasExistingNames) {
      setIsCustomName(true);
    }
  };

  return (
    <form className="gift-form" onSubmit={handleSubmit}>
      <h3>Přidej nový dárek</h3>
      <div className="gift-form__grid">
        {hasExistingNames && (
          <label>
            <span>Vyber jméno</span>
            <select value={isCustomName ? CUSTOM_OPTION_VALUE : formData.name} onChange={handleNameSelect}>
              <option value="" disabled>
                -- vyber --
              </option>
              {existingNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
              <option value={CUSTOM_OPTION_VALUE}>Jiné jméno</option>
            </select>
          </label>
        )}

        {(isCustomName || !hasExistingNames) && (
          <label>
            <span>{hasExistingNames ? 'Vlastní jméno' : 'Jméno'}</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Pro koho?"
            />
          </label>
        )}

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
            type="number"
            min="1"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Např. 1200"
          />
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
        Uložit dárek
      </button>
    </form>
  );
};

GiftForm.propTypes = {
  onAddGift: PropTypes.func.isRequired,
  defaultYear: PropTypes.number.isRequired,
  existingNames: PropTypes.arrayOf(PropTypes.string),
};

GiftForm.defaultProps = {
  existingNames: [],
};

export default GiftForm;
