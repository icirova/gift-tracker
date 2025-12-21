import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './style.css';

const buildInitialState = (defaultYear, defaultName) => ({
  name: defaultName ?? '',
  gift: '',
  price: '',
  year: defaultYear ?? new Date().getFullYear(),
});

const GiftForm = ({ onAddGift, defaultYear, allowedNames }) => {
  const defaultName = allowedNames[0] ?? '';
  const [formData, setFormData] = useState(buildInitialState(defaultYear, defaultName));
  const [error, setError] = useState('');

  const isValid = useMemo(() => {
    return (
      allowedNames.includes(formData.name) &&
      formData.gift.trim().length > 1 &&
      Number(formData.price) > 0 &&
      Number(formData.year) > 0
    );
  }, [allowedNames, formData]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, year: defaultYear }));
  }, [defaultYear]);

  useEffect(() => {
    if (allowedNames.length && !allowedNames.includes(formData.name)) {
      setFormData((prev) => ({ ...prev, name: allowedNames[0] }));
    }
  }, [allowedNames, formData.name]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setFormData(buildInitialState(defaultYear, allowedNames[0]));
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
  allowedNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default GiftForm;
