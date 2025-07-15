import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import '../styles/components/file-attachments.scss';

const FileAttachments = ({ files, onImageClick }) => {
  const BACKEND_BASE_URL = process.env.REACT_APP_API_URL || 'https://cd37168a51c2.ngrok-free.app';

  const { images, otherFiles } = useMemo(() => {
    const imgs = [];
    const others = [];

    console.log('📁 FileAttachments обрабатывает файлы:', files);

    files.forEach((file, index) => {
      // Поддерживаем и старую, и новую структуру API
      const filePath = file.stored_path || file.url || file.relative_path;
      const fileName = file.original_name || file.name || `file-${index}`;
      const mimeType = file.mime_type || file.type || '';
      
      if (!filePath) {
        console.warn('📁 Файл без пути:', file);
        return;
      }

      // Формируем URL для скачивания в зависимости от структуры API
      let downloadUrl;
      
      if (file.stored_path) {
        // Новая структура API - используем endpoint /api/v1/attachments
        const encodedPath = encodeURIComponent(file.stored_path);
        downloadUrl = `${BACKEND_BASE_URL}/api/v1/attachments/${encodedPath}`;
      } else {
        // Старая структура API - используем старый endpoint
        const encodedFilePath = encodeURIComponent(filePath);
        downloadUrl = `${BACKEND_BASE_URL}/api/v1/files/download/{file_url}?url=${encodedFilePath}`;
      }

      // Определяем расширение файла
      let ext = '';
      if (file.extension) {
        ext = file.extension.toLowerCase();
      } else if (fileName.includes('.')) {
        ext = fileName.split('.').pop().toLowerCase();
      } else if (mimeType) {
        // Извлекаем расширение из MIME-типа
        const mimeMap = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/webp': 'webp',
          'image/svg+xml': 'svg',
          'video/mp4': 'mp4',
          'video/webm': 'webm',
          'video/ogg': 'ogg',
          'audio/mp3': 'mp3',
          'audio/wav': 'wav',
          'application/pdf': 'pdf',
          'text/plain': 'txt'
        };
        ext = mimeMap[mimeType] || '';
      }

      // Определяем тип файла
      const isImage = mimeType?.startsWith('image/') || 
                      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
      
      const isVideo = mimeType?.startsWith('video/') || 
                      ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv'].includes(ext);

      const fileData = { 
        ...file, 
        downloadUrl, 
        index, 
        alt: fileName,
        extension: ext,
        original_name: fileName,
        mime_type: mimeType
      };

      console.log(`📄 Обработан файл ${index}:`, {
        fileName,
        filePath,
        downloadUrl,
        isImage,
        isVideo,
        ext,
        mimeType
      });

      if (isImage) {
        imgs.push(fileData);
      } else {
        others.push({ ...fileData, isVideo, ext });
      }
    });

    console.log('📁 Результат обработки:', {
      totalFiles: files.length,
      images: imgs.length,
      otherFiles: others.length
    });

    return { images: imgs, otherFiles: others };
  }, [files, BACKEND_BASE_URL]);

  if (images.length === 0 && otherFiles.length === 0) {
    console.log('📁 Нет файлов для отображения');
    return null;
  }

  return (
    <div className="file-attachments">
      {images.length > 0 && (
        <div className="file-attachments__images">
          {images.map((image) => (
            <div
              key={image.id || image.index}
              className="file-attachments__image-wrapper"
              onClick={() => onImageClick(image)}
            >
              <img
                src={image.downloadUrl}
                alt={image.alt}
                className="file-attachments__image"
                onLoad={() => {
                  console.log('✅ Изображение загружено:', image.downloadUrl);
                }}
                onError={(e) => {
                  console.error('❌ Ошибка загрузки изображения:', {
                    url: image.downloadUrl,
                    fileName: image.original_name,
                    error: e
                  });
                  // Можно попробовать fallback URL
                  if (image.stored_path && !e.target.src.includes('/api/v1/files/download/')) {
                    const fallbackUrl = `${BACKEND_BASE_URL}/api/v1/files/download/{file_url}?url=${encodeURIComponent(image.stored_path)}`;
                    console.log('🔄 Пробуем fallback URL:', fallbackUrl);
                    e.target.src = fallbackUrl;
                  }
                }}
              />
              <div className="file-attachments__image-info">
                <span className="file-attachments__image-name">
                  {image.original_name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {otherFiles.length > 0 && (
        <div className="file-attachments__files">
          {otherFiles.map((file) => (
            <a
              key={file.id || file.index}
              href={file.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={file.original_name}
              className="file-attachments__file-link"
              onClick={() => {
                console.log('📥 Скачивание файла:', {
                  fileName: file.original_name,
                  url: file.downloadUrl
                });
              }}
            >
              {file.isVideo ? '🎥' : getFileIcon(file.ext, file.mime_type)} 
              {file.original_name || `${file.isVideo ? 'Видео' : 'Файл'} ${file.index + 1}`}
              {file.size && (
                <span className="file-attachments__file-size">
                  ({formatFileSize(file.size)})
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

// Вспомогательная функция для определения иконки файла
const getFileIcon = (ext, mimeType) => {
  if (mimeType?.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
    return '🎵';
  }
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return '📄';
  }
  if (mimeType?.includes('document') || ['doc', 'docx'].includes(ext)) {
    return '📝';
  }
  if (mimeType?.includes('spreadsheet') || ['xls', 'xlsx'].includes(ext)) {
    return '📊';
  }
  if (mimeType?.includes('archive') || ['zip', 'rar', '7z'].includes(ext)) {
    return '📦';
  }
  return '📎';
};

// Вспомогательная функция для форматирования размера файла
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

FileAttachments.propTypes = {
  files: PropTypes.array.isRequired,
  onImageClick: PropTypes.func.isRequired
};

export default FileAttachments;