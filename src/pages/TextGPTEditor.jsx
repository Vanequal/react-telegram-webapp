import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MindVaultHeader from '../components/UI/MindVaultHeader';

import '../styles/TextGPTEditor.scss';

const TextGPTEditor = () => {
  const location = useLocation();
  const initialText = location.state?.gptText || ''; // <-- получили текст из state роутера
  const [text, setText] = useState(initialText);

  return (
    <div className="text-gpt-editor">
      <MindVaultHeader
        title="Редактировать"
        onBackClick={() => window.history.back()}
        hideSectionTitle={true}
        hideDescription={true}
        bgColor={'#EEEFF1'}
        textColor="black"
      />

      <div className="text-gpt-editor__content">
        <textarea
          className="text-gpt-editor__textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите текст..."
          autoFocus
        />
      </div>
    </div>
  );
};

export default TextGPTEditor;
