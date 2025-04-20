import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSection, fetchPosts } from '../store/slices/sectionSlice';

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

import { RiArrowRightSLine, RiArrowLeftSLine } from 'react-icons/ri';

import '../styles/MindVault.scss';

const IdeaCard = ({ idea, onExpand, onArrowClick, isExpanded, onCollapse }) => {
  const textWrapperRef = useRef(null);

  return (
    <div className={`idea-card ${isExpanded ? 'idea-card--expanded' : ''}`}>
      {isExpanded && (
        <div className="idea-card__back" onClick={onCollapse} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 12 }}>
          <RiArrowLeftSLine size={24} color="#1E88D3" />
          <span style={{ color: '#1E88D3', fontSize: 16 }}>Назад</span>
        </div>
      )}

      <div className="idea-card__top">
        <div className="idea-card__user">
          <img src={userIcon} alt="User" className="idea-card__user-icon" />
          <span className="idea-card__username">{idea.username}</span>
        </div>
        {idea.pinned && <img src={pinIcon} alt="Pin" className="idea-card__pin" />}
      </div>

      <div ref={textWrapperRef} className="idea-card__text-wrapper expanded">
        <div className="idea-card__text">{idea.preview}</div>
      </div>

      <div className="idea-card__actions-container">
        <div className="idea-card__reaction-badges">
          <div className="idea-card__reaction-badge">
            <img src={likeIcon} alt="Like" />
            <span>{idea.likes}</span>
          </div>
          <div className="idea-card__reaction-badge">
            <img src={dislikeIcon} alt="Dislike" />
            <span>{idea.dislikes}</span>
          </div>
        </div>
        <div className="idea-card__timestamp">{idea.timestamp}</div>
      </div>

      <div className="idea-card__divider"></div>

      <div className="idea-card__footer" style={{ cursor: 'pointer' }}>
        <div className="idea-card__footer-left" onClick={() => onExpand(idea.id)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {idea.comments > 0 ? (
            <>
              <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
              <span className="idea-card__comments">{idea.comments} Комментарий</span>
            </>
          ) : (
            <span className="idea-card__comments">Комментировать</span>
          )}
        </div>

        <div className="idea-card__footer-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
          <img src={eyeIcon} alt="Views" className="idea-card__icon-eye" />
          <p style={{ margin: 0, color: 'rgba(193, 198, 201, 1)', fontSize: '14px' }}>{idea.views}</p>
          <RiArrowRightSLine size={24} color="#1E88D3" onClick={(e) => { e.stopPropagation(); onArrowClick(idea.id); }} />
        </div>
      </div>
    </div>
  );
};

const MindVaultPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [expandedIdeaId, setExpandedIdeaId] = useState(null);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const { posts, loading } = useSelector(state => state.section);

  const themeId = Number(searchParams.get('id')) || 1;
  const sectionKey = 'chat_ideas';

  const attachBtnRef = useRef(null);
  const fileInputMediaRef = useRef(null);
  const fileInputFilesRef = useRef(null);

  useEffect(() => {
    dispatch(fetchSection({ section_key: sectionKey, theme_id: themeId }));
    dispatch(fetchPosts({ section_key: sectionKey, theme_id: themeId }));
  }, [dispatch, sectionKey, themeId]);

  const ideas = posts.map(post => ({
    id: post.id,
    username: post.author?.first_name || 'Пользователь',
    preview: post.message_text,
    likes: post.likes ?? 0,
    dislikes: post.dislikes ?? 0,
    comments: post.comments_count ?? 0,
    views: post.views ?? 0,
    pinned: post.pinned ?? false,
    timestamp: post.created_at?.split(' ')[1] ?? '',
  }));

  const handleExpand = (id) => navigate(`/discussion/${id}`);
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
    window.Telegram?.WebApp?.showAttachMenu?.({ media: true });
    setShowPopover(false);
  };

  const handleFileClick = () => {
    window.Telegram?.WebApp?.showAttachMenu?.({ files: true });
    setShowPopover(false);
  };

  const handleFileChange = (e) => {
    console.log("Выбраны файлы:", e.target.files);
  };

  return (
    <>
      <MindVaultHeader
        onDescriptionClick={() => navigate('/aboutpage')}
        onBackClick={() => navigate('/')}
      />

      <div className="mind-vault-page">
        {expandedIdeaId ? (
          <IdeaCard
            idea={ideas.find(i => i.id === expandedIdeaId)}
            onExpand={handleExpand}
            onArrowClick={handleArrowClick}
            isExpanded={true}
            onCollapse={handleCollapse}
          />
        ) : (
          ideas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onExpand={handleExpand}
              onArrowClick={handleArrowClick}
              isExpanded={false}
            />
          ))
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
            />
            <img src={sendIcon} alt="Send" className="vault-footer__send" />
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
        </>
      )}
    </>
  );
};

export default MindVaultPage;
