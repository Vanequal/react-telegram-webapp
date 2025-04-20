import React from 'react';
import '../styles/Menu.scss';

import myAvatar from '../assets/img/myAvatar.webp';
import maskedStar from '../assets/img/maskedStar.webp';

const Menu = () => {
  return (
    <div className="menu">
      <header className="menu__header">
        <div className="menu__avatar-wrap">
          <img src={myAvatar} alt="Avatar" className="menu__avatar" />
        </div>

        <div className="menu__info">
          <div className="menu__name">Jacob W.</div>
          <div className="menu__top" style={{ color: '#77D572' }}>Топ 100</div>
          <div className="menu__username" style={{ color: '#1976D2' }}>@jacob_d</div>
        </div>

        <div className="menu__status">
          <img src={maskedStar} alt="Star" className="menu__star" />
          <span className="menu__label">Участник</span>
          <span className="menu__number menu__number--main">1483</span>
          <span className="menu__number menu__number--top">1555</span>
          <span className="menu__number menu__number--red">72</span>
        </div>
      </header>

      <div className="menu__divider" />
    </div>
  );
};

export default Menu;
