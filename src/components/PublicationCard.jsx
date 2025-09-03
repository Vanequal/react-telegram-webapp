// components/PublicationCard.jsx
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

// Styles - используем стили публикаций
import '../styles/PublicationPage.scss';

// Constants
const VIEW_THRESHOLD_MS = 30000;
const INTERSECTION_THRESHOLD = 0.75;

const PublicationCard = React.memo(function PublicationCard({
  publication,
  onExpand,
  commentCount = 0,
  sectionKey,
  themeId
}) {
  const dispatch = useDispatch();
  const posts = useSelector(state => state.post.posts);
  const comments = useSelector(state => state.post.comments[publication.id] || []);

  // Local state
  const [selectedImage, setSelectedImage] = useState(null);

  // Refs
  const cardRef = useRef(null);

  // Derived data
  const currentPost = useMemo(() => posts.find(p => p.id === publication.id), [posts, publication.id]);

  const currentLikes = currentPost?.reactions?.count_likes ??
    currentPost?.likes ??
    publication.likes ?? 0;

  const currentDislikes = currentPost?.reactions?.count_dislikes ??
    currentPost?.dislikes ??
    publication.dislikes ?? 0;

  const currentUserReaction = currentPost?.reactions?.user_reaction ??
    currentPost?.user_reaction ??
    publication.userReaction ?? null;

  // Files
  const publicationFiles = useMemo(() => {
    const rawFiles = publication.attachments ||
      currentPost?.attachments ||
      publication.files ||
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
  }, [publication.attachments, currentPost?.attachments, publication.files, currentPost?.files, publication.id]);

  // View tracking with Intersection Observer
  useEffect(() => {
    const viewed = getViewedIdeas();
    if (viewed[publication.id]) return;

    let timer = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            markIdeaAsViewed(publication.id);
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
  }, [publication.id]);

  // Handlers
  const handleReaction = useCallback((reaction) => {
    dispatch(reactToPost({
      post_id: publication.id,
      reaction,
      section_key: sectionKey,
      theme_id: themeId
    }));
  }, [dispatch, publication.id, sectionKey, themeId]);

  const handleCardExpand = useCallback(() => onExpand(publication.id), [onExpand, publication.id]);

  const handleImageClick = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  const handleImageModalClose = useCallback(() => setSelectedImage(null), []);

  // Определяем количество комментариев
  const displayCommentCount = comments.length || commentCount || 0;

  // Получаем первый файл для отображения (если есть)
  const firstFile = publicationFiles[0];

  const handleFileDownload = useCallback((file) => {
    const BACKEND_BASE_URL = process.env.REACT_APP_API_URL || 'https://adjacent-forth-administrative-diseases.trycloudflare.com';

    let downloadUrl;
    if (file.stored_path) {
      downloadUrl = `${BACKEND_BASE_URL}/api/v1/messages/attachments/${file.stored_path}`;
    } else {
      const encodedFilePath = encodeURIComponent(file.stored_path || file.url || file.relative_path);
      downloadUrl = `${BACKEND_BASE_URL}/api/v1/files/download/{file_url}?url=${encodedFilePath}`;
    }

    // Добавляем обход ngrok для скачивания
    const urlWithBypass = downloadUrl +
      (downloadUrl.includes('?') ? '&' : '?') +
      'ngrok-skip-browser-warning=true';

    window.open(urlWithBypass, '_blank');
  }, []);

  return (
    <>
      <div className="publication-card" ref={cardRef}>
        <div className="publication-card__header">
          <img src={userIcon} alt="User" className="publication-card__avatar" />
          <span className="publication-card__username">
            {publication.author?.username || publication.username || 'Аноним'}
          </span>
        </div>

        {/* File Display - показываем только первый файл */}
        {firstFile && (
          <div className="publication-card__file-wrapper">
            <div className="file-row">
              <div className="file-box" />
              <div className="file-info">
                <span className="file-title">
                  {firstFile.original_name || firstFile.name || 'Файл'}
                </span>
                <span className="file-size">
                  {firstFile.size ? `${Math.round(firstFile.size / 1024)} Кб` : '73.7 Кб'}
                </span>
                <span className="file-link" onClick={() => handleFileDownload(firstFile)}>
                  Открыть файл
                </span>
              </div>
            </div>
          </div>
        )}

        <strong className="publication-card__excerpt-title">Выдержка:</strong>
        <p className="publication-card__excerpt-text">
          {publication.excerpt || publication.text || 'Нет выдержки'}
        </p>

        {/* Reactions */}
        <div className="publication-card__reactions">
          <ReactionBadges
            likes={currentLikes}
            dislikes={currentDislikes}
            userReaction={currentUserReaction}
            onReaction={handleReaction}
          />
        </div>

        <div className="publication-card__divider"></div>

        {/* Footer */}
        <div
          className="publication-card__footer"
          onClick={handleCardExpand}
          style={{ cursor: 'pointer' }}
        >
          {/* Показываем avatar stack только если есть комментарии */}
          {displayCommentCount > 0 && (
            <img src={avatarStack} alt="Avatars" className="publication-card__avatar-stack" />
          )}
          <span className="publication-card__comments">
            {displayCommentCount > 0
              ? `${displayCommentCount} комментариев`
              : 'Комментировать'}
          </span>
          <img src={donatIcon} alt="Donate" className="publication-card__icon-donat" />
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

export default PublicationCard;