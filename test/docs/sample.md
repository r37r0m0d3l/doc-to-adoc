AsciiDoc Comprehensive Feature Test Suite

John Doe ([john.doe@example.com](mailto:john.doe@example.com))

2023-04-05

\======= Table of Contents

\======= Document Metadata & Attributes

This document tests the extraction and rendering capabilities of AsciiDoc converters in Node.js.

*   Author: John Doe
    
*   Revision: 2.4.0
    
*   Custom Attribute Resolution: AsciiDoc Attribute Value
    
*   Current Date Attribute: 2026-07-27
    

\======= Text Formatting & Inline Elements

\======= Basic Styles

*   **Bold Text** (**Bold Text**)
    
*   _Italic Text_ (_Italic Text_)
    
*   Monospaced Code (Monospaced Code)
    
*   **Bold Monospaced** (\`\*Bold Monospaced\*\`)
    
*   _Italic Monospaced_ (\`\_Italic Monospaced\_\`)
    

\======= Advanced Inline Formatting

*   Underlined Text (Underlined Text)
    
*   Strikethrough Text (Strikethrough Text)
    
*   Highlighted Text (Highlighted Text)
    
*   Superscript: E = mc2 (E = mc2)
    
*   Subscript: H2O (H2O)
    
*   Smart symbols: © ® ™ — → ← ⇒ ⇐
    

\======= UI Macros (Requires :experimental:)

*   Keyboard shortcuts: **Ctrl**+**Alt**+\*T\*, **Cmd**+**Shift**+\*P\*
    
*   Menu selections: **File › New Project… › TypeScript**
    
*   Button references: Press the **\[Save Changes\]** button to proceed.
    

\======= Lists & Text Structures

\======= Unordered List (Nested)

*   First level item A
    
    *   Second level item A1
        
        *   Third level item A1a
            
        *   Third level item A1b
            
        
    *   Second level item A2
        
    
*   First level item B
    

\======= Ordered List (Custom Numbering)

1.  Step One: Parse Document
    
    1.  Sub-step A: Tokenize Input
        
    2.  Sub-step B: Build AST
        
    
2.  Step Two: Render HTML
    
3.  Step Three: Output Result
    

\======= Checklist (Task List)

*   Implement AST Parser
    
*   Support basic text formatting
    
*   Support complex tables
    
*   Implement macro extensions
    

\======= Description List (Glossary)

**Node.js**

A JavaScript runtime built on Chrome’s V8 JavaScript engine.

**AsciiDoc**

A human-readable document format for writing technical documentation.

**AST**

Abstract Syntax Tree, a tree representation for the abstract syntactic structure of source code.

\======= Admonitions (Callout Boxes)

Note

This is a standard NOTE admonition block used for general information.

Tip

Pro tip! You can customize admonition icons using CSS or font icons.

Important

Pay attention to edge cases when parsing nested inline markup.

Warning

Ensure that user-generated AsciiDoc input is sanitized before rendering raw HTML.

Caution

Destructive operations cannot be undone without a backup.

\======= Multiline Admonition Block

Warning

This is a multiline admonition block.

It can contain multiple paragraphs, lists, and code snippets:

*   Multi-line item 1
    
*   Multi-line item 2
    

console.log(“Warning from inside block!”);

\======= Code Blocks & Callouts

\======= Standard Code Block with Syntax Highlighting

**import** { parseAsciiDoc } **from** ‘adoc-converter’;

**interface** ParseOptions { standalone?: boolean; safeMode?: ‘unsafe’ | ‘safe’ | ‘server’ | ‘secure’; }

**export** **async** **function** processFile(filePath: string, options: ParseOptions = {}): Promise { console.log(\`Processing file: ${filePath}\`); **return** parseAsciiDoc(filePath, options); }

\======= Code Block with Callouts

**const** fs = require(‘fs’); **const** adoc = require(‘adoc-converter’); _// ①_

**const** content = fs.readFileSync(‘doc.adoc’, ‘utf8’); _// ②_ **const** html = adoc.convert(content); _// ③_

console.log(html); _// ④_

1.  Import the Node.js AsciiDoc converter module.
    
2.  Read the raw .adoc source file from the disk.
    
3.  Convert the AsciiDoc string into an HTML string.
    
4.  Print the rendered output to stdout.
    

\======= Tables

\======= Basic Table with Headers and Footers

ID

Feature Name

Support Status

01

Section Headers

Fully Supported

02

Inline Styles

Fully Supported

03

Complex Tables

Experimental

Total

3 Features Tested

100% Coverage

\======= Advanced Formatted Table with Alignment & Column Spans

Name

Type (Header Col)

Center Aligned

Right Aligned

id

String

usr\_123

$19.99

Combined Span (2 Columns)

$49.99

Rowspan (2 Rows)

Number

42

$100.00

Number

84

$200.00

\======= Table with AsciiDoc Content inside Cells (a specifier)

Component

Description & AsciiDoc Elements

Parser

*   Supports tokenization - Handles AST building { “status”: “ok”, “code”: 200 }
    

Renderer

Note Generates semantic HTML5 markup.

\======= Sidebars, Quotes & Example Blocks

\======= Quote Block

Logic will get you from A to B. Imagination will take you everywhere.

— Albert Einstein, Speech in London (1931)

\======= Example Block

Example Block Title

This is an example block that demonstrates how sample output or scenarios can be framed.

\======= Sidebar Block

Technical Notes

Sidebars are used to visually isolate related or background information from the main flow of text.

\======= Anchors, Cross-References & Footnotes

You can create explicit anchors like or link to existing sections like [the Code Blocks Section](#Xe611057f21698f1380825caf8514c0f5e58b1b0).

Here is a sentence with an inline footnote .

And another reference to a second footnote .

\======= Open & Literal Blocks

Literal Block (Preformatted text)

\_ \_ \_ \_ \_\_\_\_ | \\ | |00000000 | | | / \_\_\_| | \\| |/ \_ \\ / \_\` | | / \\ | \\\_\_\_ | |\\ | (\_) | (\_| | |/ \_\_\_ \\|\_\_\_) | |\_| \\\_|\\\_\_\_/ \\\_\_,\_|\_/\_/ \\\_\\\_\_\_\_/

\======= Abstract Block

This document serves as an exhaustive test fixture for evaluating AsciiDoc converters written for or compiled to Node.js (such as @asciidoctor/core, asciidoctor.js, or custom AST-based parsers).