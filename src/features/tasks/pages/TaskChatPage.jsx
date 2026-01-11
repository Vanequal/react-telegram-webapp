import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createTask, fetchTasks } from '@/store/slices/postSlice';
import { SECTION_CODES, DEFAULT_THEME_ID } from '@/shared/constants/sections';
import logger from '@/shared/utils/logger';
import { showError } from '@/shared/utils/notifications';

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader';
import TaskList from '@/features/tasks/components/TaskList';
import TaskComposeForm from '@/features/tasks/components/TaskComposeForm';
import TaskPreviewScreen from '@/features/tasks/components/TaskPreviewScreen';
import TaskRatingScreen from '@/features/tasks/components/TaskRatingScreen';
import TaskFooter from '@/features/tasks/components/TaskFooter';

import { useTaskForm } from '@/features/tasks/hooks/useTaskForm';
import { useTaskRating } from '@/features/tasks/hooks/useTaskRating';
import { useTaskPreview } from '@/features/tasks/hooks/useTaskPreview';

import '@/styles/features/TaskChatPage.scss';

const SECTION_CODE = SECTION_CODES.CHAT_TASKS;
const THEME_ID = DEFAULT_THEME_ID;

const TaskChatPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { posts, loading, error } = useSelector((state) => state.post);
  const [step, setStep] = useState('list');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const taskForm = useTaskForm();
  const taskRating = useTaskRating();
  const taskPreview = useTaskPreview(SECTION_CODE, THEME_ID);

  const tasks = posts.filter(
    (post) => post.type === 'task' && post.section_code === SECTION_CODE
  );

  logger.log('Total posts in store:', posts.length);
  logger.log('Tasks after filtering:', tasks.length);

  useEffect(() => {
    logger.log('TaskChatPage mounting, loading tasks...');
    dispatch(
      fetchTasks({
        section_code: SECTION_CODE,
        theme_id: THEME_ID
      })
    );
  }, [dispatch]);

  const handleInputFocus = useCallback(() => {
    setStep('compose');
  }, []);

  const handlePublishClick = useCallback(async () => {
    if (!taskForm.canPublish) return;

    setIsSubmitting(true);

    try {
      const result = await taskPreview.requestPreview(
        taskForm.title,
        taskForm.description
      );

      if (result.success) {
        setStep('preview');
      } else if (result.skipPreview) {
        logger.warn('OpenAI unavailable, skipping preview');
        setStep('rating');
      } else {
        showError('Ошибка получения preview от GPT');
      }
    } catch (error) {
      logger.error('Error in handlePublishClick:', error);
      showError('Произошла ошибка при обработке задачи');
    } finally {
      setIsSubmitting(false);
    }
  }, [taskForm.canPublish, taskForm.title, taskForm.description, taskPreview]);

  const handlePublishOriginal = useCallback(() => {
    taskPreview.handlePublishOriginal();
    setStep('rating');
  }, [taskPreview]);

  const handlePublishGPT = useCallback(() => {
    taskPreview.handlePublishGPT();
    setStep('rating');
  }, [taskPreview]);

  const handleEditGPT = useCallback(() => {
    taskPreview.handleEditGPT(taskPreview.editedGptText);
    taskForm.setDescription(taskPreview.editedGptText);
    setStep('compose');
  }, [taskPreview, taskForm]);

  const handleFinalPublish = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const taskText = taskPreview.useGPTVersion
        ? taskPreview.editedGptText
        : `${taskForm.title.trim()}\n\n${taskForm.description.trim()}`;

      logger.log('Publishing task:', {
        text: taskText,
        ratio: taskRating.skipRatio ? null : parseInt(taskRating.ratio) || null,
        files_count: taskForm.selectedFiles.length
      });

      const taskParams = {
        message_text: taskText,
        section_code: SECTION_CODE,
        theme_id: THEME_ID,
        files: taskForm.selectedFiles
      };

      if (!taskRating.skipRatio && taskRating.ratio) {
        taskParams.ratio = parseInt(taskRating.ratio);
      }

      await dispatch(createTask(taskParams)).unwrap();

      logger.log('Task created successfully');

      taskForm.resetForm();
      taskRating.resetRating();
      taskPreview.resetPreview();
      setStep('list');

      logger.log('Reloading task list...');
      // Перезагружаем список задач, но игнорируем ошибки (задача уже создана)
      try {
        await dispatch(
          fetchTasks({
            section_code: SECTION_CODE,
            theme_id: THEME_ID
          })
        ).unwrap();
        logger.log('Task list updated');
      } catch (fetchError) {
        // Игнорируем ошибки при перезагрузке, задача уже создана
        logger.warn('Error reloading tasks (non-critical):', fetchError);
      }
    } catch (error) {
      logger.error('Error publishing task:', error);
      showError(`Ошибка публикации задачи: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    taskForm,
    taskRating,
    taskPreview,
    dispatch
  ]);

  const handleBackClick = useCallback(() => {
    if (step !== 'list') {
      setStep('list');
    } else {
      navigate('/');
    }
  }, [step, navigate]);

  return (
    <div className="task-chat-page">
      <input
        ref={taskForm.fileInputRef}
        type="file"
        multiple
        accept="*/*"
        style={{ display: 'none' }}
        onChange={taskForm.handleFileSelect}
      />

      <MindVaultHeader
        bgColor="#EEEFF1"
        textColor="black"
        title="Чат задач"
        hideSectionTitle
        onBackClick={handleBackClick}
      />

      {step === 'list' && (
        <>
          <div className="task-chat-page__content">
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              sectionCode={SECTION_CODE}
              themeId={THEME_ID}
            />
          </div>

          <TaskFooter
            onAttachClick={taskForm.handleAttachClick}
            onInputFocus={handleInputFocus}
          />
        </>
      )}

      {step === 'compose' && (
        <TaskComposeForm
          title={taskForm.title}
          description={taskForm.description}
          selectedFiles={taskForm.selectedFiles}
          canPublish={taskForm.canPublish}
          isSubmitting={isSubmitting}
          onTitleChange={(e) => taskForm.setTitle(e.target.value)}
          onDescriptionChange={(e) => taskForm.setDescription(e.target.value)}
          onPublish={handlePublishClick}
        />
      )}

      {step === 'preview' && (
        <TaskPreviewScreen
          originalData={taskPreview.originalData}
          gptData={taskPreview.gptData}
          editedGptText={taskPreview.editedGptText}
          isSubmitting={isSubmitting}
          onPublishOriginal={handlePublishOriginal}
          onPublishGPT={handlePublishGPT}
          onEditGPT={handleEditGPT}
        />
      )}

      {step === 'rating' && (
        <TaskRatingScreen
          ratio={taskRating.ratio}
          skipRatio={taskRating.skipRatio}
          canSubmitRating={taskRating.canSubmitRating}
          isSubmitting={isSubmitting}
          onRatioChange={taskRating.handleRatioChange}
          onSkipToggle={taskRating.handleSkipToggle}
          onSubmit={handleFinalPublish}
        />
      )}
    </div>
  );
};

export default TaskChatPage;
