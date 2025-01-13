import dynamic from 'next/dynamic';
import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import PlaygroundEditorTheme from '../../styles/PlaygroundEditorTheme';
import CustomNodes from './nodes/CustomNodes';
import LexicalFallbackContent from './LexicalFallbackContent';

const ReadOnlyEditor = dynamic(() => import('./ReadOnlyEditor'), { ssr: false });
const isServer = typeof window === 'undefined';

function LexicalReadOnlyContent({ htmlContent }) {
  if (isServer) {
    return <LexicalFallbackContent htmlContent={htmlContent} />;
  }

  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'ReadOnlyEditor',
        theme: PlaygroundEditorTheme,
        nodes: CustomNodes,
        onError: (error) => console.error('Editor Error:', error),
        editable: false,
      }}
    >
      <ReadOnlyEditor htmlContent={htmlContent} />
    </LexicalComposer>
  );
}

export default LexicalReadOnlyContent;
