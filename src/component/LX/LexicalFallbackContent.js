import React from 'react';
import PropTypes from 'prop-types';

function LexicalFallbackContent({ htmlContent }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        whiteSpace: 'pre-line', // Yeni satırları korur
        fontFamily: 'Arial, sans-serif', // Varsayılan bir font seçimi
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#333', // Metin rengi
        padding: '1rem',
      }}
    />
  );
}

LexicalFallbackContent.propTypes = {
  htmlContent: PropTypes.string.isRequired, // htmlContent'in string olması gerektiğini belirtiyoruz
};

export default LexicalFallbackContent;
