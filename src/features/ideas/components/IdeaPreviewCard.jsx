// components/IdeaPreviewCard.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import FilePreview from '../../../shared/components/FilePreview';
import FileAttachments from '../../../shared/components/FileAttachments';

const IdeaPreviewCard = ({ preview, attachedFiles }) => {
  // Определяем тип файлов - локальные File objects или загруженные на сервер
  const fileType = useMemo(() => {
    if (!attachedFiles || attachedFiles.length === 0) return null;
    
    const firstFile = attachedFiles[0];
    
    // Если это File object (есть свойство type и size как число)
    if (firstFile instanceof File || (firstFile.type && typeof firstFile.size === 'number' && !firstFile.stored_path)) {
      return 'local';
    }
    
    // Если это загруженный файл (есть stored_path или id)
    if (firstFile.stored_path || firstFile.id) {
      return 'uploaded';
    }
    
    return 'local'; // По умолчанию считаем локальными
  }, [attachedFiles]);

  console.log('📄 IdeaPreviewCard файлы:', {
    attachedFiles,
    fileType,
    filesCount: attachedFiles?.length || 0
  });

  const renderFiles = () => {
    if (!attachedFiles || attachedFiles.length === 0) return null;

    if (fileType === 'uploaded') {
      // Загруженные файлы - используем FileAttachments
      return (
        <FileAttachments 
          files={attachedFiles} 
          onImageClick={() => {}} // Пустая функция, так как в превью не нужен модал
        />
      );
    } else {
      // Локальные файлы - используем FilePreview
      return <FilePreview files={attachedFiles} />;
    }
  };

  return (
    <div className="idea-card-gpt">
      <div className="idea-card-gpt__section">
        <p className="idea-card-gpt__label">Оригинал текста:</p>
        <p className="idea-card-gpt__text">{preview.original_text}</p>
        {attachedFiles.length > 0 && (
          <div className="idea-card-gpt__files">
            {renderFiles()}
          </div>
        )}
      </div>

      <div className="idea-card-gpt__section">
        <p className="idea-card-gpt__label">Улучшенная версия от ИИ:</p>
        <p className="idea-card-gpt__text">{preview.gpt_text}</p>
        {attachedFiles.length > 0 && (
          <div className="idea-card-gpt__files">
            {renderFiles()}
          </div>
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