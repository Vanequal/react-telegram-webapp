import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/PublicationChatPage.scss';

import menuIcon from '../assets/img/menuQuestion.png';
import bellIcon from '../assets/img/bellIcon.png';
import arrowIcon from '../assets/img/arrowIconQuestion.png';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp'

const PublicationChatPage = () => {
    const navigate = useNavigate()

    return (
        <div className="publication-chat-page">
            <div className="publication-chat-header">
                <div className="header-top">
                    <img src={menuIcon} alt="Menu" className="header-icon" />
                    <div className="header-input-wrapper">
                        <input
                            type="text"
                            placeholder="Поиск"
                            className="header-input"
                        />
                    </div>
                    <img src={bellIcon} alt="Bell" className="header-icon" />
                </div>

                <div className="header-bottom">
                    <img src={arrowIcon} alt="Back" className="arrow-icon" onClick={() => navigate('/')}/>
                    <span className="header-title">Чат публикаций</span>
                </div>
            </div>

            <p className="chat-tab-description">Подробнее об этой вкладке</p>

            <div className="no-publications-box">
                <p className="no-publications-text">
                    Временно: Публикации в разделе ещё нет
                </p>
            </div>
            <div className="attachment-hint-box">
                Прикрепите файл. Сделайте выдержку из файла актуальную для раздела.
            </div>
            <div className="chat-footer-box">
                <div className="footer-input-row">
                    <img src={skrepkaIcon} alt="Attach" className="footer-icon" />
                    <input
                        type="text"
                        placeholder="Прикрепить файл"
                        className="footer-input"
                    />
                </div>

                <div className="footer-input-row">
                    <img src={skrepkaIcon} alt="Attach" className="footer-icon" />
                    <input
                        type="text"
                        placeholder="Добавить выдержку"
                        className="footer-input"
                    />
                </div>

                <button className="publish-button" onClick={() => navigate('/publicationpage')}>ОПУБЛИКОВАТЬ</button>
            </div>
        </div>
    );
};

export default PublicationChatPage;
