import React from 'react';
import { useNavigate } from 'react-router-dom';

import skrepkaIcon from "../assets/img/skrepkaIcon.webp";
import sendIcon from "../assets/img/sendIcon.webp";

import MindVaultHeader from '../../features/mindvault/components/MindVaultHeader';

import "../styles/LaboratoryPage.scss";

const LaboratoryPage = () => {
    const navigate = useNavigate();
    return (
        <div className="laboratory-page">
            <MindVaultHeader
                bgColor={'#EEEFF1'}
                textColor='black'
                title='Чат задач'
                hideSectionTitle
                onBackClick={() => navigate('/')}
            />

            <div className="laboratory-page__top-text">
                В [Заголовок раздела] ещё нет опубликованных экспериментов.
            </div>

            <div className="laboratory-page__bottom-text">
                Придумайте название эксперимента и сформулируйте его сценарий
            </div>

            <div className="laboratory-footer">
                <img src={skrepkaIcon} alt="Attach" className="laboratory-footer__icon" />
                <input type="text" className="laboratory-footer__input" placeholder="Добавить эксперимент " />
                <img src={sendIcon} alt="Send" className="laboratory-footer__send" />
            </div>
        </div>
    );
};

export default LaboratoryPage;
