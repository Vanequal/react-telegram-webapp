import React from 'react';
import '../styles/Menu.scss';

import myAvatar from '../assets/img/myAvatar.webp';
import maskedStar from '../assets/img/maskedStar.webp';

const Menu = () => {
  return (
    <div className="menu">
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
    </div>
  );
};

export default Menu;