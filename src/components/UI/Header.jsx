import React from 'react';
import '../../styles/Header.scss';

import BurgerIcon from '../../assets/img/burger.webp';
import ShareIcon from '../../assets/img/share.webp';
import BellIcon from '../../assets/img/bell.webp';

const Header = ({ showShare = true }) => {
  return (
    <header className="header">
      <div className="header__left">
        <img src={BurgerIcon} alt="Меню" className="header__icon" />
      </div>
      <div className="header__center">
        <input 
          type="text" 
          placeholder="Поиск" 
          className="header__search" 
        />
      </div>
      <div className="header__right">
        {showShare && (
          <img src={ShareIcon} alt="Поделиться" className="header__icon" />
        )}
        <img src={BellIcon} alt="Уведомления" className="header__icon" />
      </div>
    </header>
  );
};

export default Header;
