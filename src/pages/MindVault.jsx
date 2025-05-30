import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// ✅ Используем правильные действия
import { createPostPreview, fetchPostComments, fetchPostsInSection, fetchDownloadUrl } from '../store/slices/postSlice';
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

  const postComments = useSelector(state => state.post.comments);

  const ideas = (Array.isArray(posts) ? posts : []).map(post => {
    const actualComments = postComments[post.id]?.length;
    return {
      id: post.id,
      username: post.author?.first_name || 'Пользователь',
      preview: post.message_text,
      likes: post.likes ?? 0,
      dislikes: post.dislikes ?? 0,
      comments: actualComments ?? post.comments_count ?? 0,
      views: post.views ?? 0,
      pinned: post.pinned ?? false,
      timestamp: post.created_at ?? '',
      files: post.files || []
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
      message_text: post?.message_text || selected.preview
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
    let files = Array.from(e.target.files);
  
    if (files.length > 3) {
      alert('Можно загрузить не более 3 файлов');
      files = files.slice(0, 3);
    }
  
    setAttachedFiles(files);
    console.log("Выбраны файлы:", files);
  };

  const handleSendClick = async () => {
    if (!ideaText.trim()) return;

    try {
      await dispatch(createPostPreview({
        section_id: sectionKey,
        theme_id: themeId,
        text: ideaText.trim()
      })).unwrap();
      
      navigate('/editideapagegpt', {
        state: {
          attachedFiles,
        },
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
        content_type: 'post',
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

function IdeaCard({ idea, onExpand, onArrowClick, isExpanded = false, onCollapse, commentCount = 0 }) {
  const dispatch = useDispatch();
  const comments = useSelector(state => state.post.comments[idea.id] || []); 
  const [expanded, setExpanded] = useState(isExpanded);
  const [showReadMore, setShowReadMore] = useState(false);
  const textWrapperRef = useRef(null);
  const cardRef = useRef(null);
  const fileLinks = useSelector(state => state.post.fileLinks);

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

  useEffect(() => {
    if (!idea.files || idea.files.length === 0) return;
  
    idea.files.forEach(file => {
      const cleanPath = file.relative_path.replace(/\\/g, '/');
      if (!fileLinks[cleanPath]) {
        dispatch(fetchDownloadUrl({ filePath: cleanPath, mimeType: file.mime_type || 'application/octet-stream' }));
      }
    });
  }, [idea.files, fileLinks, dispatch]);  

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
          {idea.files && idea.files.length > 0 && (
            <div className="idea-card__files" style={{ marginTop: '8px' }}>
              <strong style={{ fontSize: '14px' }}>Прикреплённые файлы:</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {idea.files.map((file, i) => {
               const cleanPath = file.relative_path.replace(/\\/g, '/');
               const url = fileLinks[cleanPath];               
                  
                  const ext = file.extension?.toLowerCase() || '';
                  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                  const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);

                  if (isImage) {
                    return (
                      <img
                        key={i}
                        src={url}
                        alt={file.original_name || `image-${i}`}
                        style={{ maxWidth: '100%', borderRadius: '12px' }}
                        onError={(e) => {
                          console.warn(`❌ Не загрузилось изображение: ${url}`);
                          e.target.src = 'https://placehold.co/400x300?text=Изображение+недоступно';
                        }}
                      />
                    );
                  } else if (isVideo) {
                    return (
                      <video
                        key={i}
                        controls
                        src={url}
                        style={{ maxWidth: '100%', borderRadius: '12px' }}
                        onError={(e) => {
                          console.warn(`❌ Не загрузилось видео: ${url}`);
                          const parent = e.target.parentNode;
                          const errorMsg = document.createElement('div');
                          errorMsg.textContent = 'Видео недоступно';
                          errorMsg.style.color = 'red';
                          errorMsg.style.padding = '10px';
                          parent.appendChild(errorMsg);
                        }}
                      />
                    );
                  } else {
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1976D2', wordBreak: 'break-word' }}
                      >
                        {file.original_name || `Файл ${i + 1}`}
                      </a>
                    );
                  }
                })}
              </div>
            </div>
          )}

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

      <div className="idea-card__badges">
        <div
          className="idea-card__badge"
          onClick={() => dispatch(reactToPost({ post_id: idea.id, reaction: 'like' }))}>
          <img src={likeIcon} alt="Like" />
          <span>{idea.likes}</span>
        </div>

        <div
          className="idea-card__badge"
          onClick={() => dispatch(reactToPost({ post_id: idea.id, reaction: 'dislike' }))}>
          <img src={dislikeIcon} alt="Dislike" />
          <span>{idea.dislikes}</span>
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
              <strong>{comment.author?.first_name || 'Аноним'}:</strong> {comment.message_text}
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