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

import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";

import '../styles/MindVault.scss';

const IdeaCard = ({ text, pinned = true, onExpand, setFullView }) => {
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
        <RiArrowRightSLine
          size={24}
          color="#1E88D3"
          onClick={() => setFullView('project')}
          style={{ cursor: 'pointer' }} />
      </div>
    </div>
  );
};

const MindVaultPage = () => {
  const [fullView, setFullView] = React.useState(null);
  return (
    <>
      <MindVaultHeader />
      <div className="mind-vault-page">
        <IdeaCard
          text={`Разработать информационный ресурс Project of Everything on Wiki. 
          Должна быть реализована поддержка разделов, фильтрации, версионности, а также 
          возможность подключения внешних источников знаний, включая AI-интеграции и сообщество пользователей.`}
          onExpand={() => setFullView('project')}
          setFullView={setFullView}
        />
        <IdeaCard
          text={`Разработать новый вид опылителей-насекомых для теплиц.`}
          pinned={false}
          onExpand={() => setFullView('project')}
          setFullView={setFullView}
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
      {fullView === 'project' && (
        <div className="idea-fullscreen">
          <section className="mind-vault-header">
            <div className="mind-vault-header__left" onClick={() => setFullView(null)}>
              <i className="mind-vault-header__icon">
                <RiArrowLeftSLine color='#1E88D3' size={36} />
              </i>
              <span className="mind-vault-header__back-text">Назад</span>
            </div>
            <h1 className="mind-vault-header__title">О ресурсе</h1>
          </section>

          <div className="idea-fullscreen__content">
            <h2>Заголовок</h2>
            <p>
              Разработать информационный ресурс Рroject of Everything on Wiki — платформу моделирования будущего, объединяющую интерактивные преимущества успешных механизмов самоорганизации интернет-энциклопедии Wikipedia, элементы сервисов вопросов и ответов Quora, Stack Exchange, Genon и мессенджера Telegram.
            </p>
            <p>
              Ресурс выступает инструментом для генерации достоверной информации, направленной на коллективное моделирование будущего и объединяет функциональные элементы различных платформ и методологий.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default MindVaultPage;