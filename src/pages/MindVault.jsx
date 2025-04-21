import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSection, fetchPosts } from '../store/slices/sectionSlice';

import MindVaultHeader from '../components/UI/MindVaultHeader';
import IdeaCard from '../components/UI/IdeaCard';

import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';

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
      tg.ready();
      tg.expand();
      tg.requestWriteAccess?.();
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
              disabled
            />
            <img
              src={sendIcon}
              alt="Send"
              className="vault-footer__send"
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
              title="Создание постов временно отключено"
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

export default MindVaultPage;
