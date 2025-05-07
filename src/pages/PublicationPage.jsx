import React from 'react'

import MindVaultHeader from '../components/UI/MindVaultHeader';

import userIcon from '../assets/img/userIcon.webp';
import likeIcon from '../assets/img/likeIcon.webp';
import dislikeIcon from '../assets/img/dislikeIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp'
import sendIcon from '../assets/img/sendIcon.webp'

import '../styles/PublicationPage.scss'

const PublicationPage = () => {
    return (
        <div>
            <MindVaultHeader
                title='Публикации'
                hideSectionTitle
                bgColor={'#EEEFF1'}
                textColor='black'
                onBackClick={() => window.history.back()} />
            <div className="publication-card">
                <div className="publication-card__header">
                    <img src={userIcon} alt="User" className="publication-card__avatar" />
                    <span className="publication-card__username">Имя пользователя</span>
                </div>

                <div className="publication-card__file-wrapper">
                    <div className="file-row">
                        <div className="file-box" />
                        <div className="file-info">
                            <span className="file-title">Файл</span>
                            <span className="file-size">73.7 Кб</span>
                            <span className="file-link">Открыть файл</span>
                        </div>
                    </div>
                </div>

                <strong className="publication-card__excerpt-title">Выдержка:</strong>
                <p className="publication-card__excerpt-text">
                    Максимальная биоконверсия происходит первые 7 дней жизненного цикла личинки.
                </p>
                <div className="publication-card__reactions">
                    <div className="reaction-badge">
                        <img src={likeIcon} alt="Like" />
                        <span>12</span>
                    </div>
                    <div className="reaction-badge">
                        <img src={dislikeIcon} alt="Dislike" />
                        <span>2</span>
                    </div>
                </div>
                <div className="publication-card__divider"></div>
                <div className="publication-card__footer">
                    <img src={avatarStack} alt="Avatars" className="publication-card__avatar-stack" />
                    <span className="publication-card__comments">Комментировать</span>
                    <img src={donatIcon} alt="Donate" className="publication-card__icon-donat" />
                    <img src={eyeIcon} alt="Views" className="publication-card__icon-eye" />
                    <p className="publication-card__views">45</p>
                </div>
            </div>
            
            <div className="publication-footer">
                <img src={skrepkaIcon} alt="Attach" className="publication-footer__icon" />
                <input type="text" className="publication-footer__input" placeholder="Добавить публикацию" />
                <img src={sendIcon} alt="Send" className="publication-footer__send" />
            </div>

        </div>
    )
};

export default PublicationPage
