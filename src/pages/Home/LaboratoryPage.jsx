import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createTask, fetchTasks, fetchMessageAttachments, createTaskComment, completeTask } from '@/store/slices/postSlice';
import { SECTION_CODES, DEFAULT_THEME_ID } from '@/shared/constants/sections';
import logger from '@/shared/utils/logger';
import { showError } from '@/shared/utils/notifications';

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader';
import TaskList from '@/features/tasks/components/TaskList';
import TaskComposeForm from '@/features/tasks/components/TaskComposeForm';
import TaskPreviewScreen from '@/features/tasks/components/TaskPreviewScreen';
import TaskFooter from '@/features/tasks/components/TaskFooter';
import TaskCompletionModal from '@/features/tasks/components/TaskCompletionModal';
import TaskResultScreen from '@/features/tasks/components/TaskResultScreen';
import TaskCard from '@/features/tasks/components/TaskCard';
import CommentThread from '@/features/discussion/components/CommentThread';

import { useTaskForm } from '@/features/tasks/hooks/useTaskForm';
import { useTaskPreview } from '@/features/tasks/hooks/useTaskPreview';

import '@/styles/features/TaskChatPage.scss';
import '@/styles/features/discussion.scss';

const SECTION_CODE = SECTION_CODES.CHAT_EXPERIMENTS;
const THEME_ID = DEFAULT_THEME_ID;

// Labels for experiment context
const EXPERIMENT_LABELS = {
  // Footer
  create: 'Добавить эксперимент',
  // Empty state
  emptyTop: 'В [Заголовок раздела] ещё нет опубликованных экспериментов',
  emptyBottom: 'Придумайте название эксперимента и сформулируйте его сценарий',
  loading: 'Загрузка экспериментов...',
  // Compose
  titleLabel: 'Название эксперимента:',
  descLabel: 'Сценарий эксперимента:',
  titlePlaceholder: 'Введите название',
  descPlaceholder: 'Опишите сценарий',
  // Card
  helpButton: 'Готов помочь с экспериментом',
  completed: 'Эксперимент выполнен',
  // Accept modal
  acceptFull: 'Вы готовы провести весь эксперимент',
  acceptPartial: 'Вы готовы провести часть эксперимента',
  // In progress
  fullInProgress: 'Эксперимент в работе',
  partialInProgress: 'Часть эксперимента в работе',
  // Completion modal
  completionTitle: 'Эксперимент выполнен?',
  completionHint: 'После прикрепления файла добавьте краткий комментарий с описанием результатов проведения эксперимента или выделите ключевые выводы, связанные с текущим разделом проекта.',
};

const LaboratoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { posts, loading, error } = useSelector((state) => state.post);
  // step: 'list' | 'compose' | 'preview' | 'detail' | 'result' | 'completing'
  const [step, setStep] = useState('list');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail view state
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentFiles, setCommentFiles] = useState([]);

  // Completion state
  const [completionTaskId, setCompletionTaskId] = useState(null);
  const [completionItem, setCompletionItem] = useState(null);
  const [completionFiles, setCompletionFiles] = useState([]);
  const [completionDescription, setCompletionDescription] = useState('');

  // Result screen state
  const [resultTaskId, setResultTaskId] = useState(null);

  const taskForm = useTaskForm();
  const taskPreview = useTaskPreview(SECTION_CODE, THEME_ID);

  const tasks = posts.filter(
    (post) => post.type === 'task' && post.section_code === SECTION_CODE
  );

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const resultTask = tasks.find(t => t.id === resultTaskId);

  // Comments = executions
  const taskExecutions = selectedTask?.executions || [];
  const comments = taskExecutions.map(exec => ({
    id: exec.message?.id,
    author_id: exec.message?.author_id,
    text: exec.message?.text || '',
    created_at: exec.message?.created_at,
    type: 'comment',
    status: exec.message_task?.status,
    is_partially: exec.message_task?.is_partially,
    reactions: exec.message?.reactions || null,
  }));

  useEffect(() => {
    dispatch(
      fetchTasks({
        section_code: SECTION_CODE,
        theme_id: THEME_ID
      })
    );
  }, [dispatch]);

  // Load attachments
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    tasks.forEach(task => {
      if (!task.attachments) {
        dispatch(fetchMessageAttachments({ message_id: task.id }));
      }
    });
  }, [tasks.length, dispatch]);

  // --- List handlers ---
  const handleInputFocus = useCallback(() => {
    setStep('compose');
  }, []);

  const handleCommentClick = useCallback((taskId) => {
    setSelectedTaskId(taskId);
    setCommentText('');
    setCommentFiles([]);
    setStep('detail');
  }, []);

  const handleTaskComplete = useCallback((taskId, item) => {
    setCompletionTaskId(taskId);
    setCompletionItem(item);
    setCompletionFiles([]);
    setCompletionDescription('');
    setStep('completing');
  }, []);

  const handleCompletedClick = useCallback((taskId) => {
    setResultTaskId(taskId);
    setStep('result');
  }, []);

  // --- Detail (comments) handlers ---
  const handleSendComment = useCallback(async () => {
    if ((!commentText.trim() && commentFiles.length === 0) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        createTaskComment({
          post_id: selectedTaskId,
          message_text: commentText.trim(),
          section_code: SECTION_CODE,
          theme_id: THEME_ID,
          files: commentFiles,
        })
      ).unwrap();

      setCommentText('');
      setCommentFiles([]);

      dispatch(fetchTasks({ section_code: SECTION_CODE, theme_id: THEME_ID }));
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      const msg = typeof error === 'string' ? error : 'Неизвестная ошибка';
      showError(`Ошибка: ${msg.slice(0, 150)}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [commentText, commentFiles, isSubmitting, dispatch, selectedTaskId]);

  const handleCommentFileSelect = useCallback((files) => {
    setCommentFiles(prev => [...prev, ...files]);
  }, []);

  // --- Completion handlers ---
  const handleCompletionFileSelect = useCallback((files) => {
    setCompletionFiles(prev => [...prev, ...files]);
  }, []);

  const handleCompletionSend = useCallback(async () => {
    if (completionFiles.length === 0 || !completionDescription.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        completeTask({
          task_message_id: completionTaskId,
          section_code: SECTION_CODE,
          theme_id: THEME_ID,
          description: completionDescription.trim(),
          files: completionFiles,
        })
      ).unwrap();

      logger.log('Experiment completed successfully');
      setStep('list');
      setCompletionTaskId(null);
      setCompletionItem(null);
      setCompletionFiles([]);
      setCompletionDescription('');

      dispatch(fetchTasks({ section_code: SECTION_CODE, theme_id: THEME_ID }));
    } catch (error) {
      logger.error('Error completing experiment:', error);
      const msg = typeof error === 'string' ? error : 'Неизвестная ошибка';
      showError(`Ошибка: ${msg.slice(0, 150)}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [completionTaskId, completionFiles, completionDescription, isSubmitting, dispatch]);

  // --- Compose/Preview handlers (NO rating step) ---
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
        // GPT unavailable — publish directly
        await publishExperiment(
          `${taskForm.title.trim()}\n\n${taskForm.description.trim()}`,
          false
        );
      } else {
        showError('Ошибка получения preview от GPT');
      }
    } catch (error) {
      logger.error('Error in handlePublishClick:', error);
      // If GPT fails, publish directly
      try {
        await publishExperiment(
          `${taskForm.title.trim()}\n\n${taskForm.description.trim()}`,
          false
        );
      } catch (publishError) {
        showError('Произошла ошибка при публикации эксперимента');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [taskForm.canPublish, taskForm.title, taskForm.description, taskPreview]);

  const publishExperiment = useCallback(async (text, isGpt) => {
    const taskParams = {
      message_text: text,
      section_code: SECTION_CODE,
      theme_id: THEME_ID,
      files: taskForm.selectedFiles,
      ratio: 1,
    };

    await dispatch(createTask(taskParams)).unwrap();

    taskForm.resetForm();
    taskPreview.resetPreview();
    setStep('list');

    try {
      await dispatch(fetchTasks({ section_code: SECTION_CODE, theme_id: THEME_ID })).unwrap();
    } catch (fetchError) {
      logger.warn('Error reloading experiments (non-critical):', fetchError);
    }
  }, [taskForm, taskPreview, dispatch]);

  const handlePublishOriginal = useCallback(async () => {
    setIsSubmitting(true);
    try {
      taskPreview.handlePublishOriginal();
      const text = `${taskForm.title.trim()}\n\n${taskForm.description.trim()}`;
      await publishExperiment(text, false);
    } catch (error) {
      logger.error('Error publishing original:', error);
      showError(`Ошибка публикации: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [taskPreview, taskForm, publishExperiment]);

  const handlePublishGPT = useCallback(async () => {
    setIsSubmitting(true);
    try {
      taskPreview.handlePublishGPT();
      await publishExperiment(taskPreview.editedGptText, true);
    } catch (error) {
      logger.error('Error publishing GPT version:', error);
      showError(`Ошибка публикации: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [taskPreview, publishExperiment]);

  const handleEditGPT = useCallback(() => {
    taskPreview.handleEditGPT(taskPreview.editedGptText);
    taskForm.setDescription(taskPreview.editedGptText);
    setStep('compose');
  }, [taskPreview, taskForm]);

  // --- Navigation ---
  const handleBackClick = useCallback(() => {
    if (step === 'detail' || step === 'result' || step === 'completing') {
      setStep('list');
      setSelectedTaskId(null);
      setResultTaskId(null);
      setCompletionTaskId(null);
    } else if (step !== 'list') {
      setStep('list');
    } else {
      navigate('/');
    }
  }, [step, navigate]);

  const isCompletingStep = step === 'completing';

  // --- Result screen ---
  if (step === 'result' && resultTask) {
    return (
      <TaskResultScreen
        task={resultTask}
        sectionCode={SECTION_CODE}
        themeId={THEME_ID}
        onBack={handleBackClick}
        labels={EXPERIMENT_LABELS}
      />
    );
  }

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

      {/* Step: List */}
      {step === 'list' && (
        <>
          <div className="task-chat-page__content">
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              sectionCode={SECTION_CODE}
              themeId={THEME_ID}
              onCommentClick={handleCommentClick}
              onTaskComplete={handleTaskComplete}
              onCompletedClick={handleCompletedClick}
              labels={EXPERIMENT_LABELS}
            />
          </div>

          <TaskFooter
            mode="create"
            onAttachClick={taskForm.handleAttachClick}
            onInputFocus={handleInputFocus}
            labels={EXPERIMENT_LABELS}
          />
        </>
      )}

      {/* Step: Detail (comments) */}
      {step === 'detail' && selectedTask && (
        <>
          <div className="task-chat-page__content">
            <div className="task-chat-page__list">
              <TaskCard
                task={selectedTask}
                sectionCode={SECTION_CODE}
                themeId={THEME_ID}
                onCommentClick={handleCommentClick}
                onTaskComplete={handleTaskComplete}
                onCompletedClick={handleCompletedClick}
                labels={EXPERIMENT_LABELS}
              />
            </div>

            <div style={{ margin: '20px 16px', height: '1px', backgroundColor: '#E2E6E9' }} />

            <div style={{ margin: '0 16px', marginBottom: '80px' }}>
              {comments.length > 0
                ? comments.map(comment => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      sectionCode={SECTION_CODE}
                      themeId={THEME_ID}
                    />
                  ))
                : (
                    <p style={{ textAlign: 'center', color: '#666' }}>Комментариев пока нет</p>
                  )}
            </div>
          </div>

          <TaskFooter
            mode="comment"
            value={commentText}
            onChange={setCommentText}
            onSend={handleSendComment}
            onFileSelect={handleCommentFileSelect}
            hasFiles={commentFiles.length > 0}
            isSubmitting={isSubmitting}
            labels={EXPERIMENT_LABELS}
          />
        </>
      )}

      {/* Step: Completing (modal + footer) */}
      {isCompletingStep && (
        <>
          <div className="task-chat-page__content">
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              sectionCode={SECTION_CODE}
              themeId={THEME_ID}
              onCommentClick={handleCommentClick}
              onTaskComplete={handleTaskComplete}
              onCompletedClick={handleCompletedClick}
              labels={EXPERIMENT_LABELS}
            />
          </div>

          <TaskCompletionModal
            selectedFiles={completionFiles}
            onClose={() => {
              setStep('list');
              setCompletionTaskId(null);
              setCompletionFiles([]);
              setCompletionDescription('');
            }}
            labels={EXPERIMENT_LABELS}
          />

          <TaskFooter
            mode="complete"
            value={completionDescription}
            onChange={setCompletionDescription}
            onSend={handleCompletionSend}
            onFileSelect={handleCompletionFileSelect}
            hasFiles={completionFiles.length > 0}
            isSubmitting={isSubmitting}
            labels={EXPERIMENT_LABELS}
          />
        </>
      )}

      {/* Step: Compose */}
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
          labels={EXPERIMENT_LABELS}
        />
      )}

      {/* Step: Preview (GPT) */}
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
    </div>
  );
};

export default LaboratoryPage;
