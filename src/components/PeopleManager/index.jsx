import { useState } from 'react';
import PropTypes from 'prop-types';
import './style.css';

const PeopleManager = ({ names, onAddName, onRemoveName, canEdit }) => {
  const [draft, setDraft] = useState('');
  const [confirmName, setConfirmName] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canEdit) {
      return;
    }
    const trimmed = draft.trim();
    if (trimmed.length < 2) {
      return;
    }
    onAddName(trimmed);
    setDraft('');
  };

  const handleRemove = (name) => {
    if (!canEdit) {
      return;
    }
    setConfirmName(name);
  };

  const handleConfirmRemove = () => {
    if (!confirmName) {
      return;
    }
    onRemoveName(confirmName);
    setConfirmName(null);
  };

  const handleCancelRemove = () => {
    setConfirmName(null);
  };

  return (
    <div className="people-manager">
      {canEdit ? (
        <form className="people-manager__form" onSubmit={handleSubmit}>
          <label className="people-manager__field">
            <span>Jméno</span>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Např. Ivetka"
            />
          </label>
          <button type="submit" disabled={draft.trim().length < 2}>
            Přidat osobu
          </button>
        </form>
      ) : null}

      {names.length ? (
        <div className="people-manager__list">
          {names.map((name) => (
            <div key={name} className="people-manager__item">
              <span>{name}</span>
              {canEdit ? (
                confirmName === name ? (
                  <div className="people-manager__confirm">
                    <span className="table-status__confirm-text">
                      Odebrat? Smaže i dárky v tomto roce.
                    </span>
                    <div className="table-status__confirm-actions">
                      <button
                        type="button"
                        className="table-status__confirm-button"
                        onClick={handleConfirmRemove}
                        aria-label={`Potvrdit odebrání osoby ${name}`}
                      >
                        Ano
                      </button>
                      <button
                        type="button"
                        className="table-status__confirm-button"
                        onClick={handleCancelRemove}
                        aria-label={`Zrušit odebrání osoby ${name}`}
                      >
                        Ne
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="table-delete people-manager__remove"
                    onClick={() => handleRemove(name)}
                    aria-label={`Odebrat osobu ${name}`}
                  >
                    &times;
                  </button>
                )
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="people-manager__empty">Zatím nejsou přidané žádné osoby.</p>
      )}
    </div>
  );
};

PeopleManager.propTypes = {
  names: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAddName: PropTypes.func.isRequired,
  onRemoveName: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
};

PeopleManager.defaultProps = {
  canEdit: true,
};

export default PeopleManager;
