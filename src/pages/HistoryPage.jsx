import React from 'react';

import '../styles/HistoryPage.scss';

import MindVaultHeader from '../components/UI/MindVaultHeader';

import { useNavigate } from 'react-router-dom';

import { RiArrowLeftSLine, RiHistoryLine } from 'react-icons/ri';

import historyUser from "../assets/img/historyUser.png"

const HistoryPage = () => {
    const navigate = useNavigate();
    
    return (
        <div className="history-page">
            <MindVaultHeader
                hideDescription
                hideSectionTitle
                onBackClick={() => navigate('/')}
                title='История'
                textColor='black'
                bgColor={"#EEEFF1"} />
            <div className="history-page__content">
                <h2 className="history-page__title">История</h2>

                <div className="history-page__section">
                    <a href="#" className="history-page__section-link">Конный двор</a>
                </div>

                <div className="history-block">
                    <div className="history-block__date">2 марта 2025</div>

                    <div className="history-item">
                        <div className="history-item__time">14:57</div>
                        <div className="history-item__avatar"><img src={historyUser} alt="" /></div>
                        <div className="history-item__content">
                            <div className="history-item__user">WikiSvsod</div>
                            <div className="history-item__main">
                                <div className="history-item__text">Публикация альтернативной статьи </div>
                                <a href="#" className="history-item__link">Функции</a>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="history-block">
                    <div className="history-block__date">2 марта 2025</div>

                    <div className="history-item">
                        <div className="history-item__time">
                            14:57
                        </div>
                        <div className="history-item__avatar"><img src={historyUser} alt="" /></div>
                        <div className="history-item__content">
                            <div className="history-item__user">WikiSvsod</div>
                            <div className="history-item__main">
                                <span className="history-item__diff history-item__diff--negative">-6</span>
                                <div className="history-item__text">Техническое моделирование</div>
                                <a href="#" className="history-item__link">Конюшни</a>
                            </div>
                            <div className="history-item__no-desc">Нет описания правки</div>
                        </div>
                    </div>

                </div>

                <div className="history-block">
                    <div className="history-block__date">26 февраля 2025</div>

                    <div className="history-item">
                        <div className="history-item__time">14:57</div>
                        <div className="history-item__avatar"><img src={historyUser} alt="" /></div>
                        <div className="history-item__content">
                            <div className="history-item__user">WikiSvsod</div>
                            <div className="history-item__main">
                                <div className="history-item__text">Публикация альтернативной статьи</div>
                                <a href="#" className="history-item__link">Конюшни</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="history-block">
                    <div className="history-block__date">26 февраля 2025</div>

                    <div className="history-item">
                        <div className="history-item__time">14:57</div>
                        <div className="history-item__avatar"><img src={historyUser} alt="" /></div>
                        <div className="history-item__content">
                            <div className="history-item__user">WikiSvsod</div>
                            <div className="history-item__main">
                                <span className="history-item__diff history-item__diff--positive">+6</span>
                                <div className="history-item__text">Техническое моделирование</div>
                            </div>
                            <div className="history-item__no-desc">Нет описания правки</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;