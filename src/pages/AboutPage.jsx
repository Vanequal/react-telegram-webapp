import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowLeftSLine } from 'react-icons/ri';
import AudioPlayer from '../components/UI/AudioPlayer';

import ecologyGif from '../assets/img/ecology.gif';
import pencilIcon from '../assets/img/pencil.webp';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';

import '../styles/AboutPage.scss';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <section className="mind-vault-header">
        <div className="mind-vault-header__left" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
          <RiArrowLeftSLine size={36} color="#1E88D3" className="mind-vault-header__icon" />
          <span className="mind-vault-header__back-text">Назад</span>
        </div>
        <h1 className="mind-vault-header__title">О ресурсе</h1>
      </section>

      <div className="idea-card idea-card--no-header">
        <h2 className="idea-card__heading">Заголовок</h2>
        <div className="idea-card__text">
          Разработать информационный ресурс Project of Everything on Wiki — платформу моделирования будущего, объединяющую интерактивные преимущества успешных механизмов самоорганизации
          <div className="idea-card__gif-wrapper">
            <img src={ecologyGif} alt="ecology" className="idea-card__gif" />
          </div>
          интернет-энциклопедии Wikipedia, элементы сервисов вопросов и ответов Quora, Stack Exchange, Genon и мессенджера Telegram.
          Ресурс выступает инструментом для генерации достоверной информации, направленной на коллективное моделирование будущего и объединяет функциональные элементы различных платформ и методологий.
        </div>

        <div className="idea-card__audio">
          <AudioPlayer />
        </div>

        <div className="idea-card__edit-icon idea-card__edit-icon--bottom">
          <img src={pencilIcon} alt="Edit" />
        </div>
      </div>

      <div className="about-page__footer">
        <img src={skrepkaIcon} alt="Attach" className="about-page__footer-icon" />
        <input
          type="text"
          className="about-page__footer-input"
          placeholder="Комментировать"
        />
        <img src={sendIcon} alt="Send" className="about-page__footer-send" />
      </div>
    </div>
  );
};

export default AboutPage;
