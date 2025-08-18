// components/PublicationDisplayCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import ReactionBadges from './ReactionBadges';
import FileAttachments from './FileAttachments';
import userIcon from '../assets/img/userIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';

const PublicationDisplayCard = ({ publication, onReaction }) => {
  // Получаем актуальные данные из Redux
  const posts = useSelector(state => state.post.posts);
  const currentPost = posts.find(p => p.id === publication.id);
  const comments = useSelector(state => state.post.comments[publication.id] || []);

  // Используем актуальные данные из Redux или fallback на переданные
  const currentLikes = currentPost?.reactions?.count_likes ??
    currentPost?.likes ??
    publication.likes ?? 0;

  const currentDislikes = currentPost?.reactions?.count_dislikes ??
    currentPost?.dislikes ??
    publication.dislikes ?? 0;

  const currentUserReaction = currentPost?.reactions?.user_reaction ??
    currentPost?.user_reaction ??
    publication.userReaction ?? null;

  // Файлы (если есть)
  const publicationFiles = publication.attachments || currentPost?.attachments || [];

  // Получаем первый файл для отображения
  const firstFile = publicationFiles[0];

  const handleFileDownload = useCallback((file) => {
    const BACKEND_BASE_URL = process.env.REACT_APP_API_URL || 'https://tight-guarantees-discs-announcement.trycloudflare.com';

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
    <div className="publication-card">
      <div className="publication-card__header">
        <img src={userIcon} alt="User" className="publication-card__avatar" />
        <span className="publication-card__username">
          {publication.author?.first_name || publication.username || 'Имя пользователя'}
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
                {firstFile.size ? `${Math.round(firstFile.size / 1024)} Кб` : '0 Кб'}
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
        {publication.excerpt || publication.text || publication.message_text || 'Нет выдержки'}
      </p>

      <div className="publication-card__reactions">
        <ReactionBadges
          likes={currentLikes}
          dislikes={currentDislikes}
          userReaction={currentUserReaction}
          onReaction={onReaction}
          readOnly={false}
        />
      </div>

      <div className="publication-card__divider"></div>

      <div className="publication-card__footer">
        <img src={avatarStack} alt="Avatars" className="publication-card__avatar-stack" />
        <span className="publication-card__comments">
          {comments.length || publication.comments || 0} Комментариев
        </span>
        <img src={donatIcon} alt="Donate" className="publication-card__icon-donat" />
      </div>
    </div>
  );
};

PublicationDisplayCard.propTypes = {
  publication: PropTypes.shape({
    id: PropTypes.number,
    excerpt: PropTypes.string,
    text: PropTypes.string,
    message_text: PropTypes.string,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
    userReaction: PropTypes.string,
    views: PropTypes.number,
    comments: PropTypes.number,
    attachments: PropTypes.array,
    author: PropTypes.object,
    username: PropTypes.string
  }).isRequired,
  onReaction: PropTypes.func.isRequired
};

export default PublicationDisplayCard;