import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import '../styles/components/image-modal.scss';

const ImageModal = React.memo(({ src, alt, onClose, loading = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Автоматически закрываем модал по Escape
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="image-modal" onClick={handleBackdropClick}>
      <div className="image-modal__container">
        <button className="image-modal__close" onClick={onClose}>
          ×
        </button>
        
        {/* Показываем спиннер загрузки */}
        {(loading || !imageLoaded) && !imageError && (
          <div className="image-modal__loading">
            <div className="image-modal__spinner">
              <div className="spinner"></div>
            </div>
            <p>Загрузка изображения...</p>
          </div>
        )}

        {/* Показываем ошибку */}
        {imageError && (
          <div className="image-modal__error">
            <div className="image-modal__error-icon">🖼️</div>
            <p>Ошибка загрузки изображения</p>
            <small>{alt}</small>
          </div>
        )}

        {/* Само изображение */}
        {src && (
          <img 
            src={src} 
            alt={alt} 
            className={`image-modal__image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              display: imageError ? 'none' : 'block',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />
        )}
      </div>
    </div>
  );
});

ImageModal.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default ImageModal;