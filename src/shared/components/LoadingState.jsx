import React from 'react'
import PropTypes from 'prop-types'

const LoadingState = ({ message = 'Загрузка...' }) => (
  <div className="loading-state">
    <p>{message}</p>
  </div>
)

LoadingState.propTypes = {
  message: PropTypes.string
}

export default LoadingState
