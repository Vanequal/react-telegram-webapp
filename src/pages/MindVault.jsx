import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSection, fetchPosts } from '../store/slices/sectionSlice';
import { createPost } from '../store/slices/postSlice';

import MindVaultHeader from '../components/UI/MindVaultHeader';

import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';

import IdeaCard from '../components/UI/IdeaCard'; // вынеси отдельно, если нужно

import '../styles/MindVault.scss';

const MindVaultPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [expandedIdeaId, setExpandedIdeaId] = useState(null);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [ideaText, setIdeaText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]); // отображение файлов

  const { posts, loading } = useSelector(state => state.section);
  const { currentUser } = useSelector(state => state.me);

  const themeId = Number(searchParams.get('id')) || 1;
  const sectionKey = 'chat_ideas';

  const attachBtnRef = useRef(null);
  const fileInputMediaRef = useRef(null);
  const fileInputFilesRef = useRef(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.requestWriteAccess?.(); // <--- важно!
    }

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

  const handleSend = () => {
    if (!ideaText.trim() || !currentUser) return;

    dispatch(createPost({
      message_text: ideaText.trim(),
      section: 'Копилка идей',
      author: {
        id: currentUser.id,
        first_name: currentUser.first_name,
        username: currentUser.username,
        lang: currentUser.language_code || 'ru',
      }
    })).then(() => {
      dispatch(fetchPosts({ section_key: sectionKey, theme_id: themeId }));
    });

    setIdeaText('');
    setAttachedFiles([]);
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
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <img src={sendIcon} alt="Send" className="vault-footer__send" onClick={handleSend} />
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

          {/* 👇 Debug-вывод для тестов (можно удалить позже) */}
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
