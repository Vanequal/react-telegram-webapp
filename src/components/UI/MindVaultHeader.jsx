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
    <section className="mind-vault-header" style={{ backgroundColor: bgColor || 'white' }}>
      <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Верхняя часть хедера */}
        <div style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50px' }}>
          <div className="mind-vault-header__left" onClick={onBackClick}>
            <i className="mind-vault-header__icon">
              <RiArrowLeftSLine color={"#1E88D3"} size={36} />
            </i>
            <span className="mind-vault-header__back-text">
              {localeTexts?.buttons?.back || 'Назад'}
            </span>
          </div>
          
          <h1
            className="mind-vault-header__title"
            style={{ color: textColor, fontSize }}
          >
            {title || localeTexts?.messages?.title || 'Копилка идей'}
          </h1>
        </div>

        {/* Заголовок раздела */}
        {!hideSectionTitle && (
          <p style={{ margin: 0, padding: '4px 0', color: '#1E88D3' }}>
            {section?.theme?.title || 'Заголовок раздела'}
          </p>
        )}

        {/* Описание - теперь часть хедера */}
        {!hideDescription && (
          <p
            className="mind-vault-header__description"
            onClick={onDescriptionClick}
          >
            {localeTexts?.buttons?.about_tab || 'Подробнее об этой вкладке'}
          </p>
        )}
      </div>
    </section>
  );
};

export default MindVaultHeader;