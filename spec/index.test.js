import { marked } from 'marked';
import mustaches from '../src/index.js';
import dedent from 'dedent-tabs';

// Marked.js adds line returns after closing tags on some default tokens.
// This removes those line returns for comparison sake.
String.prototype.trimReturns = function(){
	return this.replace(/\r?\n|\r/g, '');
};


describe('Inline: When using the Inline syntax {{ }}', ()=>{
	test('Renders a mustache span with text only', function() {
    marked.use(mustaches());
    expect(marked('{{ text}}')).toMatchSnapshot();
	});

	test('Renders a mustache span with text only, but with spaces', function() {
    marked.use(mustaches());
    expect(marked('{{ this is a text}}')).toMatchSnapshot();
	});

	test('Renders an empty mustache span', function() {
    marked.use(mustaches());
    expect(marked('{{}}')).toMatchSnapshot();
	});

	test('Renders a mustache span with just a space', function() {
    marked.use(mustaches());
    expect(marked('{{ }}')).toMatchSnapshot();
	});

	test('Renders a mustache span with a few spaces only', function() {
    marked.use(mustaches());
    expect(marked('{{     }}')).toMatchSnapshot();
	});

	test('Renders a mustache span with text and class', function() {
    marked.use(mustaches());
    expect(marked('{{my-class text}}')).toMatchSnapshot();
	});

	test('Renders a mustache span with text and two classes', function() {
    marked.use(mustaches());
    expect(marked('{{my-class,my-class2 text}}')).toMatchSnapshot();
	});

	test('Renders a mustache span with text with spaces and class', function() {
    marked.use(mustaches());
    expect(marked('{{my-class this is a text}}')).toMatchSnapshot();
	});

	test('Renders a mustache span with text and id', function() {
    marked.use(mustaches());
    expect(marked('{{#my-span text}}')).toMatchSnapshot();
	});

	test('Renders a mustache span with text and two ids', function() {
    marked.use(mustaches());
    expect(marked('{{#my-span,#my-favorite-span text}}')).toMatchSnapshot();
	});

	test('Renders a mustache span with text and css property', function() {
    marked.use(mustaches());
    expect(marked('{{color:red text}}')).toMatchSnapshot();
	});

	test('Renders a mustache span with text and two css properties', function() {
    marked.use(mustaches());
    expect(marked('{{color:red,padding:5px text}}')).toMatchSnapshot();
	});

	test('Renders a mustache span with text and css property which contains quotes', function() {
    marked.use(mustaches());
    expect(marked('{{font-family:"trebuchet ms" text}}')).toMatchSnapshot();
	});

	test('Renders a mustache span with text and two css properties which contains quotes', function() {
    marked.use(mustaches());
    expect(marked('{{font-family:"trebuchet ms",padding:"5px 10px" text}}')).toMatchSnapshot();
	});


	test('Renders a mustache span with text with quotes and css property which contains double quotes', function() {
    marked.use(mustaches());
    expect(marked('{{font-family:"trebuchet ms" text "with quotes"}}')).toMatchSnapshot();
	});


	test('Renders a mustache span with text with quotes and css property which contains double and simple quotes', function() {
    marked.use(mustaches());
    expect(marked(`{{--stringVariable:"'string'" text "with quotes"}}`)).toMatchSnapshot();
	});


	test('Renders a mustache span with text, id, class and a couple of css properties', function() {
    marked.use(mustaches());
    expect(marked('{{pen,#author,color:orange,font-family:"trebuchet ms" text}}')).toMatchSnapshot();
	});

	test('Renders a span with added attributes', function() {
    marked.use(mustaches());
    expect(marked('Text and {{pen,#author,color:orange,font-family:"trebuchet ms",a="b and c",d=e, text}} and more text!')).toMatchSnapshot();
	});
});

//  BLOCK SYNTAX

describe(`Block: When using the Block syntax {{tags\\ntext\\n}}`, ()=>{
	test('Renders a div with text only', function() {
    marked.use(mustaches());
    expect(marked(dedent`{{
												text
												}}`)).toMatchSnapshot();
	});

	test('Renders an empty div', function() {
    marked.use(mustaches());
     expect(marked(dedent`{{
													}}`)).toMatchSnapshot();
	});

	test('Renders a single paragraph with opening and closing brackets', function() {
    marked.use(mustaches());
    expect(marked(dedent`{{
												}}`)).toMatchSnapshot();
	});

	test('Renders a div with a single class', function() {
    marked.use(mustaches());
    expect(marked(dedent`{{cat
 												}}`)).toMatchSnapshot();
	});

	test('Renders a div with a single class and text', function() {
    marked.use(mustaches());
    expect(marked(dedent`{{cat
													Sample text.
													}}`)).toMatchSnapshot();
	});

	test('Renders a div with two classes and text', function() {
    marked.use(mustaches());
    expect(marked(dedent`{{cat,dog
													Sample text.
													}}`)).toMatchSnapshot();
	});

	test('Renders a div with a style and text', function() {
    marked.use(mustaches());
     expect(marked(dedent`{{color:red
													Sample text.
													}}`)).toMatchSnapshot();
	});

	test('Renders a div with a style that has a string variable, and text', function() {
    marked.use(mustaches());
    expect(marked(dedent`{{--stringVariable:"'string'"
													Sample text.
													}}`)).toMatchSnapshot();
	});

	test('Renders a div with a style that has a string variable, and text', function() {
    marked.use(mustaches());
    expect(marked(dedent`{{--stringVariable:"'string'"
													Sample text.
													}}`)).toMatchSnapshot();
	});

	test('Renders a div with a class, style and text', function() {
    marked.use(mustaches());
    expect(marked(dedent`{{cat,color:red
													Sample text.
													}}`)).toMatchSnapshot();
	});

	test('Renders a div with an ID, class, style and text (different order)', function() {
    marked.use(mustaches());
    expect(marked(dedent`{{color:red,cat,#dog
													Sample text.
													}}`)).toMatchSnapshot();
	});

	test('Renders a div with a single ID', function() {
    marked.use(mustaches());
    expect(marked(dedent`{{#cat,#dog
													Sample text.
													}}`)).toMatchSnapshot();
	});

	test('Renders a div with an ID, class, style and text, and a variable assignment', function() {
    marked.use(mustaches());
    expect(marked(dedent`{{color:red,cat,#dog,a="b and c",d="e"
													Sample text.
													}}`)).toMatchSnapshot();
	});

	test('Renders a div with added attributes', function() {
    marked.use(mustaches());
    expect(marked('{{pen,#author,color:orange,font-family:"trebuchet ms",a="b and c",d=e\nText and text and more text!\n}}\n')).toMatchSnapshot();
	});
});

// MUSTACHE INJECTION SYNTAX

describe('Injection: When an injection tag follows an element', ()=>{
	// FIXME: Most of these fail because injections currently replace attributes, rather than append to.  Or just minor extra whitespace issues.
	describe('and that element is an inline-block', ()=>{
		test('Renders a span "text" with no injection', function() {
			marked.use(mustaches());
      expect(marked('{{ text}}{}')).toMatchSnapshot();
		});

		test('Renders a span "text" with injected Class name', function() {
			marked.use(mustaches());
      expect(marked('{{ text}}{ClassName}')).toMatchSnapshot();
		});

		test('Renders a span "text" with injected attribute', function() {
			marked.use(mustaches());
      expect(marked('{{ text}}{a="b and c"}')).toMatchSnapshot();
		});

		test('Renders a span "text" with injected style', function() {
			marked.use(mustaches());
      expect(marked('{{ text}}{color:red}')).toMatchSnapshot();
		});

		test('Renders a span "text" with injected style using a string variable', function() {
			marked.use(mustaches());
			expect(marked(`{{ text}}{--stringVariable:"'string'"}`)).toMatchSnapshot();
		});

		test('Renders a span "text" with two injected styles', function() {
			marked.use(mustaches());
      expect(marked('{{ text}}{color:red,background:blue}')).toMatchSnapshot();
		});

		test('Renders a span "text" with its own ID, overwritten with an injected ID', function() {
			marked.use(mustaches());
      expect(marked('{{#oldId text}}{#newId}')).toMatchSnapshot();
		});

		test('Renders a span "text" with its own attributes, overwritten with an injected attribute, plus a new one', function() {
			marked.use(mustaches());
      expect(marked('{{attrA="old",attrB="old" text}}{attrA="new",attrC="new"}')).toMatchSnapshot();
		});

		test('Renders a span "text" with its own attributes, overwritten with an injected attribute, ignoring "class", "style", and "id"', function() {
			marked.use(mustaches());
      expect(marked('{{attrA="old",attrB="old" text}}{attrA="new",attrC="new",class="new",style="new",id="new"}')).toMatchSnapshot();
		});

		test('Renders a span "text" with its own styles, appended with injected styles', function() {
			marked.use(mustaches());
      expect(marked('{{color:blue,height:10px text}}{width:10px,color:red}')).toMatchSnapshot();
		});

		test('Renders a span "text" with its own classes, appended with injected classes', function() {
			marked.use(mustaches());
      expect(marked('{{classA,classB text}}{classA,classC}')).toMatchSnapshot();
		});

		test('Renders an emphasis element with injected Class name', function() {
			marked.use(mustaches());
      expect(marked('*emphasis*{big}')).toMatchSnapshot();
		});

		test('Renders a code element with injected style', function() {
			marked.use(mustaches());
      expect(marked('`code`{background:gray}')).toMatchSnapshot();
		});

		test('Renders an image element with injected style', function() {
			marked.use(mustaches());
      expect(marked('![alt text](https://i.imgur.com/hMna6G0.png){position:absolute}')).toMatchSnapshot();
		});

		test('Renders an element modified by only the first of two consecutive injections', function() {
			marked.use(mustaches());
      expect(marked('{{ text}}{color:red}{background:blue}')).toMatchSnapshot();
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
      expect(marked('{{\ntext\n}}\n{}')).toMatchSnapshot();
		});

		test('renders a div "text" with injected Class name', function() {
			marked.use(mustaches());
      expect(marked('{{\ntext\n}}\n{ClassName}')).toMatchSnapshot();
		});

		test('renders a div "text" with injected style', function() {
			marked.use(mustaches());
      expect(marked('{{\ntext\n}}\n{color:red}')).toMatchSnapshot();
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


// TODO: add tests for ID with accordance to CSS spec:
//
// From https://drafts.csswg.org/selectors/#id-selectors:
//
// > An ID selector consists of a “number sign” (U+0023, #) immediately followed by the ID value, which must be a CSS identifier.
//
// From: https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier:
//
// > In CSS, identifiers (including element names, classes, and IDs in selectors) can contain only the characters [a-zA-Z0-9]
// > and ISO 10646 characters U+00A0 and higher, plus the hyphen (-) and the underscore (_);
// > they cannot start with a digit, two hyphens, or a hyphen followed by a digit.
// > Identifiers can also contain escaped characters and any ISO 10646 character as a numeric code (see next item).
// > For instance, the identifier "B&W?" may be written as "B\&W\?" or "B\26 W\3F".
// > Note that Unicode is code-by-code equivalent to ISO 10646 (see [UNICODE] and [ISO10646]).

// TODO: add tests for class with accordance to CSS spec:
//
// From: https://drafts.csswg.org/selectors/#class-html:
//
// > The class selector is given as a full stop (. U+002E) immediately followed by an identifier.
