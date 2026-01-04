import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Централизованная навигация для приложения
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();

  const goToHome = useCallback(() => navigate('/'), [navigate]);
  const goToMindVault = useCallback(() => navigate('/mindvault'), [navigate]);
  const goToTaskChat = useCallback(() => navigate('/taskchatpage'), [navigate]);
  const goToPublicationChat = useCallback(() => navigate('/publicationchatpage'), [navigate]);
  const goToQuestionChat = useCallback(() => navigate('/questionchatpage'), [navigate]);
  const goToDiscussion = useCallback((id) => navigate(`/discussion/${id}`), [navigate]);
  const goToProfile = useCallback(() => navigate('/myprofile'), [navigate]);
  const goBack = useCallback(() => navigate(-1), [navigate]);

  return {
    navigate,
    goToHome,
    goToMindVault,
    goToTaskChat,
    goToPublicationChat,
    goToQuestionChat,
    goToDiscussion,
    goToProfile,
    goBack
  };
};

export default useAppNavigation;
