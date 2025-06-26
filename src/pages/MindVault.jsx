import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPostPreview, fetchPostComments, fetchPostsInSection } from '../store/slices/postSlice';
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

  const { posts, loading, error, postsLoaded } = useSelector(state => state.post);
  const postComments = useSelector(state => state.post.comments);
  const commentsLoadingFlags = useSelector(state => state.post.commentsLoadingFlags);

  const themeId = Number(searchParams.get('id')) || 1;
  const sectionKey = 'chat_ideas';

  const fetchParams = useMemo(() => ({
    section_key: sectionKey,
    theme_id: themeId,
    content_type: 'posts'
  }), [sectionKey, themeId]);

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

    // 🔥 ИСПРАВЛЕНО: Загружаем посты только если они еще не загружены
    if (!postsLoaded && !loading) {
      dispatch(fetchPostsInSection(fetchParams));
    }
  }, [dispatch, fetchParams, postsLoaded, loading]);

  useEffect(() => {
    if (posts && posts.length > 0) {
      console.log('📊 Загруженные посты:', posts);
      console.log('📊 Пример структуры первого поста:', posts[0]);
    }
  }, [posts?.length]);

  const ideas = useMemo(() => {
    return (Array.isArray(posts) ? posts : []).map(post => {
      const actualComments = postComments[post.id]?.length;
      return {
        id: post.id,
        username: post.author?.first_name || 'Пользователь',
        preview: post.text,
        likes: post.likes || 0,
        dislikes: post.dislikes || 0,
        comments: actualComments ?? post.comments_count ?? 0,
        views: post.views ?? 0,
        pinned: post.pinned ?? false,
        timestamp: post.created_at ?? '',
        files: post.files || [],
        userReaction: post.user_reaction || null
      };
    });
  }, [posts, postComments]);

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    console.log('🔍 Проверяем необходимость загрузки комментариев для постов:', posts.length);

    posts.forEach(post => {
      const isLoading = commentsLoadingFlags[post.id];
      const hasComments = postComments[post.id];

      // Загружаем комментарии только если они еще не загружены и не загружаются
      if (!isLoading && !hasComments) {
        console.log(`📥 Загружаем комментарии для поста ${post.id}`);

        dispatch(fetchPostComments({
          post_id: post.id,
          section_key: sectionKey,
          theme_id: themeId,
          type: 'post',
        }));
      } else {
        console.log(`⏭️ Пропускаем загрузку комментариев для поста ${post.id}:`, {
          isLoading,
          hasComments: !!hasComments
        });
      }
    });
  }, [posts?.length, dispatch, sectionKey, themeId]);

  const handleExpand = useCallback((id) => {
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
  }, [ideas, posts, navigate]);

  const handleArrowClick = useCallback((id) => setExpandedIdeaId(id), []);
  const handleCollapse = useCallback(() => setExpandedIdeaId(null), []);

  const handleAttachClick = useCallback(() => {
    if (attachBtnRef.current) {
      const rect = attachBtnRef.current.getBoundingClientRect();
      setPopoverPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
      setShowPopover(true);
    }
  }, []);

  const handleMediaClick = useCallback(() => {
    const tg = window.Telegram?.WebApp;
    const used = tg?.showAttachMenu?.({ media: true });
    if (!used) {
      fileInputMediaRef.current?.click();
    }
    setShowPopover(false);
  }, []);

  const handleFileClick = useCallback(() => {
    const tg = window.Telegram?.WebApp;
    const used = tg?.showAttachMenu?.({ files: true });
    if (!used) {
      fileInputFilesRef.current?.click();
    }
    setShowPopover(false);
  }, []);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(files);
  }, []);

  const handleSendClick = useCallback(async () => {
    if (!ideaText.trim()) return;

    try {
      if (attachedFiles.length > 0) {
        // Если есть файлы - создаем пост напрямую
        const result = await dispatch(createPost({
          message_text: ideaText.trim(),
          section_id: sectionKey,
          theme_id: themeId,
          publishing_method: 'original',
          files: attachedFiles
        })).unwrap();

        console.log('✅ Пост с файлами создан:', result);

        // Очищаем форму
        setIdeaText('');
        setAttachedFiles([]);

        // Перезагружаем посты
        dispatch(fetchPostsInSection({
          section_key: sectionKey,
          theme_id: themeId
        }));

      } else {
        // Если нет файлов - создаем превью для AI обработки
        const previewResult = await dispatch(createPostPreview({
          section_id: sectionKey,
          theme_id: themeId,
          text: ideaText.trim()
        })).unwrap();

        navigate('/editideapagegpt', {
          state: {
            attachedFiles: [],
            preview: previewResult
          }
        });
      }
    } catch (error) {
      console.error('Ошибка создания поста/предпросмотра:', error);
    }
  }, [ideaText, dispatch, sectionKey, themeId, navigate, attachedFiles]);

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

// Компонент для отображения изображения в полном размере
const ImageModal = React.memo(({ src, alt, onClose }) => {
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={handleBackdropClick}
    >
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            zIndex: 1001
          }}
        >
          ×
        </button>
        <img
          src={src}
          alt={alt}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
      </div>
    </div>
  );
});

const IdeaCard = React.memo(function IdeaCard({
  idea,
  onExpand,
  onArrowClick,
  isExpanded = false,
  onCollapse,
  commentCount = 0,
  sectionKey,
  themeId
}) {
  const dispatch = useDispatch();
  const comments = useSelector(state => state.post.comments[idea.id] || []);
  const [expanded, setExpanded] = useState(isExpanded);
  const [showReadMore, setShowReadMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const textWrapperRef = useRef(null);
  const cardRef = useRef(null);

  const posts = useSelector(state => state.post.posts);
  const currentPost = useMemo(() => posts.find(p => p.id === idea.id), [posts, idea.id]);

  const currentLikes = currentPost?.likes ?? idea.likes ?? 0;
  const currentDislikes = currentPost?.dislikes ?? idea.dislikes ?? 0;
  const currentUserReaction = currentPost?.user_reaction ?? idea.userReaction ?? null;

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
  }, [idea.id]);

  const handleReaction = useCallback((reaction) => {
    dispatch(reactToPost({
      post_id: idea.id,
      reaction,
      section_id: sectionKey,
      theme_id: themeId
    }));
  }, [dispatch, idea.id, sectionKey, themeId]);

  const renderFiles = useMemo(() => {
    if (!idea.files || idea.files.length === 0) return null;

    const BACKEND_BASE_URL = process.env.REACT_APP_API_URL || 'https://trembl-quarterly-sector-t.trycloudflare.com';

    const images = [];
    const otherFiles = [];

    idea.files.forEach((file, index) => {
      if (!file.url && !file.relative_path) return;

      const fileAbsolutePath = file.url;
      if (!fileAbsolutePath) return;

      const encodedFilePath = encodeURIComponent(fileAbsolutePath);
      const downloadUrl = `${BACKEND_BASE_URL}/api/v1/files/download/{file_url}?url=${encodedFilePath}`;

      const ext = (file.extension || '').toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
      const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);

      if (isImage) {
        images.push({ ...file, downloadUrl, index, alt: file.original_name || `image-${index}` });
      } else {
        otherFiles.push({ ...file, downloadUrl, index, isVideo, ext });
      }
    });

    return (
      <div className="idea-card__files" style={{ marginTop: '12px', paddingBottom: '12px' }}>
        {images.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            marginBottom: otherFiles.length > 0 ? '12px' : '0'
          }}>
            {images.map((image) => (
              <div
                key={image.index}
                onClick={() => setSelectedImage(image)}
                style={{
                  width: '100%',
                  height: '120px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid #e0e0e0',
                  position: 'relative',
                  backgroundColor: '#f5f5f5'
                }}
              >
                <img
                  src={image.downloadUrl}
                  alt={image.alt}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </div>
        )}

        {otherFiles.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {otherFiles.map((file) => (
              <a
                key={file.index}
                href={file.downloadUrl}
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
                  border: '1px solid #e0e0e0',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              >
                {file.isVideo ? '🎥' : '📎'} {file.original_name || `${file.isVideo ? 'Видео' : 'Файл'} ${file.index + 1}`}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }, [idea.files]);

  const handleExpandClick = useCallback(() => setExpanded(true), []);
  const handleCardExpand = useCallback(() => onExpand(idea.id), [onExpand, idea.id]);

  return (
    <>
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
          </div>
        </div>

        {!expanded && showReadMore && (
          <button className="idea-card__read-more" onClick={handleExpandClick}>
            Читать далее
          </button>
        )}

        {renderFiles}

        {/* Обновленная секция с реакциями в стиле DiscussionPage */}
        <div className="idea-card__actions-container">
          <div className="idea-card__reaction-badges">
            <div
              className="idea-card__reaction-badge"
              onClick={() => handleReaction('like')}
              style={{
                cursor: 'pointer',
                backgroundColor: currentUserReaction === 'like' ? '#E1EFFF' : '#E1EFFF',
                opacity: currentUserReaction === 'like' ? 1 : 0.7
              }}
            >
              <img src={likeIcon} alt="Like" />
              <span>{currentLikes}</span>
            </div>

            <div
              className="idea-card__reaction-badge"
              onClick={() => handleReaction('dislike')}
              style={{
                cursor: 'pointer',
                backgroundColor: currentUserReaction === 'dislike' ? '#FFE1E1' : '#E1EFFF',
                opacity: currentUserReaction === 'dislike' ? 1 : 0.7
              }}
            >
              <img src={dislikeIcon} alt="Dislike" />
              <span>{currentDislikes}</span>
            </div>
          </div>

          <span className="idea-card__timestamp">
            {new Date(idea.timestamp).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        <div className="idea-card__divider" />

        <div
          className="idea-card__footer"
          onClick={handleCardExpand}
          style={{ cursor: 'pointer' }}
        >
          <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
          <span className="idea-card__comments">
            {comments.length > 0
              ? `${comments.length} комментариев`
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

      {selectedImage && (
        <ImageModal
          src={selectedImage.downloadUrl}
          alt={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
});

export default MindVaultPage;