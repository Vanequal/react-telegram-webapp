import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import '@/styles/components/file-attachments.scss'

const FileAttachments = ({ files, onImageClick }) => {
  const BACKEND_BASE_URL = process.env.REACT_APP_API_URL || 'https://adjacent-forth-administrative-diseases.trycloudflare.com'
  const [imageCache, setImageCache] = useState({})

  // Функция для загрузки изображения через fetch с обходом ngrok
  const loadImageAsBase64 = async (url, fileId) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          Accept: 'image/*',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const base64 = await new Promise(resolve => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })

      setImageCache(prev => ({
        ...prev,
        [fileId]: base64,
      }))

      return base64
    } catch (error) {
      console.error('❌ Ошибка загрузки изображения через fetch:', error)
      return null
    }
  }

  const { images, otherFiles } = useMemo(() => {
    const imgs = []
    const others = []

    console.log('📁 FileAttachments обрабатывает файлы:', files)

    files.forEach((file, index) => {
      // Поддерживаем и старую, и новую структуру API
      const filePath = file.file_path || file.stored_path || file.url || file.relative_path
      const fileName = file.original_name || file.name || `file-${index}`
      const mimeType = file.mime_type || file.type || ''

      if (!filePath) {
        console.warn('📁 Файл без пути:', file)
        return
      }

      // Формируем URL для скачивания используя НОВЫЙ endpoint
      let downloadUrl

      if (file.file_path || file.stored_path) {
        // Новая структура API - используем обновленный endpoint
        downloadUrl = `${BACKEND_BASE_URL}/api/v1/messages/attachments/${file.file_path || file.stored_path}`
      } else {
        // Fallback для старой структуры
        const encodedFilePath = encodeURIComponent(filePath)
        downloadUrl = `${BACKEND_BASE_URL}/api/v1/files/download/{file_url}?url=${encodedFilePath}`
      }

      // Определяем расширение файла
      let ext = ''
      if (file.extension) {
        ext = file.extension.toLowerCase()
      } else if (fileName.includes('.')) {
        ext = fileName.split('.').pop().toLowerCase()
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
          'text/plain': 'txt',
        }
        ext = mimeMap[mimeType] || ''
      }

      // Определяем тип файла
      const isImage = mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)

      const isVideo = mimeType?.startsWith('video/') || ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv'].includes(ext)

      const fileData = {
        ...file,
        downloadUrl,
        index,
        alt: fileName,
        extension: ext,
        original_name: fileName,
        mime_type: mimeType,
        fileId: file.id || `${index}-${fileName}`,
      }

      console.log(`📄 Обработан файл ${index}:`, {
        fileName,
        filePath,
        downloadUrl,
        isImage,
        isVideo,
        ext,
        mimeType,
      })

      if (isImage) {
        imgs.push(fileData)
      } else {
        others.push({ ...fileData, isVideo, ext })
      }
    })

    console.log('📁 Результат обработки:', {
      totalFiles: files.length,
      images: imgs.length,
      otherFiles: others.length,
    })

    return { images: imgs, otherFiles: others }
  }, [files, BACKEND_BASE_URL])

  if (images.length === 0 && otherFiles.length === 0) {
    console.log('📁 Нет файлов для отображения')
    return null
  }

  return (
    <div className="file-attachments">
      {images.length > 0 && (
        <div className="file-attachments__images">
          {images.map(image => (
            <ImageWithFetch key={image.fileId} image={image} onImageClick={onImageClick} imageCache={imageCache} loadImageAsBase64={loadImageAsBase64} />
          ))}
        </div>
      )}

      {otherFiles.length > 0 && (
        <div className="file-attachments__files">
          {otherFiles.map(file => (
            <a
              key={file.fileId}
              href={file.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={file.original_name}
              className="file-attachments__file-link"
              onClick={e => {
                console.log('📥 Скачивание файла:', {
                  fileName: file.original_name,
                  url: file.downloadUrl,
                })

                // Добавляем обход ngrok для скачивания
                e.preventDefault()
                const urlWithBypass = file.downloadUrl + (file.downloadUrl.includes('?') ? '&' : '?') + 'ngrok-skip-browser-warning=true'
                window.open(urlWithBypass, '_blank')
              }}
            >
              {file.isVideo ? '🎥' : getFileIcon(file.ext, file.mime_type)}
              {file.original_name || `${file.isVideo ? 'Видео' : 'Файл'} ${file.index + 1}`}
              {file.size && <span className="file-attachments__file-size">({formatFileSize(file.size)})</span>}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// Компонент для изображения с загрузкой через fetch
const ImageWithFetch = ({ image, onImageClick, imageCache, loadImageAsBase64 }) => {
  const [imageSrc, setImageSrc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Проверяем кэш
    if (imageCache[image.fileId]) {
      setImageSrc(imageCache[image.fileId])
      setLoading(false)
      return
    }

    // Загружаем изображение через fetch
    const loadImage = async () => {
      const base64 = await loadImageAsBase64(image.downloadUrl, image.fileId)
      if (base64) {
        setImageSrc(base64)
      } else {
        setError(true)
      }
      setLoading(false)
    }

    loadImage()
  }, [image, imageCache, loadImageAsBase64])

  if (loading) {
    return (
      <div className="file-attachments__image-wrapper">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100px',
            background: '#f5f5f5',
            borderRadius: '4px',
          }}
        >
          Загрузка...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="file-attachments__image-wrapper">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100px',
            background: '#ffeaea',
            borderRadius: '4px',
            padding: '10px',
          }}
        >
          🖼️
          <small>Ошибка загрузки</small>
        </div>
      </div>
    )
  }

  return (
    <div
      className="file-attachments__image-wrapper"
      onClick={() =>
        onImageClick({
          ...image,
          src: imageSrc, // Передаем загруженный base64 URL
        })
      }
    >
      <img
        src={imageSrc}
        alt={image.alt}
        className="file-attachments__image"
        onLoad={() => {
          console.log('✅ Изображение отображено:', image.original_name)
        }}
      />
      <div className="file-attachments__image-info">
        <span className="file-attachments__image-name">{image.original_name}</span>
      </div>
    </div>
  )
}

// Вспомогательная функция для определения иконки файла
const getFileIcon = (ext, mimeType) => {
  if (mimeType?.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
    return '🎵'
  }
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return '📄'
  }
  if (mimeType?.includes('document') || ['doc', 'docx'].includes(ext)) {
    return '📝'
  }
  if (mimeType?.includes('spreadsheet') || ['xls', 'xlsx'].includes(ext)) {
    return '📊'
  }
  if (mimeType?.includes('archive') || ['zip', 'rar', '7z'].includes(ext)) {
    return '📦'
  }
  return '📎'
}

// Вспомогательная функция для форматирования размера файла
const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

FileAttachments.propTypes = {
  files: PropTypes.array.isRequired,
  onImageClick: PropTypes.func.isRequired,
}

export default FileAttachments
