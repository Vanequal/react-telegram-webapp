import React from 'react';
import { useNavigate } from 'react-router-dom';

import MindVaultHeader from '../../mindvault/components/MindVaultHeader';

import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';
import sendIconActive from '../assets/img/sendButtonActive.png';

import '../styles/DebatePage.scss';

const DebatePage = () => {
  const navigate = useNavigate();

  return (
    <div className="debate-page">
      <MindVaultHeader
        onDescriptionClick={() => navigate('/aboutpage')}
        onBackClick={() => navigate('/')}
        hideSectionTitle
        bgColor="#EEEFF1"
        title="Обсуждение"
        textColor="black"
      />

      <div className="debate-content">
        <p>Пока никто не высказался о [Заголовок раздела].<br />
          Ваше мнение может стать первым и задать тон обсуждению!
        </p>
        <p>Ваша аргументированная критика и конструктивные предложения будут высоко оценены и повысят ваш рейтинг. 
          Не упустите шанс повлиять на развитие темы!
        </p>
      </div>

      <div className="vault-footer">
        <img src={skrepkaIcon} alt="Attach" className="vault-footer__icon" />
        <input
          type="text"
          className="vault-footer__input"
          placeholder="Добавить мнение"
        />
        <img
          src={sendIcon}
          alt="Send"
          className="vault-footer__send"
          style={{
            opacity: 0.5,
            cursor: 'not-allowed'
          }}
          title="Введите текст"
        />
      </div>
    </div>
  );
};

export default DebatePage;
