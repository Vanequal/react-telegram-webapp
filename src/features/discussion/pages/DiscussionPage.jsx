// DiscussionPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { createComment, fetchPostComments, reactToPost, fetchPostById } from '@/store/slices/postSlice'

// Components
import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import DiscussionIdeaCard from '@/features/discussion/components/DiscussionIdeaCard'
import CommentThread from '@/features/discussion/components/CommentThread'
import CommentComposer from '@/features/discussion/components/CommentComposer'

// Styles
import '@/styles/features/discussion.scss'

// Constants
const SECTION_KEY = 'chat_ideas'
const DEFAULT_THEME_ID = 1

const DiscussionPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // Redux selectors
  const { posts, selectedPost } = useSelector(state => state.post)
  const postComments = useSelector(state => state.post.comments[+id] || [])
  const { commentsLoading, loading } = useSelector(state => state.post)

  // Local state
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)

  // Derived data - более надежное получение данных о посте
  const ideaFromState = location.state?.idea
  const ideaFromPosts = posts.find(p => String(p.id) === id)
  const idea = useMemo(() => {
    return ideaFromState || ideaFromPosts || selectedPost
  }, [ideaFromState, ideaFromPosts, selectedPost])

  const comments = postComments

  // Handlers
  const handleSendComment = useCallback(
    async (files = []) => {
      if ((!commentText.trim() && files.length === 0) || isSubmitting) return

      setIsSubmitting(true)
      try {
        console.log('📤 Отправка комментария с файлами:', {
          text: commentText.trim(),
          filesCount: files.length,
          files: files.map(f => f.name),
        })

        await dispatch(
          createComment({
            post_id: +id,
            message_text: commentText.trim(),
            section_key: SECTION_KEY,
            theme_id: DEFAULT_THEME_ID,
            files: files, // Передаем файлы
          })
        ).unwrap()

        setCommentText('')

        // Scroll to bottom after adding comment
        setTimeout(() => {
          const commentsContainer = document.querySelector('.comment-list')
          if (commentsContainer) {
            commentsContainer.scrollTop = commentsContainer.scrollHeight
          }
        }, 100)
      } catch (error) {
        console.error('Error adding comment:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [commentText, isSubmitting, dispatch, id]
  )

  const handleCommentChange = useCallback(text => {
    setCommentText(text)
  }, [])

  const handleNavigateBack = useCallback(() => {
    navigate('/mindvault')
  }, [navigate])

  const handleNavigateToAbout = useCallback(() => {
    navigate('/aboutpage')
  }, [navigate])

  // Обработчик реакций на пост (для DiscussionIdeaCard)
  const handlePostReaction = useCallback(
    reaction => {
      if (idea?.id) {
        dispatch(
          reactToPost({
            post_id: idea.id,
            reaction,
            section_key: SECTION_KEY,
            theme_id: DEFAULT_THEME_ID,
          })
        )
      }
    },
    [dispatch, idea?.id]
  )

  // Effect для загрузки поста, если его нет в состоянии
  useEffect(() => {
    const postId = +id
    if (postId && !idea && !loading) {
      console.log('🔄 Загружаем пост по ID:', postId)
      dispatch(
        fetchPostById({
          message_id: postId,
          section_key: SECTION_KEY,
          theme_id: DEFAULT_THEME_ID,
        })
      )
    }
  }, [id, idea, loading, dispatch])

  // Effect для загрузки комментариев
  useEffect(() => {
    const postId = +id

    // Проверяем, нужно ли загружать комментарии
    const shouldLoadComments = postId && !commentsLoaded && !commentsLoading && (!comments || comments.length === 0)

    if (shouldLoadComments) {
      console.log('🔄 Загружаем комментарии для поста:', postId)
      setCommentsLoaded(true)

      dispatch(
        fetchPostComments({
          post_id: postId,
          section_key: SECTION_KEY,
          theme_id: DEFAULT_THEME_ID,
          type: 'post',
        })
      )
    }
  }, [id, comments, commentsLoading, commentsLoaded, dispatch])

  // Effect для сброса флага при смене поста
  useEffect(() => {
    setCommentsLoaded(false)
  }, [id])

  // Effect для скролла к элементу
  useEffect(() => {
    const scrollTo = location.state?.scrollTo
    if (scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(scrollTo)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
    }
  }, [location.state])

  // Debug логи
  useEffect(() => {
    console.log('🐛 DiscussionPage Debug:', {
      postId: +id,
      ideaExists: !!idea,
      commentsCount: comments.length,
      commentsLoading,
      commentsLoaded,
      postFromState: !!ideaFromState,
      postFromPosts: !!ideaFromPosts,
      selectedPost: !!selectedPost,
    })
  }, [id, idea, comments, commentsLoading, commentsLoaded, ideaFromState, ideaFromPosts, selectedPost])

  return (
    <div className="discussion-page">
      <MindVaultHeader onBackClick={handleNavigateBack} onDescriptionClick={handleNavigateToAbout} bgColor="#EEEFF1" textColor="black" />

      <div className="discussion-page__container">
        {/* Показываем лоадер, если пост загружается */}
        {loading && !idea && <div className="loading-post">Загрузка поста...</div>}

        {idea && (
          <div className="discussion-page__idea-wrapper">
            <DiscussionIdeaCard idea={idea} onReaction={handlePostReaction} />
          </div>
        )}

        <div id="discussion-start" className="discussion-pill">
          Начало обсуждения
        </div>

        <div className="comment-list">
          {commentsLoading && <p className="loading-comments">Загрузка комментариев...</p>}

          {!commentsLoading && comments.length > 0
            ? comments.map((comment, index) => <CommentThread key={comment.id} comment={comment} isNew={location.state?.scrollTo === 'new-comment' && index === comments.length - 1} sectionKey={SECTION_KEY} themeId={DEFAULT_THEME_ID} />)
            : !commentsLoading && commentsLoaded && <p className="empty-comments">Комментариев пока нет</p>}
        </div>
      </div>

      <CommentComposer commentText={commentText} onCommentChange={handleCommentChange} onSubmit={handleSendComment} isSubmitting={isSubmitting} />
    </div>
  )
}

export default DiscussionPage
