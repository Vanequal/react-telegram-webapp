import React from 'react';
import PropTypes from 'prop-types';
import skrepkaIcon from '@/assets/images/skrepkaIcon.webp';
import sendIcon from '@/assets/images/sendIcon.webp';

const TaskFooter = ({ onAttachClick, onInputFocus }) => {
  return (
    <div className="task-footer">
      <img
        src={skrepkaIcon}
        alt="Attach"
        className="task-footer__icon"
        onClick={onAttachClick}
        style={{ cursor: 'pointer' }}
      />
      <input
        type="text"
        className="task-footer__input"
        placeholder="Назвать и сформулировать задачу"
        onFocus={onInputFocus}
        readOnly
      />
      <img src={sendIcon} alt="Send" className="task-footer__send" />
    </div>
  );
};

TaskFooter.propTypes = {
  onAttachClick: PropTypes.func.isRequired,
  onInputFocus: PropTypes.func.isRequired
};

export default TaskFooter;
