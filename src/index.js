'use strict';

// global variables for the whole book
let pluginOptions;
let titleFormats;
let isMultiPart;
let readmeLevel;
let readmeDepth;

// global variables for the current page
let currentPage;

/**
 * Split and trim the chapter formats.
 * @param {string} formats The chapter formats delimited by '|||'.
 * @returns {string[]} The chapter formats in an array.
 */
function parseTitleFormats(formats) {
  return formats.split('|||').map((s) => s.trim());
}

/**
 * Loads the book info.
 * @param {Object} options Pass this.options to this parameter.
 * @param {Object} summary Pass this.summary to this parameter.
 */
function loadBookInfo(options, summary) {
  pluginOptions = options.pluginsConfig['page-numbering'];
  titleFormats = parseTitleFormats(pluginOptions.chapterFormat);

  const readmeFile = options.structure.readme;
  let readme = summary.getArticleByPath(readmeFile);
  if (!readme && readmeFile === 'README.md')
    readme = summary.getArticleByPath('README.adoc');
  readmeLevel = readme.level.split('.');
  readmeDepth = readmeLevel.length;

  isMultiPart = pluginOptions.forceMultipleParts;
  if (isMultiPart)
    return;
  summary.walk((article) => {
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

  let i = 0;
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
 * Obtain the chapter number of a page. If depth is zero, return the whole
 * chapter number. If depth is positive, return the numbering up to the
 * specified depth, counted from the left. If depth negative, the numbering
 * minus the specified depth.
 *
 * For consistency with GitBook, the depth is always counted with the part
 * number, even if it is omitted in the output. This function returns an empty
 * string if all parts of the chapter number are omitted.
 *
 * @param {Object} page
 * @param {number} depth
 * @returns {string}
 */
function getChapterNumber(page, depth = 0) {
  let level = depth ? page.level.slice(0, depth) : page.level.slice();
  if (pluginOptions.skipReadme)
    level = adjustLevelWithReadme(level);
  if (!isMultiPart)
    level.splice(0, 1);
  return level.join('.');
}

/**
 * Obtain the title of a page. If formatOverride is an empty string, the format
 * in the plugin properties is used.
 * @param {Object} page
 * @param {string} [formatOverride]
 * @returns {string}
 */
function getTitle(page, formatOverride) {
  const format = formatOverride.trim().length
                     ? parseTitleFormats(formatOverride) : titleFormats;
  let index = page.level.length - 2;
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
    autochapter: function(block) {
      return getChapterNumber(currentPage, parseInt(block.body));
    },
  },
  hooks: {
    'init': function() { loadBookInfo(this.options, this.summary); },
    'page:before': function(page) {
      loadCurrentPageInfo(page);
      return page;
    },
  },
};
