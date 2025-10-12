// TextGPTEditor.jsx
import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../../store/slices/postSlice';
import MindVaultHeader from '../../mindvault/components/MindVaultHeader';

import '../styles/TextGPTEditor.scss';

// Constants
const DEFAULT_SECTION_KEY = 'chat_ideas';
const DEFAULT_THEME_ID = 1;

const TextGPTEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  // Получаем данные из навигации
  const initialText = location.state?.gptText || '';
  const attachedFiles = location.state?.attachedFiles || [];
  
  // State
  const [text, setText] = useState(initialText);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Redux state
  const { loading, error } = useSelector(state => state.post);
  
  // Derived values
  const sectionKey = searchParams.get('section_key') || DEFAULT_SECTION_KEY;
  const themeId = Number(searchParams.get('theme_id')) || DEFAULT_THEME_ID;
  
  // Проверяем есть ли изменения в тексте
  const hasChanges = text.trim() !== initialText.trim();
  const canPublish = text.trim().length > 0;

  const handleBack = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите уйти?');
      if (!confirmed) return;
    }
    window.history.back();
  }, [hasChanges]);

  const handlePublish = useCallback(async () => {
    if (!canPublish || isPublishing) return;

    setIsPublishing(true);
    
    try {
      console.log('📤 Публикуем отредактированный GPT текст:', {
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        files_count: attachedFiles?.length || 0,
        section_key: sectionKey,
        theme_id: themeId
      });

      const payload = {
        message_text: text.trim(),
        section_key: sectionKey,
        theme_id: themeId,
        files: attachedFiles || [],
        publishing_method: 'gpt' // Указываем что это отредактированная GPT версия
      };

      const actionResult = await dispatch(createPost(payload));
      
      if (actionResult.meta.requestStatus === 'fulfilled') {
        console.log('✅ Отредактированный пост успешно опубликован:', actionResult.payload);
        navigate('/mindvault', { 
          state: { 
            message: 'Пост успешно опубликован!' 
          }
        });
      } else {
        const errorMsg = typeof actionResult.payload === 'string' 
          ? actionResult.payload 
          : actionResult.payload?.message || actionResult.payload?.detail || 'Неизвестная ошибка';
        
        console.error('❌ Ошибка публикации:', errorMsg);
        alert(`Ошибка публикации: ${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Исключение при публикации:', error);
      alert('Произошла ошибка при публикации поста');
    } finally {
      setIsPublishing(false);
    }
  }, [text, attachedFiles, sectionKey, themeId, canPublish, isPublishing, dispatch, navigate]);

  return (
    <div className="text-gpt-editor">
      <MindVaultHeader
        title="Редактировать"
        onBackClick={handleBack}
        hideSectionTitle={true}
        hideDescription={true}
        bgColor={'#EEEFF1'}
        textColor="black"
      />

      <div className="text-gpt-editor__content">
        {/* Информация о файлах если есть */}
        {attachedFiles && attachedFiles.length > 0 && (
          <div className="text-gpt-editor__files-info">
            📎 Прикреплено файлов: {attachedFiles.length}
          </div>
        )}
        
        {/* Показываем ошибки */}
        {error && (
          <div className="text-gpt-editor__error">
            ❌ {error}
          </div>
        )}
        
        <textarea
          className="text-gpt-editor__textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите текст..."
          autoFocus
          disabled={isPublishing}
        />
        
        {/* Кнопки действий */}
        <div className="text-gpt-editor__actions">
          {hasChanges && (
            <div className="text-gpt-editor__changes-indicator">
              ✏️ Текст изменен
            </div>
          )}
          
          <button
            className="text-gpt-editor__publish-btn"
            onClick={handlePublish}
            disabled={!canPublish || isPublishing || loading}
          >
            {isPublishing || loading ? 'Публикуем...' : 'Опубликовать'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextGPTEditor;