import React from 'react';
import MindVaultHeader from '../components/UI/MindVaultHeader';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';

import '../styles/EditIdeaPageGPT.scss';

const EditIdeaPageGPT = () => {
    return (
        <div className="edit-idea-page-gpt">
            <MindVaultHeader
                onBackClick={() => window.history.back()}
                onDescriptionClick={() => { }}
                hideSectionTitle={true}
            />

            <div className="edit-idea-page-gpt__content">
                <p className="edit-idea-page-gpt__empty-message">
                    Идей в канале <span className="edit-idea-page-gpt__section-name">[Заголовок раздела]</span> ещё нет.
                </p>

                <div className="idea-card-gpt">
                    <p className="idea-card-gpt__label">Оригинал текста:</p>
                    <p className="idea-card-gpt__text">Вывести новый вид насекомых опылителей для теплиц</p>
                    <p className="idea-card-gpt__label">Улучшенная версия от ИИ:</p>
                    <p className="idea-card-gpt__text">Разработать новый вид опылителей-насекомых для теплиц.</p>
                </div>

                <div className="idea-card-gpt__actions">
                    <button className="idea-card-gpt__action-button">Опубликовать оригинал</button>
                    <button className="idea-card-gpt__action-button">Опубликовать версию GPT</button>
                    <button className="idea-card-gpt__action-button">Редактировать версию GPT</button>
                </div>

            </div>

            <div className="vault-footer">
                <img src={skrepkaIcon} alt="Attach" className="vault-footer__icon" />
                <input
                    type="text"
                    className="vault-footer__input"
                    placeholder="Написать заново"
                />
                <img src={sendIcon} alt="Send" className="vault-footer__send" />
            </div>
        </div>
    );
};

export default EditIdeaPageGPT;
