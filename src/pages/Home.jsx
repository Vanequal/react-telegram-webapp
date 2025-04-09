import React, { useState, useEffect } from 'react';
import Header from '../components/UI/Header';
import HomeIcons from '../components/UI/HomeIcons';
import FooterIcons from '../components/UI/FooterIcons';
import '../styles/Home.scss';

function Home() {
  const [animate, setAnimate] = useState(false);

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
      
      <HomeIcons />
      
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
      
      <FooterIcons />
    </div>
  );
}

export default Home;