import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux'
import { selectTheme } from '@/store/slices/themeSlice'

import HomeIcons from '@/shared/ui/HomeIcons'
import FooterIcons from '@/shared/ui/FooterIcons'
import '@/styles/shared/components/Home.scss'

import burgerIcon from '@/assets/images/burger.webp'
import shareIcon from '@/assets/images/share.webp'
import bellIcon from '@/assets/images/bell.webp'

function Home() {
  const [animate, setAnimate] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useSelector(selectTheme)

  const handleClick = () => {
    setAnimate(true)
    setTimeout(() => {
      setAnimate(false)
      navigate('/experiencepage')
    }, 300)
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-web-app.js?version=5.7'
    script.async = true

    script.onload = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()
        tg.disableVerticalSwipes()

        const isSmallScreen = window.matchMedia('(max-width: 768px)').matches
        const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches
        if (isSmallScreen || isTouchDevice) {
          document.documentElement.classList.add('telegram-webapp')
          document.documentElement.classList.add('ios')
        }
      }
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    if (isIOS) {
      document.documentElement.classList.add('ios')
    }
  }, [])

  // Root theme уже загружается в App.jsx, здесь ничего дополнительно грузить не нужно

  return (
    <>
      <div className="home">
        <div className="home__scroll">
          <section className="section-head">
            <div className="section-head__left" onClick={() => navigate('/menu')}>
              <img src={burgerIcon} alt="Меню" className="section-head__icon" />
            </div>
            <div className="section-head__center">
              <input type="text" placeholder={theme?.locale_texts?.inputs?.search || 'Поиск'} className="section-head__search" />
            </div>
            <div className="section-head__right">
              <img src={shareIcon} alt="Поделиться" className="section-head__icon" />
              <img src={bellIcon} alt="Уведомления" className="section-head__icon" />
            </div>
          </section>

          <h1 className="home__title">{theme?.title || 'Название раздела'}</h1>

          <HomeIcons />

          <div className="home__buttons">
            <button className={`home__button home__button--primary ${animate ? 'animate' : ''}`} onClick={handleClick}>
              Обмен опытом
            </button>
            <button className="home__button home__button--secondary">Описание</button>
            <button className="home__button home__button--tertiary">Идеальный результат</button>
            <button className="home__button home__button--quaternary">Модули проекта</button>
          </div>
        </div>
        <FooterIcons />
      </div>
    </>
  )
}

export default Home
