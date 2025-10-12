export const CONSTANTS = {
    SECTION_KEY: 'chat_ideas',
    DEFAULT_THEME_ID: 1,
    VIEW_THRESHOLD_MS: 30000,
    INTERSECTION_THRESHOLD: 0.75,
    TEXT_EXPAND_THRESHOLD: 160,
    BACKEND_BASE_URL: process.env.REACT_APP_API_URL || 'https://tight-guarantees-discs-announcement.trycloudflare.com/',
    
    FILE_ACCEPT: {
      MEDIA: 'image/*,video/*',
      DOCUMENTS: '.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt'
    },
    
    IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    VIDEO_EXTENSIONS: ['mp4', 'webm', 'ogg'],
    
    PUBLISHING_METHODS: {
      ORIGINAL: 'original',
      GPT: 'gpt'
    },
    
    POST_TYPES: {
      POST: 'post',
      COMMENT: 'comment'
    }
  };