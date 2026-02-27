// MindVaultPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createPostPreview, fetchPostComments, fetchPostsInSection, createPost, fetchMessageAttachments, fetchMessageReactions } from '@/store/slices/postSlice.js'
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
const SECTION_CODE = 'chat_ideas' // ✅ Переименовано

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
  const rootThemeId = useSelector(state => state.theme.theme?.id)

  // Derived values — theme UUID from store (root theme loaded in App.jsx)
  const themeId = rootThemeId || null

  const fetchParams = useMemo(
    () => ({
      section_code: SECTION_CODE, // ✅ Изменено
      theme_id: themeId,
      limit: 100,
      offset: 0,
    }),
    [themeId]
  )

  // Transform posts to ideas format
  const ideas = useMemo(() => {
    return (Array.isArray(posts) ? posts : []).map(post => {
      const actualComments = postComments[post.id]?.length || 0

      return {
        id: post.id,
        username: post.author?.first_name || post.author?.username || 'Пользователь',
        text: post.text, // ✅ Добавлено для IdeaCard
        preview: post.text,
        likes: post.likes || 0,
        dislikes: post.dislikes || 0,
        comments: actualComments,
        views: post.views ?? 0,
        pinned: post.pinned ?? false,
        timestamp: post.created_at ?? '',
        created_at: post.created_at, // ✅ Добавлено
        files: post.attachments || [], // ✅ Используем attachments из API
        attachments: post.attachments || [], // ✅ Используем attachments из API
        userReaction: post.user_reaction || null,
        author: post.author, // ✅ Добавлено
        reactions: post.reactions, // ✅ Добавлено
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
      console.log('📥 Загружаем посты:', fetchParams)
      dispatch(fetchPostsInSection(fetchParams))
    }
  }, [dispatch, fetchParams, postsLoaded, loading])

  // Load attachments, reactions and comments for posts
  useEffect(() => {
    if (!posts || posts.length === 0) return

    posts.forEach(post => {
      // Загружаем вложения если их еще нет
      if (!post.attachments) {
        dispatch(fetchMessageAttachments({ message_id: post.id }))
      }

      // Загружаем реакции если их еще нет
      if (!post.reactions) {
        dispatch(fetchMessageReactions({ message_id: post.id }))
      }

      // Загружаем комментарии
      const isLoading = commentsLoadingFlags[post.id]
      const hasComments = postComments[post.id]

      if (!isLoading && !hasComments) {
        dispatch(
          fetchPostComments({
            post_id: post.id,
            section_code: SECTION_CODE, // ✅ Изменено
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
      console.log('📤 Создаем превью поста:', {
        section_code: SECTION_CODE,
        theme_id: themeId,
        text: postData.text.substring(0, 50),
      })

      const previewResult = await dispatch(
        createPostPreview({
          section_code: SECTION_CODE, // ✅ Изменено
          theme_id: themeId,
          text: postData.text.trim(),
        })
      ).unwrap()

      console.log('✅ Превью создано:', previewResult)

      navigate('/editideapagegpt', {
        state: {
          attachedFiles: postData.files,
          preview: previewResult,
          section_code: SECTION_CODE, // ✅ Добавлено
          theme_id: themeId, // ✅ Добавлено
        },
      })

      setPostData({ text: '', files: [] })
    } catch (error) {
      console.error('❌ Error creating post preview:', error)
      
      // ✅ Обработка ошибки 403 (OpenAI отключен)
      if (error === 'OpenAI временно недоступен') {
        // Публикуем без GPT версии
        try {
          await dispatch(
            createPost({
              message_text: postData.text.trim(),
              section_code: SECTION_CODE,
              theme_id: themeId,
              type: 'post',
              is_openai_generated: false,
              ratio: 99,
              files: postData.files,
            })
          ).unwrap()
          
          alert('Пост опубликован без AI обработки')
          setPostData({ text: '', files: [] })
        } catch (postError) {
          alert(`Ошибка публикации: ${postError}`)
        }
      } else {
        alert(`Ошибка создания превью: ${error}`)
      }
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
      return (
        <IdeaCard
          idea={expandedIdea}
          onExpand={handleIdeaExpand}
          commentCount={expandedIdea?.comments || 0}
          isExpanded={true}
          onCollapse={() => setExpandedIdeaId(null)}
          sectionCode={SECTION_CODE} // ✅ Изменено
          themeId={themeId}
        />
      )
    }

    return ideas.map(idea => (
      <IdeaCard
        key={idea.id}
        idea={idea}
        commentCount={idea.comments}
        onExpand={handleIdeaExpand}
        isExpanded={false}
        sectionCode={SECTION_CODE} // ✅ Изменено
        themeId={themeId}
      />
    ))
  }

  return (
    <>
      <MindVaultHeader
        onDescriptionClick={handleNavigateToAbout}
        onBackClick={handleNavigateBack}
        textColor="black"
        bgColor="#EEEFF1"
      />

      <div className="mind-vault-page">{renderContent()}</div>

      {!expandedIdeaId && (
        <PostComposer
          postData={postData}
          onPostDataChange={handlePostDataChange}
          onSubmit={handlePostSubmit}
          disabled={loading}
        />
      )}
    </>
  )
}

export default MindVaultPage