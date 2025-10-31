// MindVaultPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createPostPreview, fetchPostComments, fetchPostsInSection, createPost } from '@/store/slices/postSlice.js'
import { getViewedIdeas, markIdeaAsViewed } from '@/shared/utils/utils.js'

// Components
import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import IdeaCard from '@/features/ideas/components/IdeaCard.jsx'
import PostComposer from '@/shared/components/PostComposer.jsx'
import EmptyState from '@/shared/components/EmptyState.jsx'
import LoadingState from '@/shared/components/LoadingState.jsx'
import ErrorState from '@/shared/components/ErrorState.jsx'

// Styles
import '@/styles/features/mind-vault.scss'

// Constants
const SECTION_KEY = 'chat_ideas'
const DEFAULT_THEME_ID = 1

const MindVaultPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  // State
  const [expandedIdeaId, setExpandedIdeaId] = useState(null)
  const [postData, setPostData] = useState({
    text: '',
    files: [],
  })

  // Redux selectors
  const { posts, loading, error, postsLoaded } = useSelector(state => state.post)
  const postComments = useSelector(state => state.post.comments)
  const commentsLoadingFlags = useSelector(state => state.post.commentsLoadingFlags)

  // Derived values
  const themeId = Number(searchParams.get('id')) || DEFAULT_THEME_ID

  const fetchParams = useMemo(
    () => ({
      section_key: SECTION_KEY,
      theme_id: themeId,
      limit: 100,
      offset: 0,
    }),
    [themeId]
  )

  // Transform posts to ideas format с учетом новой структуры API
  const ideas = useMemo(() => {
    return (Array.isArray(posts) ? posts : []).map(post => {
      // Комментарии могут быть в разных местах
      const actualComments = postComments[post.id]?.length || post.comments?.length || post.comments_count || 0

      // Реакции из новой структуры API
      const reactions = post.reactions || {}

      return {
        id: post.id,
        username: post.author?.first_name || post.author?.username || 'Пользователь',
        preview: post.text,
        likes: reactions.count_likes || post.likes || 0,
        dislikes: reactions.count_dislikes || post.dislikes || 0,
        comments: actualComments,
        views: post.views ?? 0,
        pinned: post.pinned ?? false,
        timestamp: post.created_at ?? '',
        files: post.attachments || post.files || [], // API может возвращать attachments
        userReaction: reactions.user_reaction || post.user_reaction || null,
      }
    })
  }, [posts, postComments])

  // Initialize Telegram WebApp
  useEffect(() => {
    const initTelegram = () => {
      const tg = window.Telegram?.WebApp
      if (tg) {
        try {
          tg.ready()
          tg.expand()
          tg.requestWriteAccess?.()
        } catch (err) {
          console.warn('[Telegram WebApp] initialization error:', err.message)
        }
      }
    }

    initTelegram()
  }, [])

  // Fetch posts if not loaded
  useEffect(() => {
    if (!postsLoaded && !loading) {
      dispatch(fetchPostsInSection(fetchParams))
    }
  }, [dispatch, fetchParams, postsLoaded, loading])

  // Load comments for posts
  useEffect(() => {
    if (!posts || posts.length === 0) return

    posts.forEach(post => {
      const isLoading = commentsLoadingFlags[post.id]
      const hasComments = postComments[post.id]

      // Загружаем комментарии только если их еще нет и они не загружаются
      if (!isLoading && !hasComments) {
        dispatch(
          fetchPostComments({
            post_id: post.id,
            section_key: SECTION_KEY,
            theme_id: themeId,
          })
        )
      }
    })
  }, [posts?.length, dispatch, themeId, commentsLoadingFlags, postComments])

  // Handlers
  const handleIdeaExpand = useCallback(
    id => {
      const viewed = getViewedIdeas()
      if (!viewed[id]) {
        markIdeaAsViewed(id)
      }

      const selected = ideas.find(i => i.id === id)
      const post = posts.find(p => p.id === id)
      const ideaWithText = {
        ...selected,
        message_text: post?.text || selected.preview,
      }

      navigate(`/discussion/${id}`, { state: { idea: ideaWithText } })
    },
    [ideas, posts, navigate]
  )

  const handlePostSubmit = useCallback(async () => {
    if (!postData.text.trim()) return

    try {
      const previewResult = await dispatch(
        createPostPreview({
          section_key: SECTION_KEY,
          theme_id: themeId,
          text: postData.text.trim(),
        })
      ).unwrap()

      navigate('/editideapagegpt', {
        state: {
          attachedFiles: postData.files,
          preview: previewResult,
        },
      })

      setPostData({ text: '', files: [] })
    } catch (error) {
      console.error('Error creating post preview:', error)
      // Показываем ошибку пользователю
      alert(`Ошибка создания превью: ${error}`)
    }
  }, [postData, dispatch, themeId, navigate])

  const handlePostDataChange = useCallback(newData => {
    setPostData(newData)
  }, [])

  const handleNavigateToAbout = useCallback(() => navigate('/aboutpage'), [navigate])
  const handleNavigateBack = useCallback(() => navigate('/'), [navigate])

  // Render content based on state
  const renderContent = () => {
    if (loading && ideas.length === 0) {
      return <LoadingState />
    }

    if (error) {
      return <ErrorState error={error} />
    }

    if (!loading && ideas.length === 0) {
      return <EmptyState />
    }

    if (expandedIdeaId) {
      const expandedIdea = ideas.find(i => i.id === expandedIdeaId)
      return <IdeaCard idea={expandedIdea} onExpand={handleIdeaExpand} commentCount={expandedIdea?.comments || 0} isExpanded={true} onCollapse={() => setExpandedIdeaId(null)} sectionKey={SECTION_KEY} themeId={themeId} />
    }

    return ideas.map(idea => <IdeaCard key={idea.id} idea={idea} commentCount={idea.comments} onExpand={handleIdeaExpand} isExpanded={false} sectionKey={SECTION_KEY} themeId={themeId} />)
  }

  return (
    <>
      <MindVaultHeader onDescriptionClick={handleNavigateToAbout} onBackClick={handleNavigateBack} textColor="black" bgColor="#EEEFF1" />

      <div className="mind-vault-page">{renderContent()}</div>

      {!expandedIdeaId && <PostComposer postData={postData} onPostDataChange={handlePostDataChange} onSubmit={handlePostSubmit} disabled={loading} />}
    </>
  )
}

export default MindVaultPage
