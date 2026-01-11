// features/laboratory/components/ExperimentComposer.jsx
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import sendIcon from '@/assets/images/sendIcon.webp'
import sendIconActive from '@/assets/images/sendButtonActive.png'
import '@/styles/features/ExperimentComposer.scss'

const ExperimentComposer = ({ experimentData, onExperimentDataChange, onSubmit, disabled }) => {
  const { title, scenario } = experimentData

  const handleTitleChange = useCallback(
    e => {
      onExperimentDataChange({ ...experimentData, title: e.target.value })
    },
    [experimentData, onExperimentDataChange]
  )

  const handleScenarioChange = useCallback(
    e => {
      onExperimentDataChange({ ...experimentData, scenario: e.target.value })
    },
    [experimentData, onExperimentDataChange]
  )

  const handleSubmit = useCallback(() => {
    if (title.trim() && scenario.trim()) {
      onSubmit()
    }
  }, [title, scenario, onSubmit])

  const isSubmitDisabled = !title.trim() || !scenario.trim() || disabled

  return (
    <div className="experiment-composer">
      <div className="experiment-composer__form">
        <div className="experiment-composer__field">
          <label className="experiment-composer__label">Название эксперимента:</label>
          <input
            type="text"
            className="experiment-composer__input"
            placeholder="Введите название эксперимента"
            value={title}
            onChange={handleTitleChange}
            disabled={disabled}
          />
        </div>

        <div className="experiment-composer__field">
          <label className="experiment-composer__label">Сценарий эксперимента:</label>
          <textarea
            className="experiment-composer__textarea"
            placeholder="Опишите сценарий эксперимента"
            value={scenario}
            onChange={handleScenarioChange}
            disabled={disabled}
            rows={8}
          />
        </div>

        <button
          className="experiment-composer__submit"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          style={{
            opacity: isSubmitDisabled ? 0.5 : 1,
            cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          <img src={isSubmitDisabled ? sendIcon : sendIconActive} alt="Опубликовать" />
          <span>Опубликовать</span>
        </button>
      </div>
    </div>
  )
}

ExperimentComposer.propTypes = {
  experimentData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    scenario: PropTypes.string.isRequired,
  }).isRequired,
  onExperimentDataChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

export default ExperimentComposer
