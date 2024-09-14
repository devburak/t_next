import escapeHTML from 'escape-html';
import {
  IS_BOLD,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_UNDERLINE,
  IS_CODE,
  IS_SUBSCRIPT,
  IS_SUPERSCRIPT,
} from './RichTextNodeFormat';

function getLinkForPage(doc) {
  return 'implement this';
}

/**
 * @param {Array} children - SerializedLexicalNode dizisi
 * @returns {string[]} - HTML string dizisi
 */
export function serialize(children) {
  return children
    .map((node) => {
      if (node.type === 'text') {
        let text = `${escapeHTML(node.text)}`;

        if (node.format & IS_BOLD) {
          text = `<strong>${text}</strong>`;
        }
        if (node.format & IS_ITALIC) {
          text = `<em>${text}</em>`;
        }
        if (node.format & IS_STRIKETHROUGH) {
          text = `<span class="line-through">${text}</span>`;
        }
        if (node.format & IS_UNDERLINE) {
          text = `<span class="underline">${text}</span>`;
        }
        if (node.format & IS_CODE) {
          text = `<code>${text}</code>`;
        }
        if (node.format & IS_SUBSCRIPT) {
          text = `<sub>${text}</sub>`;
        }
        if (node.format & IS_SUPERSCRIPT) {
          text = `<sup>${text}</sup>`;
        }
        return `${text}`;
      }
      // Image node işleme
      if (node.type === 'image') {
        const { src, altText, maxWidth, width, height } = node;
        // maxWidth kullanılabilirse kullan, yoksa width'i dene. İkisi de yoksa varsayılan genişlik.
        const imgWidth = maxWidth || width || 'auto';
        const imgHeight = height || 'auto';
        return `<img src="${src}" alt="${altText}" style="max-width:${imgWidth}px; height:${imgHeight}px;" />`;
    }

      if (!node) {
        return null;
      }

      const serializedChildren = node.children ? serialize(node.children).join('') : null;

      switch (node.type) {
        case 'linebreak':
          return `<br>`;
        case 'link':
          const attributes = node.attributes;

          if (attributes?.linkType === 'custom') {
            return `<a href="${attributes.url}"${attributes.newTab ? ' target="_blank"' : ''} rel="${attributes?.rel ?? ''}${attributes?.sponsored ? ' sponsored' : ''}${attributes?.nofollow ? ' nofollow' : ''}">${serializedChildren}</a>`;
          }

          // TODO: internal link handling
          return `<a href="${getLinkForPage(attributes?.doc)}"${attributes?.newTab ? ' target="_blank"' : ''} rel="${attributes?.rel ?? ''}${attributes?.sponsored ? ' sponsored' : ''}${attributes?.nofollow ? ' nofollow' : ''}">${serializedChildren}</a>`;
        case 'list':
          // TODO: properly handle especially nested lists
          if (node.listType === 'bullet') {
            return `<ul class="list-disc mb-4 pl-8">${serializedChildren}</ul>`;
          } else {
            return `<ol class="list-disc mb-4 pl-8">${serializedChildren}</ol>`;
          }
        case 'listitem':
          return `<li>${serializedChildren}</li>`;
        case 'heading':
          return `<${node.tag}>${serializedChildren}</${node.tag}>`;
        default:
          // Probably just a normal paragraph
          return `<p>${serializedChildren || '<br>'}</p>`;
      }
    })
    .filter((node) => node !== null);
}
