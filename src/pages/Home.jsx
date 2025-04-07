import React, { useState, useEffect } from 'react';
import Header from '../components/UI/Header';
import HomeIcons from '../components/UI/HomeIcons';
import FooterIcons from '../components/UI/FooterIcons'; 
import '../styles/Home.scss';

function Home() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      
      tg.ready();
      tg.expand();
      
      if (typeof tg.disableVerticalSwipes === 'function') {
        tg.disableVerticalSwipes();
      }
      
      if (typeof tg.requestFullscreen === 'function') {
        tg.requestFullscreen();
      }
      
      // Дополнительная настройка для iOS
      const expandViewport = () => {
        tg.expand();
        document.body.style.height = `${tg.viewportHeight}px`;
        document.documentElement.style.height = `${tg.viewportHeight}px`;
      };
      
      expandViewport();
      window.addEventListener('resize', expandViewport);
      setTimeout(expandViewport, 100);
      
      return () => {
        window.removeEventListener('resize', expandViewport);
      };
    }
  }, []);

  const handleClick = () => {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 300);
  };

  return (
    <div className="home">
      <Header showShare={true} />
      <h1 className="home__title">Название раздела</h1>

      <HomeIcons/>

      <div className="home__buttons">
        <button
          className={`home__button home__button--primary ${animate ? 'animate' : ''}`}
          onClick={handleClick}>
          Обмен &nbsp; опытом
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

      <FooterIcons/>

    </div>
  );
}

export default Home;
