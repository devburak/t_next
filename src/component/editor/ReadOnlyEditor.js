// components/ReadOnlyEditor.js

import React, { useEffect } from 'react';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $insertNodes } from 'lexical';
// import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
function ReadOnlyEditor({ htmlContent }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      try {
        const parser = new DOMParser();
        const dom = parser.parseFromString(htmlContent, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().select();
        $insertNodes(nodes);
      } catch (error) {
        console.error('Error parsing HTML content for LexicalEditor:', error);
      }
    });
  }, [editor, htmlContent]);

  return (
    <RichTextPlugin
      contentEditable={<ContentEditable readOnly={true} className="editor-content" />}
      placeholder={null}  // Okuma modunda placeholder kullanmayabilirsiniz
      ErrorBoundary={LexicalErrorBoundary}
    />
  );
}

export default ReadOnlyEditor;
