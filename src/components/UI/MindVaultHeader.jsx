import React from 'react';
import '../../styles/MindVaultHeader.scss';
import { RiArrowLeftSLine } from "react-icons/ri";
import { useSelector } from 'react-redux';

const MindVaultHeader = ({
  onDescriptionClick,
  onBackClick,
  hideSectionTitle,
  hideDescription,
  title,
  bgColor,
  textColor = '#1E88D3',
  fontSize = '24px'
}) => {
  const section = useSelector(state => state.section.data);
  const localeTexts = section?.locale_texts;

  return (
    <div className="mind-vault-header-wrapper">
      <div className="mind-vault-header-sticky">
        <section className="mind-vault-header" style={{ backgroundColor: bgColor || 'white' }}>
          <div className="mind-vault-header__left" onClick={onBackClick}>
            <i className="mind-vault-header__icon">
              <RiArrowLeftSLine color={"#1E88D3"} size={36} />
            </i>
            <span className="mind-vault-header__back-text">
              {localeTexts?.buttons?.back || 'Назад'}
            </span>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h1
              className="mind-vault-header__title"
              style={{ color: textColor, fontSize }}
            >
              {title || localeTexts?.messages?.title || 'Копилка идей'}
            </h1>
            {!hideSectionTitle && (
              <p style={{ margin: 0, padding: 0, color: '#1E88D3' }}>
                {section?.theme?.title || 'Заголовок раздела'}
              </p>
            )}
          </div>
        </section>

        {!hideDescription && (
          <p
            className="mind-vault-header__description"
            onClick={onDescriptionClick}
            style={{ cursor: 'pointer' }}
          >
            {localeTexts?.buttons?.about_tab || 'Подробнее об этой вкладке'}
          </p>
        )}
      </div>
      {/* Пустой блок для компенсации высоты липкого хедера */}
      <div className="mind-vault-header-spacer"></div>
    </div>
  );
};

export default MindVaultHeader;