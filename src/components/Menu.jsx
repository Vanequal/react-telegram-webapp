import React, { useState } from 'react';
import { RiArrowRightSLine } from "react-icons/ri";

import '../styles/Menu.scss';

import myAvatar from '../assets/img/myAvatar.webp';
import maskedStar from '../assets/img/maskedStar.webp';
import telegramLogo from '../assets/img/telegramLogo.webp';
import personIcon from '../assets/img/personIcon.webp';
import wallet from '../assets/img/wallet.webp';
import languageIcon from '../assets/img/languageIcon.webp';
import messageSquare from '../assets/img/messageSquare.webp';
import alertCircle from '../assets/img/alertCircle.webp';
import house from '../assets/img/house.webp';
import personShield from '../assets/img/personShield.webp';
import exitIcon from '../assets/img/exitIcon.webp';

const Menu = () => {
  const [isMobileVersion, setIsMobileVersion] = useState(true);

  return (
    <div className="menu">
      {/* Хедер */}
      <section className="menu__header">
        <div className="menu__details">
          <div className="menu__profile">
            <div className="menu__avatar-wrap">
              <img src={myAvatar} alt="Avatar" className="menu__avatar" />
            </div>
            <div className="menu__info">
              <div className="menu__name">Jacob W.</div>
              <div className="menu__top-wrap">
                <div className="menu__top">Топ 100</div>
                <img src={maskedStar} alt="Star" className="menu__star-inline" />
              </div>
              <div className="menu__username">@jacob_d</div>
            </div>
          </div>
          <div className="menu__status-box">
            <span className="menu__label">Участник</span>
            <span className="menu__number menu__number--main">1483</span>
            <span className="menu__number menu__number--top">1555</span>
            <span className="menu__number menu__number--red">72</span>
          </div>
        </div>
      </section>

      <div className="menu__divider" />

      {/* Список */}
      <div className="menu__list">
        <MenuItem icon={personIcon} label="Мой профиль" />
        <div className="menu__divider" />
        <MenuToggle icon={telegramLogo} label="Выкл уведомления в TG" />
        <div className="menu__divider" />
        <MenuItem icon={wallet} label="Кошелек" />
        <div className="menu__divider" />
        <MenuItem
          icon={languageIcon}
          label="Язык / Language"
          value="Русский"
          isBlueValue
          fontValue="Roboto"
        />
        <div className="menu__divider" />
        <MenuItem icon={messageSquare} label="Написать нам" />
        <div className="menu__divider" />
        <MenuItem icon={alertCircle} label="О ресурсе" />
        <div className="menu__divider" />
        <MenuItem icon={house} label="На главную" />
        <div className="menu__divider" />
        <MenuItem icon={personShield} label="Управление проектом" />
      </div>

      <div className="menu__divider" />

      <div className="menu__switch-row">
        <span className={`menu__switch-label ${isMobileVersion ? 'active' : ''}`}>Моб. версия</span>

        <div className="menu__switcher" onClick={() => setIsMobileVersion(!isMobileVersion)}>
          <div className={`menu__switch-track ${isMobileVersion ? 'mobile' : 'desktop'}`}>
            <div className="menu__switch-thumb" />
          </div>
        </div>

        <span className={`menu__switch-label ${!isMobileVersion ? 'active' : ''}`}>Пк. версия</span>
      </div>

      <div className="menu__divider" />

      {/* Выход */}
      <div className="menu__logout">
        <img src={exitIcon} alt="Выход" />
        <span className="menu__logout-text">Выход</span>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, value, isBlueValue, fontValue }) => (
  <div className="menu__item">
    <div className="menu__item-left">
      <img src={icon} alt={label} />
      <span className="menu__item-label">{label}</span>
    </div>
    <div className="menu__item-right">
      {value && (
        <span
          className="menu__item-value"
          style={{
            color: isBlueValue ? '#1976D2' : '#000',
            fontFamily: fontValue || 'Montserrat'
          }}
        >
          {value}
        </span>
      )}
      <RiArrowRightSLine size={20} color="#3C3C434D" />
    </div>
  </div>
);

const MenuToggle = ({ icon, label }) => (
  <div className="menu__item">
    <div className="menu__item-left">
      <img src={icon} alt={label} />
      <span className="menu__item-label">{label}</span>
    </div>
    <label className="menu__switch-btn">
      <input type="checkbox" defaultChecked />
      <span className="menu__switch-round" />
    </label>
  </div>
);

export default Menu;
