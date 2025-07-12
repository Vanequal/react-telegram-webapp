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
  
  // State from navigation
  const attachedFiles = location.state?.attachedFiles || [];
  
  // Local state
  const [postData, setPostData] = useState({
    text: '',
    files: []
  });
  
  // Redux state
  const { preview } = useSelector(state => state.post);

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
        const errorMsg = typeof actionResult.payload === 'string' 
          ? actionResult.payload 
          : actionResult.payload?.message || 'Неизвестная ошибка';
        console.warn('Error creating post:', errorMsg);
      }
    } catch (error) {
      console.error('Error publishing:', error);
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
            />
          </>
        )}
      </div>

      <PostComposer
        postData={postData}
        onPostDataChange={handlePostDataChange}
        onSubmit={handleSend}
        placeholder="Написать заново"
      />
    </div>
  );
};

// Sub-components
const EmptyPreview = ({ sectionKey }) => (
  <p className="edit-idea-page-gpt__empty-message">
    Идей в канале <span className="edit-idea-page-gpt__section-name">{sectionKey}</span> ещё нет.
  </p>
);

const PreviewActions = ({ onPublishOriginal, onPublishGPT, onEditGPT }) => (
  <div className="idea-card-gpt__actions">
    <button 
      className="idea-card-gpt__action-button" 
      onClick={onPublishOriginal}
    >
      Опубликовать оригинал
    </button>
    <button 
      className="idea-card-gpt__action-button" 
      onClick={onPublishGPT}
    >
      Опубликовать версию GPT
    </button>
    <button 
      className="idea-card-gpt__action-button" 
      onClick={onEditGPT}
    >
      Редактировать версию GPT
    </button>
  </div>
);

export default EditIdeaPageGPT;
