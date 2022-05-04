/*
*   Modified from: https://github.com/editor-js/list/
*   https://github.com/editor-js/link
*/
/**
 * Build styles
 */

/**
 * @typedef {object} ListData
 * @property {string} style - can be ordered or unordered
 * @property {Array} items - li elements
 */

/**
* @typedef {object} ListConfig
* @description Tool's config from Editor
* @property {string} defaultStyle — ordered or unordered
*/

/**
 * List Tool for the Editor.js 2.0
 */
class Choice {

  /**
   * Notify core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Allow to use native Enter behaviour
   *
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: '<svg width="17" height="13" viewBox="0 0 17 13" xmlns="http://www.w3.org/2000/svg"> <path d="M5.625 4.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm0-4.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm0 9.85h9.25a1.125 1.125 0 0 1 0 2.25h-9.25a1.125 1.125 0 0 1 0-2.25zm-4.5-5a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zm0-4.85a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zm0 9.85a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25z"/></svg>',
      title: '选项',
    };
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {object} params - tool constructor options
   * @param {ListData} params.data - previously saved data
   * @param {object} params.config - user config for Tool
   * @param {object} params.api - Editor.js API
   * @param {boolean} params.readOnly - read-only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    /**
     * HTML nodes
     *
     * @private
     */
    this._elements = {
      wrapper: null,
    };

    this.api = api;
    this.readOnly = readOnly;

    this.settings = [
      {
        name: '添加描述',
        title: '添加描述',
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.28h2.25v.237h1.15-1.15zM1.9 8.455v-3.42c0-1.154.985-2.09 2.2-2.09h4.2v2.137H4.15v3.373H1.9zm0 2.137h2.25v3.325H8.3v2.138H4.1c-1.215 0-2.2-.936-2.2-2.09v-3.373zm15.05-2.137H14.7V5.082h-4.15V2.945h4.2c1.215 0 2.2.936 2.2 2.09v3.42z"/></svg>',
        default: false,
      },
    ];

    /**
     * Tool's data
     *
     * @type {ListData}
     */
    this._data = {
      style: 'ordered',
      items: [],
    };

    this.data = data;
  }

  /**
   * Returns list tag with items
   *
   * @returns {Element}
   * @public
   */
  render() {
    this._elements.wrapper = this.makeMainTag(this._data.style);

    // fill with data
    if (this._data.items.length) {
      this._data.items.forEach((item) => {
        this._elements.wrapper.appendChild(this._make('li', this.CSS.item, {
          innerHTML: item,
        }));
      });
    } else {
      for (let i = 0; i < 4; i++) {
        const oli = this._make('li', this.CSS.item);
        oli.textContent = "选项" + "ABCD"[i];
        this._elements.wrapper.appendChild(oli);
      }
    }

    if (!this.readOnly) {
      // detect keydown on the last item to escape List
      this._elements.wrapper.addEventListener('keydown', (event) => {
        const [ENTER, BACKSPACE] = [13, 8]; // key codes

        switch (event.keyCode) {
          case ENTER:
            this.getOutofList(event);
            break;
          case BACKSPACE:
            this.backspace(event);
            break;
        }
      }, false);
    }

    const labelAns = document.createElement('label');
    labelAns.textContent = "答案: ";
    labelAns.for = "answerInput";
    labelAns.className = "input-group-text";

    this.inputAns = document.createElement('input');
    this.inputAns.className = "input-ans form-control";
    this.inputAns.id = "answerInput"
    this.inputAns.placeholder = "请用大写英文字母";

    const ansDiv = document.createElement('div');
    ansDiv.appendChild(labelAns);
    ansDiv.appendChild(this.inputAns);
    ansDiv.className = "input-group";

    this.wholeWrapper = document.createElement('div');

    this.wholeWrapper.appendChild(this._elements.wrapper);
    this.wholeWrapper.appendChild(ansDiv);

    return this.wholeWrapper;
  }

  /**
   * @returns {ListData}
   * @public
   */
  save() {
    return this.data;
  }

  /**
   * Allow List Tool to be converted to/from other block
   *
   * @returns {{export: Function, import: Function}}
   */
  static get conversionConfig() {
    return {
      /**
       * To create exported string from list, concatenate items by dot-symbol.
       *
       * @param {ListData} data - list data to create a string from thats
       * @returns {string}
       */
      export: (data) => {
        return data.items.join('. ');
      },
      /**
       * To create a list from other block's string, just put it at the first item
       *
       * @param {string} string - string to create list tool data from that
       * @returns {ListData}
       */
      import: (string) => {
        return {
          items: [string],
          style: 'orderd',
        };
      },
    };
  }

  /**
   * Sanitizer rules
   *
   * @returns {object}
   */
  static get sanitize() {
    return {
      style: {},
      items: {
        br: true,
      },
    };
  }

  /**
   * Settings
   *
   * @public
   * @returns {Element}
   */
  renderSettings() {
    const wrapper = this._make('div', [this.CSS.settingsWrapper], {});

    this.settings.forEach((item) => {
      const itemEl = this._make('div', this.CSS.settingsButton, {
        innerHTML: item.icon,
      });

      itemEl.addEventListener('click', () => {
        this.toggleTune(item.name);

        // clear other buttons
        const buttons = itemEl.parentNode.querySelectorAll('.' + this.CSS.settingsButton);

        Array.from(buttons).forEach((button) =>
          button.classList.remove(this.CSS.settingsButtonActive)
        );

        // mark active
        itemEl.classList.toggle(this.CSS.settingsButtonActive);
      });

      this.api.tooltip.onHover(itemEl, item.title, {
        placement: 'top',
        hidingDelay: 500,
      });

      if (this._data.style === item.name) {
        itemEl.classList.add(this.CSS.settingsButtonActive);
      }

      wrapper.appendChild(itemEl);
    });

    return wrapper;
  }

  /**
   * On paste callback that is fired from Editor
   *
   * @param {PasteEvent} event - event with pasted data
   */
  onPaste(event) {
    const list = event.detail.data;

    this.data = this.pasteHandler(list);
  }

  /**
   * List Tool on paste configuration
   *
   * @public
   */
  static get pasteConfig() {
    return {
      tags: ['OL', 'UL', 'LI'],
    };
  }

  /**
   * Creates main <ul> or <ol> tag depended on style
   *
   * @param {string} style - 'ordered' or 'unordered'
   * @returns {HTMLOListElement|HTMLUListElement}
   */
  makeMainTag(style) {
    const styleClass = style === 'ordered' ? this.CSS.wrapperOrdered : this.CSS.wrapperUnordered;
    const tag = style === 'ordered' ? 'ol' : 'ul';

    return this._make(tag, [this.CSS.baseBlock, this.CSS.wrapper, styleClass], {
      contentEditable: !this.readOnly,
    });
  }

  /**
   * Toggles List style
   *
   * @param {string} name
   */
  toggleTune(name) {
    this.enableDescrition = !this.enableDescrition;
    const newTag = document.createElement('div');

    if (this.enableDescrition) {
      const description = document.createElement('p');
      description.textContent = "这里是题目的描述";
      description.contentEditable = true;
      description.className = 'description';
      newTag.appendChild(description);
    } else {
      this.wholeWrapper.childNodes.forEach((node) => {
        if (node.className === 'description') {
          this.wholeWrapper.removeChild(node);
        }
      });
    }

    while (this.wholeWrapper.hasChildNodes()) {
      newTag.appendChild(this.wholeWrapper.firstChild);
    }

    this.wholeWrapper.replaceWith(newTag);
  }

  /**
   * Styles
   *
   * @private
   */
  get CSS() {
    return {
      baseBlock: this.api.styles.block,
      wrapper: 'cdx-list',
      wrapperOrdered: 'cdx-list--ordered',
      wrapperUnordered: 'cdx-list--unordered',
      item: 'cdx-list__item',
      settingsWrapper: 'cdx-list-settings',
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
    };
  }

  /**
   * List data setter
   *
   * @param {ListData} listData
   */
  set data(listData) {
    if (!listData) {
      listData = {};
    }

    this._data.style = listData.style || 'ordered';
    this._data.items = listData.items || [];

    const oldView = this._elements.wrapper;

    if (oldView) {
      oldView.parentNode.replaceChild(this.render(), oldView);
    }
  }

  /**
   * Return List data
   *
   * @returns {ListData}
   */
  get data() {
    this._data.items = [];

    const items = this._elements.wrapper.querySelectorAll(`.${this.CSS.item}`);

    for (let i = 0; i < items.length; i++) {
      const value = items[i].innerHTML.replace('<br>', ' ').trim();

      if (value) {
        this._data.items.push(items[i].innerHTML);
      }
    }

    return this._data;
  }

  /**
   * Helper for making Elements with attributes
   *
   * @param  {string} tagName           - new Element tag name
   * @param  {Array|string} classNames  - list or name of CSS classname(s)
   * @param  {object} attributes        - any attributes
   * @returns {Element}
   */
  _make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (const attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }

  /**
   * Returns current List item by the caret position
   *
   * @returns {Element}
   */
  get currentItem() {
    let currentNode = window.getSelection().anchorNode;

    if (currentNode.nodeType !== Node.ELEMENT_NODE) {
      currentNode = currentNode.parentNode;
    }

    return currentNode.closest(`.${this.CSS.item}`);
  }

  /**
   * Get out from List Tool
   * by Enter on the empty last item
   *
   * @param {KeyboardEvent} event
   */
  getOutofList(event) {
    const items = this._elements.wrapper.querySelectorAll('.' + this.CSS.item);

    /**
     * Save the last one.
     */
    if (items.length < 2) {
      return;
    }

    const lastItem = items[items.length - 1];
    const currentItem = this.currentItem;

    /** Prevent Default li generation if item is empty */
    if (currentItem === lastItem && !lastItem.textContent.trim().length) {
      /** Insert New Block and set caret */
      currentItem.parentElement.removeChild(currentItem);
      this.api.blocks.insert();
      this.api.caret.setToBlock(this.api.blocks.getCurrentBlockIndex());
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Handle backspace
   *
   * @param {KeyboardEvent} event
   */
  backspace(event) {
    const items = this._elements.wrapper.querySelectorAll('.' + this.CSS.item),
      firstItem = items[0];

    if (!firstItem) {
      return;
    }

    /**
     * Save the last one.
     */
    if (items.length < 2 && !firstItem.innerHTML.replace('<br>', ' ').trim()) {
      event.preventDefault();
    }
  }

  /**
   * Select LI content by CMD+A
   *
   * @param {KeyboardEvent} event
   */
  selectItem(event) {
    event.preventDefault();

    const selection = window.getSelection(),
      currentNode = selection.anchorNode.parentNode,
      currentItem = currentNode.closest('.' + this.CSS.item),
      range = new Range();

    range.selectNodeContents(currentItem);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Handle UL, OL and LI tags paste and returns List data
   *
   * @param {HTMLUListElement|HTMLOListElement|HTMLLIElement} element
   * @returns {ListData}
   */
  pasteHandler(element) {
    const { tagName: tag } = element;
    let style;

    switch (tag) {
      case 'OL':
        style = 'ordered';
        break;
      case 'UL':
      case 'LI':
        style = 'unordered';
    }

    const data = {
      style,
      items: [],
    };

    if (tag === 'LI') {
      data.items = [element.innerHTML];
    } else {
      const items = Array.from(element.querySelectorAll('LI'));

      data.items = items
        .map((li) => li.innerHTML)
        .filter((item) => !!item.trim());
    }

    return data;
  }
}

/**SVG m 6167.264,2220.82 q 1.5432,0 2.0055,-0.6409 0.2084,-0.2814 0.2084,-0.6253 0,-0.6018 -0.3842,-0.8832 -0.3125,-0.2344 -0.7618,-0.2501 -0.6056,0 -1.0679,0.047 z m 0.046,-2.8841 q 0.4819,0 0.7619,-0.062 0.28,-0.062 0.5079,-0.1954 0.2279,-0.1329 0.3777,-0.3361 0.1563,-0.211 0.1563,-0.4767 0,-0.7269 -1.0289,-0.7269 -0.4493,0 -0.8204,0.125 v 1.6726 z m 0.2475,3.3608 q -1.1721,0 -1.1721,-0.2579 0,-0.07 0.052,-0.125 0.052,-0.055 0.1628,-0.055 0.1107,0 0.1302,-0.01 v -4.5331 q -0.065,-0.023 -0.1628,-0.1407 -0.098,-0.1251 -0.098,-0.2189 0,-0.1016 0.072,-0.1407 0.1693,-0.078 0.6707,-0.1641 0.5079,-0.086 0.9897,-0.086 0.4884,0 0.814,0.1642 0.6381,0.3204 0.6381,1.0864 0,0.6174 -0.4493,1.0317 -0.1953,0.1641 -0.2344,0.1875 0.1628,0.016 0.4363,0.2189 0.2735,0.1954 0.4428,0.5158 0.1693,0.3127 0.1693,0.7738 0,0.469 -0.1824,0.805 -0.5079,0.9457 -2.279,0.9457 z m 0.015,-10.2643 1.3182,-0.089 q -0.4273,-1.5279 -0.6096,-2.2879 -0.4064,1.3905 -0.7086,2.3768 z m 2.1518,2.4739 q -0.1354,0 -0.1667,-0.1294 -0.099,-0.4527 -0.2084,-0.8569 l -0.3022,-1.0187 -1.6621,0.1132 q -0.4324,1.3906 -0.5054,1.7058 -0.042,0.1698 -0.2605,0.1698 -0.2293,0 -0.2293,-0.2021 0,-0.065 0.026,-0.1132 0.021,-0.048 0.042,-0.1051 0.021,-0.065 0.068,-0.2102 0.052,-0.1455 0.1511,-0.4365 0.1042,-0.2991 0.2501,-0.7519 h 0.016 q -0.083,0 -0.1406,-0.1617 -0.057,-0.1697 -0.057,-0.3072 0,-0.1698 0.094,-0.1698 0.099,0.016 0.2866,0.016 0.9014,-2.7891 0.9274,-3.1691 0.011,-0.1617 0.042,-0.2264 0.037,-0.065 0.1355,-0.065 0.083,0 0.1928,0.081 0.1094,0.081 0.1302,0.2183 l -0.016,0.1617 q 0,0.097 0.2761,1.1156 0.8649,3.1934 1.1828,3.9048 0.062,0.1375 0.062,0.186 0,0.1293 -0.1094,0.1859 -0.1042,0.065 -0.2241,0.065 z m 2.5454,-0.1819 h 9.9773 c 0.3021,2e-4 0.5918,0.1472 0.8053,0.4088 0.2136,0.2616 0.3336,0.6164 0.3336,0.9863 0,0.3699 -0.12,0.7246 -0.3336,0.9862 -0.2135,0.2616 -0.5032,0.4087 -0.8053,0.4088 h -9.9763 c -0.3022,2e-4 -0.5921,-0.1468 -0.8058,-0.4085 -0.2137,-0.2616 -0.3338,-0.6165 -0.3338,-0.9865 0,-0.3701 0.1201,-0.725 0.3338,-0.9866 0.2137,-0.2617 0.5036,-0.4086 0.8058,-0.4085 z m 0,-6.0116 h 9.9773 c 0.2988,0.01 0.5836,0.1557 0.7932,0.4166 0.2095,0.2609 0.327,0.6122 0.327,0.9782 0,0.3659 -0.1175,0.7172 -0.327,0.9781 -0.2096,0.2609 -0.4944,0.4105 -0.7932,0.4166 h -9.9763 c -0.3054,0.01 -0.6,-0.1379 -0.8178,-0.4001 -0.2178,-0.2623 -0.3405,-0.6206 -0.3405,-0.9946 0,-0.3741 0.1227,-0.7324 0.3405,-0.9947 0.2178,-0.2622 0.5124,-0.4064 0.8178,-0.4001 z m 0,12.2102 h 9.9773 c 0.2988,0.01 0.5836,0.1558 0.7932,0.4167 0.2095,0.2609 0.327,0.6122 0.327,0.9781 0,0.3659 -0.1175,0.7172 -0.327,0.9781 -0.2096,0.2609 -0.4944,0.4106 -0.7932,0.4167 h -9.9763 c -0.2958,-0.011 -0.5763,-0.1633 -0.7823,-0.4235 -0.206,-0.2603 -0.3211,-0.6084 -0.3211,-0.9708 0,-0.3624 0.1151,-0.7106 0.3211,-0.9708 0.206,-0.2602 0.4865,-0.4121 0.7823,-0.4235 z */