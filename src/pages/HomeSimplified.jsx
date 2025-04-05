import React from 'react';
import Header from '../components/UI/Header';
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

function Home() {
  return (
    <div className="home">
      <Header showShare={true} />
      <h1 className="home__title">Название раздела</h1>
      
      <div className="home__icons">
        <img src={backIcon} alt="Back" className="home__icon" />
        <img src={timeIcon} alt="Time" className="home__icon" />
        <img src={pautineIcon} alt="Pautine" className="home__icon" />
        <img src={messengerIcon} alt="Messenger" className="home__icon" />
        <img src={resumeIcon} alt="Resume" className="home__icon" />
      </div>

      <div className="home__buttons">
        <button className="home__button">Обмен опытом</button>
        <button className="home__button">Описание</button>
        <button className="home__button">ИКР</button>
        <button className="home__button">Модули проекта</button>
      </div>

      <div className="home__footerIcons">
        <img src={pigIcon} alt="Pig" className="home__icon" />
        <img src={headIcon} alt="Head" className="home__icon" />
        <img src={typewriterIcon} alt="Typewriter" className="home__icon" />
        <img src={gearIcon} alt="Gear" className="home__icon" />
        <img src={microscopeIcon} alt="Microscope" className="home__icon" />
      </div>
    </div>
  );
}

export default Home;
