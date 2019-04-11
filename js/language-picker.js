window.addEventListener('load', function() {
  const languages = ['javascript', 'java', 'swift', 'js'];
  /** @type {Object<String, Object<String, {tab: Element, panel: Element}>>} */
  const groups = {};

  /**
   * Retrieve pre-defined coding language from URI.
   *
   * @return {String|null} Language which specified in browser
   * location.
   */
  const selectedLanguage = function () {
    const queryString = window.location.search.substring(1);
    let selectedLanguage = null;

    queryString.split('&').forEach(function (pair) {
      const keyValue = pair.split('=');

      if (keyValue[0] === 'language') {
        selectedLanguage = keyValue[1];
      }
    });

    return selectedLanguage;
  };

  /**
   * Switch all code snippets on page to selected language tab.
   *
   * @param {String} [language] - Name of language for which code
   * snippets should be shown.
   * @param {Element} [selectedTab] - Reference on element which is
   * used to represent language tab.
   */
  const switchSnippetsLanguage = function (language, selectedTab) {
    let selectedTabId = null;

    if (language === null) {
      selectedTabId = selectedTab.getAttribute('id');
      language = selectedTab.innerHTML.toString();
    }

    language = language.toLowerCase();

    Object.keys(groups).forEach(function (groupId) {
      Object.keys(groups[groupId]).forEach(function (_language) {
        const selectedGroupPanel = groups[groupId][_language].panel;
        const selectedGroupTab = groups[groupId][_language].tab;
        const groupTabId = selectedGroupTab.getAttribute('id');

        if (_language !== language) {
          selectedGroupPanel.classList.remove('active');
          selectedGroupTab.classList.remove('active');
        } else if (selectedTabId === null || selectedTabId !== groupTabId) {
          selectedGroupPanel.classList.add('active');
          selectedGroupTab.classList.add('active');
        }
      });
    });
  };

  /**
   * Update hash link to include name of selected language.
   *
   * @param {String} language - Language which should be appended to
   * hash link.
   */
  const addLanguageToLinks = function (language) {
    language = language.toLowerCase();

    document.querySelectorAll('.hash-link').forEach(function(el) {
      let regex = new RegExp(`language=(${languages.join('|')})`);
      let href = el.getAttribute('href');
      let match = regex.exec(href);

      if (match !== null) {
        href = href.replace(match[0], `language=${language}`);
      } else {
        href = `?language=${language}${href}`;
      }

      el.setAttribute('href', href);
    });
  };

  /**
   * Make sure what specified element will remain on same position in
   * case if content height before this element will change.
   *
   * @param {Element} element - Element for which position should be
   * preserved.
   * @param {Number} oldTopPos - Previous element top position within
   * view.
   */
  const scrollToElement = function (element, oldTopPos) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const boundingRect = element.getBoundingClientRect();
    const body = document.querySelector('body');

    body.scrollTop = boundingRect.top + scrollTop - oldTopPos;
  };

  // Group snippets for each group by language.
  document.querySelectorAll('.tabs').forEach(function(el) {
    el.querySelectorAll('.nav-link').forEach(function(tab) {
      const tabPanelId = tab.getAttribute('data-tab');
      const groupId = tab.getAttribute('data-group');
      const panel = document.querySelector(`#${tabPanelId}`);
      const language = tab.innerHTML.toString().toLowerCase();

      if (languages.indexOf(language) >= 0) {
        groups[groupId] = groups[groupId] || {};
        groups[groupId][language] = { tab, panel };
      }
    });
  });

  // Listen for code language tab switch.
  document.querySelectorAll('.nav-link').forEach(function(el) {
    el.addEventListener('click', function(e) {
      const language = e.target.innerHTML.toString().toLowerCase();
      const element = e.target.parentElement.parentElement;
      const elementTop = element.getBoundingClientRect().top;

      // Store user-selected code snippet language.
      window.localStorage.setItem('crcSnippetsLanguage', language);

      switchSnippetsLanguage(null, e.target);
      addLanguageToLinks(language);

      /**
       * Restore position of element (because page can change it's
       * height and element will slide away from screen.
       */
      scrollToElement(element, elementTop);
    });
  });

  // Try to restore previously stored user-selected language.
  let language = window.localStorage.getItem('crcSnippetsLanguage');
  language = selectedLanguage() || language;

  if (language !== null) {
    switchSnippetsLanguage(language);
    addLanguageToLinks(language);
  }

  window.crcSwitchSnippetsLanguage = switchSnippetsLanguage;

});
