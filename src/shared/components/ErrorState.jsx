import React from 'react';
import PropTypes from 'prop-types';

const ErrorState = ({ error }) => (
  <p className="error-state">
    Ошибка загрузки: {error}
  </p>
);

ErrorState.propTypes = {
  error: PropTypes.string.isRequired
};

export default ErrorState;