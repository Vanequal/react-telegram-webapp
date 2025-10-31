// PublicationPageList.jsx (будет заменять старую PublicationPage)
import React, { useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPostComments, fetchPostsInSection } from '@/store/slices/postSlice'

// Components
import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import PublicationCard from '@/features/publications/components/PublicationCard'

// Icons
import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendButtonActive.png'

// Styles
import '@/styles/features/PublicationPage.scss'

// Constants
const SECTION_KEY = 'chat_publications'
const DEFAULT_THEME_ID = 1

const PublicationPageList = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

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

  // Transform posts to publications format
  const publications = useMemo(() => {
    return (Array.isArray(posts) ? posts : []).map(post => {
      const actualComments = postComments[post.id]?.length || post.comments?.length || post.comments_count || 0

      const reactions = post.reactions || {}

      return {
        id: post.id,
        username: post.author?.first_name || post.author?.username || 'Пользователь',
        excerpt: post.text,
        likes: reactions.count_likes || post.likes || 0,
        dislikes: reactions.count_dislikes || post.dislikes || 0,
        comments: actualComments,
        views: post.views ?? 0,
        timestamp: post.created_at ?? '',
        files: post.attachments || post.files || [],
        userReaction: reactions.user_reaction || post.user_reaction || null,
        author: post.author,
      }
    })
  }, [posts, postComments])

  // Fetch publications if not loaded
  useEffect(() => {
    if (!postsLoaded && !loading) {
      dispatch(fetchPostsInSection(fetchParams))
    }
  }, [dispatch, fetchParams, postsLoaded, loading])

  // Load comments for publications
  useEffect(() => {
    if (!posts || posts.length === 0) return

    posts.forEach(post => {
      const isLoading = commentsLoadingFlags[post.id]
      const hasComments = postComments[post.id]

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
  const handlePublicationExpand = useCallback(
    id => {
      const selected = publications.find(p => p.id === id)
      const post = posts.find(p => p.id === id)
      const publicationWithText = {
        ...selected,
        message_text: post?.text || selected.excerpt,
      }

      navigate(`/publicationpage/${id}`, { state: { publication: publicationWithText } })
    },
    [publications, posts, navigate]
  )

  const handleAddPublication = useCallback(() => {
    navigate('/publicationchatpage')
  }, [navigate])

  return (
    <div>
      <MindVaultHeader title="Публикации" hideSectionTitle bgColor={'#EEEFF1'} textColor="black" onBackClick={() => navigate('/')} />

      {/* Показываем публикации или пустое состояние */}
      {loading && publications.length === 0 ? (
        <div
          style={{
            margin: '20px',
            padding: '20px',
            textAlign: 'center',
            background: '#1976D21A',
            borderRadius: '8px',
          }}
        >
          <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Загрузка публикаций...</p>
        </div>
      ) : publications.length === 0 ? (
        <div
          style={{
            margin: '20px',
            padding: '20px',
            textAlign: 'center',
            background: '#1976D21A',
            borderRadius: '8px',
          }}
        >
          <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Публикаций пока нет. Добавьте первую публикацию!</p>
        </div>
      ) : (
        publications.map(publication => <PublicationCard key={publication.id} publication={publication} onExpand={handlePublicationExpand} commentCount={publication.comments} sectionKey={SECTION_KEY} themeId={themeId} />)
      )}

      {/* Footer - неактивные элементы, активная только кнопка отправки */}
      <div className="publication-footer">
        <img
          src={skrepkaIcon}
          alt="Attach"
          className="publication-footer__icon"
          style={{
            opacity: 0.5,
            cursor: 'not-allowed',
          }}
        />
        <input
          type="text"
          className="publication-footer__input"
          placeholder="Добавить публикацию"
          style={{
            opacity: 0.5,
            cursor: 'not-allowed',
            pointerEvents: 'none',
          }}
          readOnly
        />
        <img src={sendIcon} alt="Send" className="publication-footer__send" onClick={handleAddPublication} style={{ cursor: 'pointer' }} />
      </div>
    </div>
  )
}

export default PublicationPageList
