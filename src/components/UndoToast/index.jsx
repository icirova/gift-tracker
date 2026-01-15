import PropTypes from 'prop-types';

const UndoToast = ({ pendingDelete, pendingAdd, pendingNameDelete, onUndoDelete, onUndoNameDelete }) => {
  if (!pendingDelete && !pendingAdd && !pendingNameDelete) {
    return null;
  }

  return (
    <div className="undo-toast" role="status">
      {pendingNameDelete ? (
        <>
          <span>Jméno bylo odebráno.</span>
          <button type="button" className="undo-toast__button" onClick={onUndoNameDelete}>
            Zpět
          </button>
        </>
      ) : pendingAdd ? (
        <span>Dárek byl přidán.</span>
      ) : (
        <>
          <span>Dárek byl smazán.</span>
          <button type="button" className="undo-toast__button" onClick={onUndoDelete}>
            Vrátit zpět
          </button>
        </>
      )}
    </div>
  );
};

UndoToast.propTypes = {
  pendingDelete: PropTypes.shape({
    gift: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }),
  pendingAdd: PropTypes.shape({
    gift: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }),
  pendingNameDelete: PropTypes.shape({
    name: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
  }),
  onUndoDelete: PropTypes.func.isRequired,
  onUndoNameDelete: PropTypes.func.isRequired,
};

UndoToast.defaultProps = {
  pendingDelete: null,
  pendingAdd: null,
  pendingNameDelete: null,
};

export default UndoToast;
