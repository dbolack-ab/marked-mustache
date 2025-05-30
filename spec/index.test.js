import { marked } from 'marked';
import mustaches from '../src/index.js';
import { default as dedent } from 'dedent-tabs';

// Marked.js adds line returns after closing tags on some default tokens.
// This removes those line returns for comparison sake.
String.prototype.trimReturns = function(){
	return this.replace(/\r?\n|\r/g, '');
};

// MUSTACHE INJECTION SYNTAX

describe('Injection: When an injection tag follows an element', ()=>{
	// FIXME: Most of these fail because injections currently replace attributes, rather than append to.  Or just minor extra whitespace issues.
	describe('and that element is an inline-block', ()=>{
		test('Renders a span "text" with no injection', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{ text}}{}'))).toMatchSnapshot();
		});

		test('Renders a span "text" with injected Class name', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{ text}}{ClassName}'))).toMatchSnapshot();
		});

		test('Renders a span "text" with injected attribute', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{ text}}{a="b and c"}'))).toMatchSnapshot();
		});

		test('Renders a span "text" with injected style', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{ text}}{color:red}'))).toMatchSnapshot();
		});

		test('Renders a span "text" with injected style using a string variable', function() {
			marked.use(mustaches());
			expect(marked(trimLines(`{{ text}}{--stringVariable:"'string'"}`))).toMatchSnapshot();
		});

		test('Renders a span "text" with two injected styles', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{ text}}{color:red,background:blue}'))).toMatchSnapshot();
		});

		test('Renders a span "text" with its own ID, overwritten with an injected ID', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{#oldId text}}{#newId}'))).toMatchSnapshot();
		});

		test('Renders a span "text" with its own attributes, overwritten with an injected attribute, plus a new one', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{attrA="old",attrB="old" text}}{attrA="new",attrC="new"}'))).toMatchSnapshot();
		});

		test('Renders a span "text" with its own attributes, overwritten with an injected attribute, ignoring "class", "style", and "id"', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{attrA="old",attrB="old" text}}{attrA="new",attrC="new",class="new",style="new",id="new"}'))).toMatchSnapshot();
		});

		test('Renders a span "text" with its own styles, appended with injected styles', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{color:blue,height:10px text}}{width:10px,color:red}'))).toMatchSnapshot();
		});

		test('Renders a span "text" with its own classes, appended with injected classes', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{classA,classB text}}{classA,classC}'))).toMatchSnapshot();
		});

		test('Renders an emphasis element with injected Class name', function() {
			marked.use(mustaches());
      expect(marked(trimLines('*emphasis*{big}'))).toMatchSnapshot();
		});

		test('Renders a code element with injected style', function() {
			marked.use(mustaches());
      expect(marked(trimLines('`code`{background:gray}'))).toMatchSnapshot();
		});

		test('Renders an image element with injected style', function() {
			marked.use(mustaches());
      expect(marked(trimLines('![alt text](https://i.imgur.com/hMna6G0.png){position:absolute}'))).toMatchSnapshot();
		});

		test('Renders an element modified by only the first of two consecutive injections', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{ text}}{color:red}{background:blue}'))).toMatchSnapshot();
		});

		test('Renders an parent and child element, each modified by an injector', function() {
			const source = dedent`**bolded text**{color:red}
														{color:blue}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
                            
		});

		test('Renders an image with added attributes', function() {
			const source = `![homebrew mug](https://i.imgur.com/hMna6G0.png) {position:absolute,bottom:20px,left:130px,width:220px,a="b and c",d=e}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		test('Renders an image with "=" in the url, and added attributes', function() {
			const source = `![homebrew mug](https://i.imgur.com/hMna6G0.png?auth=12345&height=1024) {position:absolute,bottom:20px,left:130px,width:220px,a="b and c",d=e}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		test('Renders an image and added attributes with "=" in the value, ', function() {
			const source = `![homebrew mug](https://i.imgur.com/hMna6G0.png) {position:absolute,bottom:20px,left:130px,width:220px,a="b and c",d=e,otherUrl="url?auth=12345"}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});
	});

	describe('and that element is a block', ()=>{
		test('renders a div "text" with no injection', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{\ntext\n}}\n{}'))).toMatchSnapshot();
		});

		test('renders a div "text" with injected Class name', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{\ntext\n}}\n{ClassName}'))).toMatchSnapshot();
		});

		test('renders a div "text" with injected style', function() {
			marked.use(mustaches());
      expect(marked(trimLines('{{\ntext\n}}\n{color:red}'))).toMatchSnapshot();
		});

		test('renders a div "text" with two injected styles', function() {
			const source = dedent`{{
														text
														}}
														{color:red,background:blue}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		test('renders a div "text" with injected variable string', function() {
			const source = dedent`{{
														text
														}}
														{--stringVariable:"'string'"}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		test('Renders a span "text" with its own ID, overwritten with an injected ID', function() {
			const source = dedent`{{#oldId
														text
														}}
														{#newId}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		test('Renders a span "text" with its own attributes, overwritten with an injected attribute, plus a new one', function() {
			const source = dedent`{{attrA="old",attrB="old"
														text
														}}
														{attrA="new",attrC="new"}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		test('Renders a span "text" with its own attributes, overwritten with an injected attribute, ignoring "class", "style", and "id"', function() {
			const source = dedent`{{attrA="old",attrB="old"
														text
														}}
														{attrA="new",attrC="new",class="new",style="new",id="new"}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		test('Renders a span "text" with its own styles, appended with injected styles', function() {
			const source = dedent`{{color:blue,height:10px
														text
														}}
														{width:10px,color:red}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		test('Renders a span "text" with its own classes, appended with injected classes', function() {
			const source = dedent`{{classA,classB
														text
														}}
														{classA,classC}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		test('renders an h2 header "text" with injected class name', function() {
			const source = dedent`## text
														{ClassName}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		test('renders a table with injected class name', function() {
			const source = dedent`| Experience Points | Level |
														|:------------------|:-----:|
														| 0                 | 1     |
														| 300               | 2     |

														{ClassName}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		// test('renders a list with with a style injected into the <ul> tag', function() {
		// 	const source = dedent`- Cursed Ritual of Bad Hair
		// - Eliminate Vindictiveness in Gym Teacher
		// - Ultimate Rite of the Confetti Angel
		// - Dark Chant of the Dentists
		// - Divine Spell of Crossdressing
		// {color:red}`;
		// 	const rendered = marked.render(source).trimReturns();
		// 	expect(rendered, `Input:\n${source}`, { showPrefix: false }).toBe(`...`);   // FIXME: expect this to be injected into <ul>?  Currently injects into last <li>
		// });

		test('renders an h2 header "text" with injected class name, and "secondInjection" as regular text on the next line.', function() {
			const source = dedent`## text
			{ClassName}
			{secondInjection}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});

		test('renders a div nested into another div, the inner with class=innerDiv and the other class=outerDiv', function() {
			const source = dedent`{{
														outer text
														{{
														inner text
														}}
														{innerDiv}
														}}
														{outerDiv}`;
			marked.use(mustaches());
      expect(marked(source).trimReturns()).toMatchSnapshot();
		});
	});
});
