// EditIdeaPageGPT.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPostPreview, createPost } from '../store/slices/postSlice';

// Components
import MindVaultHeader from '../components/UI/MindVaultHeader';
import IdeaPreviewCard from '../components/IdeaPreviewCard';
import PostComposer from '../components/PostComposer';

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
  
  // Local state
  const [postData, setPostData] = useState({
    text: '',
    files: []
  });
  
  // Redux state - используем превью из Redux или из навигации
  const reduxPreview = useSelector(state => state.post.preview);
  const preview = reduxPreview || navigationPreview;
  const loading = useSelector(state => state.post.loading);

  // Derived values
  const sectionKey = searchParams.get('section_key') || DEFAULT_SECTION_KEY;
  const themeId = Number(searchParams.get('theme_id')) || DEFAULT_THEME_ID;

  // Handlers
  const handleSend = useCallback(() => {
    if (postData.text.trim()) {
      dispatch(createPostPreview({
        section_key: sectionKey,
        theme_id: themeId,
        text: postData.text,
      }));      
    }
  }, [postData.text, dispatch, sectionKey, themeId]);

  const handlePublish = useCallback(async (text, publishing_method = 'original') => {
    if (!text) return;

    // Используем новую структуру данных для API
    const payload = {
      message_text: text,
      section_key: sectionKey,
      theme_id: themeId,
      files: attachedFiles,
      publishing_method
    };

    try {
      const actionResult = await dispatch(createPost(payload));
      if (actionResult.meta.requestStatus === 'fulfilled') {
        navigate('/mindvault');
      } else {
        // Обработка ошибок
        const errorMsg = typeof actionResult.payload === 'string' 
          ? actionResult.payload 
          : actionResult.payload?.message || actionResult.payload?.detail || 'Неизвестная ошибка';
        console.warn('Error creating post:', errorMsg);
        
        // Можно показать пользователю уведомление об ошибке
        alert(`Ошибка публикации: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error publishing:', error);
      alert('Произошла ошибка при публикации поста');
    }
  }, [dispatch, sectionKey, themeId, attachedFiles, navigate]);

  const handlePublishOriginal = useCallback(() => {
    handlePublish(preview.original_text, 'original');
  }, [handlePublish, preview]);

  const handlePublishGPT = useCallback(() => {
    handlePublish(preview.gpt_text, 'gpt');
  }, [handlePublish, preview]);

  const handleEditGPT = useCallback(() => {
    navigate('/textgpteditpage', { 
      state: { gptText: preview.gpt_text } 
    });
  }, [navigate, preview]);

  const handleNavigateBack = useCallback(() => {
    window.history.back();
  }, []);

  const handlePostDataChange = useCallback((newData) => {
    setPostData(newData);
  }, []);

  return (
    <div className="edit-idea-page-gpt">
      <MindVaultHeader
        onBackClick={handleNavigateBack}
        onDescriptionClick={() => {}}
        hideSectionTitle={true}
        textColor="black"
        bgColor="#EEEFF1"
      />

      <div className="edit-idea-page-gpt__content">
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

      <PostComposer
        postData={postData}
        onPostDataChange={handlePostDataChange}
        onSubmit={handleSend}
        placeholder="Написать заново"
        disabled={loading}
      />
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
      Напишите текст ниже, чтобы создать превью с помощью ИИ.
    </p>
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
    >
      {loading ? 'Публикуем...' : 'Опубликовать оригинал'}
    </button>
    
    <button 
      className="idea-card-gpt__action-button" 
      onClick={onPublishGPT}
      disabled={loading || !hasGPT}
    >
      {loading ? 'Публикуем...' : 'Опубликовать версию GPT'}
    </button>
    
    <button 
      className="idea-card-gpt__action-button idea-card-gpt__action-button--secondary" 
      onClick={onEditGPT}
      disabled={loading || !hasGPT}
    >
      Редактировать версию GPT
    </button>
  </div>
);

export default EditIdeaPageGPT;