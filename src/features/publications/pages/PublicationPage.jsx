// PublicationPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { createComment, fetchPostComments, reactToPost, fetchPostById } from '@/store/slices/postSlice'

// Components
import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import PublicationDisplayCard from '@/features/publications/components/PublicationDisplayCard'
import CommentThread from '@/features/discussion/components/CommentThread'
import CommentComposer from '@/features/discussion/components/CommentComposer'

// Styles
import '@/styles/features/PublicationPage.scss'

// Constants
const SECTION_CODE = 'chat_publications' // ✅ Переименовано
const DEFAULT_THEME_ID = 1

const PublicationPage = () => {
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

  // Derived data
  const publicationFromState = location.state?.publication
  const publicationFromPosts = posts.find(p => String(p.id) === id)
  const publication = useMemo(() => {
    return publicationFromState || publicationFromPosts || selectedPost
  }, [publicationFromState, publicationFromPosts, selectedPost])

  const comments = postComments

  // Handlers
  const handleSendComment = useCallback(
    async (files = []) => {
      if ((!commentText.trim() && files.length === 0) || isSubmitting) return

      setIsSubmitting(true)
      try {
        console.log('📤 Отправка комментария:', {
          text: commentText.trim(),
          filesCount: files.length,
          post_id: +id,
          section_code: SECTION_CODE,
        })

        await dispatch(
          createComment({
            post_id: +id,
            message_text: commentText.trim(),
            section_code: SECTION_CODE, // ✅ Изменено
            theme_id: DEFAULT_THEME_ID,
            files: files,
          })
        ).unwrap()

        console.log('✅ Комментарий добавлен')
        setCommentText('')

        // Scroll to bottom after adding comment
        setTimeout(() => {
          const commentsContainer = document.querySelector('.comment-list')
          if (commentsContainer) {
            commentsContainer.scrollTop = commentsContainer.scrollHeight
          }
        }, 100)
      } catch (error) {
        console.error('❌ Error adding comment:', error)
        alert(`Ошибка добавления комментария: ${error}`)
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
    navigate('/publicationlist')
  }, [navigate])

  const handleNavigateToAbout = useCallback(() => {
    navigate('/aboutpage')
  }, [navigate])

  // Обработчик реакций на публикацию
  const handlePublicationReaction = useCallback(
    reaction => {
      if (publication?.id) {
        dispatch(
          reactToPost({
            post_id: publication.id,
            reaction,
          })
        )
      }
    },
    [dispatch, publication?.id]
  )

  // Effect для загрузки публикации, если её нет в состоянии
  useEffect(() => {
    const publicationId = +id
    if (publicationId && !publication && !loading) {
      console.log('🔄 Загружаем публикацию по ID:', publicationId)
      dispatch(
        fetchPostById({
          message_id: publicationId,
          section_code: SECTION_CODE, // ✅ Изменено
          theme_id: DEFAULT_THEME_ID,
        })
      )
    }
  }, [id, publication, loading, dispatch])

  // Effect для загрузки комментариев
  useEffect(() => {
    const publicationId = +id

    const shouldLoadComments = publicationId && !commentsLoaded && !commentsLoading && (!comments || comments.length === 0)

    if (shouldLoadComments) {
      console.log('🔄 Загружаем комментарии для публикации:', publicationId)
      setCommentsLoaded(true)

      dispatch(
        fetchPostComments({
          post_id: publicationId,
          section_code: SECTION_CODE, // ✅ Изменено
          theme_id: DEFAULT_THEME_ID,
        })
      )
    }
  }, [id, comments, commentsLoading, commentsLoaded, dispatch])

  // Effect для сброса флага при смене публикации
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

  return (
    <div style={{ height: '100vh', overflow: 'auto' }}>
      <MindVaultHeader
        title="Публикации"
        hideSectionTitle
        bgColor={'#EEEFF1'}
        textColor="black"
        onBackClick={handleNavigateBack}
      />

      {loading && !publication && <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка публикации...</div>}

      {publication && <PublicationDisplayCard publication={publication} onReaction={handlePublicationReaction} />}

      <div
        style={{
          margin: '20px 16px',
          height: '1px',
          backgroundColor: '#E2E6E9',
        }}
      ></div>

      <div style={{ margin: '0 16px', marginBottom: '80px' }}>
        {commentsLoading && <p style={{ textAlign: 'center', color: '#666' }}>Загрузка комментариев...</p>}

        {!commentsLoading && comments.length > 0 ? (
          comments.map((comment, index) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              isNew={location.state?.scrollTo === 'new-comment' && index === comments.length - 1}
              sectionCode={SECTION_CODE} // ✅ Изменено
              themeId={DEFAULT_THEME_ID}
            />
          ))
        ) : (
          !commentsLoading && commentsLoaded && <p style={{ textAlign: 'center', color: '#666' }}>Комментариев пока нет</p>
        )}
      </div>

      <CommentComposer
        commentText={commentText}
        onCommentChange={handleCommentChange}
        onSubmit={handleSendComment}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default PublicationPage