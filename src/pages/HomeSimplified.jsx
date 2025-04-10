import React, { useState } from 'react';
import '../styles/HomeSimplified.scss';

import backIcon from '../assets/img/back.webp';
import timeIcon from '../assets/img/time.webp';
import pautineIcon from '../assets/img/pautineSimple.webp';
import messengerIcon from '../assets/img/messangerSimple.webp';
import resumeIcon from '../assets/img/resume.webp';

import pigIcon from '../assets/img/pigSimple.webp';
import typewriterIcon from '../assets/img/typewriterSimple.webp';
import microscopeIcon from '../assets/img/microscopeSimple.webp';
import gearIcon from '../assets/img/gearSimple.webp';
import headIcon from '../assets/img/headSimple.webp';

function HomeSimplified() {
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 300);
  };

  return (
    <div className="home-simplified">
      <Header showShare={true} />
      <h1 className="home-simplified__title">Название раздела</h1>

      <div className="home-simplified__icons">
        <img src={backIcon} alt="Back" className="home__icon" />
        <img src={timeIcon} alt="Time" className="home__icon" />
        <img src={pautineIcon} alt="Pautine" className="home__icon" />
        <img src={messengerIcon} alt="Messenger" className="home__icon" />
        <img src={resumeIcon} alt="Resume" className="home__icon" />
      </div>

      <div className="home-simplified__buttons">
        <button
          className={`home-simplified__button home-simplified__button--primary ${animate ? 'animate' : ''}`}
          onClick={handleClick}>
          Обмен &nbsp; опытом
        </button>
        <button className="home-simplified__button home-simplified__button--secondary">
          Описание
        </button>
        <button className="home-simplified__button home-simplified__button--tertiary">
          Идеальный результат
        </button>
        <button className="home-simplified__button home-simplified__button--quaternary">
          Модули проекта
        </button>
      </div>

      <div className="home-simplified__footerIcons">
        <img src={pigIcon} alt="Pig" className="home-simplified__icon home__icon--pig" />
        <img src={headIcon} alt="Head" className="home-simplified__icon" />
        <img src={typewriterIcon} alt="Typewriter" className="home-simplified__icon" />
        <img src={gearIcon} alt="Gear" className="home-simplified__icon" />
        <img src={microscopeIcon} alt="Microscope" className="home-simplified__icon" />
      </div>
    </div>
  );
}

export default HomeSimplified;
