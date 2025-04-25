import React from 'react';
import '../styles/HistoryPage.scss';
import MindVaultHeader from '../components/UI/MindVaultHeader';
import { IoChevronBackOutline } from 'react-icons/io5';
import { RiArrowLeftSLine, RiHistoryLine } from 'react-icons/ri';

const HistoryPage = () => {
    return (
        <div className="history-page">
            <MindVaultHeader
                hideDescription
                hideSectionTitle
                title='История'
                textColor='black'
                bgColor={"#EEEFF1"} />
            <div className="history-page__content">
                <div className="history-page__navigation">
                    <RiArrowLeftSLine size={24} />
                    <RiHistoryLine size={24} />
                </div>

                <h2 className="history-page__title">История</h2>

                <div className="history-page__section">
                    <a href="#" className="history-page__section-link">Конный двор</a>
                </div>

                <div className="history-block">
                    <div className="history-block__date">2 марта 2025</div>

                    <div className="history-item">
                        <div className="history-item__time">14:57</div>
                        <div className="history-item__avatar"></div>
                        <div className="history-item__content">
                            <div className="history-item__user">WikiSvsod</div>
                            <div className="history-item__text">Публикация альтернативной статьи</div>
                            <a href="#" className="history-item__link">Функции</a>
                        </div>
                    </div>
                </div>

                <div className="history-block">
                    <div className="history-block__date">2 марта 2025</div>

                    <div className="history-item">
                        <div className="history-item__time">
                            <img src={'../assets/img/time.webp'} alt="time" className="history-item__icon" />
                            14:57
                        </div>
                        <img src={'../assets/img/historyUser.png'} alt="avatar" className="history-item__avatar" />
                        <div className="history-item__content">
                            <div className="history-item__user">WikiSvsod</div>
                            <span className="history-item__diff history-item__diff--negative">-6</span>
                            <div className="history-item__text">Техническое моделирование</div>
                            <div className="history-item__no-desc">Нет описания правки</div>
                            <a href="#" className="history-item__link">Конюшни</a>
                        </div>
                    </div>

                </div>

                <div className="history-block">
                    <div className="history-block__date">26 февраля 2025</div>

                    <div className="history-item">
                        <div className="history-item__time">14:57</div>
                        <div className="history-item__avatar"></div>
                        <div className="history-item__content">
                            <div className="history-item__user">WikiSvsod</div>
                            <span className="history-item__diff history-item__diff--positive">-6</span>
                            <div className="history-item__text">Публикация альтернативной статьи</div>
                            <a href="#" className="history-item__link">Конюшни</a>
                        </div>
                    </div>
                </div>

                <div className="history-block">
                    <div className="history-block__date">26 февраля 2025</div>

                    <div className="history-item">
                        <div className="history-item__time">14:57</div>
                        <div className="history-item__avatar"></div>
                        <div className="history-item__content">
                            <div className="history-item__user">WikiSvsod</div>
                            <span className="history-item__diff history-item__diff--negative">-6</span>
                            <div className="history-item__text">Публикация альтернативной статьи</div>
                            <div className="history-item__no-desc">Нет описания правки</div>
                            <a href="#" className="history-item__link">Конюшни</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;