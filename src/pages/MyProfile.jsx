import React from 'react';
import MindVaultHeader from '../components/UI/MindVaultHeader';

import '../styles/MyProfile.scss';

import myProfilePhoto from '../assets/img/myProfilePhoto.webp';
import myProfileWallet from '../assets/img/myProfileWallet.webp';
import myProfilePen from '../assets/img/myProfilePen.webp';
import maskedStar from '../assets/img/maskedStar.webp';
import myProfileMedal from '../assets/img/myProfileMedal.webp';
import myProfileQR from '../assets/img/myProfileQR.webp';

const MyProfile = () => {
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
                        <div className="my-profile__name">Виталий Яковлев</div>
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
                    <div className="value">@s_pokrovitel</div>
                </div>

                <div className="my-profile__block">
                    <div className="label">Мобильный</div>
                    <div className="value">+7 (911) 234-56-78</div>
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
