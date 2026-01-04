import { useState, useCallback, useRef } from 'react';

export const useTaskForm = () => {
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
    e.target.value = '';
  }, []);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setSelectedFiles([]);
  }, []);

  const canPublish = title.trim() || description.trim();

  return {
    fileInputRef,
    title,
    setTitle,
    description,
    setDescription,
    selectedFiles,
    setSelectedFiles,
    handleAttachClick,
    handleFileSelect,
    resetForm,
    canPublish
  };
};

export default useTaskForm;
