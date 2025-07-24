// EditIdeaPageGPT.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPostPreview, createPost, clearError } from '../store/slices/postSlice';

// Components
import MindVaultHeader from '../components/UI/MindVaultHeader';
import IdeaPreviewCard from '../components/IdeaPreviewCard';

// Styles
import '../styles/components/edit-idea-gpt.scss';

// Constants
const DEFAULT_SECTION_KEY = 'chat_ideas';
const DEFAULT_THEME_ID = 1;

const EditIdeaPageGPT = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // State from navigation - получаем приложенные файлы и превью
  const attachedFiles = location.state?.attachedFiles || [];
  const navigationPreview = location.state?.preview || null;
  
  // Redux state - используем превью из Redux или из навигации
  const reduxPreview = useSelector(state => state.post.preview);
  const preview = reduxPreview || navigationPreview;
  const loading = useSelector(state => state.post.loading);
  const error = useSelector(state => state.post.error);

  // Derived values
  const sectionKey = searchParams.get('section_key') || DEFAULT_SECTION_KEY;
  const themeId = Number(searchParams.get('theme_id')) || DEFAULT_THEME_ID;

  // Очищаем ошибки при монтировании компонента
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Handlers
  const handlePublish = useCallback(async (text, publishing_method = 'original') => {
    if (!text || !text.trim()) {
      alert('Текст для публикации не может быть пустым');
      return;
    }

    console.log('📤 Публикуем пост:', {
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      publishing_method,
      files_count: attachedFiles?.length || 0,
      section_key: sectionKey,
      theme_id: themeId
    });

    const payload = {
      message_text: text.trim(),
      section_key: sectionKey,
      theme_id: themeId,
      files: attachedFiles || [],
      publishing_method
    };

    try {
      const actionResult = await dispatch(createPost(payload));
      
      if (actionResult.meta.requestStatus === 'fulfilled') {
        console.log('✅ Пост успешно опубликован:', actionResult.payload);
        navigate('/mindvault');
      } else {
        // Обработка ошибок
        const errorMsg = typeof actionResult.payload === 'string' 
          ? actionResult.payload 
          : actionResult.payload?.message || actionResult.payload?.detail || 'Неизвестная ошибка';
        
        console.error('❌ Ошибка публикации:', errorMsg);
        alert(`Ошибка публикации: ${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Исключение при публикации:', error);
      alert('Произошла ошибка при публикации поста');
    }
  }, [dispatch, sectionKey, themeId, attachedFiles, navigate]);

  const handlePublishOriginal = useCallback(() => {
    if (!preview?.original_text) {
      alert('Оригинальный текст недоступен');
      return;
    }
    handlePublish(preview.original_text, 'original');
  }, [handlePublish, preview]);

  const handlePublishGPT = useCallback(() => {
    if (!preview?.gpt_text) {
      alert('GPT версия недоступна');
      return;
    }
    handlePublish(preview.gpt_text, 'gpt');
  }, [handlePublish, preview]);

  const handleEditGPT = useCallback(() => {
    if (!preview?.gpt_text) {
      alert('GPT версия недоступна для редактирования');
      return;
    }
    navigate('/textgpteditpage', { 
      state: { 
        gptText: preview.gpt_text,
        attachedFiles: attachedFiles,
        section_key: sectionKey,
        theme_id: themeId
      } 
    });
  }, [navigate, preview, attachedFiles, sectionKey, themeId]);

  const handleNavigateBack = useCallback(() => {
    window.history.back();
  }, []);

  // Показываем ошибки пользователю
  const displayError = error && typeof error === 'string' ? error : null;

  return (
    <div className="edit-idea-page-gpt">
      <MindVaultHeader
        onBackClick={handleNavigateBack}
        onDescriptionClick={() => {}}
        hideSectionTitle={true}
        hideDescription={true}
        textColor="black"
        bgColor="#EEEFF1"
      />

      <div className="edit-idea-page-gpt__content">
        {displayError && (
          <div className="edit-idea-page-gpt__error">
            <p className="error-message">❌ {displayError}</p>
            <button 
              className="error-dismiss"
              onClick={() => dispatch(clearError())}
            >
              ✕
            </button>
          </div>
        )}

        {!preview ? (
          <EmptyPreview sectionKey={sectionKey} />
        ) : (
          <>
            <IdeaPreviewCard
              preview={preview}
              attachedFiles={attachedFiles}
            />
            
            <PreviewActions
              onPublishOriginal={handlePublishOriginal}
              onPublishGPT={handlePublishGPT}
              onEditGPT={handleEditGPT}
              loading={loading}
              hasOriginal={!!preview.original_text}
              hasGPT={!!preview.gpt_text}
            />
          </>
        )}
      </div>

      {/* Убираем PostComposer - больше нет футера! */}
    </div>
  );
};

// Sub-components
const EmptyPreview = ({ sectionKey }) => (
  <div className="edit-idea-page-gpt__empty-container">
    <p className="edit-idea-page-gpt__empty-message">
      Превью поста пока не создано.
    </p>
    <p className="edit-idea-page-gpt__empty-hint">
      Вернитесь назад, чтобы создать превью.
    </p>
    {sectionKey && (
      <p className="edit-idea-page-gpt__section-info">
        Секция: <strong>{sectionKey}</strong>
      </p>
    )}
  </div>
);

const PreviewActions = ({ 
  onPublishOriginal, 
  onPublishGPT, 
  onEditGPT, 
  loading, 
  hasOriginal, 
  hasGPT 
}) => (
  <div className="idea-card-gpt__actions">
    <button 
      className="idea-card-gpt__action-button" 
      onClick={onPublishOriginal}
      disabled={loading || !hasOriginal}
      title={!hasOriginal ? 'Оригинальный текст недоступен' : ''}
    >
      {loading ? 'Публикуем...' : 'Опубликовать оригинал'}
    </button>
    
    <button 
      className="idea-card-gpt__action-button" 
      onClick={onPublishGPT}
      disabled={loading || !hasGPT}
      title={!hasGPT ? 'GPT версия недоступна' : ''}
    >
      {loading ? 'Публикуем...' : 'Опубликовать версию GPT'}
    </button>
    
    <button 
      className="idea-card-gpt__action-button idea-card-gpt__action-button--secondary" 
      onClick={onEditGPT}
      disabled={loading || !hasGPT}
      title={!hasGPT ? 'GPT версия недоступна для редактирования' : ''}
    >
      Редактировать версию GPT
    </button>
  </div>
);

export default EditIdeaPageGPT;