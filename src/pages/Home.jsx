import React, { useEffect, useState } from 'react';
import HomeIcons from '../components/UI/HomeIcons';
import FooterIcons from '../components/UI/FooterIcons';
import '../styles/Home.scss';

import burgerIcon from '../assets/img/burger.webp';
import shareIcon from '../assets/img/share.webp';
import bellIcon from '../assets/img/bell.webp';

function Home() {
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 300);
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-web-app.js?version=5.7";
    script.async = true;

    script.onload = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.requestFullscreen();
        tg.expand();
        tg.disableVerticalSwipes();

        const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
        const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        if (isSmallScreen || isTouchDevice) {
          document.documentElement.classList.add('telegram-webapp');
          document.documentElement.classList.add('ios');
        }
      }
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      document.documentElement.classList.add('ios');
    }
  }, []);

  return (
    <>
      <header className="app-header">
      </header>
      <div className="home">
        <div className="home__scroll">
          <section className="section-head">
            <div className="section-head__left">
              <img src={burgerIcon} alt="Меню" className="section-head__icon" />
            </div>
            <div className="section-head__center">
              <input
                type="text"
                placeholder="Поиск"
                className="section-head__search"
              />
            </div>
            <div className="section-head__right">
              <img src={shareIcon} alt="Поделиться" className="section-head__icon" />
              <img src={bellIcon} alt="Уведомления" className="section-head__icon" />
            </div>
          </section>

          <h1 className="home__title">Название раздела</h1>

          <HomeIcons />

          <div className="home__buttons">
            <button
              className={`home__button home__button--primary ${animate ? 'animate' : ''}`}
              onClick={handleClick}>
              Обмен&nbsp;опытом
            </button>
            <button className="home__button home__button--secondary">
              Описание
            </button>
            <button className="home__button home__button--tertiary">
              Идеальный результат
            </button>
            <button className="home__button home__button--quaternary">
              Модули проекта
            </button>
          </div>
        </div>
        <FooterIcons />
      </div>

    </>
  );
}

export default Home;
