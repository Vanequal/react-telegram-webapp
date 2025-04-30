import React, { useState } from 'react';
import MindVaultHeader from '../components/UI/MindVaultHeader';

import userIcon from '../assets/img/userIcon.webp';
import likeIcon from '../assets/img/likeIcon.webp';
import dislikeIcon from '../assets/img/dislikeIcon.webp';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';

import '../styles/QuestionPage.scss';

const mockQuestion = {
    id: 1,
    text: "Как правильно настроить прокси в React-приложении?",
    created_at: "2025-05-01 12:34:56",
    likes: 12,
    dislikes: 2,
    views: 45,
    comments: [
        {
            id: 1,
            text: "Через setupProxy.js с http-proxy-middleware",
            created_at: "2025-05-01 13:00:00",
            author: { first_name: "Алексей" },
            likes: 3,
            dislikes: 0,
            replies: [
                {
                    id: 11,
                    text: "Да, это рабочий способ!",
                    created_at: "2025-05-01 13:05:00",
                    author: { first_name: "Ирина" }
                }
            ]
        },
        {
            id: 2,
            text: "Можно ещё через nginx если на проде",
            created_at: "2025-05-01 13:10:00",
            author: { first_name: "Бот" },
            likes: 2,
            dislikes: 1,
            replies: []
        }
    ]
};

function Comment({ comment }) {
    const [showReplies, setShowReplies] = useState(true);

    return (
        <div className="question-comment-thread">
            <div className="question-comment-item">
                <div className="question-comment-header">
                    <img src={userIcon} alt="Avatar" className="question-comment-avatar" />
                    <div className="question-comment-user">{comment.author?.first_name || 'Пользователь'}</div>
                    <div className="question-comment-timestamp">{comment.created_at.split(' ')[1]}</div>
                </div>
                <div className="question-comment-content">{comment.text}</div>
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
                {comment.replies?.length > 0 && (
                    <div className="question-comment-actions-left">
                        <button className="question-toggle-replies-button" onClick={() => setShowReplies(!showReplies)}>
                            {showReplies
                                ? `Скрыть ответы (${comment.replies.length})`
                                : `Показать ответы (${comment.replies.length})`}
                        </button>
                    </div>
                )}
            </div>

            {showReplies && comment.replies?.length > 0 && (
                <div className="question-replies-container">
                    {comment.replies.map(reply => (
                        <div key={reply.id} className="question-reply-thread">
                            <div className="question-comment-header">
                                <img src={userIcon} alt="Avatar" className="question-comment-avatar" />
                                <div className="question-comment-user">{reply.author?.first_name || 'Пользователь'}</div>
                                <div className="question-comment-timestamp">{reply.created_at?.split(' ')[1]}</div>
                            </div>
                            <div className="question-comment-content">{reply.text}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const QuestionChatPage = () => {
    const comments = mockQuestion.comments;

    return (
        <div className="question-page">
            <MindVaultHeader
                onBackClick={() => window.history.back()}
                onDescriptionClick={() => { }}
                bgColor="#EEEFF1"
                textColor="black"
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
                            <div className="question-card__text">{mockQuestion.text}</div>
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

                        <div className="question-card__divider" style={{marginTop: '20px'}}></div>

                        {/* Футер карточки */}
                        <div className="question-card__footer">
                            <img src={avatarStack} alt="Avatars" className="question-card__avatar-stack" />
                            <span className="question-card__answers-count">3 ответа</span>
                            <img src={donatIcon} alt="Donate" className="question-card__icon-donat" />
                            <img src={eyeIcon} alt="Views" className="question-card__icon-eye" />
                            <span className="question-card__views">36</span>
                            <span className="question-card__arrow">→</span>
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
                <input type="text" className="question-footer__input" placeholder="Ответить..." />
                <img src={sendIcon} alt="Send" className="question-footer__send" />
            </div>
        </div>
    );
};

export default QuestionChatPage;
