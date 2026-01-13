import PropTypes from 'prop-types';
import './style.css';

const HeroQuickForm = ({ quickGift, allowedNames, statusOptions, onChange, onSubmit, isValid }) => (
  <form className="hero-quick" onSubmit={onSubmit}>
    <label className="hero-quick__field">
      <span>Jméno</span>
      <select name="name" value={quickGift.name} onChange={onChange}>
        {allowedNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
    <label className="hero-quick__field">
      <span>Stav</span>
      <select name="status" value={quickGift.status} onChange={onChange}>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
    <label className="hero-quick__field">
      <span>Dárek</span>
      <input
        type="text"
        name="gift"
        value={quickGift.gift}
        onChange={onChange}
        placeholder="Co se kupuje"
      />
    </label>
    <label className="hero-quick__field">
      <span>Cena (Kč)</span>
      <input
        type="text"
        inputMode="numeric"
        name="price"
        value={quickGift.price}
        onChange={onChange}
        placeholder="Např. 1200 (volitelné)"
      />
    </label>
    <button type="submit" disabled={!isValid}>
      Přidat dárek
    </button>
  </form>
);

HeroQuickForm.propTypes = {
  quickGift: PropTypes.shape({
    name: PropTypes.string.isRequired,
    gift: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  allowedNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  statusOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
};

export default HeroQuickForm;
