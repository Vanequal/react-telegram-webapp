import { useState, useCallback } from 'react';

export const useTaskRating = () => {
  const [ratio, setRatio] = useState('');
  const [skipRatio, setSkipRatio] = useState(false);

  const handleRatioChange = useCallback((e) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value)) {
      setRatio(value);
      if (value) setSkipRatio(false);
    }
  }, []);

  const handleSkipToggle = useCallback(() => {
    setSkipRatio((prev) => !prev);
    if (!skipRatio) setRatio('');
  }, [skipRatio]);

  const resetRating = useCallback(() => {
    setRatio('');
    setSkipRatio(false);
  }, []);

  const canSubmitRating = ratio.trim() !== '' || skipRatio;

  return {
    ratio,
    setRatio,
    skipRatio,
    setSkipRatio,
    handleRatioChange,
    handleSkipToggle,
    resetRating,
    canSubmitRating
  };
};

export default useTaskRating;
