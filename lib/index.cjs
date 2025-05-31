'use strict';

var _ = require('lodash');

const processStyleTags = (string)=>{
// split tags up. quotes can only occur right after : or =.
// TODO: can we simplify to just split on commas?
	const tags = string.match(/(?:[^, ":=]+|[:=](?:"[^"]*"|))+/g);

	const id         = _.remove(tags, (tag)=>tag.startsWith('#')).map((tag)=>tag.slice(1))[0]        || null;
	const classes    = _.remove(tags, (tag)=>(!tag.includes(':')) && (!tag.includes('='))).join(' ') || null;
	const attributes = _.remove(tags, (tag)=>(tag.includes('='))).map((tag)=>tag.replace(/="?([^"]*)"?/g, '="$1"'))
		?.filter((attr)=>!attr.startsWith('class="') && !attr.startsWith('style="') && !attr.startsWith('id="'))
		.reduce((obj, attr)=>{
			const index = attr.indexOf('=');
			let [key, value] = [attr.substring(0, index), attr.substring(index + 1)];
			value = value.replace(/"/g, '');
			obj[key.trim()] = value.trim();
			return obj;
		}, {}) || null;
	const styles = tags?.length ? tags.reduce((styleObj, style)=>{
		const index = style.indexOf(':');
		const [key, value] = [style.substring(0, index), style.substring(index + 1)];
		styleObj[key.trim()] = value.replace(/"?([^"]*)"?/g, '$1').trim();
		return styleObj;
	}, {}) : null;

	return {
		id         : id,
		classes    : classes,
		styles     : _.isEmpty(styles)     ? null : styles,
		attributes : _.isEmpty(attributes) ? null : attributes
	};
};

//Given a string representing an HTML element, extract all of its properties (id, class, style, and other attributes)
const extractHTMLStyleTags = (htmlString)=>{
	const firstElementOnly = htmlString.split('>')[0];
	const id         = firstElementOnly.match(/id="([^"]*)"/)?.[1]    || null;
	const classes    = firstElementOnly.match(/class="([^"]*)"/)?.[1] || null;
	const styles     = firstElementOnly.match(/style="([^"]*)"/)?.[1]
		?.split(';').reduce((styleObj, style)=>{
			if(style.trim() === '') return styleObj;
			const index = style.indexOf(':');
			const [key, value] = [style.substring(0, index), style.substring(index + 1)];
			styleObj[key.trim()] = value.trim();
			return styleObj;
		}, {}) || null;
	const attributes = firstElementOnly.match(/[a-zA-Z]+="[^"]*"/g)
		?.filter((attr)=>!attr.startsWith('class="') && !attr.startsWith('style="') && !attr.startsWith('id="'))
		.reduce((obj, attr)=>{
			const index = attr.indexOf('=');
			const [key, value] = [attr.substring(0, index), attr.substring(index + 1)];
			obj[key.trim()] = value.replace(/"/g, '');
			return obj;
		}, {}) || null;

	return {
		id         : id,
		classes    : classes,
		styles     : _.isEmpty(styles)     ? null : styles,
		attributes : _.isEmpty(attributes) ? null : attributes
	};
};

const mergeHTMLTags = (originalTags, newTags)=>{
	return {
		id         : newTags.id || originalTags.id || null,
		classes    : [originalTags.classes, newTags.classes].join(' ').trim() || null,
		styles     : Object.assign(originalTags.styles     ?? {}, newTags.styles     ?? {}),
		attributes : Object.assign(originalTags.attributes ?? {}, newTags.attributes ?? {})
	};
};



function index() {
  return {
    extensions: [
      {
        name  : 'mustacheSpans',
        level : 'inline',                                   // Is this a block-level or inline-level tokenizer?
        start(src) { return src.match(/{{[^{]/)?.index; },  // Hint to Marked.js to stop and check for a match
        tokenizer(src, tokens) {
          const completeSpan = /^{{[^\n]*}}/;               // Regex for the complete token
          const inlineRegex = /{{(?=((?:[:=](?:"['\w,\-()#%=?. ]*"|[\w\-()#%.]*)|[^"=':{}\s]*)*))\1 *|}}/g;
          const match = completeSpan.exec(src);
          if(match) {
            //Find closing delimiter
            let blockCount = 0;
            let tags = {};
            let endTags = 0;
            let endToken = 0;
            let delim;
            while (delim = inlineRegex.exec(match[0])) {
              if(_.isEmpty(tags)) {
                tags = processStyleTags(delim[0].substring(2));
                endTags = delim[0].length;
              }
              if(delim[0].startsWith('{{')) {
                blockCount++;
              } else if(delim[0] == '}}' && blockCount !== 0) {
                blockCount--;
                if(blockCount == 0) {
                  endToken = inlineRegex.lastIndex;
                  break;
                }
              }
            }

            if(endToken) {
              const raw = src.slice(0, endToken);
              const text = raw.slice(endTags || -2, -2);

              return {                              // Token to generate
                type   : 'mustacheSpans',           // Should match "name" above
                raw    : raw,                       // Text to consume from the source
                text   : text,                      // Additional custom properties
                tags   : tags,
                tokens : this.lexer.inlineTokens(text)    // inlineTokens to process **bold**, *italics*, etc.
              };
            }
          }
        },
        renderer(token) {
          const tags = token.tags;
          tags.classes = ['inline-block', tags.classes].join(' ').trim();
          return `<span` +
            `${tags.classes    ? ` class="${tags.classes}"` : ''}` +
            `${tags.id         ? ` id="${tags.id}"`         : ''}` +
            `${tags.styles     ? ` style="${Object.entries(tags.styles).map(([key, value])=>`${key}:${value};`).join(' ')}"` : ''}` +
            `${tags.attributes ? ` ${Object.entries(tags.attributes).map(([key, value])=>`${key}="${value}"`).join(' ')}`     : ''}` +
            `>${this.parser.parseInline(token.tokens)}</span>`; // parseInline to turn child tokens into HTML
        }
      },
      {
        name  : 'mustacheDivs',
        level : 'block',
        start(src) { return src.match(/\n *{{[^{]/m)?.index; },  // Hint to Marked.js to stop and check for a match
        tokenizer(src, tokens) {
          const completeBlock = /^ *{{[^\n}]* *\n.*\n *}}/s;                // Regex for the complete token
          const blockRegex = /^ *{{(?=((?:[:=](?:"['\w,\-()#%=?. ]*"|[\w\-()#%.]*)|[^"=':{}\s]*)*))\1 *$|^ *}}$/gm;
          const match = completeBlock.exec(src);
          if(match) {
            //Find closing delimiter
            let blockCount = 0;
            let tags = {};
            let endTags = 0;
            let endToken = 0;
            let delim;
            while (delim = blockRegex.exec(match[0])?.[0].trim()) {
              if(_.isEmpty(tags)) {
                tags = processStyleTags(delim.substring(2));
                endTags = delim.length + src.indexOf(delim);
              }
              if(delim.startsWith('{{')) {
                blockCount++;
              } else if(delim == '}}' && blockCount !== 0) {
                blockCount--;
                if(blockCount == 0) {
                  endToken = blockRegex.lastIndex;
                  break;
                }
              }
            }

            if(endToken) {
              const raw = src.slice(0, endToken);
              const text = raw.slice(endTags || -2, -2);
              return {                                        // Token to generate
                type   : 'mustacheDivs',                      // Should match "name" above
                raw    : raw,                                 // Text to consume from the source
                text   : text,                                // Additional custom properties
                tags   : tags,
                tokens : this.lexer.blockTokens(text)
              };
            }
          }
        },
        renderer(token) {
          const tags = token.tags;
          tags.classes = ['block', tags.classes].join(' ').trim();
          return `<div` +
            `${tags.classes    ? ` class="${tags.classes}"` : ''}` +
            `${tags.id         ? ` id="${tags.id}"`         : ''}` +
            `${tags.styles     ? ` style="${Object.entries(tags.styles).map(([key, value])=>`${key}:${value};`).join(' ')}"` : ''}` +
            `${tags.attributes ? ` ${Object.entries(tags.attributes).map(([key, value])=>`${key}="${value}"`).join(' ')}` : ''}` +
            `>${this.parser.parse(token.tokens)}</div>`; // parse to turn child tokens into HTML
        }
      },
      {
        name  : 'mustacheInjectInline',
        level : 'inline',
        start(src) { return src.match(/ *{[^{\n]/)?.index; },  // Hint to Marked.js to stop and check for a match
        tokenizer(src, tokens) {
          const inlineRegex = /^ *{(?=((?:[:=](?:"['\w,\-()#%=?. ]*"|[\w\-()#%.]*)|[^"=':{}\s]*)*))\1}/g;
          const match = inlineRegex.exec(src);
          if(match) {
            const lastToken = tokens[tokens.length - 1];
            if(!lastToken || lastToken.type == 'mustacheInjectInline')
              return false;

            const tags = processStyleTags(match[1]);
            lastToken.originalType = lastToken.type;
            lastToken.type         = 'mustacheInjectInline';
            lastToken.injectedTags = tags;
            return {
              type : 'mustacheInjectInline',            // Should match "name" above
              raw  : match[0],          // Text to consume from the source
              text : ''
            };
          }
        },
        renderer(token) {
          if(!token.originalType){
            return;
          }
          token.type = token.originalType;
          const text = this.parser.parseInline([token]);
          const originalTags = extractHTMLStyleTags(text);
          const injectedTags = token.injectedTags;
          const tags         = mergeHTMLTags(originalTags, injectedTags);
          const openingTag = /(<[^\s<>]+)[^\n<>]*(>.*)/s.exec(text);
          if(openingTag) {
            return `${openingTag[1]}` +
              `${tags.classes    ? ` class="${tags.classes}"` : ''}` +
              `${tags.id         ? ` id="${tags.id}"`         : ''}` +
              `${!_.isEmpty(tags.styles)     ? ` style="${Object.entries(tags.styles).map(([key, value])=>`${key}:${value};`).join(' ')}"` : ''}` +
              `${!_.isEmpty(tags.attributes) ? ` ${Object.entries(tags.attributes).map(([key, value])=>`${key}="${value}"`).join(' ')}` : ''}` +
              `${openingTag[2]}`; // parse to turn child tokens into HTML
          }
          return text;
        }
      },
      {
          name  : 'mustacheInjectBlock',
          level : 'block',
          start(src) { return src.match(/\n *{[^{\n]/m)?.index; },  // Hint to Marked.js to stop and check for a match
          tokenizer(src, tokens) {
            const inlineRegex = /^ *{(?=((?:[:=](?:"['\w,\-()#%=?. ]*"|[\w\-()#%.]*)|[^"=':{}\s]*)*))\1}/ym;
            const match = inlineRegex.exec(src);
            if(match) {
              const lastToken = tokens[tokens.length - 1];
              if(!lastToken || lastToken.type == 'mustacheInjectBlock')
                return false;

              lastToken.originalType = 'mustacheInjectBlock';
              lastToken.injectedTags = processStyleTags(match[1]);
              return {
                type : 'mustacheInjectBlock', // Should match "name" above
                raw  : match[0],              // Text to consume from the source
                text : ''
              };
            }
          },
          renderer(token) {
            if(!token.originalType){
              return;
            }
            token.type = token.originalType;
            const text = this.parser.parse([token]);
            const originalTags = extractHTMLStyleTags(text);
            const injectedTags = token.injectedTags;
            const tags         = mergeHTMLTags(originalTags, injectedTags);
            const openingTag = /(<[^\s<>]+)[^\n<>]*(>.*)/s.exec(text);
            if(openingTag) {
              return `${openingTag[1]}` +
                `${tags.classes    ? ` class="${tags.classes}"` : ''}` +
                `${tags.id         ? ` id="${tags.id}"`         : ''}` +
                `${!_.isEmpty(tags.styles)     ? ` style="${Object.entries(tags.styles).map(([key, value])=>`${key}:${value};`).join(' ')}"` : ''}` +
                `${!_.isEmpty(tags.attributes) ? ` ${Object.entries(tags.attributes).map(([key, value])=>`${key}="${value}"`).join(' ')}` : ''}` +
                `${openingTag[2]}`; // parse to turn child tokens into HTML
            }
            return text;
          }
        }
    ],
    walkTokens(token) {
      // After token tree is finished, tag tokens to apply styles to so Renderer can find them
      // Does not work with tables since Marked.js tables generate invalid "tokens", and changing "type" ruins Marked handling that edge-case
      if(token.originalType == 'mustacheInjectBlock' && token.type !== 'table') {
        token.originalType = token.type;
        token.type         = 'mustacheInjectBlock';
      }
    }
  };
}

module.exports = index;
