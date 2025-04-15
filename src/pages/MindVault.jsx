import React from 'react';
import MindVaultHeader from '../components/UI/MindVaultHeader';
import AudioPlayer from '../components/UI/AudioPlayer';

import userIcon from '../assets/img/userIcon.webp';
import pinIcon from '../assets/img/pinIcon.webp';
import likeIcon from '../assets/img/likeIcon.webp';
import dislikeIcon from '../assets/img/dislikeIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';
import pencilIcon from '../assets/img/pencil.webp';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';
import ecologyGif from '../assets/img/ecology.gif';  // Import the image properly

import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";

import '../styles/MindVault.scss';

const IdeaCard = ({ idea, onExpand, noHeader = false, forceExpanded = false }) => {
  const [expanded, setExpanded] = React.useState(forceExpanded);
  const [showReadMore, setShowReadMore] = React.useState(false);

  const textWrapperRef = React.useRef(null);

  const isDescriptionCard = idea.id === 'about';
  const hasComments = idea.comments > 0;

  const scrollToDiscussion = () => {
    const el = document.getElementById('discussion-start');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (textWrapperRef.current && textWrapperRef.current.scrollHeight > 160) {
      setShowReadMore(true);
    }
  }, []);

  // вставляем гифку после фразы
  const renderPreviewWithGif = (text) => {
    if (!isDescriptionCard) return <div className="idea-card__text">{text}</div>;

    const trigger = "успешных механизмов самоорганизации";
    const index = text.indexOf(trigger);

    if (index === -1) return <div className="idea-card__text">{text}</div>;

    const before = text.slice(0, index + trigger.length);
    const after = text.slice(index + trigger.length);

    return (
      <div className="idea-card__text">
        {before}
        <div style={{ margin: '12px 0' }}>
          <img
            src={ecologyGif}
            alt="ecology"
            style={{ width: '100%', borderRadius: '12px' }}
          />
        </div>
        {after}
      </div>
    );
  };

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
        {renderPreviewWithGif(idea.preview)}
      </div>

      {!expanded && showReadMore && !noHeader && !forceExpanded && (
        <button className="idea-card__read-more" onClick={() => setExpanded(true)}>
          Читать далее
        </button>
      )}

      {!isDescriptionCard && (
        <>
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
        </>
      )}

      {isDescriptionCard && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <img src={pencilIcon} alt="Edit" style={{ width: 24, height: 24, opacity: 0.5 }} />
        </div>
      )}

      {/* кастомный аудиоплеер */}
      {isDescriptionCard && (
        <div style={{ marginTop: '16px' }}>
          <AudioPlayer />
        </div>
      )}

      {hasComments && (
        <div className="idea-card__footer" onClick={scrollToDiscussion} style={{ cursor: 'pointer' }}>
          <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
          <span className="idea-card__comments">{idea.comments} Комментария</span>
          {!isDescriptionCard && (
            <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
          )}
          <img src={eyeIcon} alt="Views" className="idea-card__icon-eye" />
          <p style={{ margin: 0, color: 'rgba(193, 198, 201, 1)', fontSize: '14px' }}>{idea.views}</p>
          {!noHeader && !isDescriptionCard && (
            <RiArrowRightSLine
              size={24}
              color="#1E88D3"
              onClick={() => onExpand(idea)}
              style={{ cursor: 'pointer' }}
            />
          )}
        </div>
      )}
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
      <MindVaultHeader onDescriptionClick={() => setFullView({ ...descriptionIdea })} />
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

          {fullView.id === 'about' && (
            <div className="vault-footer">
              <img src={skrepkaIcon} alt="Attach" className="vault-footer__icon" />
              <div className="vault-footer__input" style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #E2E6E9',
                borderRadius: '20px',
                boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.25)',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '16px',
                color: '#00000099',
                backgroundColor: '#fff'
              }}>
                Комментировать
              </div>
              <img src={sendIcon} alt="Send" className="vault-footer__send" />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MindVaultPage;