#!/usr/bin/env node
import g from"node:fs/promises";import T from"node:path";import{parseArgs as J}from"node:util";import{spawnSync as d}from"node:child_process";import{existsSync as P}from"node:fs";import C from"node:fs/promises";import*as p from"node:path";import{convert as h}from"@asciidoctor/core";import{parse as j}from"csv-parse/sync";import{XMLParser as B}from"fast-xml-parser";import*as m from"js-yaml";import E from"mammoth";import{PDFParse as I}from"pdf-parse";import{parse as v}from"smol-toml";import $ from"turndown";import{utils as D,read as R}from"xlsx";var k=new B({ignoreAttributes:!1}),y={".docx":"docx",".htm":"html",".html":"html",".latex":"latex",".markdown":"markdown",".md":"markdown",".mdx":"markdown",".mediawiki":"mediawiki",".odf":"odt",".odt":"odt",".org":"org",".rst":"rst",".rtf":"rtf",".tex":"latex",".wiki":"mediawiki"};function N(){try{let r=d("pandoc",["--version"],{stdio:"ignore"});return r.status===0&&!r.error}catch{return!1}}function f(r,n=","){let t=j(r,{skip_empty_lines:!0,delimiter:n});if(t.length===0)return"";let e=t[0],s=t.slice(1),o=`[options="header"]
|===
`;o+=`| ${e.map(a=>String(a).replace(/\|/g,"\\|")).join(" | ")}

`;for(let a of s)o+=`| ${a.map(i=>String(i).replace(/\|/g,"\\|")).join(" | ")}
`;return o+=`|===
`,o}function F(r){let n=R(r),t=n.SheetNames[0];if(!t)return"";let e=n.Sheets[t],s=D.sheet_to_csv(e);return f(s,",")}function L(r){let n=r.replace(/<head[^>]*>[\s\S]*?<\/head>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,""),e=new $({headingStyle:"atx"}).turndown(n);return _(e)}function l(r,n){let t=r;if(typeof r=="string")try{n==="json"?t=JSON.parse(r):n==="yaml"?t=m.load(r):n==="toml"?t=v(r):n==="xml"&&(t=k.parse(r))}catch{return`[source,${n}]
----
${r.trim()}
----
`}return typeof t!="object"||t===null?`[source,${n}]
----
${String(t).trim()}
----
`:S(t)}function S(r,n=1){let t="",e="*".repeat(n);for(let[s,o]of Object.entries(r))typeof o=="object"&&o!==null?(t+=`${e} *${s}:*
`,t+=S(o,n+1)):t+=`${e} *${s}:* ${o}
`;return t}function _(r){let n=[],t=r;return t=t.replace(/```(\w*)\r?\n([\s\S]*?)```/g,(e,s,o)=>{let a=`\xA7CODEBLOCK${n.length}\xA7`;return n.push(`${s?`[source,${s}]
`:`[source]
`}----
${o.trim()}
----
`),a}),t=t.replace(/^[*+_-]{3,}$/gm,"'''"),t=t.replace(/(\*\*\*|___)(.*?)\1/g,"\xA7BI\xA7$2\xA7BI\xA7"),t=t.replace(/(\*\*|__)(.*?)\1/g,"\xA7B\xA7$2\xA7B\xA7"),t=t.replace(/(\*|_)(.*?)\1/g,"\xA7I\xA7$2\xA7I\xA7"),t=t.replace(/^(?:<a id=".*"><\/a>)?######\s+(.*)$/gm,"====== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#####\s+(.*)$/gm,"===== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?####\s+(.*)$/gm,"==== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?###\s+(.*)$/gm,"=== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?##\s+(.*)$/gm,"== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#\s+(.*)$/gm,"= $1"),t=t.replace(/(^>.*\n?)+/gm,e=>`[quote]
____
${e.split(`
`).map(o=>o.replace(/^>\s?/,"")).filter(o=>o.length>0).join(`
`)}
____

`),t=t.replace(/^[ \t]*[-*+]\s+(.*)$/gm,"* $1"),t=t.replace(/^[ \t]*\d+\.\s+(.*)$/gm,". $1"),t=t.replace(/^(\|.*\|)\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+\r?\n((\|.*\|\r?\n?)*)/gm,(e,s,o)=>{let a=u=>u.split("|").filter((w,x,O)=>x>0&&x<O.length-1).map(w=>w.trim()),i=a(s),A=o.trim().split(`
`).map(a),c=`[options="header"]
|===
`;c+=`| ${i.join(" | ")}
`;for(let u of A)c+=`| ${u.join(" | ")}
`;return c+=`|===
`,c}),t=t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,"image:$2[$1]"),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,"$2[$1]"),t=t.replace(/§BI§/g,"***"),t=t.replace(/§B§/g,"*"),t=t.replace(/§I§/g,"_"),n.forEach((e,s)=>{t=t.replace(`\xA7CODEBLOCK${s}\xA7`,e)}),t.trim()}async function M(r,n){let t=await C.readFile(r),e=t.toString("utf-8");switch(n.toLowerCase()){case".pdf":{let s=new I({data:t});try{let a=(await s.getInfo()).info?.Title?.trim(),i=await s.getText();return a?`= ${a}

${i.text}`:i.text}finally{await s.destroy()}}case".docx":return(await E.extractRawText({buffer:t})).value;case".csv":return f(e,",");case".tsv":return f(e,"	");case".xlsx":case".ods":return F(t);case".html":case".htm":return L(e);case".json":return l(JSON.parse(e),"json");case".yaml":case".yml":return l(m.load(e),"yaml");case".toml":return l(v(e),"toml");case".xml":return l(k.parse(e),"xml");case".md":case".markdown":case".mdx":return _(e);default:return e}}async function U(r,n){if(N()&&y[n]){let e=y[n],s=[r,"-t","asciidoc"];e&&s.unshift("-f",e);let o=d("pandoc",s,{encoding:"utf-8"});if(o.status===0)return o.stdout;let a=d("pandoc",[r,"-t","asciidoc"],{encoding:"utf-8"});if(a.status===0)return a.stdout}return M(r,n)}async function b(r){let{input:n,type:t="adoc"}=r,e=p.resolve(process.cwd(),n);if(!P(e))throw new Error(`File not found "${e}"`);let s=p.extname(e).toLowerCase(),o=await U(e,s);if(t==="md"||t==="markdown"){let a=await h(o,{attributes:{doctype:"book"}});o=new $({headingStyle:"atx"}).turndown(a)}else(t==="txt"||t==="text")&&(o=(await h(o,{attributes:{doctype:"book"}})).replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/\r?\n/g," ").replace(/<h[1-6][^>]*>/gi,`

`).replace(/<p[^>]*>/gi,`

`).replace(/<br[^>]*>/gi,`
`).replace(/<li[^>]*>/gi,`
* `).replace(/<tr[^>]*>/gi,`
`).replace(/<(?:td|th)[^>]*>/gi," | ").replace(/<div[^>]*>/gi,`
`).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[ \t]+/g," ").replace(/ \| \s+/g," | ").replace(/\* \s+/g,"* ").replace(/\n\s*\n\s*\n+/g,`

`).trim());return o}async function q(){let{values:r,positionals:n}=J({options:{input:{type:"string",short:"i"},output:{type:"string",short:"o"},type:{type:"string",short:"t",default:"adoc"},force:{type:"boolean",short:"f",default:!1},version:{type:"boolean",short:"v"},help:{type:"boolean",short:"h"}},allowPositionals:!0});r.version&&(console.log("2adoc v1.0.0"),process.exit(0)),r.help&&(console.log(`
2adoc \u2013 Universal Document & Data to AsciiDoc Converter

Usage:
  2adoc <input-file> [output-file] [options]
  2adoc -i <input-file> -o <output-file> -t <type>

Options:
  -i, --input <file>   Input file path
  -o, --output <file>  Output file path (default: stdout)
  -t, --type <type>    Output format: adoc, md, txt (default: adoc)
  -f, --force          Overwrite output files if it already exists
  -v, --version        Show version
  -h, --help           Show help
    `.trim()),process.exit(0));let t=r.input||n[0],e=r.output||n[1];t||(console.error("Error: Missing input file. Run '2adoc --help' for usage."),process.exit(1));let s=(r.type||"adoc").toLowerCase();["adoc","asciidoc","md","markdown","txt","text"].includes(s)||(console.error(`Error: Unsupported output type '${s}'. Valid types: adoc, md, txt.`),process.exit(1));try{let o=await b({input:t,type:s});if(e){if(!r.force)try{await g.access(e),console.error(`Error: Output file '${e}' already exists. Use -f or --force to overwrite.`),process.exit(1)}catch(a){if(a.code!=="ENOENT")throw a}await g.mkdir(T.dirname(T.resolve(e)),{recursive:!0}),await g.writeFile(e,o,"utf-8")}else process.stdout.write(o)}catch(o){console.error("Conversion failed:",o instanceof Error?o.message:o),process.exit(2)}}q().then(()=>process.exit(0)).catch(r=>{console.error(r),process.exit(3)});
//# sourceMappingURL=cli.js.map
