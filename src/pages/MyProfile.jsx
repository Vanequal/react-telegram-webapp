import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../store/slices/meSlice';

import MindVaultHeader from '../components/UI/MindVaultHeader';
import '../styles/MyProfile.scss';

import myProfilePhoto from '../assets/img/myProfilePhoto.webp';
import myProfileWallet from '../assets/img/myProfileWallet.webp';
import myProfilePen from '../assets/img/myProfilePen.webp';
import maskedStar from '../assets/img/maskedStar.webp';
import myProfileMedal from '../assets/img/myProfileMedal.webp';
import myProfileQR from '../assets/img/myProfileQR.webp';

const MyProfile = () => {
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.me);

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser());
    }
  }, [currentUser, dispatch]);

  if (loading || !currentUser) {
    return <div className="my-profile__loading">Загрузка...</div>;
  }

  return (
    <div className="my-profile">
      <MindVaultHeader
        onBackClick={() => window.history.back()}
        hideSectionTitle
        hideDescription
        title="Мой профиль"
        bgColor="#182330"
        textColor="#FFFFFF"
      />

      <div className="my-profile__photo">
        <img src={myProfilePhoto} alt="Profile" />
        <img src={myProfileMedal} className="my-profile__medal" />
        <div className="my-profile__top100">
          <span>Топ 100</span>
          <img src={maskedStar} alt="Star" />
        </div>
      </div>

      <div className="my-profile__container">
        <div className="my-profile__info">
          <div className="my-profile__info-left">
            <div className="my-profile__name">{currentUser.first_name}</div>
            <div className="my-profile__location">г. Москва</div>
          </div>

          <div className="my-profile__tagline">Участник</div>

          <div className="my-profile__stats">
            <span className="main">1483</span>
            <span className="green">1555</span>
            <span className="red">72</span>
          </div>
        </div>

        <div className="my-profile__block">
          <div className="label">О себе</div>
          <div className="value_about">
            {/* Можно подтянуть из отдельного поля, если оно появится */}
            Пишу Telegram-ботов на Python с нуля: API, базы, логика. Увлекаюсь кулинарией и строительством.<br />
            <br />
            Мечтаю жить исключительно среди добрых, целеустремлённых и отзывчивых людей.
          </div>
        </div>

        <div className="my-profile__block">
          <div className="label-row">
            <span className="label">Имя пользователя</span>
            <span className="label">Статусы</span>
          </div>
          <div className="value">@{currentUser.username}</div>
        </div>

        <div className="my-profile__block">
          <div className="label">Мобильный</div>
          <div className="value">{currentUser.phone_number}</div>
        </div>

        <div className="my-profile__wallet">
          <div className="wallet__icon-wrap">
            <img src={myProfileWallet} alt="Wallet" className="wallet__icon" />
            <div className="wallet__label">Кошелек</div>
          </div>
          <div className="wallet__center-text">Отправить донат</div>
          <img src={myProfileQR} alt="QR" className="wallet__qr" />
        </div>

        <button className="my-profile__edit">
          <img src={myProfilePen} alt="Edit" />
          <span>Редактировать профиль</span>
        </button>
      </div>
    </div>
  );
};

export default MyProfile;
