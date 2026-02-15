import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createTask, fetchTasks, fetchMessageAttachments, createComment, fetchPostComments, completeTask } from '@/store/slices/postSlice';
import { SECTION_CODES, DEFAULT_THEME_ID } from '@/shared/constants/sections';
import logger from '@/shared/utils/logger';
import { showError } from '@/shared/utils/notifications';

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader';
import TaskList from '@/features/tasks/components/TaskList';
import TaskComposeForm from '@/features/tasks/components/TaskComposeForm';
import TaskPreviewScreen from '@/features/tasks/components/TaskPreviewScreen';
import TaskRatingScreen from '@/features/tasks/components/TaskRatingScreen';
import TaskFooter from '@/features/tasks/components/TaskFooter';
import TaskCompletionModal from '@/features/tasks/components/TaskCompletionModal';
import TaskResultScreen from '@/features/tasks/components/TaskResultScreen';
import TaskCard from '@/features/tasks/components/TaskCard';
import CommentThread from '@/features/discussion/components/CommentThread';

import { useTaskForm } from '@/features/tasks/hooks/useTaskForm';
import { useTaskRating } from '@/features/tasks/hooks/useTaskRating';
import { useTaskPreview } from '@/features/tasks/hooks/useTaskPreview';

import '@/styles/features/TaskChatPage.scss';
import '@/styles/features/discussion.scss';

const SECTION_CODE = SECTION_CODES.CHAT_TASKS;
const COMMENT_SECTION_CODE = 'discussion'; // Бэкенд не поддерживает chat_tasks для комментариев
const THEME_ID = DEFAULT_THEME_ID;

const TaskChatPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { posts, loading, error, commentsLoading } = useSelector((state) => state.post);
  // step: 'list' | 'compose' | 'preview' | 'rating' | 'detail' | 'result' | 'completing'
  const [step, setStep] = useState('list');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail view state (comments)
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentFiles, setCommentFiles] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  // Completion state
  const [completionTaskId, setCompletionTaskId] = useState(null);
  const [completionItem, setCompletionItem] = useState(null);
  const [completionFiles, setCompletionFiles] = useState([]);
  const [completionDescription, setCompletionDescription] = useState('');

  // Result screen state
  const [resultTaskId, setResultTaskId] = useState(null);

  const taskForm = useTaskForm();
  const taskRating = useTaskRating();
  const taskPreview = useTaskPreview(SECTION_CODE, THEME_ID);

  const tasks = posts.filter(
    (post) => post.type === 'task' && post.section_code === SECTION_CODE
  );

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const resultTask = tasks.find(t => t.id === resultTaskId);
  const completionTask = tasks.find(t => t.id === completionTaskId);
  const comments = useSelector(state => state.post.comments[selectedTaskId] || []);

  useEffect(() => {
    dispatch(
      fetchTasks({
        section_code: SECTION_CODE,
        theme_id: THEME_ID
      })
    );
  }, [dispatch]);

  // Load attachments for tasks
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    tasks.forEach(task => {
      if (!task.attachments) {
        dispatch(fetchMessageAttachments({ message_id: task.id }));
      }
    });
  }, [tasks.length, dispatch]);

  // Load comments when detail view is open
  useEffect(() => {
    if (step === 'detail' && selectedTaskId && !commentsLoaded && !commentsLoading) {
      setCommentsLoaded(true);
      dispatch(
        fetchPostComments({
          post_id: selectedTaskId,
          section_code: COMMENT_SECTION_CODE,
          theme_id: THEME_ID,
        })
      );
    }
  }, [step, selectedTaskId, commentsLoaded, commentsLoading, dispatch]);

  // --- List handlers ---
  const handleInputFocus = useCallback(() => {
    setStep('compose');
  }, []);

  const handleCommentClick = useCallback((taskId) => {
    setSelectedTaskId(taskId);
    setCommentsLoaded(false);
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
        createComment({
          post_id: selectedTaskId,
          message_text: commentText.trim(),
          section_code: COMMENT_SECTION_CODE,
          theme_id: THEME_ID,
          files: commentFiles,
        })
      ).unwrap();

      setCommentText('');
      setCommentFiles([]);
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      showError(`Ошибка комментария: ${typeof error === 'string' ? error : JSON.stringify(error)}`);
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
          section_code: COMMENT_SECTION_CODE,
          theme_id: THEME_ID,
          description: completionDescription.trim(),
          files: completionFiles,
        })
      ).unwrap();

      logger.log('Task completed successfully');
      setStep('list');
      setCompletionTaskId(null);
      setCompletionItem(null);
      setCompletionFiles([]);
      setCompletionDescription('');

      // Reload tasks
      dispatch(fetchTasks({ section_code: SECTION_CODE, theme_id: THEME_ID }));
    } catch (error) {
      logger.error('Error completing task:', error);
      showError(`Ошибка завершения задачи: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [completionTaskId, completionFiles, completionDescription, isSubmitting, dispatch]);

  // --- Compose/Preview/Rating handlers ---
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

      taskForm.resetForm();
      taskRating.resetRating();
      taskPreview.resetPreview();
      setStep('list');

      try {
        await dispatch(fetchTasks({ section_code: SECTION_CODE, theme_id: THEME_ID })).unwrap();
      } catch (fetchError) {
        logger.warn('Error reloading tasks (non-critical):', fetchError);
      }
    } catch (error) {
      logger.error('Error publishing task:', error);
      showError(`Ошибка публикации задачи: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [taskForm, taskRating, taskPreview, dispatch]);

  // --- Navigation ---
  const handleBackClick = useCallback(() => {
    if (step === 'detail' || step === 'result' || step === 'completing') {
      setStep('list');
      setSelectedTaskId(null);
      setResultTaskId(null);
      setCompletionTaskId(null);
      setCommentsLoaded(false);
    } else if (step !== 'list') {
      setStep('list');
    } else {
      navigate('/');
    }
  }, [step, navigate]);

  const isRatingStep = step === 'rating';
  const isCompletingStep = step === 'completing';

  // --- Result screen ---
  if (step === 'result' && resultTask) {
    return (
      <TaskResultScreen
        task={resultTask}
        sectionCode={COMMENT_SECTION_CODE}
        themeId={THEME_ID}
        onBack={handleBackClick}
      />
    );
  }

  return (
    <div
      className="task-chat-page"
      style={isRatingStep ? { background: 'rgba(0, 44, 87, 0.8)' } : undefined}
    >
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
        hideDescription={isRatingStep}
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
            />
          </div>

          <TaskFooter
            mode="create"
            onAttachClick={taskForm.handleAttachClick}
            onInputFocus={handleInputFocus}
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
              />
            </div>

            <div style={{ margin: '20px 16px', height: '1px', backgroundColor: '#E2E6E9' }} />

            <div style={{ margin: '0 16px', marginBottom: '80px' }}>
              {commentsLoading && (
                <p style={{ textAlign: 'center', color: '#666' }}>Загрузка комментариев...</p>
              )}

              {!commentsLoading && comments.length > 0
                ? comments.map(comment => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      sectionCode={COMMENT_SECTION_CODE}
                      themeId={THEME_ID}
                    />
                  ))
                : !commentsLoading && commentsLoaded && (
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
          />

          <TaskFooter
            mode="complete"
            value={completionDescription}
            onChange={setCompletionDescription}
            onSend={handleCompletionSend}
            onFileSelect={handleCompletionFileSelect}
            hasFiles={completionFiles.length > 0}
            isSubmitting={isSubmitting}
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
        />
      )}

      {/* Step: Preview */}
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

      {/* Step: Rating */}
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
