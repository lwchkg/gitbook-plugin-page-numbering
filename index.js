'use strict';

// global variables for the whole book
var pluginOptions;
var titleFormats;
var isMultiPart;
var readmeLevel;
var readmeDepth;

// global variables for the current page
var currentPage;

/**
 * Split and trim the chapter formats.
 * @param {string} formats
 * @returns {string[]}
 */
function parseTitleFormats(formats) {
  return formats.split('|||').map(s => s.trim());
}

/**
 * Loads the book info.
 * @param {Object} options Pass this.options to this parameter.
 * @param {Object} summary Pass this.summary to this parameter.
 */
function loadBookInfo(options, summary) {
  pluginOptions = options.pluginsConfig['numbering-support'];
  titleFormats = parseTitleFormats(pluginOptions.chapterFormat);

  var readmeFile = options.structure.readme;
  var readme = summary.getArticleByPath(readmeFile);
  if (!readme && readmeFile === 'README.md')
    readme = summary.getArticleByPath('README.adoc');
  readmeLevel = readme.level.split('.');
  readmeDepth = readmeLevel.length;

  isMultiPart = pluginOptions.forceMultipleParts;
  if (isMultiPart)
    return;
  summary.walk(article => {
    if (article.level.split('.')[0] > 1) {
      isMultiPart = true;
      return false;
    }
  });
}

/**
 * Load the information of the page into static variables. This is called by
 * page:before hook.
 * @param {Object} page The page structure in GitBook.
 */
function loadCurrentPageInfo(page) {
  currentPage = {
    title: page.title,
    level: page.level.split('.'),
  };
}

/**
 * Adjust the article level so README is excluded in the count.
 * @param {number[]} level Unadjusted level given by GitBook.
 * @returns {number[]} Adjusted level.
 */
function adjustLevelWithReadme(level) {
  level = level.slice();

  if (readmeDepth > level.length)
    return level;

  var i = 0;
  while (i < readmeDepth - 1) {
    if (readmeLevel[i] !== level[i])
      return level;
    ++i;
  }

  if (readmeLevel[i] <= level[i])
    level[i]--;
  return level;
}

/**
 * Obtain the chapter number of a page.
 * @param {Object} page
 * @returns {string}
 */
function getChapterNumber(page) {
  var level = page.level.slice();
  if (pluginOptions.skipReadme)
    level = adjustLevelWithReadme(level);
  if (!pluginOptions.forceMultipleParts)
    level.splice(0, 1);
  return level.join('.');
}

/**
 * Obtain the title of a page. If formatOverride is an empty string, the format
 * in the plugin properties is used.
 * @param {Object} page
 * @param {string} format
 * @returns {string}
 */
function getTitle(page, formatOverride) {
  var format = formatOverride.trim().length ? parseTitleFormats(formatOverride)
                                            : titleFormats;
  var index = page.level.length - 2;
  if (index < 0)
    index = 0;
  else if (index >= format.length)
    index = format.length - 1;

  return titleFormats[index]
             .replace('#chapno#', getChapterNumber(page))
             .replace('#title#', page.title);
}

module.exports = {
  blocks: {
    autotitle: function(block) {
      return getTitle(currentPage, block.body);
    },
    autochapter: function() {
      return getChapterNumber(currentPage);
    }
  },
  hooks: {
    'init': function() { loadBookInfo(this.options, this.summary); },
    'page:before': function(page) {
      loadCurrentPageInfo(page);
      return page;
    }
  }
};