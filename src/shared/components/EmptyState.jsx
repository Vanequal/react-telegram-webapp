import React from 'react'
import PropTypes from 'prop-types'
import '@/styles/components/state-components.scss'

const EmptyState = ({ message = 'Идей пока нет' }) => (
  <p className="empty-state">{message}</p>
)

EmptyState.propTypes = {
  message: PropTypes.string
}

export default EmptyState
