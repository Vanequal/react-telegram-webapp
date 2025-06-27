// components/IdeaPreviewCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import FilePreview from './FilePreview';

const IdeaPreviewCard = ({ preview, attachedFiles }) => {
  return (
    <div className="idea-card-gpt">
      <div className="idea-card-gpt__section">
        <p className="idea-card-gpt__label">Оригинал текста:</p>
        <p className="idea-card-gpt__text">{preview.original_text}</p>
        {attachedFiles.length > 0 && (
          <FilePreview files={attachedFiles} />
        )}
      </div>

      <div className="idea-card-gpt__section">
        <p className="idea-card-gpt__label">Улучшенная версия от ИИ:</p>
        <p className="idea-card-gpt__text">{preview.gpt_text}</p>
        {attachedFiles.length > 0 && (
          <FilePreview files={attachedFiles} />
        )}
      </div>
    </div>
  );
};

IdeaPreviewCard.propTypes = {
  preview: PropTypes.shape({
    original_text: PropTypes.string.isRequired,
    gpt_text: PropTypes.string.isRequired
  }).isRequired,
  attachedFiles: PropTypes.array.isRequired
};

export default IdeaPreviewCard;