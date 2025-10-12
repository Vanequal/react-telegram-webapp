import React from 'react';
import MindVaultHeader from '../../mindvault/components/MindVaultHeader';

import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';

import '../styles/EditIdeaPage.scss';

const EditIdeaPage = () => {
  return (
    <div className="edit-idea-page">
      <MindVaultHeader
        onBackClick={() => window.history.back()}
        onDescriptionClick={() => {}}
        hideSectionTitle={true}
      />

      <div className="edit-idea-page__content">
        <p className="edit-idea-page__empty-message">
          Идей в канале <span className="edit-idea-page__section-name">[Заголовок раздела]</span> ещё нет.
        </p>
      </div>

      <div className="vault-footer">
        <img src={skrepkaIcon} alt="Attach" className="vault-footer__icon" />
        <input
          type="text"
          className="vault-footer__input"
          placeholder="Добавить идею"
        />
        <img src={sendIcon} alt="Send" className="vault-footer__send" />
      </div>
    </div>
  );
};

export default EditIdeaPage;
