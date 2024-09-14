/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import katex from 'katex';
import React, { Suspense } from 'react';
import { $applyNodeReplacement, DecoratorNode, DOMExportOutput } from 'lexical';

const EquationComponent = React.lazy(() => import('./EquationComponent'));

function convertEquationElement(domNode) {
  let equation = domNode.getAttribute('data-lexical-equation');
  const inline = domNode.getAttribute('data-lexical-inline') === 'true';
  
  // Decode the equation from base64
  equation = atob(equation || '');
  if (equation) {
    const node = $createEquationNode(equation, inline);
    return { node };
  }
  return null;
}

export class EquationNode extends DecoratorNode {
  constructor(equation, inline, key) {
    super(key);
    this.__equation = equation;
    this.__inline = inline || false;
  }

  static getType() {
    return 'equation';
  }

  static clone(node) {
    return new EquationNode(node.__equation, node.__inline, node.__key);
  }

  static importJSON(serializedNode) {
    const node = $createEquationNode(serializedNode.equation, serializedNode.inline);
    return node;
  }

  exportJSON() {
    return {
      equation: this.getEquation(),
      inline: this.__inline,
      type: 'equation',
      version: 1,
    };
  }

  createDOM(_config) {
    const element = document.createElement(this.__inline ? 'span' : 'div');
    element.className = 'editor-equation';
    return element;
  }

  exportDOM() {
    const element = document.createElement(this.__inline ? 'span' : 'div');
    const equation = btoa(this.__equation);
    element.setAttribute('data-lexical-equation', equation);
    element.setAttribute('data-lexical-inline', `${this.__inline}`);
    katex.render(this.__equation, element, {
      displayMode: !this.__inline,
      errorColor: '#cc0000',
      output: 'html',
      strict: 'warn',
      throwOnError: false,
      trust: false,
    });
    return { element };
  }

  static importDOM() {
    return {
      div: function(domNode) {
        if (!domNode.hasAttribute('data-lexical-equation')) {
          return null;
        }
        return {
          conversion: convertEquationElement,
          priority: 2,
        };
      },
      span: function(domNode) {
        if (!domNode.hasAttribute('data-lexical-equation')) {
          return null;
        }
        return {
          conversion: convertEquationElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(prevNode) {
    return this.__inline !== prevNode.__inline;
  }

  getTextContent() {
    return this.__equation;
  }

  getEquation() {
    return this.__equation;
  }

  setEquation(equation) {
    const writable = this.getWritable();
    writable.__equation = equation;
  }

  decorate() {
    return (
      <Suspense fallback={null}>
        <EquationComponent
          equation={this.__equation}
          inline={this.__inline}
          nodeKey={this.__key}
        />
      </Suspense>
    );
  }
}

export function $createEquationNode(equation = '', inline = false) {
  const equationNode = new EquationNode(equation, inline);
  return $applyNodeReplacement(equationNode);
}

export function $isEquationNode(node) {
  return node instanceof EquationNode;
}
