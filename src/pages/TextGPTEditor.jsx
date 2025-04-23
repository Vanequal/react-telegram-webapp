import React from 'react';
import MindVaultHeader from '../components/UI/MindVaultHeader';

import '../styles/TextGPTEditor.scss';

const TextGPTEditor = () => {
  return (
    <div className="text-gpt-editor">
      <MindVaultHeader
        title="Редактировать"
        onBackClick={() => window.history.back()}
        hideSectionTitle={true}
        hideDescription={true}
        bgColor={'#EEEFF1'}
        textColor='black'
      />

      <div className="text-gpt-editor__content">
        <p className="text-gpt-editor__main-text">
          Разработать новый вид <br /> опылителей-насекомых для теплиц.
        </p>
      </div>
    </div>
  );
};

export default TextGPTEditor;
