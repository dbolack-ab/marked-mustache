(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["hard-breaks"] = factory());
})(this, (function () { 'use strict';

  const processStyleTags = (string)=>{
  	//split tags up. quotes can only occur right after : or =.
  	//TODO: can we simplify to just split on commas?
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
      ]
    };
  }

  return index;

}));
