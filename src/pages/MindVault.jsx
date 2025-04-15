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

const IdeaCard = ({ idea, onExpand, noHeader = false, forceExpanded = false }) => {
  const [expanded, setExpanded] = React.useState(forceExpanded);
  const [showReadMore, setShowReadMore] = React.useState(false);

  const textWrapperRef = React.useRef(null);

  React.useEffect(() => {
    if (textWrapperRef.current && textWrapperRef.current.scrollHeight > 160) {
      setShowReadMore(true);
    }
  }, []);

  const isDescriptionCard = idea.id === 'about'; // 👈 определяем, что это "подробнее об этой вкладке"

  return (
    <div className={`idea-card ${noHeader ? 'idea-card--no-header' : ''}`}>
      {isDescriptionCard && (
        <h2 style={{ fontSize: '22px', margin: '0 0 12px 0', fontWeight: 600 }}>
          Заголовок
        </h2>
      )}

      {!noHeader && (
        <div className="idea-card__top">
          <div className="idea-card__user">
            <img src={userIcon} alt="User" className="idea-card__user-icon" />
            <span className="idea-card__username">{idea.username}</span>
          </div>
          {idea.pinned && <img src={pinIcon} alt="Pin" className="idea-card__pin" />}
        </div>
      )}

      <div
        ref={textWrapperRef}
        className={`idea-card__text-wrapper ${expanded ? 'expanded' : ''}`}
      >
        <div className="idea-card__text">{idea.preview}</div>
      </div>

      {!expanded && showReadMore && !noHeader && !forceExpanded && (
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

      <div className="idea-card__footer">
        <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
        <span className="idea-card__comments">{idea.comments} Комментария</span>
        <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
        <img src={eyeIcon} alt="Views" className="idea-card__icon-eye" />
        <p style={{ margin: '0', color: 'rgba(193, 198, 201, 1)', fontSize: '14px' }}>{idea.views}</p>
        {!noHeader && (
          <RiArrowRightSLine
            size={24}
            color="#1E88D3"
            onClick={() => onExpand(idea)}
            style={{ cursor: 'pointer' }}
          />
        )}
      </div>
    </div>
  );
};


const MindVaultPage = () => {
  const [fullView, setFullView] = React.useState(null);

  const ideas = [
    {
      id: 'project',
      username: 'Имя пользователя',
      preview: 'Разработать информационный ресурс  Рroject of Everything on Wiki.',
      full: `Разработать информационный ресурс Рroject of Everything on Wiki — платформу моделирования будущего, объединяющую интерактивные преимущества успешных механизмов самоорганизации интернет-энциклопедии Wikipedia, элементы сервисов вопросов и ответов Quora, Stack Exchange, Genon и мессенджера Telegram.

Ресурс выступает инструментом для генерации достоверной информации, направленной на коллективное моделирование будущего и объединяет функциональные элементы различных платформ и методологий.`,
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
      full: 'Разработать новый вид опылителей-насекомых для теплиц — автономных и устойчивых к условиям среды, с управлением через мобильное приложение.',
      likes: 2,
      dislikes: 1,
      comments: 1,
      views: 12,
      pinned: false
    }
  ];

  const descriptionIdea = {
    id: 'about',
    preview: `Разработать информационный ресурс  Рroject of Everything on Wiki — платформу моделирования будущего, объединяющую интерактивные преимущества успешных механизмов самоорганизации интернет-энциклопедии Wikipedia, элементы сервисов вопросов и ответов Quora, Stack Exchange, Genon и мессенджера Telegram.

Ресурс выступает инструментом для генерации достоверной информации, направленной на коллективное моделирование будущего и объединяет функциональные элементы различных платформ и методологий.`,
    full: '',
    likes: 0,
    dislikes: 0,
    comments: 0,
    views: 0,
    pinned: false
  };

  return (
    <>
      <MindVaultHeader onDescriptionClick={() => setFullView({ ...descriptionIdea, id: 'about' })} />
      <div className="mind-vault-page">
        {ideas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} onExpand={setFullView} />
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

      {fullView && (
        <div className="idea-fullscreen">
          <section className="mind-vault-header">
            <div className="mind-vault-header__left" onClick={() => setFullView(null)}>
              <i className="mind-vault-header__icon">
                <RiArrowLeftSLine
                  color="#1E88D3"
                  size={36}
                  style={{ cursor: 'pointer' }}
                />
              </i>
              <span className="mind-vault-header__back-text" style={{ cursor: 'pointer' }}>
                Назад
              </span>
            </div>
            <h1 className="mind-vault-header__title">О ресурсе</h1>
          </section>

          <div className="idea-fullscreen__content">
            <IdeaCard idea={fullView} noHeader forceExpanded />
          </div>
        </div>
      )}
    </>
  );
};

export default MindVaultPage;