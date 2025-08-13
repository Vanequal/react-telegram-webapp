import React from 'react';
import '../../styles/FooterIcons.scss';

import DefaultPigIcon from '../../assets/img/pig.webp';
import DefaultHeadIcon from '../../assets/img/head.webp';
import DefaultTypewriterIcon from '../../assets/img/typewriter.webp';
import DefaultGearIcon from '../../assets/img/gear.webp';
import DefaultMicroscopeIcon from '../../assets/img/microscope.webp';

const FooterIcons = ({
  showPig = true,
  showHead = true,
  showTypewriter = true,
  showGear = true,
  showMicroscope = true,
  pigIcon = DefaultPigIcon,
  headIcon = DefaultHeadIcon,
  typewriterIcon = DefaultTypewriterIcon,
  gearIcon = DefaultGearIcon,
  microscopeIcon = DefaultMicroscopeIcon,
  onPigClick,
  onHeadClick,
  onTypewriterClick,
  onGearClick,
  onMicroscopeClick,
}) => {
  return (
    <div className="footer-icons">
      {showPig && (
        <a href="/mindvault">
          <img
            src={pigIcon}
            alt="Pig"
            className="footer-icons__icon footer-icons__icon--pig"
            onClick={onPigClick}
          />
        </a>
      )}
      {showHead && (
        <a href='/questionchatpage'>
          <img
            src={headIcon}
            alt="Head"
            className="footer-icons__icon"
            onClick={onHeadClick}
          />
        </a>
      )}
      {showTypewriter && (
        <a href='/publicationpage'>
          <img
            src={typewriterIcon}
            alt="Typewriter"
            className="footer-icons__icon"
            onClick={onTypewriterClick}
          />
        </a>
      )}
      {showGear && (
        <a href='/taskchatpage'>
          <img
            src={gearIcon}
            alt="Gear"
            className="footer-icons__icon"
            onClick={onGearClick}
          />
        </a>
      )}
      {showMicroscope && (
        <a href='/laboratorypage'>
          <img
            src={microscopeIcon}
            alt="Microscope"
            className="footer-icons__icon"
            onClick={onMicroscopeClick}
          />
        </a>
      )}
    </div>
  );
};

export default FooterIcons;
