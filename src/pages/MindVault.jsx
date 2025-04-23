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

  const { posts, loading, data: section } = useSelector(state => state.section);
  const localeTexts = section?.locale_texts;
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

    dispatch(fetchSection({ section_key: sectionKey, theme_id: themeId }));
    dispatch(fetchPosts({ section_key: sectionKey, theme_id: themeId }));
  }, [dispatch, sectionKey, themeId]);

  const ideas = (Array.isArray(posts) ? posts : []).map(post => ({
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
    const used = window.Telegram?.WebApp?.showAttachMenu?.({ media: true });
    if (!used) fileInputMediaRef.current?.click();
    setShowPopover(false);
  };

  const handleFileClick = () => {
    const used = window.Telegram?.WebApp?.showAttachMenu?.({ files: true });
    if (!used) fileInputFilesRef.current?.click();
    setShowPopover(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(files);
    console.log("Выбраны файлы:", files);
  };

  const handleSendClick = () => {
    if (ideaText.trim()) {
      navigate('/editideapagegpt');
    }
  };

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

        {!loading && ideas.length === 0 && (
          <p className="mind-vault-header__description" style={{ textAlign: 'center', padding: '1rem', color: 'gray' }}>
            {localeTexts?.messages?.empty_section || 'Идей пока нет'}
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
              placeholder={localeTexts?.inputs?.message || 'Добавить идею'}
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

function IdeaCard({ idea, onExpand, onArrowClick, isExpanded = false, onCollapse }) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [showReadMore, setShowReadMore] = useState(false);
  const textWrapperRef = useRef(null);

  useEffect(() => {
    if (textWrapperRef.current?.scrollHeight > 160) {
      setShowReadMore(true);
    }
  }, []);

  useEffect(() => {
    setExpanded(isExpanded);
  }, [isExpanded]);

  return (
    <div className="idea-card">
      <div className="idea-card__top">
        <div className="idea-card__user">
          <img src={userIcon} alt="User" className="idea-card__user-icon" />
          <span className="idea-card__username">{idea.username}</span>
        </div>
        {idea.pinned && <img src={pinIcon} alt="Pin" className="idea-card__pin" />}
      </div>

      <div ref={textWrapperRef} className={`idea-card__text-wrapper ${expanded ? 'expanded' : ''}`}>
        <div className="idea-card__text">{idea.preview}</div>
      </div>

      {!expanded && showReadMore && (
        <button className="idea-card__read-more" onClick={() => setExpanded(true)}>Читать далее</button>
      )}

      <div className="idea-card__badges">
        <div className="idea-card__badge"><img src={likeIcon} alt="Like" /><span>{idea.likes}</span></div>
        <div className="idea-card__badge"><img src={dislikeIcon} alt="Dislike" /><span>{idea.dislikes}</span></div>
      </div>

      <div className="idea-card__divider" />

      {idea.comments > 0 && (
        <div className="idea-card__footer" onClick={() => onExpand(idea.id)} style={{ cursor: 'pointer' }}>
          <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
          <span className="idea-card__comments">{idea.comments} комментариев</span>
          <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
          <img src={eyeIcon} alt="Views" className="idea-card__icon-eye" />
          <p style={{ margin: 0, color: 'rgba(193, 198, 201, 1)', fontSize: '14px' }}>{idea.views}</p>
          <span className="idea-card__timestamp">{idea.timestamp}</span>
        </div>
      )}

      {isExpanded && (
        <button className="idea-card__collapse" onClick={onCollapse}>Свернуть</button>
      )}
    </div>
  );
}

export default MindVaultPage;
