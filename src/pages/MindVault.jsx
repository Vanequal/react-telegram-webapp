import React from 'react';
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

const IdeaCard = ({ text, pinned = true }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [showReadMore, setShowReadMore] = React.useState(false);
  const textWrapperRef = React.useRef(null);

  React.useEffect(() => {
    if (textWrapperRef.current && textWrapperRef.current.scrollHeight > 160) {
      setShowReadMore(true);
    }
  }, []);

  return (
    <div className="idea-card">
      <div className="idea-card__top">
        <div className="idea-card__user">
          <img src={userIcon} alt="User" className="idea-card__user-icon" />
          <span className="idea-card__username">Имя пользователя</span>
        </div>
        {pinned && <img src={pinIcon} alt="Pin" className="idea-card__pin" />}
      </div>

      <div
        ref={textWrapperRef}
        className={`idea-card__text-wrapper ${expanded ? 'expanded' : ''}`}
      >
        <div className="idea-card__text">{text}</div>
      </div>

      {!expanded && showReadMore && (
        <button className="idea-card__read-more" onClick={() => setExpanded(true)}>
          Читать далее
        </button>
      )}

      <div className="idea-card__badges">
        <div className="idea-card__badge">
          <img src={likeIcon} alt="Like" />
          <span>5</span>
        </div>
        <div className="idea-card__badge">
          <img src={dislikeIcon} alt="Dislike" />
          <span>2</span>
        </div>
      </div>

      <div className="idea-card__divider"></div>

      <div className="idea-card__footer">
        <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
        <span className="idea-card__comments">3 Комментария</span>
        <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
        <img src={eyeIcon} alt="Views" className="idea-card__icon-eye" />
        <p style={{ margin: '0', color: 'rgba(193, 198, 201, 1)', fontSize: '14px' }}>36</p>
        <RiArrowRightSLine size={24} color="#1E88D3" />
      </div>
    </div>
  );
};

const MindVaultPage = () => {
  return (
    <>
      <MindVaultHeader />
      <div className="mind-vault-page">
        <IdeaCard
          text={`Разработать информационный ресурс Project of Everything on Wiki. 
          Должна быть реализована поддержка разделов, фильтрации, версионности, а также 
          возможность подключения внешних источников знаний, включая AI-интеграции и сообщество пользователей.`}
        />
        <IdeaCard
          text={`Разработать новый вид опылителей-насекомых для теплиц.`}
          pinned={false}
        />
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
