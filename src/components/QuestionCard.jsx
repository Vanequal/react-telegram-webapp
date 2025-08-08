// components/QuestionCard.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reactToPost } from '../store/slices/postSlice';
import { getViewedIdeas, markIdeaAsViewed } from '../utils/utils';

// Components
import ImageModal from './ImageModal';
import FileAttachments from './FileAttachments';
import ReactionBadges from './ReactionBadges';

// Icons
import userIcon from '../assets/img/userIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';

// Styles - используем те же стили что и для идей
import '../styles/components/idea-card.scss';

// Constants
const VIEW_THRESHOLD_MS = 30000;
const INTERSECTION_THRESHOLD = 0.75;
const TEXT_EXPAND_THRESHOLD = 160;

const QuestionCard = React.memo(function QuestionCard({
  question,
  onExpand,
  answerCount = 0,
  sectionKey,
  themeId
}) {
  const dispatch = useDispatch();
  const posts = useSelector(state => state.post.posts);
  const answers = useSelector(state => state.post.comments[question.id] || []);
  
  // Local state
  const [expanded, setExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Refs
  const textWrapperRef = useRef(null);
  const cardRef = useRef(null);

  // Derived data
  const currentPost = useMemo(() => posts.find(p => p.id === question.id), [posts, question.id]);
  
  const currentLikes = currentPost?.reactions?.count_likes ?? 
                      currentPost?.likes ?? 
                      question.likes ?? 0;
  
  const currentDislikes = currentPost?.reactions?.count_dislikes ?? 
                         currentPost?.dislikes ?? 
                         question.dislikes ?? 0;
  
  const currentUserReaction = currentPost?.reactions?.user_reaction ?? 
                             currentPost?.user_reaction ?? 
                             question.userReaction ?? null;

  // Files
  const questionFiles = useMemo(() => {
    const rawFiles = question.attachments || 
                     currentPost?.attachments || 
                     question.files || 
                     currentPost?.files || 
                     [];

    if (!rawFiles || rawFiles.length === 0) {
      return [];
    }

    return rawFiles.map((file, index) => ({
      ...file,
      url: file.stored_path || file.url,
      relative_path: file.stored_path || file.relative_path,
      original_name: file.original_name || file.name,
      extension: file.extension || (file.original_name ? 
        file.original_name.split('.').pop().toLowerCase() : ''),
      index: index
    }));
  }, [question.attachments, currentPost?.attachments, question.files, currentPost?.files, question.id]);

  // Check if text needs "Read more" button
  useEffect(() => {
    if (textWrapperRef.current?.scrollHeight > TEXT_EXPAND_THRESHOLD) {
      setShowReadMore(true);
    }
  }, []);

  // View tracking with Intersection Observer
  useEffect(() => {
    const viewed = getViewedIdeas();
    if (viewed[question.id]) return;

    let timer = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            markIdeaAsViewed(question.id);
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
  }, [question.id]);

  // Handlers
  const handleReaction = useCallback((reaction) => {
    dispatch(reactToPost({
      post_id: question.id,
      reaction,
      section_key: sectionKey,
      theme_id: themeId
    }));
  }, [dispatch, question.id, sectionKey, themeId]);

  const handleExpandClick = useCallback(() => setExpanded(true), []);
  const handleCardExpand = useCallback(() => onExpand(question.id), [onExpand, question.id]);
  
  const handleImageClick = useCallback((image) => {
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

  // Определяем количество ответов
  const displayAnswerCount = answers.length || answerCount || 0;

  return (
    <>
      <div className="idea-card question-card" ref={cardRef}>
        {/* Header */}
        <div className="idea-card__top">
          <div className="idea-card__user">
            <img src={userIcon} alt="User" className="idea-card__user-icon" />
            <span className="idea-card__username">
              {question.author?.username || question.username || 'Аноним'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div 
          ref={textWrapperRef} 
          className={`idea-card__text-wrapper ${expanded ? 'expanded' : ''}`}
        >
          <div className="idea-card__text-row">
            <div className="idea-card__text">
              <strong>Вопрос:</strong> {question.text || 'Нет текста'}
            </div>
          </div>
        </div>

        {!expanded && showReadMore && (
          <button className="idea-card__read-more" onClick={handleExpandClick}>
            Читать далее
          </button>
        )}

        {/* File Attachments */}
        {questionFiles?.length > 0 && (
          <div className="idea-card__files">
            <FileAttachments 
              files={questionFiles} 
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
            {formatTimestamp(question.created_at || question.timestamp)}
          </span>
        </div>

        <div className="idea-card__divider" />

        {/* Footer */}
        <div
          className="idea-card__footer"
          onClick={handleCardExpand}
          style={{ cursor: 'pointer' }}
        >
          {/* Показываем avatar stack только если есть ответы */}
          {displayAnswerCount > 0 && (
            <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
          )}
          <span className="idea-card__comments">
            {displayAnswerCount > 0
              ? `${displayAnswerCount} ответов`
              : 'Ответить на вопрос'}
          </span>
          <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
        </div>
      </div>

      {/* Image Modal */}
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

export default QuestionCard;