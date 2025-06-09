import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPostPreview, fetchPostComments, fetchPostsInSection, fetchDownloadUrl, setAttachedFiles } from '../store/slices/postSlice';
import { reactToPost } from '../store/slices/postSlice';
import { getViewedIdeas, markIdeaAsViewed } from '../utils/utils.js';

import MindVaultHeader from '../components/UI/MindVaultHeader';

import userIcon from '../assets/img/userIcon.webp';
import pinIcon from '../assets/img/pinIcon.webp';
import likeIcon from '../assets/img/likeIcon.webp';
import dislikeIcon from '../assets/img/dislikeIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';
import sendIconActive from '../assets/img/sendButtonActive.png';

import '../styles/MindVault.scss';

const MindVaultPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [expandedIdeaId, setExpandedIdeaId] = useState(null);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [ideaText, setIdeaText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);

  const attachBtnRef = useRef(null);
  const fileInputMediaRef = useRef(null);
  const fileInputFilesRef = useRef(null);

  // ✅ Используем состояние из postSlice
  const { posts, loading, error } = useSelector(state => state.post);

  const themeId = Number(searchParams.get('id')) || 1;
  const sectionKey = 'chat_ideas';

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        tg.requestWriteAccess?.();
      } catch (err) {
        console.warn('[Telegram WebApp] requestWriteAccess is not supported:', err.message);
      }
    }

    // ✅ Используем правильное действие для загрузки постов
    dispatch(fetchPostsInSection({
      section_key: sectionKey,
      theme_id: themeId,
      content_type: 'posts'
    }));
  }, [dispatch, sectionKey, themeId]);

  // Добавляем отладочный вывод
  useEffect(() => {
    if (posts && posts.length > 0) {
      console.log('📊 Загруженные посты:', posts);
      console.log('📊 Пример структуры первого поста:', posts[0]);
    }
  }, [posts]);

  const postComments = useSelector(state => state.post.comments);

  const ideas = (Array.isArray(posts) ? posts : []).map(post => {
    const actualComments = postComments[post.id]?.length;
    return {
      id: post.id,
      username: post.author?.first_name || 'Пользователь',
      preview: post.text,
      // Проверяем разные возможные поля для лайков/дислайков
      likes: post.likes || post.count_likes || post.reactions?.likes || 0,
      dislikes: post.dislikes || post.count_dislikes || post.reactions?.dislikes || 0,
      comments: actualComments ?? post.comments_count ?? 0,
      views: post.views ?? 0,
      pinned: post.pinned ?? false,
      timestamp: post.created_at ?? '',
      files: post.files || [],
      // Добавляем реакцию пользователя
      userReaction: post.user_reaction || null
    };
  });

  const handleExpand = (id) => {
    const viewed = getViewedIdeas();
    if (!viewed[id]) {
      markIdeaAsViewed(id);
      const updated = ideas.map(i => i.id === id ? { ...i, views: i.views + 1 } : i);
    }
    const selected = ideas.find(i => i.id === id);
    const post = posts.find(p => p.id === id);
    const ideaWithText = {
      ...selected,
      message_text: post?.text || selected.preview
    };
    navigate(`/discussion/${id}`, { state: { idea: ideaWithText } });
  };

  const handleArrowClick = (id) => setExpandedIdeaId(id);
  const handleCollapse = () => setExpandedIdeaId(null);

  const handleAttachClick = () => {
    if (attachBtnRef.current) {
      const rect = attachBtnRef.current.getBoundingClientRect();
      setPopoverPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
      setShowPopover(true);
    }
  };

  const handleMediaClick = () => {
    const tg = window.Telegram?.WebApp;
    const used = tg?.showAttachMenu?.({ media: true });
    if (!used) {
      fileInputMediaRef.current?.click();
    }
    setShowPopover(false);
  };

  const handleFileClick = () => {
    const tg = window.Telegram?.WebApp;
    const used = tg?.showAttachMenu?.({ files: true });
    if (!used) {
      fileInputFilesRef.current?.click();
    }
    setShowPopover(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(files);
  };

  const handleSendClick = async () => {
    if (!ideaText.trim()) return;

    try {
      const previewResult = await dispatch(createPostPreview({
        section_id: sectionKey,
        theme_id: themeId,
        text: ideaText.trim()
      })).unwrap();
  
      navigate('/editideapagegpt', { 
        state: { 
          attachedFiles: attachedFiles,
          preview: previewResult 
        } 
      });
    } catch (error) {
      console.error('Ошибка предпросмотра:', error);
    }
  };

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    posts.forEach(post => {
      dispatch(fetchPostComments({
        post_id: post.id,
        section_key: sectionKey,
        theme_id: themeId,
        type: 'post',
      }));
    });
  }, [posts, dispatch, sectionKey, themeId]);

  return (
    <>
      <MindVaultHeader
        onDescriptionClick={() => navigate('/aboutpage')}
        onBackClick={() => navigate('/')}
        textColor={'black'}
        bgColor={'#EEEFF1'}
      />

      <div className="mind-vault-page">
        {expandedIdeaId ? (
          <IdeaCard
            idea={ideas.find(i => i.id === expandedIdeaId)}
            onExpand={handleExpand}
            commentCount={ideas.find(i => i.id === expandedIdeaId)?.comments || 0}
            onArrowClick={handleArrowClick}
            isExpanded={true}
            onCollapse={handleCollapse}
            sectionKey={sectionKey}
            themeId={themeId}
          />
        ) : (
          ideas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              commentCount={idea.comments}
              onExpand={handleExpand}
              onArrowClick={handleArrowClick}
              isExpanded={false}
              sectionKey={sectionKey}
              themeId={themeId}
            />
          ))
        )}

        {!loading && ideas.length === 0 && (
          <p className="mind-vault-header__description" style={{ textAlign: 'center', padding: '1rem', color: 'gray' }}>
            Идей пока нет
          </p>
        )}

        {error && (
          <p style={{ textAlign: 'center', padding: '1rem', color: 'red' }}>
            Ошибка загрузки: {error}
          </p>
        )}
      </div>

      {!expandedIdeaId && (
        <>
          <div className="vault-footer">
            <img
              src={skrepkaIcon}
              alt="Attach"
              className="vault-footer__icon"
              onClick={handleAttachClick}
              ref={attachBtnRef}
            />
            <input
              type="file"
              ref={fileInputMediaRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,video/*"
              multiple
            />
            <input
              type="file"
              ref={fileInputFilesRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt"
              multiple
            />
            <input
              type="text"
              className="vault-footer__input"
              placeholder="Добавить идею"
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
              onClick={handleSendClick}
              title={ideaText.trim() ? 'Отправить идею' : 'Создание постов временно отключено'}
            />
          </div>

          {showPopover && (
            <div
              className="popover-menu"
              style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
              onMouseLeave={() => setShowPopover(false)}
            >
              <button className="popover-btn" onClick={handleMediaClick}>📷 Медиа</button>
              <button className="popover-btn" onClick={handleFileClick}>📁 Файл</button>
            </div>
          )}

          {attachedFiles.length > 0 && (
            <div style={{ padding: '10px', color: 'white' }}>
              <strong>Вы прикрепили:</strong>
              <ul>
                {attachedFiles.map((file, i) => (
                  <li key={i}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );
};

function IdeaCard({ idea, onExpand, onArrowClick, isExpanded = false, onCollapse, commentCount = 0, sectionKey, themeId }) {
  const dispatch = useDispatch();
  const comments = useSelector(state => state.post.comments[idea.id] || []);
  const [expanded, setExpanded] = useState(isExpanded);
  const [showReadMore, setShowReadMore] = useState(false);
  const textWrapperRef = useRef(null);
  const cardRef = useRef(null);
  
  // Получаем актуальные данные поста из Redux
  const posts = useSelector(state => state.post.posts);
  const currentPost = posts.find(p => p.id === idea.id);
  
  // Используем актуальные значения из Redux или из idea
  const currentLikes = currentPost?.likes ?? idea.likes;
  const currentDislikes = currentPost?.dislikes ?? idea.dislikes;

  useEffect(() => {
    if (textWrapperRef.current?.scrollHeight > 160) {
      setShowReadMore(true);
    }
  }, []);

  useEffect(() => {
    const viewed = getViewedIdeas();
    if (viewed[idea.id]) return;

    let timer = null;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        timer = setTimeout(() => {
          markIdeaAsViewed(idea.id);
          idea.views += 1;
        }, 30000);
      } else {
        clearTimeout(timer);
      }
    }, {
      threshold: 0.75,
    });

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, [idea]);

  // Убираем useEffect для загрузки файлов - теперь формируем URL напрямую

  // ✅ Обработчик реакций с новыми параметрами
  const handleReaction = (reaction) => {
    dispatch(reactToPost({ 
      post_id: idea.id, 
      reaction,
      section_id: sectionKey,
      theme_id: themeId
    }));
  };

  return (
    <div className="idea-card" ref={cardRef}>
      <div className="idea-card__top">
        <div className="idea-card__user">
          <img src={userIcon} alt="User" className="idea-card__user-icon" />
          <span className="idea-card__username">{idea.username}</span>
        </div>
        {idea.pinned && <img src={pinIcon} alt="Pin" className="idea-card__pin" />}
      </div>

      <div ref={textWrapperRef} className={`idea-card__text-wrapper ${expanded ? 'expanded' : ''}`}>
        <div className="idea-card__text-row">
          <div className="idea-card__text">{idea.preview}</div>
          
          <span className="idea-card__timestamp">
            {new Date(idea.timestamp).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {!expanded && showReadMore && (
        <button className="idea-card__read-more" onClick={() => setExpanded(true)}>Читать далее</button>
      )}

      {/* ✅ Отображение файлов под текстом */}

{/* ✅ Отображение файлов под текстом */}
{idea.files && idea.files.length > 0 && (
  <div className="idea-card__files" style={{ marginTop: '12px', paddingBottom: '12px' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {idea.files.map((file, i) => {
        if (!file.url && !file.relative_path) {
          return null;
        }

        const BACKEND_BASE_URL = process.env.REACT_APP_API_URL || 'https://b538-109-75-62-2.ngrok-free.app';
        const fileAbsolutePath = file.url;
        
        if (!fileAbsolutePath) {
          return null;
        }
        
        const encodedFilePath = encodeURIComponent(fileAbsolutePath);
        const downloadUrl = `${BACKEND_BASE_URL}/api/v1/files/download/{file_url}?url=${encodedFilePath}`;

        const ext = (file.extension || '').toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);

        if (isImage) {
          return (
            <a 
              key={i} 
              href={downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-block',
                maxWidth: '200px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e0e0e0'
              }}
            >
              <img
                src={downloadUrl}
                alt={file.original_name || `image-${i}`}
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  display: 'block'
                }}
              />
            </a>
          );
        } else if (isVideo) {
          return (
            <a 
              key={i}
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#1976D2',
                fontSize: '14px',
                border: '1px solid #e0e0e0'
              }}
            >
              🎥 {file.original_name || `Видео ${i + 1}`}
            </a>
          );
        } else {
          return (
            <a
              key={i}
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={file.original_name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#1976D2',
                fontSize: '14px',
                border: '1px solid #e0e0e0'
              }}
            >
              📎 {file.original_name || `Файл ${i + 1}`}
            </a>
          );
        }
      })}
    </div>
  </div>
)}

      <div className="idea-card__badges" style={{ 
        display: 'flex', 
        gap: '16px', 
        marginTop: '12px',
        marginBottom: '12px' 
      }}>
        <div
          className="idea-card__badge"
          onClick={() => handleReaction('like')}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}>
          <img src={likeIcon} alt="Like" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{currentLikes}</span>
        </div>

        <div
          className="idea-card__badge"
          onClick={() => handleReaction('dislike')}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}>
          <img src={dislikeIcon} alt="Dislike" style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{currentDislikes}</span>
        </div>
      </div>

      <div className="idea-card__divider" />

      <div
        className="idea-card__footer"
        onClick={() => onExpand(idea.id)}
        style={{ cursor: 'pointer' }}
      >
        <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
        <span className="idea-card__comments">
          {commentCount > 0
            ? `${commentCount} комментариев`
            : 'Прокомментировать'}
        </span>
        <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
        <img src={eyeIcon} alt="Views" className="idea-card__icon-eye" />
        <p style={{ margin: 0, color: 'rgba(193, 198, 201, 1)', fontSize: '14px' }}>{idea.views}</p>
      </div>

      {expanded && comments.length > 0 && (
        <div className="idea-card__comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="idea-card__comment">
              <strong>{comment.author?.first_name || 'Аноним'}:</strong> {comment.text}
            </div>
          ))}
        </div>
      )}

      {isExpanded && (
        <button className="idea-card__collapse" onClick={onCollapse}>Свернуть</button>
      )}
    </div>
  );
}

export default MindVaultPage;