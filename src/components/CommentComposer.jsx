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
    <div className="discussion-footer">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      
      <img 
        src={skrepkaIcon} 
        alt="Attach" 
        className="discussion-footer__icon"
        onClick={handleAttachClick}
        style={{ cursor: 'pointer' }}
      />
      
      <div className="discussion-footer__input-container">
        {selectedFiles.length > 0 && (
          <div className="discussion-footer__files">
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
        
        <input
          type="text"
          className="discussion-footer__input"
          placeholder="Комментировать"
          value={commentText}
          onChange={handleChange}
          disabled={isSubmitting}
          onKeyPress={handleKeyPress}
        />
      </div>
      
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
  );
};

CommentComposer.propTypes = {
  commentText: PropTypes.string.isRequired,
  onCommentChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
};

export default CommentComposer;