// DiscussionPage.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MindVaultHeader from '../components/UI/MindVaultHeader';

import userIcon from '../assets/img/userIcon.webp';
import pinIcon from '../assets/img/pinIcon.webp';
import likeIcon from '../assets/img/likeIcon.webp';
import dislikeIcon from '../assets/img/dislikeIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';
import avatar1 from '../assets/img/avatar1.png'
import avatar2 from '../assets/img/avatar2.png'
import avatar3 from '../assets/img/avatar3.png'
import skrepkaIcon from '../assets/img/skrepkaIcon.webp'
import sendIcon from '../assets/img/sendIcon.webp';

import { RiArrowRightSLine } from "react-icons/ri";

import '../styles/DiscussionPage.scss';

const mockIdeas = {
  project: {
    id: 'project',
    username: 'Имя пользователя',
    preview: 'Разработать информационный ресурс Project of Everything on Wiki.',
    likes: 5,
    dislikes: 2,
    comments: 3,
    views: 36,
    pinned: true,
    timestamp: '15:35',
  },
};

const mockComments = {
  project: [
    {
      id: 'c1',
      user: 'Имя пользователя',
      avatar: userIcon,
      text: 'Совмещение различных технологий и систем .',
      likes: 5,
      dislikes: 2,
      timestamp: '15:35',
      replies: [
        {
          id: 'r1',
          user: 'Имя пользователя',
          avatar: userIcon,
          text: 'Легко',
          likes: 0,
          dislikes: 5,
          timestamp: '1 апреля',
          replyTo: {
            user: 'Имя пользователя',
            text: 'Совмещение различных технологий и систем .'
          },
          replies: [
            {
              id: 'r2',
              user: 'Имя пользователя',
              avatar: userIcon,
              text: 'Кому легко?',
              likes: 5,
              dislikes: 0,
              timestamp: '',
              replyTo: {
                user: 'Имя пользователя',
                text: 'Легко'
              }
            },
          ],
        },
      ],
    },
    {
      id: 'c2',
      user: 'Имя пользователя',
      avatar: userIcon,
      text: 'Совмещение различных технологий и систем .',
      likes: 1,
      dislikes: 0,
      timestamp: '15:40',
      replies: [],
    },
  ],
};

function IdeaCard({ idea, onExpand, noHeader = false, forceExpanded = false }) {
  const [expanded, setExpanded] = useState(forceExpanded);
  const [showReadMore, setShowReadMore] = useState(false);
  const textWrapperRef = React.useRef(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (textWrapperRef.current?.scrollHeight > 160) setShowReadMore(true);
  }, []);

  const scrollToDiscussion = () => {
    const el = document.getElementById('discussion-start');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`idea-card ${noHeader ? 'idea-card--no-header' : ''}`}>
      {!noHeader && (
        <div className="idea-card__top">
          <div className="idea-card__user">
            <img src={userIcon} alt="User" className="idea-card__user-icon" />
            <span className="idea-card__username">{idea.username}</span>
          </div>
          {idea.pinned && <img src={pinIcon} alt="Pin" className="idea-card__pin" />}
        </div>
      )}

      <div
        ref={textWrapperRef}
        className={`idea-card__text-wrapper ${expanded ? 'expanded' : ''}`}
      >
        <div className="idea-card__text">
          {forceExpanded ? idea.full || idea.preview : idea.preview}
        </div>
      </div>

      {!expanded && showReadMore && !forceExpanded && (
        <button className="idea-card__read-more" onClick={() => setExpanded(true)}>
          Читать далее
        </button>
      )}

      <div className="idea-card__actions-container">
        <div className="idea-card__reaction-badges">
          <div className="idea-card__reaction-badge">
            <img src={likeIcon} alt="Like" />
            <span>{idea.likes}</span>
          </div>
          <div className="idea-card__reaction-badge">
            <img src={dislikeIcon} alt="Dislike" />
            <span>{idea.dislikes}</span>
          </div>
        </div>
        <div className="idea-card__timestamp">{idea.timestamp}</div>
      </div>

      <div className="idea-card__divider"></div>

      {idea.comments > 0 && (
        <div
          className="idea-card__footer"
          onClick={scrollToDiscussion}
          style={{ cursor: 'pointer' }}
        >
          <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
          <span className="idea-card__comments">{idea.comments} Комментарий</span>
          <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
          <img src={eyeIcon} alt="Views" className="idea-card__icon-eye" />
          <p style={{ margin: 0, color: 'rgba(193, 198, 201, 1)', fontSize: '14px' }}>
            {idea.views}
          </p>
          {!noHeader && (
            <RiArrowRightSLine
              size={24}
              color="#1E88D3"
              onClick={() => onExpand(idea)}
              style={{ cursor: 'pointer' }}
            />
          )}
        </div>
      )}
      <div className="idea-card__divider"></div>
    </div>
  );
}

function Comment({ comment }) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="comment-thread">
      <div className="comment-item">
        <div className="comment-header">
          <img src={avatar1} alt="Avatar" className="comment-avatar" />
          <div className="comment-user">{comment.user}</div>
          {comment.timestamp && <div className="comment-timestamp">{comment.timestamp}</div>}
        </div>
        <div className="comment-content">{comment.text}</div>
        <div className="comment-actions-right">
          <div className="reaction-badge">
            <img src={likeIcon} alt="Like" />
            <span>{comment.likes}</span>
          </div>
          <div className="reaction-badge">
            <img src={dislikeIcon} alt="Dislike" />
            <span>{comment.dislikes}</span>
          </div>
        </div>
        <div className="comment-actions">
          <div className="comment-actions-left">
            <button className="reply-button">Ответить</button>
            {comment.replies?.length > 0 && (
              <button className="toggle-replies-button" onClick={() => setShowReplies(!showReplies)}>
                {showReplies
                  ? `Скрыть ответы (${comment.replies.length})`
                  : `Показать ответы (${comment.replies.length})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplies && comment.replies?.length > 0 && (
        <div className="replies-container">
          {comment.replies.map(reply => (
            <div key={reply.id} className="reply-thread">
              <div className="comment-header">
                <img src={avatar2} alt="Avatar" className="comment-avatar" />
                <div className="comment-user">{reply.user}</div>
                {reply.timestamp && <div className="comment-timestamp">{reply.timestamp}</div>}
              </div>

              <div className="comment-content">{reply.text}</div>
              <div className="comment-actions">
                <div className="comment-actions-left">
                  <button className="reply-button">Ответить</button>
                </div>
                <div className="comment-actions-right">
                  <div className="reaction-badge">
                    <img src={likeIcon} alt="Like" />
                    <span>{reply.likes}</span>
                  </div>
                  <div className="reaction-badge">
                    <img src={dislikeIcon} alt="Dislike" />
                    <span>{reply.dislikes}</span>
                  </div>
                </div>
              </div>

              {reply.replies?.length > 0 && (
                <div className="nested-replies">
                  {reply.replies.map(nestedReply => (
                    <div key={nestedReply.id} className="reply-thread">
                      <div className="comment-header">
                        <img src={avatar3} alt="Avatar" className="comment-avatar" />
                        <div className="comment-user">{nestedReply.user}</div>
                        {nestedReply.timestamp && <div className="comment-timestamp">{nestedReply.timestamp}</div>}
                      </div>

                      {nestedReply.replyTo && (
                        <div className="reply-quote-wrapper">
                          <div className="replied-user-name">{nestedReply.replyTo.user}</div>
                          <div className="replied-content">{nestedReply.replyTo.text}</div>
                        </div>
                      )}

                      <div className="comment-content">{nestedReply.text}</div>
                      <div className="comment-actions">
                        <div className="comment-actions-left">
                          <button className="reply-button">Ответить</button>
                        </div>
                        <div className="comment-actions-right">
                          <div className="reaction-badge">
                            <img src={likeIcon} alt="Like" />
                            <span>{nestedReply.likes}</span>
                          </div>
                          <div className="reaction-badge">
                            <img src={dislikeIcon} alt="Dislike" />
                            <span>{nestedReply.dislikes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DiscussionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idea = id && mockIdeas[id] ? mockIdeas[id] : null;
  const comments = id && mockComments[id] ? mockComments[id] : [];

  const handleBackClick = () => {
    navigate('/mindvault');
  };

  const handleAboutClick = () => {
    navigate('/aboutpage');
  };

  return (
    <div className="discussion-page">
      <MindVaultHeader
        onBackClick={handleBackClick}
        onDescriptionClick={handleAboutClick}
      />
      <div className="discussion-page__container">
        {idea && (
          <div className="discussion-page__idea-wrapper">
            <IdeaCard
              idea={idea}
              onExpand={() => { }}
              noHeader={true}
              forceExpanded={true}
            />
          </div>
        )}
        <div id="discussion-start" className="discussion-pill">Начало обсуждения</div>
        <div className="comment-list">
          {comments.map(comment => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
      <div className="discussion-footer">
        <img src={skrepkaIcon} alt="Attach" className="discussion-footer__icon" />
        <input
          type="text"
          className="discussion-footer__input"
          placeholder="Комментировать"
        />
        <img src={sendIcon} alt="Send" className="discussion-footer__send" />
      </div>
    </div>
  );
}

export default DiscussionPage;