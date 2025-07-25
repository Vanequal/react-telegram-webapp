// components/IdeaCard.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reactToPost } from '../store/slices/postSlice';
import { getViewedIdeas, markIdeaAsViewed } from '../utils/utils';

// Components
import ImageModal from './ImageModal';
import FileAttachments from './FileAttachments';
import ReactionBadges from './ReactionBadges';
import CommentsList from './CommentsList';

// Icons
import userIcon from '../assets/img/userIcon.webp';
import pinIcon from '../assets/img/pinIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';

// Styles
import '../styles/components/idea-card.scss';

// Constants
const VIEW_THRESHOLD_MS = 30000;
const INTERSECTION_THRESHOLD = 0.75;
const TEXT_EXPAND_THRESHOLD = 160;

const IdeaCard = React.memo(function IdeaCard({
  idea,
  onExpand,
  isExpanded = false,
  onCollapse,
  commentCount = 0,
  sectionKey,
  themeId
}) {
  const dispatch = useDispatch();
  const posts = useSelector(state => state.post.posts);
  const comments = useSelector(state => state.post.comments[idea.id] || []);
  
  // Local state
  const [expanded, setExpanded] = useState(isExpanded);
  const [showReadMore, setShowReadMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Refs
  const textWrapperRef = useRef(null);
  const cardRef = useRef(null);

  // Derived data - обновляем для новой структуры API
  const currentPost = useMemo(() => posts.find(p => p.id === idea.id), [posts, idea.id]);
  
  // Получаем данные реакций из разных источников для совместимости
  const currentLikes = currentPost?.reactions?.count_likes ?? 
                      currentPost?.likes ?? 
                      idea.likes ?? 0;
  
  const currentDislikes = currentPost?.reactions?.count_dislikes ?? 
                         currentPost?.dislikes ?? 
                         idea.dislikes ?? 0;
  
  const currentUserReaction = currentPost?.reactions?.user_reaction ?? 
                             currentPost?.user_reaction ?? 
                             idea.userReaction ?? null;

  // Правильно извлекаем файлы из новой структуры API
  const ideaFiles = useMemo(() => {
    // Проверяем разные источники файлов для совместимости
    const rawFiles = idea.attachments || 
                     currentPost?.attachments || 
                     idea.files || 
                     currentPost?.files || 
                     [];

    console.log('📁 IdeaCard - Обработка файлов для поста:', {
      postId: idea.id,
      rawFiles: rawFiles,
      rawFilesLength: rawFiles.length,
      ideaHasAttachments: !!idea.attachments,
      currentPostHasAttachments: !!currentPost?.attachments,
      ideaHasFiles: !!idea.files,
      currentPostHasFiles: !!currentPost?.files
    });

    if (!rawFiles || rawFiles.length === 0) {
      console.log('📁 IdeaCard - Нет файлов для обработки');
      return [];
    }

    // Возвращаем файлы в том формате, который ожидает FileAttachments
    const processedFiles = rawFiles.map((file, index) => ({
      // Сохраняем оригинальную структуру
      ...file,
      // Добавляем поля для совместимости со старым FileAttachments
      url: file.stored_path || file.url,
      relative_path: file.stored_path || file.relative_path,
      original_name: file.original_name || file.name,
      extension: file.extension || (file.original_name ? 
        file.original_name.split('.').pop().toLowerCase() : ''),
      // Индекс для ключей
      index: index
    }));

    console.log('📁 IdeaCard - Обработанные файлы:', processedFiles);
    return processedFiles;
  }, [idea.attachments, currentPost?.attachments, idea.files, currentPost?.files, idea.id]);

  // Check if text needs "Read more" button
  useEffect(() => {
    if (textWrapperRef.current?.scrollHeight > TEXT_EXPAND_THRESHOLD) {
      setShowReadMore(true);
    }
  }, []);

  // View tracking with Intersection Observer
  useEffect(() => {
    const viewed = getViewedIdeas();
    if (viewed[idea.id]) return;

    let timer = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            markIdeaAsViewed(idea.id);
          }, VIEW_THRESHOLD_MS);
        } else {
          clearTimeout(timer);
        }
      },
      { threshold: INTERSECTION_THRESHOLD }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [idea.id]);

  // Handlers
  const handleReaction = useCallback((reaction) => {
    dispatch(reactToPost({
      post_id: idea.id,
      reaction,
      section_key: sectionKey,
      theme_id: themeId
    }));
  }, [dispatch, idea.id, sectionKey, themeId]);

  const handleExpandClick = useCallback(() => setExpanded(true), []);
  const handleCardExpand = useCallback(() => onExpand(idea.id), [onExpand, idea.id]);
  
  // Упрощаем обработку клика по изображению - используем уже загруженный src
  const handleImageClick = useCallback((image) => {
    console.log('🖼️ Клик по изображению:', image);
    setSelectedImage(image);
  }, []);
  
  const handleImageModalClose = useCallback(() => setSelectedImage(null), []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      return new Date(timestamp).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting timestamp:', timestamp);
      return '';
    }
  };

  // Определяем количество комментариев
  const displayCommentCount = comments.length || commentCount || 0;

  return (
    <>
      <div className="idea-card" ref={cardRef}>
        {/* Header */}
        <div className="idea-card__top">
          <div className="idea-card__user">
            <img src={userIcon} alt="User" className="idea-card__user-icon" />
            <span className="idea-card__username">
              {idea.author?.username || idea.username || 'Аноним'}
            </span>
          </div>
          {idea.pinned && <img src={pinIcon} alt="Pin" className="idea-card__pin" />}
        </div>

        {/* Content */}
        <div 
          ref={textWrapperRef} 
          className={`idea-card__text-wrapper ${expanded ? 'expanded' : ''}`}
        >
          <div className="idea-card__text-row">
            <div className="idea-card__text">
              {idea.text || idea.preview || idea.content || 'Нет текста'}
            </div>
          </div>
        </div>

        {!expanded && showReadMore && (
          <button className="idea-card__read-more" onClick={handleExpandClick}>
            Читать далее
          </button>
        )}

        {/* File Attachments */}
        {ideaFiles?.length > 0 && (
          <div className="idea-card__files">
            <FileAttachments 
              files={ideaFiles} 
              onImageClick={handleImageClick}
            />
          </div>
        )}

        {/* Reactions */}
        <div className="idea-card__actions-container">
          <ReactionBadges
            likes={currentLikes}
            dislikes={currentDislikes}
            userReaction={currentUserReaction}
            onReaction={handleReaction}
          />
          <span className="idea-card__timestamp">
            {formatTimestamp(idea.created_at || idea.timestamp)}
          </span>
        </div>

        <div className="idea-card__divider" />

        {/* Footer */}
        <div
          className="idea-card__footer"
          onClick={handleCardExpand}
          style={{ cursor: 'pointer' }}
        >
          {/* Показываем avatar stack только если есть комментарии */}
          {displayCommentCount > 0 && (
            <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
          )}
          <span className="idea-card__comments">
            {displayCommentCount > 0
              ? `${displayCommentCount} комментариев`
              : 'Прокомментировать'}
          </span>
          <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
        </div>

        {/* Comments List (when expanded) */}
        {expanded && comments.length > 0 && (
          <CommentsList comments={comments} />
        )}

        {/* Collapse Button */}
        {isExpanded && (
          <button className="idea-card__collapse" onClick={onCollapse}>
            Свернуть
          </button>
        )}
      </div>

      {/* Image Modal - используем тот же src что был в миниатюре */}
      {selectedImage && (
        <ImageModal
          src={selectedImage.src || selectedImage.downloadUrl || selectedImage.url}
          alt={selectedImage.alt || selectedImage.original_name || selectedImage.name}
          onClose={handleImageModalClose}
        />
      )}
    </>
  );
});

export default IdeaCard;