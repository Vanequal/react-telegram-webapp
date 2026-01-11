// features/laboratory/components/ExperimentVersionSelector.jsx
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import '@/styles/features/ExperimentVersionSelector.scss'

const ExperimentVersionSelector = ({ originalText, gptText, onPublishOriginal, onPublishGPT, onEditGPT, onRestart }) => {
  const [selectedVersion, setSelectedVersion] = useState('gpt')
  const [editedGptText, setEditedGptText] = useState(gptText)

  const handleVersionChange = useCallback(version => {
    setSelectedVersion(version)
  }, [])

  const handleEditedGptTextChange = useCallback(e => {
    setEditedGptText(e.target.value)
  }, [])

  const handlePublish = useCallback(() => {
    if (selectedVersion === 'original') {
      onPublishOriginal()
    } else if (selectedVersion === 'gpt') {
      onPublishGPT()
    }
  }, [selectedVersion, onPublishOriginal, onPublishGPT])

  const handleEdit = useCallback(() => {
    onEditGPT(editedGptText)
  }, [editedGptText, onEditGPT])

  const displayText = selectedVersion === 'original' ? originalText : selectedVersion === 'gpt' ? gptText : editedGptText

  return (
    <div className="experiment-version-selector">
      <div className="experiment-version-selector__tabs">
        <button className={`experiment-version-selector__tab ${selectedVersion === 'original' ? 'active' : ''}`} onClick={() => handleVersionChange('original')}>
          Оригинал
        </button>
        <button className={`experiment-version-selector__tab ${selectedVersion === 'gpt' ? 'active' : ''}`} onClick={() => handleVersionChange('gpt')}>
          Версия GPT
        </button>
        <button className={`experiment-version-selector__tab ${selectedVersion === 'edit' ? 'active' : ''}`} onClick={() => handleVersionChange('edit')}>
          Редактировать GPT
        </button>
      </div>

      <div className="experiment-version-selector__content">
        {selectedVersion === 'edit' ? (
          <textarea className="experiment-version-selector__textarea" value={editedGptText} onChange={handleEditedGptTextChange} rows={12} />
        ) : (
          <div className="experiment-version-selector__preview">{displayText}</div>
        )}
      </div>

      <div className="experiment-version-selector__actions">
        {selectedVersion === 'edit' ? (
          <button className="experiment-version-selector__button experiment-version-selector__button--edit" onClick={handleEdit}>
            Редактировать версию GPT
          </button>
        ) : (
          <button className="experiment-version-selector__button experiment-version-selector__button--publish" onClick={handlePublish}>
            Опубликовать {selectedVersion === 'original' ? 'оригинал' : 'версию GPT'}
          </button>
        )}
      </div>

      <div className="experiment-version-selector__footer">
        <input type="text" className="experiment-version-selector__footer-input" placeholder="Написать заново" onClick={onRestart} readOnly />
      </div>
    </div>
  )
}

ExperimentVersionSelector.propTypes = {
  originalText: PropTypes.string.isRequired,
  gptText: PropTypes.string.isRequired,
  onPublishOriginal: PropTypes.func.isRequired,
  onPublishGPT: PropTypes.func.isRequired,
  onEditGPT: PropTypes.func.isRequired,
  onRestart: PropTypes.func.isRequired,
}

export default ExperimentVersionSelector
