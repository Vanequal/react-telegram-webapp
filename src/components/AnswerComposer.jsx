// components/AnswerComposer.jsx
import React, { useCallback, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';
import sendIconActive from '../assets/img/sendButtonActive.png';
import FileAttachments from './FileAttachments';

const AnswerComposer = ({ answerText, onAnswerChange, onSubmit, isSubmitting }) => {
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleChange = useCallback((e) => {
    onAnswerChange(e.target.value);
  }, [onAnswerChange]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if ((answerText.trim() || selectedFiles.length > 0) && !isSubmitting) {
      onSubmit(selectedFiles);
      setSelectedFiles([]); // Очищаем файлы после отправки
    }
  }, [answerText, selectedFiles, isSubmitting, onSubmit]);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      console.log('📎 Выбраны файлы для ответа:', files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
    // Очищаем input для возможности выбора тех же файлов повторно
    e.target.value = '';
  }, []);

  const handleRemoveFile = useCallback((indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  // Обработка клавиатуры на мобильных устройствах
  useEffect(() => {
    const handleFocus = () => {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 300);
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      return () => {
        inputElement.removeEventListener('focus', handleFocus);
      };
    }
  }, []);

  const isDisabled = !answerText.trim() && selectedFiles.length === 0 || isSubmitting;

  // Функция для подсчета и описания прикрепленных файлов
  const getAttachmentsDescription = (files) => {
    if (files.length === 0) return '';
    
    const imageFiles = files.filter(f => {
      const name = f.name.toLowerCase();
      return f.type?.startsWith('image/') || 
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].some(ext => name.endsWith(`.${ext}`));
    });
    
    const documentFiles = files.filter(f => {
      const name = f.name.toLowerCase();
      return ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].some(ext => name.endsWith(`.${ext}`));
    });
    
    const otherFiles = files.filter(f => !imageFiles.includes(f) && !documentFiles.includes(f));
    
    const parts = [];
    
    if (imageFiles.length > 0) {
      parts.push(`${imageFiles.length} ${imageFiles.length === 1 ? 'фото' : 'фото'}`);
    }
    
    if (documentFiles.length > 0) {
      parts.push(`${documentFiles.length} ${documentFiles.length === 1 ? 'документ' : 'документов'}`);
    }
    
    if (otherFiles.length > 0) {
      parts.push(`${otherFiles.length} ${otherFiles.length === 1 ? 'файл' : 'файлов'}`);
    }
    
    return parts.join(' и ');
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*" // Принимаем ВСЕ типы файлов
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      
      {/* Показываем прикрепленные файлы над футером */}
      {selectedFiles.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '70px', // Над футером
          left: '10px',
          right: '10px',
          background: 'white',
          borderRadius: '8px',
          padding: '8px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 99,
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
          {/* Текст о прикрепленных файлах */}
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
            padding: '6px 12px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            📎 Вы прикрепили: {getAttachmentsDescription(selectedFiles)}
          </div>
          
          <FileAttachments 
            files={selectedFiles.map((file, index) => ({
              id: `temp-${index}`,
              original_name: file.name,
              name: file.name,
              extension: file.name.split('.').pop()?.toLowerCase() || '',
              size: file.size,
              file: file, // Храним оригинальный файл
              isTemp: true, // Флаг для временных файлов
              type: file.type || 'application/octet-stream' // MIME тип
            }))}
            onRemove={handleRemoveFile}
            showRemoveButton={true}
          />
        </div>
      )}
      
      <div className="question-footer">
        <img 
          src={skrepkaIcon} 
          alt="Attach" 
          className="question-footer__icon"
          onClick={handleAttachClick}
          style={{ cursor: 'pointer' }}
        />
        
        <input
          ref={inputRef}
          type="text"
          className="question-footer__input"
          placeholder="Ответить на вопрос"
          value={answerText}
          onChange={handleChange}
          disabled={isSubmitting}
          onKeyPress={handleKeyPress}
        />
        
        <img
          src={isDisabled ? sendIcon : sendIconActive}
          alt="Send"
          className="question-footer__send"
          onClick={handleSubmit}
          style={{
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.5 : 1
          }}
        />
      </div>
    </>
  );
};

AnswerComposer.propTypes = {
  answerText: PropTypes.string.isRequired,
  onAnswerChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
};

export default AnswerComposer;