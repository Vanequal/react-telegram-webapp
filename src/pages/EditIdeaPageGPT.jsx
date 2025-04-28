import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPostPreview, createPost } from '../store/slices/postSlice';

import MindVaultHeader from '../components/UI/MindVaultHeader';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';
import sendIconActive from '../assets/img/sendButtonActive.png';

import '../styles/EditIdeaPageGPT.scss';

const EditIdeaPageGPT = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  const [ideaText, setIdeaText] = useState('');
  const { preview, loading } = useSelector(state => state.post);

  const sectionKey = searchParams.get('section_key') || 'chat_ideas';
  const themeId = Number(searchParams.get('theme_id')) || 1;
  
  const handleSend = () => {
    if (ideaText.trim()) {
      dispatch(createPostPreview({
        section_key: sectionKey,
        theme_id: themeId,
        message_text: ideaText
      }));
    }
  };

  const handlePublish = async (text, publishing_method = 'original') => {
    if (!text) return;
  
    const payload = {
      message_text: text,
      section_key: sectionKey,
      theme_id: themeId,
      publishing_method,
    };

    try {
      await dispatch(createPost(payload)).unwrap();
      navigate('/mindvault');
    } catch (error) {
      console.error('Ошибка публикации:', error);
    }
  };
  
  
  

  return (
    <div className="edit-idea-page-gpt">
      <MindVaultHeader
        onBackClick={() => window.history.back()}
        onDescriptionClick={() => {}}
        hideSectionTitle={true}
        textColor="black"
        bgColor="#EEEFF1"
      />

      <div className="edit-idea-page-gpt__content">
        {!preview ? (
          <p className="edit-idea-page-gpt__empty-message">
            Идей в канале <span className="edit-idea-page-gpt__section-name">{sectionKey}</span> ещё нет.
          </p>
        ) : (
          <div className="idea-card-gpt">
            <p className="idea-card-gpt__label">Оригинал текста:</p>
            <p className="idea-card-gpt__text">{preview.messages?.original_text}</p>
            <p className="idea-card-gpt__label">Улучшенная версия от ИИ:</p>
            <p className="idea-card-gpt__text">{preview.messages?.gpt_text}</p>
          </div>
        )}

        {preview && (
          <div className="idea-card-gpt__actions">
            <button
              className="idea-card-gpt__action-button"
              onClick={() => handlePublish(preview.messages?.original_text, 'original')}
            >
              Опубликовать оригинал
            </button>

            <button
              className="idea-card-gpt__action-button"
              onClick={() => handlePublish(preview.messages?.gpt_text, 'gpt')}
            >
              Опубликовать версию GPT
            </button>

            <button
              className="idea-card-gpt__action-button"
              onClick={() => navigate('/textgpteditpage', { state: { gptText: preview.messages?.gpt_text } })}
            >
              Редактировать версию GPT
            </button>
          </div>
        )}
      </div>

      <div className="vault-footer">
        <img src={skrepkaIcon} alt="Attach" className="vault-footer__icon" />

        <input
          type="text"
          className="vault-footer__input"
          placeholder="Написать заново"
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
        />

        <img
          src={ideaText.trim() ? sendIconActive : sendIcon}
          alt="Send"
          className="vault-footer__send"
          style={{
            opacity: ideaText.trim() ? 1 : 0.5,
            cursor: ideaText.trim() ? 'pointer' : 'not-allowed'
          }}
          title={ideaText.trim() ? 'Готово к отправке' : 'Введите текст'}
          onClick={handleSend}
        />
      </div>
    </div>
  );
};

export default EditIdeaPageGPT;
