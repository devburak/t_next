import React, { useEffect } from 'react';
import {$getRoot, $getSelection} from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {  EditorState } from 'lexical';



const editorConfig = {
  // Editör için yapılandırmalar
  editable: false,
};

function LexicalEditor({ json }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Eğer editor veya json mevcut değilse, işlem yapma
    if (!editor || !json) {
      return;
    }

    // JSON'dan EditorState oluştur
    const initialState = EditorState.createFromJSON(json);

    // Editörün durumunu güncelle
    editor.setEditorState(initialState);

  }, [editor, json]);

  return <ContentEditable />;
}

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
function onChange(editorState) {
    editorState.read(() => {
      // Read the contents of the EditorState here.
      const root = $getRoot();
      const selection = $getSelection();
  
      console.log(root, selection);
    });
  }
  

export default function LexicalJSONRenderer(lexicalJSON ) {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <PlainTextPlugin contentEditable={<ContentEditable />} placeholder="Yükleniyor..." />
      <LexicalEditor json={lexicalJSON} />
      <OnChangePlugin onChange={onChange} />
    </LexicalComposer>
  );
}
