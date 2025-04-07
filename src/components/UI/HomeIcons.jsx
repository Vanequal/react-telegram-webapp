import React from 'react';
import '../../styles/HomeIcons.scss';

// Импорт иконок по умолчанию
import DefaultBackIcon from '../../assets/img/back.webp';
import DefaultTimeIcon from '../../assets/img/time.webp';
import DefaultPautineIcon from '../../assets/img/pautine.webp';
import DefaultMessengerIcon from '../../assets/img/messanger.webp';
import DefaultResumeIcon from '../../assets/img/resume.webp';

const HomeIcons = ({
  showBack = true,
  showTime = true,
  showPautine = true,
  showMessenger = true,
  showResume = true,
  backIcon = DefaultBackIcon,
  timeIcon = DefaultTimeIcon,
  pautineIcon = DefaultPautineIcon,
  messengerIcon = DefaultMessengerIcon,
  resumeIcon = DefaultResumeIcon,
  onBackClick,
  onTimeClick,
  onPautineClick,
  onMessengerClick,
  onResumeClick,
}) => {
  return (
    <div className="home-icons">
      {showBack && (
        <img
          src={backIcon}
          alt="Back"
          className="home-icons__icon"
          onClick={onBackClick}
        />
      )}
      {showTime && (
        <img
          src={timeIcon}
          alt="Time"
          className="home-icons__icon"
          onClick={onTimeClick}
        />
      )}
      {showPautine && (
        <img
          src={pautineIcon}
          alt="Pautine"
          className="home-icons__icon"
          onClick={onPautineClick}
        />
      )}
      {showMessenger && (
        <img
          src={messengerIcon}
          alt="Messenger"
          className="home-icons__icon"
          onClick={onMessengerClick}
        />
      )}
      {showResume && (
        <img
          src={resumeIcon}
          alt="Resume"
          className="home-icons__icon"
          onClick={onResumeClick}
        />
      )}
    </div>
  );
};

export default HomeIcons;
