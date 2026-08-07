#!/usr/bin/env node
import w from"node:fs/promises";import T from"node:path";import{parseArgs as H}from"node:util";import{spawnSync as d}from"node:child_process";import{existsSync as P}from"node:fs";import C from"node:fs/promises";import*as p from"node:path";import{convert as y}from"@asciidoctor/core";import{parse as j}from"csv-parse/sync";import{XMLParser as B}from"fast-xml-parser";import*as f from"js-yaml";import E from"mammoth";import{PDFParse as D}from"pdf-parse";import{parse as $}from"smol-toml";import k from"turndown";import{utils as I,read as N}from"xlsx";var S=new B({ignoreAttributes:!1}),v={".htm":"html",".html":"html",".latex":"latex",".markdown":"markdown",".md":"markdown",".mdx":"markdown",".mediawiki":"mediawiki",".odf":"odt",".odt":"odt",".org":"org",".rst":"rst",".rtf":"rtf",".tex":"latex",".wiki":"mediawiki"};function R(){try{let t=d("pandoc",["--version"],{stdio:"ignore"});return t.status===0&&!t.error}catch{return!1}}async function F(t){let o=new D({data:t});try{let r=(await o.getInfo()).info?.Title?.trim(),s=await o.getText();return r?`= ${r}

${s.text}`:s.text}finally{await o.destroy()}}async function L(t){let{value:o}=await E.convertToMarkdown({buffer:t});return g(o)}function m(t,o=","){let e=j(t,{skip_empty_lines:!0,delimiter:o});if(e.length===0)return"";let r=e[0],s=e.slice(1),n=`[options="header"]
|===
`;n+=`| ${r.map(i=>String(i).replace(/\|/g,"\\|")).join(" | ")}

`;for(let i of s)n+=`| ${i.map(a=>String(a).replace(/\|/g,"\\|")).join(" | ")}
`;return n+=`|===
`,n}function M(t){let o=N(t),e=o.SheetNames[0];if(!e)return"";let r=o.Sheets[e],s=I.sheet_to_csv(r);return m(s,",")}function U(t){let o=t.replace(/<head[^>]*>[\s\S]*?<\/head>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,""),r=new k({headingStyle:"atx"}).turndown(o);return g(r)}function l(t,o){let e=t;if(typeof t=="string")try{o==="json"?e=JSON.parse(t):o==="yaml"?e=f.load(t):o==="toml"?e=$(t):o==="xml"&&(e=S.parse(t))}catch{return`[source,${o}]
----
${t.trim()}
----
`}return typeof e!="object"||e===null?`[source,${o}]
----
${String(e).trim()}
----
`:_(e)}function _(t,o=1){let e="",r="*".repeat(o);for(let[s,n]of Object.entries(t))typeof n=="object"&&n!==null?(e+=`${r} *${s}:*
`,e+=_(n,o+1)):e+=`${r} *${s}:* ${n}
`;return e}function g(t){let o=[],e=t;return e=e.replace(/```(\w*)\r?\n([\s\S]*?)```/g,(r,s,n)=>{let i=`\xA7CODEBLOCK${o.length}\xA7`;return o.push(`${s?`[source,${s}]
`:`[source]
`}----
${n.trim()}
----
`),i}),e=e.replace(/^[*+_-]{3,}$/gm,"'''"),e=e.replace(/(\*\*\*|___)(.*?)\1/g,"\xA7BI\xA7$2\xA7BI\xA7"),e=e.replace(/(\*\*|__)(.*?)\1/g,"\xA7B\xA7$2\xA7B\xA7"),e=e.replace(/(\*|_)(.*?)\1/g,"\xA7I\xA7$2\xA7I\xA7"),e=e.replace(/^(?:<a id=".*"><\/a>)?######\s+(.*)$/gm,"====== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?#####\s+(.*)$/gm,"===== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?####\s+(.*)$/gm,"==== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?###\s+(.*)$/gm,"=== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?##\s+(.*)$/gm,"== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?#\s+(.*)$/gm,"= $1"),e=e.replace(/(^>.*\n?)+/gm,r=>`[quote]
____
${r.split(`
`).map(n=>n.replace(/^>\s?/,"")).filter(n=>n.length>0).join(`
`)}
____

`),e=e.replace(/^[ \t]*[-*+]\s+(.*)$/gm,"* $1"),e=e.replace(/^[ \t]*\d+\.\s+(.*)$/gm,". $1"),e=e.replace(/^(\|.*\|)\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+\r?\n((\|.*\|\r?\n?)*)/gm,(r,s,n)=>{let i=u=>u.split("|").filter((h,x,O)=>x>0&&x<O.length-1).map(h=>h.trim()),a=i(s),A=n.trim().split(`
`).map(i),c=`[options="header"]
|===
`;c+=`| ${a.join(" | ")}
`;for(let u of A)c+=`| ${u.join(" | ")}
`;return c+=`|===
`,c}),e=e.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,"image:$2[$1]"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,"$2[$1]"),e=e.replace(/§BI§/g,"***"),e=e.replace(/§B§/g,"*"),e=e.replace(/§I§/g,"_"),o.forEach((r,s)=>{e=e.replace(`\xA7CODEBLOCK${s}\xA7`,r)}),e.trim()}async function J(t,o){let e=await C.readFile(t),r=e.toString("utf-8");switch(o.toLowerCase()){case".pdf":return F(e);case".docx":return L(e);case".csv":return m(r,",");case".tsv":return m(r,"	");case".xlsx":case".ods":return M(e);case".html":case".htm":return U(r);case".json":return l(JSON.parse(r),"json");case".yaml":case".yml":return l(f.load(r),"yaml");case".toml":return l($(r),"toml");case".xml":return l(S.parse(r),"xml");case".md":case".markdown":case".mdx":return g(r);default:return r}}async function q(t,o){if(R()&&v[o]){let r=v[o],s=[t,"-t","asciidoc"];r&&s.unshift("-f",r);let n=d("pandoc",s,{encoding:"utf-8"});if(n.status===0)return n.stdout;let i=d("pandoc",[t,"-t","asciidoc"],{encoding:"utf-8"});if(i.status===0)return i.stdout}return J(t,o)}async function b(t){let{input:o,type:e="adoc"}=t,r=p.resolve(process.cwd(),o);if(!P(r))throw new Error(`File not found "${r}"`);let s=p.extname(r).toLowerCase(),n=await q(r,s);if(e==="md"||e==="markdown"){let i=await y(n,{attributes:{doctype:"book"}});n=new k({headingStyle:"atx"}).turndown(i)}else(e==="txt"||e==="text")&&(n=(await y(n,{attributes:{doctype:"book"}})).replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/\r?\n/g," ").replace(/<h[1-6][^>]*>/gi,`

`).replace(/<p[^>]*>/gi,`

`).replace(/<br[^>]*>/gi,`
`).replace(/<li[^>]*>/gi,`
* `).replace(/<tr[^>]*>/gi,`
`).replace(/<(?:td|th)[^>]*>/gi," | ").replace(/<div[^>]*>/gi,`
`).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[ \t]+/g," ").replace(/ \| \s+/g," | ").replace(/\* \s+/g,"* ").replace(/\n\s*\n\s*\n+/g,`

`).trim());return n}async function K(){let{values:t,positionals:o}=H({options:{input:{type:"string",short:"i"},output:{type:"string",short:"o"},type:{type:"string",short:"t",default:"adoc"},force:{type:"boolean",short:"f",default:!1},version:{type:"boolean",short:"v"},help:{type:"boolean",short:"h"}},allowPositionals:!0});t.version&&(console.log("doc-to-adoc v1.0.0"),process.exit(0)),t.help&&(console.log(`
doc-to-adoc \u2013 Universal Document & Data to AsciiDoc Converter

Usage:
  doc-to-adoc <input-file> [output-file] [options]
  doc-to-adoc -i <input-file> -o <output-file> -t <type>

Options:
  -i, --input <file>   Input file path
  -o, --output <file>  Output file path (default: stdout)
  -t, --type <type>    Output format: adoc, md, txt (default: adoc)
  -f, --force          Overwrite output files if it already exists
  -v, --version        Show version
  -h, --help           Show help
    `.trim()),process.exit(0));let e=t.input||o[0],r=t.output||o[1];e||(console.error("Error: Missing input file. Run 'doc-to-adoc --help' for usage."),process.exit(1));let s=(t.type||"adoc").toLowerCase();["adoc","asciidoc","md","markdown","txt","text"].includes(s)||(console.error(`Error: Unsupported output type '${s}'. Valid types: adoc, md, txt.`),process.exit(1));try{let n=await b({input:e,type:s});if(r){if(!t.force)try{await w.access(r),console.error(`Error: Output file '${r}' already exists. Use -f or --force to overwrite.`),process.exit(1)}catch(i){if(i.code!=="ENOENT")throw i}await w.mkdir(T.dirname(T.resolve(r)),{recursive:!0}),await w.writeFile(r,n,"utf-8")}else process.stdout.write(n)}catch(n){console.error("Conversion failed:",n instanceof Error?n.message:n),process.exit(2)}}K().then(()=>process.exit(0)).catch(t=>{console.error(t),process.exit(3)});
//# sourceMappingURL=cli.js.map
