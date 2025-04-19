import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";

import '../styles/MindVault.scss';

function IdeaCard({ idea, onExpand, onArrowClick, isExpanded, onCollapse }) {
  const [showReadMore, setShowReadMore] = React.useState(false);
  const textWrapperRef = React.useRef(null);

  React.useEffect(() => {
    if (textWrapperRef.current?.scrollHeight > 160) {
      setShowReadMore(true);
    }
  }, []);

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
        <div
          className="idea-card__footer-left"
          onClick={() => onExpand(idea.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {idea.comments > 0 ? (
            <>
              <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
              <span className="idea-card__comments" style={{ textWrap: 'nowrap' }}>{idea.comments} Комментарий</span>
            </>
          ) : (
            <span className="idea-card__comments">Комментировать</span>
          )}
        </div>

        <div className="idea-card__footer-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
          <img src={eyeIcon} alt="Views" className="idea-card__icon-eye" />
          <p style={{ margin: 0, color: 'rgba(193, 198, 201, 1)', fontSize: '14px' }}>{idea.views}</p>
          <RiArrowRightSLine size={24} color="#1E88D3" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onArrowClick(idea.id); }} />
        </div>
      </div>
    </div>
  );
}

const MindVaultPage = () => {
  const navigate = useNavigate();
  const [expandedIdeaId, setExpandedIdeaId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fileInputMediaRef = useRef(null);
  const fileInputFilesRef = useRef(null);

  const ideas = [
    {
      id: 'project',
      username: 'Имя пользователя',
      preview: 'Разработать информационный ресурс  Рroject of Everything on Wiki.',
      likes: 5,
      dislikes: 2,
      comments: 3,
      views: 36,
      pinned: true,
      timestamp: '15:35'
    },
    {
      id: 'bees',
      username: 'Имя пользователя',
      preview: 'Разработать новый вид опылителей-насекомых для теплиц.',
      likes: 2,
      dislikes: 1,
      comments: 0,
      views: 12,
      pinned: false,
      timestamp: '16:10'
    }
  ];

  const handleExpand = (id) => {
    navigate(`/discussion/${id}`);
  };

  const handleArrowClick = (id) => {
    setExpandedIdeaId(id);
  };

  const handleCollapse = () => {
    setExpandedIdeaId(null);
  };

  const handleAttachClick = () => {
    setShowModal(true);
  };

  const handleMediaClick = () => {
    fileInputMediaRef.current?.click();
    setShowModal(false);
  };

  const handleFileClick = () => {
    fileInputFilesRef.current?.click();
    setShowModal(false);
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

          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <p>Что прикрепить?</p>
                <button className="modal-btn" onClick={handleMediaClick}>📷 Медиа (фото/видео)</button>
                <button className="modal-btn" onClick={handleFileClick}>📁 Файл (документы)</button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default MindVaultPage;
