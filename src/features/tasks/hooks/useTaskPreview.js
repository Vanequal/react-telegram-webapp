import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { createPostPreview, clearError } from '@/store/slices/postSlice';
import logger from '@/shared/utils/logger';

export const useTaskPreview = (sectionCode, themeId) => {
  const dispatch = useDispatch();
  const [originalData, setOriginalData] = useState(null);
  const [gptData, setGptData] = useState(null);
  const [editedGptText, setEditedGptText] = useState('');
  const [useGPTVersion, setUseGPTVersion] = useState(false);

  const requestPreview = useCallback(async (title, description) => {
    const fullText = `${title.trim()}\n\n${description.trim()}`;
    logger.log('Requesting GPT preview for:', fullText);

    try {
      const previewResult = await dispatch(
        createPostPreview({
          section_code: sectionCode,
          theme_id: themeId,
          text: fullText
        })
      ).unwrap();

      logger.log('GPT response received:', previewResult);

      setOriginalData({
        title: title.trim(),
        description: description.trim()
      });

      const gptText = previewResult.openai_text || previewResult.gpt_text || 'No GPT response';
      setGptData({
        title: 'Улучшенная версия от ИИ',
        description: gptText
      });
      setEditedGptText(gptText);

      return { success: true };
    } catch (error) {
      logger.error('Error getting preview:', error);

      if (error === 'OpenAI временно недоступен') {
        dispatch(clearError());
        return { success: false, skipPreview: true };
      }

      return { success: false, error };
    }
  }, [dispatch, sectionCode, themeId]);

  const handlePublishOriginal = useCallback(() => {
    setUseGPTVersion(false);
  }, []);

  const handlePublishGPT = useCallback(() => {
    setUseGPTVersion(true);
  }, []);

  const handleEditGPT = useCallback((newText) => {
    setGptData((prev) => ({
      ...prev,
      description: newText
    }));
    setEditedGptText(newText);
  }, []);

  const resetPreview = useCallback(() => {
    setOriginalData(null);
    setGptData(null);
    setEditedGptText('');
    setUseGPTVersion(false);
  }, []);

  return {
    originalData,
    gptData,
    editedGptText,
    setEditedGptText,
    useGPTVersion,
    requestPreview,
    handlePublishOriginal,
    handlePublishGPT,
    handleEditGPT,
    resetPreview
  };
};

export default useTaskPreview;
