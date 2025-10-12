import React from 'react';
import MindVaultHeader from '../../mindvault/components/MindVaultHeader';
import '../styles/EditProfile.scss';

import avatarEditProfile from '../assets/img/avatarEditProfile.png';

const EditProfilePage = () => {
    return (
        <div className="edit-profile">
            <MindVaultHeader
                onBackClick={() => window.history.back()}
                hideSectionTitle
                hideDescription
                title="Редактировать профиль"
                bgColor="#EAEFF6"
                textColor="black"
                fontSize='16px'
            />

            <div className="edit-profile__form">
                <FieldRow label="Имя*" placeholder="Иван" required />
                <FieldRow label="Фамилия*" placeholder="Иванов" required />
                <FieldRow label="Год рождения*" placeholder="1975" required />
                <FieldRow label="Локация*" placeholder="Ленинградская обл." required />
                <FieldRow label="Профессия" placeholder="Дизайнер" />

                <div className="edit-profile__combined-block">
                    <div className="section-item">
                        <div className="section-header">Навыки и компетенции*</div>
                        <textarea className="section-textarea" placeholder="..."></textarea>
                    </div>

                    <div className="section-item">
                        <div className="section-header">Увлечения*</div>
                        <textarea className="section-textarea" placeholder="..."></textarea>
                    </div>

                    <div className="section-item">
                        <div className="section-header">Мечта</div>
                        <textarea className="section-textarea" placeholder="..."></textarea>
                    </div>

                    <div className="section-item">
                        <div className="section-header">Фото*</div>
                        <div className="section-photo">
                            <img src={avatarEditProfile} alt="Avatar" className="edit-profile__avatar" />
                        </div>
                    </div>
                </div>

                <div className="edit-profile__wallet">Кошелек</div>

                <button className="edit-profile__submit">Опубликовать</button>
            </div>
        </div>
    );
};

const FieldRow = ({ label, placeholder }) => (
    <div className="edit-profile__field-row">
        <label className="edit-profile__row-label">{label}</label>
        <input className="edit-profile__row-input" placeholder={placeholder} />
    </div>
);

export default EditProfilePage;