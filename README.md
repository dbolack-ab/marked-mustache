# marked-mustache

Enhance HTML output of Markdown via Mustache blocks. Mustaches are a powerful markdown render-enhancing feature that extend and enhance the CSS styling of the rendered Markdown.

## What is a mustache in Markdown?

A mustache is a set of single or double curly braces (`{` and `}`) containing style and attribute modifiers. This can be HTML attributes (`width=100%` ), an element id ( `#Chapter2` ), CSS classnames ( `wide,yellowBorder` ), or style properties ( `color:blue` ). Any combination may be used at the same time. Element ids set on Header Elements ( `#` ) will be dropped.

There are a couple of simple formatting rules for the modifiers.
 * The list of modifiers is comma separated.
 * No Whitespace except in string assignments
 * Strings must be wrapped in a double-quote, singlequote duo, like: `"'I am a string'"`

 When the mustache is parsed it is broken up then applied to the appropriate HTML element. Classes are added to the element's `class` attribute, style properties to its `style` attribute, attributes are added to the elemnt, and finally the element's id is set if appropriate.

## Inserting Mustaches

### Single Mustache Wrapper

A single mustache wrapper set is placed directly after a Markdown element. The mustache's contents apply directly to the preceding element. Inline elements like *italics* or images require the injection on the same line. Block elements like headers require the injection to start on the line immediately following.

#### Examples:

```
## Header 2
{color:red}
```

```
![homebrew mug](https://i.imgur.com/hMna6G0.png) {position:absolute,bottom:20px,left:130px,width:220px}
```

### Double Mustache Wrapper

Double Mustaches are used to wrap a span of markdown in a container and apply the element modifiers to that container. In inline use, the mustache is converted into a span. This mode is used inside of blocks of markdown text. In Block mode, the mustache is converted into a `div` container and contains an number of Markdown block containers.

In both cases, the wrapper is constructed in the following order:
 * `{{`
 * the element modifiers
 * a single space
 * the markdown text being wrapped
 * `}}`

#### Examples:

Inline:

```
My favorite color is {{color:blue blue}}.
```

Block:

```
{{background:black,color:white
Hello!

Welcome to our example!
}}
```

# Usage
<!-- Show most examples of how to use this extension -->

```js
const marked = require("marked");
const markedMustache = require("marked-mustache");

```
