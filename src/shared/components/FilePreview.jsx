// components/FilePreview.jsx
import React from 'react';
import PropTypes from 'prop-types';

const FilePreview = ({ files }) => {
  return (
    <div className="file-preview">
      {files.map((file, index) => (
        <div key={index} className="file-preview__item">
          {file.type.startsWith('image/') ? (
            <img 
              src={URL.createObjectURL(file)} 
              alt={`image-${index}`} 
              className="file-preview__image"
            />
          ) : file.type.startsWith('video/') ? (
            <video 
              controls 
              className="file-preview__video"
              src={URL.createObjectURL(file)} 
            />
          ) : (
            <a 
              href={URL.createObjectURL(file)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="file-preview__link"
            >
              {file.name}
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

FilePreview.propTypes = {
  files: PropTypes.array.isRequired
};

export default FilePreview;