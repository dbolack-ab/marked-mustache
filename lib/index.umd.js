(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["hard-breaks"] = factory());
})(this, (function () { 'use strict';

  function index() {
    return {
      extensions: [
        {
          name  : 'hardBreaks',
          level : 'block',
          start(src) { return src.match(/\n\\+$/m)?.index; }, // Hint to Marked.js to stop and check for a match
          tokenizer(src, tokens) {
            const regex = /^(\\+)(?:\n|$)/ym;
            const match = regex.exec(src);
            if(match?.length) {
              return {
                type   : 'hardBreaks', // Should match "name" above
                raw    : match[0], // Text to consume from the source
                length : match[1].length,
                text   : ''
              };
            }
          },
          renderer(token) {
              return `<br>\n`.repeat(token.length);
          }
        }
      ]
    };
  }

  return index;

}));
