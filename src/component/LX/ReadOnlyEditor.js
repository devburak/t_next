import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createHeadlessEditor } from 'lexical';

function ReadOnlyEditor({ htmlContent }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    editor.update(() => {
      try {
        // Lexical'in Headless Editor'unu oluştur
        const headlessEditor = createHeadlessEditor();

        // HTML içeriğini içeri aktar
        headlessEditor.update(() => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          const root = headlessEditor.getRootElement();

          if (doc.body) {
            root.append(...Array.from(doc.body.childNodes));
          }
        });

        // İçeriği ana editöre aktar
        const editorState = headlessEditor.getEditorState();
        editor.setEditorState(editorState);
      } catch (error) {
        console.error('Error importing HTML using Lexical:', error);
      }
    });
  }, [editor, htmlContent]);

  return <div className="editor-container" />;
}

export default ReadOnlyEditor;
