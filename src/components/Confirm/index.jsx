import PropTypes from 'prop-types';
import './style.css';

const Confirm = ({
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Ano',
  cancelLabel = 'Ne',
  className = '',
}) => (
  <div className={`table-status__confirm${className ? ` ${className}` : ''}`}>
    <span className="table-status__confirm-text">{message}</span>
    <div className="table-status__confirm-actions">
      <button type="button" className="table-status__confirm-button" onClick={onConfirm}>
        {confirmLabel}
      </button>
      <button type="button" className="table-status__confirm-button" onClick={onCancel}>
        {cancelLabel}
      </button>
    </div>
  </div>
);

Confirm.propTypes = {
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  className: PropTypes.string,
};

export default Confirm;
