import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTheme } from '../store/slices/themeSlice';

import HomeIcons from '../components/UI/HomeIcons';
import FooterIcons from '../components/UI/FooterIcons';
import '../styles/Home.scss';

import burgerIcon from '../assets/img/burger.webp';
import shareIcon from '../assets/img/share.webp';
import bellIcon from '../assets/img/bell.webp';

function Home() {
  const [animate, setAnimate] = useState(false);
  const dispatch = useDispatch();
  const { theme, loading, error } = useSelector((state) => state.theme);

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

  useEffect(() => {
    dispatch(fetchTheme(1));
  }, [dispatch]);


  return (
    <>
      <div className="home">
        <div className="home__scroll">
          <section className="section-head">
            <div className="section-head__left">
              <img src={burgerIcon} alt="Меню" className="section-head__icon" />
            </div>
            <div className="section-head__center">
              <input
                type="text"
                placeholder={theme?.locale_texts?.inputs?.search || 'Поиск'}
                className="section-head__search"
              />

            </div>
            <div className="section-head__right">
              <img src={shareIcon} alt="Поделиться" className="section-head__icon" />
              <img src={bellIcon} alt="Уведомления" className="section-head__icon" />
            </div>
          </section>

          <h1 className="home__title">{theme?.title || 'Название раздела'}</h1>

          <HomeIcons />

          <div className="home__buttons">
            {theme?.locale_texts?.buttons?.experience_exchange && (
              <button
                className={`home__button home__button--primary ${animate ? 'animate' : ''}`}
                onClick={handleClick}
              >
                {theme.locale_texts.buttons.experience_exchange}
              </button>
            )}
            {theme?.locale_texts?.buttons?.description && (
              <button className="home__button home__button--secondary">
                {theme.locale_texts.buttons.description}
              </button>
            )}
            {theme?.locale_texts?.buttons?.perfect_result && (
              <button className="home__button home__button--tertiary">
                {theme.locale_texts.buttons.perfect_result}
              </button>
            )}
            {theme?.locale_texts?.buttons?.project_modules && (
              <button className="home__button home__button--quaternary">
                {theme.locale_texts.buttons.project_modules}
              </button>
            )}
          </div>
        </div>
        <FooterIcons />
      </div>
    </>
  );
}

export default Home;
