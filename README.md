# Page numbering for GitBook
This plugin add blocks for numbering pages, table, figures, etc... in GitBook.

Disclaimer: currently only numbering of pages is supported.


## Example project
Still working on this...

## Installation

Add the plugin into `book.json` or `book.js`, e.g.
```
{
    plugins: ["page-numbering"]
}
```

## Configuration

This plugin has a few options.
You can access the options in the GitBook GUI or by adding the following to `book.json` or `book.js`.
```
{
    "pluginsConfig": {
        "page-numbering": {
            "skipReadme": false,
            "chapterFormat": "Chapter #chapno#&nbsp;&nbsp;&nbsp;#title# ||| #chapno#&nbsp;&nbsp;&nbsp;#title#",
            "forceMultipleParts": false
        }
    }
}
```

The value of the options shown above are the defaults properties of the plugin.
Here are their meanings:

| Option               | Meaning       |
|----------------------|---------------|
| `skipReadme`         | Skip the book readme file (usually README.md) in the numbering.       |
| `chapterFormat`      | The format of the automatic headings used for chapters. See “format of chapter titles” below to see the format of this option.       |
| `forceMultipleParts` | Force multiple-part numberings. If false, the part number is skipped if the book consists of only a single part.       |


## Usage

You can use the following tags in a GitBook page:

`{% autochapter %}{% endautochapter %}` returns the chapter number of the page.

`{% autochapter %} [depth] {% endautochapter %}` returns the chapter number of the page up to [depth], where [depth] is an integer. If [depth] is negative, then the depth is the actual depth plus the negative number.

_NOTE: in a single part document, pages with the highest level (chapters) have a depth of 2, not 1._
This is done to maintain consistency with GitBook chapter numbering.

`{% autotitle %}{% endautotitle %}` returns the title of the page.
The format in the plugin options is used to format the title.

`{% autotitle %} [format] {% endautotitle %}` returns the title of the page, with the specified [format].
See “format of chapter titles” below to see the format of [format].

## Format of chapter titles
Enter the exact words you want to show in the chapter titles.
The following text have special function:

`#chapno#`: replaced by the chapter number of page (e.g. 1.1).

`#title#`: replaced by the title of the page, as defined in SUMMARY.md or the summary file you specify in book.js.

Also, you can use `|||` to use different automatic headings in pages with different depths.
This can be used in both the plugin options and also the `{% autochapter %}` tag.

After separating the format by `|||`, the first part of the format is used for pages with depth 2 (i.e. chapters).
The second part is used for pages with depth 3, etc.
(Note: in GitBook pages cannot have a depth of 1.)

The last part of the format is used in pages with it’s correspond depth, and also pages with a higher depth.
e.g. If the format has 2 parts, the second part is used for pages with depth 3, 4, 5, etc.

## TODO
**Figure numbering**.
I am not sure if it is feasible to number the figures sequentially in multiple documents (if pages are loaded out of order, then sadly it is not.)

As a workaround, you can still use the chapter numbers do the numbering yourself.

**Cross referencing**, i.e. obtaining the chapter number of other pages in the book.

## Report bugs / Contributions
- To report issues and request features for the GitBook plugin, post an issue in the
  [GitHub repository](https://github.com/lwchkg/gitbook-plugin-page-numbering)
