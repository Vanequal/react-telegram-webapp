import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MindVaultHeader from '../components/UI/MindVaultHeader';

import userIcon from '../assets/img/userIcon.webp';
import likeIcon from '../assets/img/likeIcon.webp';
import dislikeIcon from '../assets/img/dislikeIcon.webp';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';

import '../styles/QuestionAnswerPage.scss';

const mockQuestion = {
    id: 1,
    text: "Как правильно расположить инсектарий относительно сторон света? ",
    created_at: "2025-05-01 12:34:56",
    likes: 12,
    dislikes: 2,
    views: 45,
    comments: [
        {
            id: 1,
            text: "Через setupProxy.js с http-proxy-middleware",
            created_at: "2025-05-01 13:00:00",
            author: { first_name: "Имя Пользователя" },
            likes: 3,
            dislikes: 0,
            replies: [
                {
                    id: 11,
                    text: "Докажи",
                    created_at: "2025-05-01 13:05:00",
                    author: { first_name: "Имя Пользователя" },
                    dislikes: 5,
                },
                {
                    id: 12,
                    text: "См. Видео в закрепе((",
                    created_at: "2025-05-01 13:08:00",
                    author: { first_name: "Имя Пользователя" },
                    reply_to: { text: "Докажи", author: "Имя Пользователя" },
                    likes: 5
                }
            ]
        }
    ]
};


function Comment({ comment }) {
    const [showReplies, setShowReplies] = useState(true);

    // Проверяем, является ли это первым комментарием
    const isFirstComment = comment.id === 1;

    return (
        <div className={`question-comment-thread ${isFirstComment ? 'first-comment' : ''}`}>
            <div className="question-comment-item">
                <div className="question-comment-header">
                    <img src={userIcon} alt="Avatar" className="question-comment-avatar" />
                    <div className="question-comment-user">{comment.author?.first_name || 'Пользователь'}</div>
                    <div className="question-comment-timestamp">{comment.created_at.split(' ')[1]}</div>
                </div>
                <div className="question-comment-content">
                    {isFirstComment ? (
                        <><strong>Ответ:</strong> Фронт на юг.</>
                    ) : (
                        comment.text
                    )}
                </div>
                <div className="question-comment-actions-right">
                    <div className="question-reaction-badge">
                        <img src={likeIcon} alt="Like" />
                        <span>{comment.likes}</span>
                    </div>
                    <div className="question-reaction-badge">
                        <img src={dislikeIcon} alt="Dislike" />
                        <span>{comment.dislikes}</span>
                    </div>
                </div>

                {isFirstComment ? (
                    <div className="comment-actions-container">
                        <button className="comment-action-button">
                            Комментировать
                        </button>
                        <button
                            className="comment-action-button"
                            onClick={() => setShowReplies(!showReplies)}
                        >
                            {showReplies
                                ? `Скрыть комментарии (2)`
                                : `Посмотреть 2 Комментария`}
                        </button>
                    </div>
                ) : (
                    comment.replies?.length > 0 && (
                        <div className="question-comment-actions-left">
                            <button
                                className="question-toggle-replies-button"
                                onClick={() => setShowReplies(!showReplies)}
                            >
                                {showReplies
                                    ? `Скрыть ответы (${comment.replies.length})`
                                    : `Показать ответы (${comment.replies.length})`}
                            </button>
                        </div>
                    )
                )}
            </div>

            {showReplies && comment.replies.map((reply, index) => (
                <div key={reply.id} className="question-reply-thread" style={{ marginTop: '6%' }}>
                    <div className="question-subcomment">
                        <div className="question-subcomment-item">
                            <img src={userIcon} alt="Avatar" className="question-comment-avatar" />
                            <div className="question-subcomment-body">
                                <div className="question-subcomment-header">
                                    <div className="question-subcomment-user">{reply.author?.first_name || 'Пользователь'}</div>
                                    <div className="question-comment-timestamp">{reply.created_at?.split(' ')[1]}</div>
                                </div>

                                {reply.reply_to && (
                                    <div className="reply-quote-wrapper">
                                        <div className="replied-user-name">{reply.reply_to.author}</div>
                                        <div className="replied-content">{reply.reply_to.text}</div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="question-subcomment-text">{reply.text}</div>
                                    <div className="question-subcomment-reactions">
                                        <div className="question-subcomment-reaction">
                                            <img src={likeIcon} alt="Like" />
                                            <span>{reply.likes}</span>
                                        </div>
                                        <div className="question-subcomment-reaction">
                                            <img src={dislikeIcon} alt="Dislike" />
                                            <span>{reply.dislikes}</span>
                                        </div>
                                    </div>
                                </div>

                                <p style={{ color: '#1976D2', fontSize: '15px', fontFamily: 'Montserrat, sans-serif', margin: '0', fontWeight: '600' }}>Ответить</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

        </div>
    );
}

const QuestionAnswerPage = () => {
    const comments = mockQuestion.comments;
    const navigate = useNavigate()
    return (
        <div className="question-page">
            <MindVaultHeader
                onBackClick={() => navigate("/")}
                onDescriptionClick={() => {
                    navigate("/aboutpage")
                }}
                bgColor="#EEEFF1"
                textColor="black"
                hideSectionTitle
                title={"Ответы"}
            />

            <div className="question-page__container">
                <div className="question-page__wrapper">
                    <div className="question-card">
                        {/* Верхняя часть: аватар и имя */}
                        <div className="question-card__header">
                            <img src={userIcon} alt="User" className="question-card__avatar" />
                            <span className="question-card__username">{mockQuestion.author?.first_name || 'Имя Пользователя'}</span>
                        </div>

                        {/* Текст вопроса */}
                        <div className="question-card__text-wrapper">
                            <div className="question-card__text"><strong>Вопрос:</strong> {mockQuestion.text}</div>
                        </div>

                        {/* Лайки и дизлайки */}
                        <div className="question-card__actions-container">
                            <div className="question-card__reaction-badges">
                                <div className="question-card__reaction-badge">
                                    <img src={likeIcon} alt="Like" />
                                    <span>{mockQuestion.likes}</span>
                                </div>
                                <div className="question-card__reaction-badge">
                                    <img src={dislikeIcon} alt="Dislike" />
                                    <span>{mockQuestion.dislikes}</span>
                                </div>
                            </div>
                            <div className="question-card__timestamp">
                                {mockQuestion.created_at.split(' ')[1]}
                            </div>
                        </div>

                        <div className="question-card__divider" style={{ marginTop: '20px' }}></div>

                        {/* Футер карточки */}
                        <div
                            className="question-card__footer"
                            style={{ cursor: 'pointer' }}
                        >
                            <img src={avatarStack} alt="Avatars" className="question-card__avatar-stack" />
                            <span className="question-card__comments">
                                {mockQuestion.comments.length > 0
                                    ? `${mockQuestion.comments.length} комментариев`
                                    : 'Прокомментировать'}
                            </span>
                            <img src={donatIcon} alt="Donate" className="question-card__icon-donat" />
                            <img src={eyeIcon} alt="Views" className="question-card__icon-eye" />
                            <p className="question-card__views">{mockQuestion.views}</p>
                        </div>
                    </div>
                </div>

                <div id="question-start" className="question-pill">Начало Обсуждения</div>

                <div className="question-comment-list">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <Comment key={comment.id} comment={comment} />
                        ))
                    ) : (
                        <p className="question-empty-comments">Комментариев пока нет</p>
                    )}
                </div>
            </div>

            <div className="question-footer">
                <img src={skrepkaIcon} alt="Attach" className="question-footer__icon" />
                <input type="text" className="question-footer__input" placeholder="Ответить на вопрос" />
                <img src={sendIcon} alt="Send" className="question-footer__send" />
            </div>
        </div>
    );
};

export default QuestionAnswerPage;
