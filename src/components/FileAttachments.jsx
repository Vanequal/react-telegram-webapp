import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import '../../styles/components/file-attachments.scss';

const FileAttachments = ({ files, onImageClick }) => {
  const BACKEND_BASE_URL = process.env.REACT_APP_API_URL || 'https://trembl-quarterly-sector-t.trycloudflare.com';

  const { images, otherFiles } = useMemo(() => {
    const imgs = [];
    const others = [];

    files.forEach((file, index) => {
      if (!file.url && !file.relative_path) return;

      const fileAbsolutePath = file.url;
      if (!fileAbsolutePath) return;

      const encodedFilePath = encodeURIComponent(fileAbsolutePath);
      const downloadUrl = `${BACKEND_BASE_URL}/api/v1/files/download/{file_url}?url=${encodedFilePath}`;

      const ext = (file.extension || '').toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
      const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);

      const fileData = { 
        ...file, 
        downloadUrl, 
        index, 
        alt: file.original_name || `file-${index}` 
      };

      if (isImage) {
        imgs.push(fileData);
      } else {
        others.push({ ...fileData, isVideo, ext });
      }
    });

    return { images: imgs, otherFiles: others };
  }, [files, BACKEND_BASE_URL]);

  if (images.length === 0 && otherFiles.length === 0) return null;

  return (
    <div className="file-attachments">
      {images.length > 0 && (
        <div className="file-attachments__images">
          {images.map((image) => (
            <div
              key={image.index}
              className="file-attachments__image-wrapper"
              onClick={() => onImageClick(image)}
            >
              <img
                src={image.downloadUrl}
                alt={image.alt}
                className="file-attachments__image"
              />
            </div>
          ))}
        </div>
      )}

      {otherFiles.length > 0 && (
        <div className="file-attachments__files">
          {otherFiles.map((file) => (
            <a
              key={file.index}
              href={file.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={file.original_name}
              className="file-attachments__file-link"
            >
              {file.isVideo ? '🎥' : '📎'} 
              {file.original_name || `${file.isVideo ? 'Видео' : 'Файл'} ${file.index + 1}`}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

FileAttachments.propTypes = {
  files: PropTypes.array.isRequired,
  onImageClick: PropTypes.func.isRequired
};

export default FileAttachments;
