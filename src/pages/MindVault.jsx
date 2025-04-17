// MindVaultPage.jsx

import React from 'react';
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

import { RiArrowRightSLine } from "react-icons/ri";

import '../styles/MindVault.scss';

function IdeaCard({ idea, onExpand }) {
  const [expanded, setExpanded] = React.useState(false);
  const [showReadMore, setShowReadMore] = React.useState(false);
  const textWrapperRef = React.useRef(null);

  React.useEffect(() => {
    if (textWrapperRef.current?.scrollHeight > 160) {
      setShowReadMore(true);
    }
  }, []);

  const scrollToDiscussion = () => {
    const el = document.getElementById('discussion-start');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="idea-card">
      <div className="idea-card__top">
        <div className="idea-card__user">
          <img src={userIcon} alt="User" className="idea-card__user-icon" />
          <span className="idea-card__username">{idea.username}</span>
        </div>
        {idea.pinned && <img src={pinIcon} alt="Pin" className="idea-card__pin" />}
      </div>

      <div
        ref={textWrapperRef}
        className={`idea-card__text-wrapper ${expanded ? 'expanded' : ''}`}
      >
        <div className="idea-card__text">{idea.preview}</div>
      </div>

      {!expanded && showReadMore && (
        <button className="idea-card__read-more" onClick={() => setExpanded(true)}>
          Читать далее
        </button>
      )}

      <div className="idea-card__badges">
        <div className="idea-card__badge">
          <img src={likeIcon} alt="Like" />
          <span>{idea.likes}</span>
        </div>
        <div className="idea-card__badge">
          <img src={dislikeIcon} alt="Dislike" />
          <span>{idea.dislikes}</span>
        </div>
      </div>

      <div className="idea-card__divider"></div>

      {/* рендерим футер только если есть комментарии */}
      {idea.comments > 0 && (
        <div
          className="idea-card__footer"
          onClick={scrollToDiscussion}
          style={{ cursor: 'pointer' }}
        >
          <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
          <span className="idea-card__comments">{idea.comments} Комментарий</span>
          <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
          <img src={eyeIcon} alt="Views" className="idea-card__icon-eye" />
          <p style={{ margin: 0, color: 'rgba(193, 198, 201, 1)', fontSize: '14px' }}>
            {idea.views}
          </p>
          <RiArrowRightSLine
            size={24}
            color="#1E88D3"
            onClick={() => onExpand(idea)}
            style={{ cursor: 'pointer' }}
          />
        </div>
      )}
    </div>
  );
}

const MindVaultPage = () => {
  const navigate = useNavigate();

  const ideas = [
    {
      id: 'project',
      username: 'Имя пользователя',
      preview: 'Разработать информационный ресурс  Рroject of Everything on Wiki.',
      likes: 5,
      dislikes: 2,
      comments: 3,
      views: 36,
      pinned: true
    },
    {
      id: 'bees',
      username: 'Имя пользователя',
      preview: 'Разработать новый вид опылителей-насекомых для теплиц.',
      likes: 2,
      dislikes: 1,
      comments: 0,      // комментариев нет
      views: 12,
      pinned: false
    }
  ];

  return (
    <>
      <MindVaultHeader onDescriptionClick={() => navigate('/aboutpage')} />

      <div className="mind-vault-page">
        {ideas.map(idea => (
          <IdeaCard key={idea.id} idea={idea} onExpand={() => navigate(`/discussion/${idea.id}`)} />
        ))}
      </div>

      <div className="vault-footer">
        <img src={skrepkaIcon} alt="Attach" className="vault-footer__icon" />
        <input
          type="text"
          className="vault-footer__input"
          placeholder="Добавить идею"
        />
        <img src={sendIcon} alt="Send" className="vault-footer__send" />
      </div>
    </>
  );
};

export default MindVaultPage;
