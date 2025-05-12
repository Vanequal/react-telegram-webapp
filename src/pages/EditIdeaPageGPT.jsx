import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPostPreview, createPost } from '../store/slices/postSlice';

import MindVaultHeader from '../components/UI/MindVaultHeader';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';
import sendIconActive from '../assets/img/sendButtonActive.png';

import '../styles/EditIdeaPageGPT.scss';

const EditIdeaPageGPT = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [attachedFiles, setAttachedFiles] = useState(location.state?.attachedFiles || []);
  const [ideaText, setIdeaText] = useState('');
  const { preview, loading } = useSelector(state => state.post);

  const sectionKey = searchParams.get('section_key') || 'chat_ideas';
  const themeId = Number(searchParams.get('theme_id')) || 1;

  const convertFilesToBase64 = async (files) => {
    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    return Promise.all(promises);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; 
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const convertFilesToBase64List = async (files) => {
    const base64List = [];
    for (const file of files) {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); 
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      base64List.push(base64);
    }
    return base64List;
  };
  

  const handleSend = () => {
    if (ideaText.trim()) {
      dispatch(createPostPreview({
        section_key: sectionKey,
        theme_id: themeId,
        message_text: ideaText,
      }));
    }
  };

  const handlePublish = async (text, publishing_method = 'original') => {
    if (!text) return;
  
    try {
      const base64Files = await convertFilesToBase64List(attachedFiles);
  
      const payload = {
        message_text: text,
        section_key: sectionKey,
        theme_id: themeId,
        files: base64Files,
        publishing_method,
        content_type: 'post',
      };
  
      const actionResult = await dispatch(createPost(payload));
      if (actionResult.meta.requestStatus === 'fulfilled') {
        navigate('/mindvault');
      } else {
        console.warn('Пост создался, но бек вернул ошибку', actionResult.payload);
        navigate('/mindvault');
      }
    } catch (error) {
      console.error('Ошибка публикации:', error);
      navigate('/mindvault');
    }
  };
  

  return (
    <div className="edit-idea-page-gpt">
      <MindVaultHeader
        onBackClick={() => window.history.back()}
        onDescriptionClick={() => { }}
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
            <p className="idea-card-gpt__text">{preview.message_text}</p>
            {attachedFiles.map((file, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`image-${i}`}
                    style={{ maxWidth: '100%', borderRadius: '12px' }}
                  />
                ) : file.type.startsWith('video/') ? (
                  <video
                    controls
                    style={{ maxWidth: '100%', borderRadius: '12px' }}
                    src={URL.createObjectURL(file)}
                  />
                ) : (
                  <a
                    href={URL.createObjectURL(file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1976D2', wordBreak: 'break-word' }}
                  >
                    {file.name}
                  </a>
                )}
              </div>
            ))}
            <p className="idea-card-gpt__label">Улучшенная версия от ИИ:</p>
            <p className="idea-card-gpt__text">{preview.gpt_text}</p>
            {attachedFiles.map((file, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`image-${i}`}
                    style={{ maxWidth: '100%', borderRadius: '12px' }}
                  />
                ) : file.type.startsWith('video/') ? (
                  <video
                    controls
                    style={{ maxWidth: '100%', borderRadius: '12px' }}
                    src={URL.createObjectURL(file)}
                  />
                ) : (
                  <a
                    href={URL.createObjectURL(file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1976D2', wordBreak: 'break-word' }}
                  >
                    {file.name}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {preview && (
          <div className="idea-card-gpt__actions">
            <button
              className="idea-card-gpt__action-button"
              onClick={() => handlePublish(preview.message_text, 'original')}
            >
              Опубликовать оригинал
            </button>

            <button
              className="idea-card-gpt__action-button"
              onClick={() => handlePublish(preview.gpt_text, 'gpt')}
            >
              Опубликовать версию GPT
            </button>

            <button
              className="idea-card-gpt__action-button"
              onClick={() => navigate('/textgpteditpage', { state: { gptText: preview.gpt_text } })}
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
