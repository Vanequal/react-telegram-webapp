import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import '../styles/components/image-modal.scss';

const ImageModal = React.memo(({ src, alt, onClose }) => {
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div className="image-modal" onClick={handleBackdropClick}>
      <div className="image-modal__container">
        <button className="image-modal__close" onClick={onClose}>
          ×
        </button>
        <img src={src} alt={alt} className="image-modal__image" />
      </div>
    </div>
  );
});

ImageModal.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ImageModal;