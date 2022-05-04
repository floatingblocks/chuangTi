/*
    https://github.com/editor-js/underline
*/

/**
 * Underline Tool for the Editor.js
 *
 * Allows to wrap inline fragment and style it somehow.
 */
 class InlineLine {
    /**
     * Class name for term-tag
     *
     * @type {string}
     */
    static get CSS() {
      return 'inline-line';
    };
  
    /**
     * @param {{api: object}}  - Editor.js API
     */
    constructor({ api }) {
      this.api = api;
  
      /**
       * Toolbar Button
       *
       * @type {HTMLElement|null}
       */
      this.button = null;
  
      /**
       * Tag represented the term
       *
       * @type {string}
       */
      this.tag = 'SPAN';
  
      /**
       * CSS classes
       */
      this.iconClasses = {
        base: this.api.styles.inlineToolButton,
        active: this.api.styles.inlineToolButtonActive,
      };
    }
  
    /**
     * Specifies Tool as Inline Toolbar Tool
     *
     * @returns {boolean}
     */
    static get isInline() {
      return true;
    }
  
    /**
     * Create button element for Toolbar
     *
     * @returns {HTMLElement}
     */
    render() {
      this.button = document.createElement('button');
      this.button.type = 'button';
      this.button.classList.add(this.iconClasses.base);
      this.button.innerHTML = this.toolboxIcon;
  
      return this.button;
    }
  
    /**
     * Wrap/Unwrap selected fragment
     *
     * @param {Range} range - selected fragment
     */
    surround(range) {
      if (!range) {
        return;
      }
  
      const termWrapper = this.api.selection.findParentTag(this.tag, InlineLine.CSS);
  
      /**
       * If start or end of selection is in the highlighted block
       */
      if (termWrapper) {
        this.unwrap(termWrapper);
      } else {
        this.wrap(range);
      }
    }
  
    /**
     * Wrap selection with term-tag
     *
     * @param {Range} range - selected fragment
     */
    wrap(range) {
      /**
       * Create a wrapper for highlighting
       */
      const u = document.createElement(this.tag);
  
      u.classList.add(InlineLine.CSS);
  
      /**
       * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
       *
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
       *
       * // range.surroundContents(span);
       */
      u.appendChild(range.extractContents());
      range.insertNode(u);
  
      /**
       * Expand (add) selection to highlighted block
       */
      this.api.selection.expandToTag(u);
    }
  
    /**
     * Unwrap term-tag
     *
     * @param {HTMLElement} termWrapper - term wrapper tag
     */
    unwrap(termWrapper) {
      /**
       * Expand selection to all term-tag
       */
      this.api.selection.expandToTag(termWrapper);
  
      const sel = window.getSelection();
      const range = sel.getRangeAt(0);
  
      const unwrappedContent = range.extractContents();
  
      /**
       * Remove empty term-tag
       */
      termWrapper.parentNode.removeChild(termWrapper);
  
      /**
       * Insert extracted content
       */
      range.insertNode(unwrappedContent);
  
      /**
       * Restore selection
       */
      sel.removeAllRanges();
      sel.addRange(range);
    }
  
    /**
     * Check and change Term's state for current selection
     */
    checkState() {
      const termTag = this.api.selection.findParentTag(this.tag, InlineLine.CSS);
  
      this.button.classList.toggle(this.iconClasses.active, !!termTag);
    }
  
    /**
     * Get Tool icon's SVG
     *
     * @returns {string}
     */
    get toolboxIcon() {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M416 288C433.7 288 448 302.3 448 320C448 337.7 433.7 352 416 352H32C14.33 352 0 337.7 0 320C0 302.3 14.33 288 32 288H416zM416 160C433.7 160 448 174.3 448 192C448 209.7 433.7 224 416 224H32C14.33 224 0 209.7 0 192C0 174.3 14.33 160 32 160H416z"/></svg>';
    }
  
    /**
     * Sanitizer rule
     *
     * @returns {{u: {class: string}}}
     */
    static get sanitize() {
      return {
        u: {
          class: InlineLine.CSS,
        },
      };
    }
  }