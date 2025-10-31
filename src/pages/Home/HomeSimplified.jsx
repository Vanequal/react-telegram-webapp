import React, { useState } from 'react'
import '@/styles/shared/components/HomeSimplified.scss'

import backIcon from '@/assets/images/back.webp'
import timeIcon from '@/assets/images/time.webp'
import pautineIcon from '@/assets/images/pautineSimple.webp'
import messengerIcon from '@/assets/images/messangerSimple.webp'
import resumeIcon from '@/assets/images/resume.webp'

import pigIcon from '@/assets/images/pigSimple.webp'
import typewriterIcon from '@/assets/images/typewriterSimple.webp'
import microscopeIcon from '@/assets/images/microscopeSimple.webp'
import gearIcon from '@/assets/images/gearSimple.webp'
import headIcon from '@/assets/images/headSimple.webp'

function HomeSimplified() {
  const [animate, setAnimate] = useState(false)

  const handleClick = () => {
    setAnimate(true)
    setTimeout(() => {
      setAnimate(false)
    }, 300)
  }

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
        <button className={`home-simplified__button home-simplified__button--primary ${animate ? 'animate' : ''}`} onClick={handleClick}>
          Обмен &nbsp; опытом
        </button>
        <button className="home-simplified__button home-simplified__button--secondary">Описание</button>
        <button className="home-simplified__button home-simplified__button--tertiary">Идеальный результат</button>
        <button className="home-simplified__button home-simplified__button--quaternary">Модули проекта</button>
      </div>

      <div className="home-simplified__footerIcons">
        <img src={pigIcon} alt="Pig" className="home-simplified__icon home__icon--pig" />
        <img src={headIcon} alt="Head" className="home-simplified__icon" />
        <img src={typewriterIcon} alt="Typewriter" className="home-simplified__icon" />
        <img src={gearIcon} alt="Gear" className="home-simplified__icon" />
        <img src={microscopeIcon} alt="Microscope" className="home-simplified__icon" />
      </div>
    </div>
  )
}

export default HomeSimplified
