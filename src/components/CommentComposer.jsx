// components/CommentComposer.jsx
import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';
import sendIconActive from '../assets/img/sendButtonActive.png';
import FileAttachments from './FileAttachments';

const CommentComposer = ({ commentText, onCommentChange, onSubmit, isSubmitting }) => {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleChange = useCallback((e) => {
    onCommentChange(e.target.value);
  }, [onCommentChange]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if ((commentText.trim() || selectedFiles.length > 0) && !isSubmitting) {
      onSubmit(selectedFiles);
      setSelectedFiles([]); // Очищаем файлы после отправки
    }
  }, [commentText, selectedFiles, isSubmitting, onSubmit]);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      console.log('📎 Выбраны файлы для комментария:', files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
    // Очищаем input для возможности выбора тех же файлов повторно
    e.target.value = '';
  }, []);

  const handleRemoveFile = useCallback((indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const isDisabled = !commentText.trim() && selectedFiles.length === 0 || isSubmitting;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
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
          maxHeight: '120px',
          overflowY: 'auto'
        }}>
          <FileAttachments 
            files={selectedFiles.map((file, index) => ({
              id: `temp-${index}`,
              original_name: file.name,
              name: file.name,
              extension: file.name.split('.').pop().toLowerCase(),
              size: file.size,
              file: file, // Храним оригинальный файл
              isTemp: true // Флаг для временных файлов
            }))}
            onRemove={handleRemoveFile}
            showRemoveButton={true}
          />
        </div>
      )}
      
      <div className="discussion-footer">
        <img 
          src={skrepkaIcon} 
          alt="Attach" 
          className="discussion-footer__icon"
          onClick={handleAttachClick}
          style={{ cursor: 'pointer' }}
        />
        
        <input
          type="text"
          className="discussion-footer__input"
          placeholder="Комментировать"
          value={commentText}
          onChange={handleChange}
          disabled={isSubmitting}
          onKeyPress={handleKeyPress}
        />
        
        <img
          src={isDisabled ? sendIcon : sendIconActive}
          alt="Send"
          className="discussion-footer__send"
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

CommentComposer.propTypes = {
  commentText: PropTypes.string.isRequired,
  onCommentChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
};

export default CommentComposer;