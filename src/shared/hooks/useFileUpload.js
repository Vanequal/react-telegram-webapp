import { useState, useCallback, useRef } from 'react';

/**
 * Универсальный hook для загрузки файлов
 */
export const useFileUpload = (options = {}) => {
  const {
    multiple = true,
    accept = '*/*',
    maxFiles = 10
  } = options;

  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 0) {
      setSelectedFiles((prev) => {
        const newFiles = [...prev, ...files];
        return newFiles.slice(0, maxFiles);
      });
    }

    e.target.value = '';
  }, [maxFiles]);

  const removeFile = useCallback((index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  return {
    fileInputRef,
    selectedFiles,
    setSelectedFiles,
    handleAttachClick,
    handleFileSelect,
    removeFile,
    clearFiles,
    fileInputProps: {
      ref: fileInputRef,
      type: 'file',
      multiple,
      accept,
      style: { display: 'none' },
      onChange: handleFileSelect
    }
  };
};

export default useFileUpload;
