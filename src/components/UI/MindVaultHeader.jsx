import React from 'react';
import '../../styles/MindVaultHeader.scss';
import { RiArrowLeftSLine } from "react-icons/ri";

const MindVaultHeader = ({ onDescriptionClick, onBackClick, hideSectionTitle, hideDescription, title = "Копилка идей" }) => {
    return (
      <>
        <section className="mind-vault-header">
          <div className="mind-vault-header__left" onClick={onBackClick}>
            <i className="mind-vault-header__icon">
              <RiArrowLeftSLine color="#1E88D3" size={36} />
            </i>
            <span className="mind-vault-header__back-text">Назад</span>
          </div>
          <h1 className="mind-vault-header__title">{title}</h1>
          {!hideSectionTitle && (
            <p style={{ margin: '0', padding: '0', color: '#1E88D3' }}>Заголовок раздела</p>
          )}
        </section>
  
        {!hideDescription && (
          <p
            className="mind-vault-header__description"
            onClick={onDescriptionClick}
            style={{ color: '#1E88D3', cursor: 'pointer' }}
          >
            Подробнее об этой вкладке
          </p>
        )}
      </>
    );
  };
  

export default MindVaultHeader;
