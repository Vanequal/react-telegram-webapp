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
  // Исправляем селекторы для получения данных из правильных слайсов
  const section = useSelector(state => state.section?.data);
  const theme = useSelector(state => state.theme?.theme);
  
  // Получаем локализацию из секции (если есть) или используем fallback
  const localeTexts = section?.locale_texts;

  return (
    <>
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
              {/* Используем заголовок из theme API */}
              {theme?.title || 'Заголовок раздела'}
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
    </>
  );
};

export default MindVaultHeader;