import React from 'react';
import '../../styles/MindVaultHeader.scss';
import { RiArrowLeftSLine } from "react-icons/ri";

const MindVaultHeader = ({ onDescriptionClick, onBackClick }) => {
    return (
        <>
            <section className="mind-vault-header">
                <div className="mind-vault-header__left">
                    <i className="mind-vault-header__icon"><RiArrowLeftSLine color='#1E88D3' size={36} /></i>
                    <span
                        className="mind-vault-header__back-text"
                        onClick={onBackClick}>Назад</span>
                </div>
                <h1 className="mind-vault-header__title">Копилка идей</h1>
                <p style={{ margin: '0', padding: '0', color: '#1E88D3' }}>Заголовок раздела</p>
            </section>
            <p
                className="mind-vault-header__description"
                onClick={onDescriptionClick}
                style={{ color: '#1E88D3', cursor: 'pointer' }}
            >
                Подробнее об этой вкладке
            </p>
        </>
    );
};

export default MindVaultHeader;
