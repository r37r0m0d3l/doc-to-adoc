import{spawnSync as d}from"node:child_process";import{existsSync as T}from"node:fs";import A from"node:fs/promises";import*as p from"node:path";import{convert as x}from"@asciidoctor/core";import{parse as P}from"csv-parse/sync";import{XMLParser as j}from"fast-xml-parser";import*as u from"js-yaml";import B from"mammoth";import{PDFParse as C}from"pdf-parse";import{parse as y}from"smol-toml";import v from"turndown";import{utils as O,read as I}from"xlsx";var S=new j({ignoreAttributes:!1}),h={".htm":"html",".html":"html",".latex":"latex",".markdown":"markdown",".md":"markdown",".mdx":"markdown",".mediawiki":"mediawiki",".odf":"odt",".odt":"odt",".org":"org",".rst":"rst",".rtf":"rtf",".tex":"latex",".wiki":"mediawiki"};function R(){try{let n=d("pandoc",["--version"],{stdio:"ignore"});return n.status===0&&!n.error}catch{return!1}}async function D(n){let r=new C({data:n});try{let t=(await r.getInfo()).info?.Title?.trim(),s=await r.getText();return t?`= ${t}

${s.text}`:s.text}finally{await r.destroy()}}async function N(n){let{value:r}=await B.convertToMarkdown({buffer:n});return f(r)}function g(n,r=","){let e=P(n,{skip_empty_lines:!0,delimiter:r});if(e.length===0)return"";let t=e[0],s=e.slice(1),o=`[options="header"]
|===
`;o+=`| ${t.map(a=>String(a).replace(/\|/g,"\\|")).join(" | ")}

`;for(let a of s)o+=`| ${a.map(c=>String(c).replace(/\|/g,"\\|")).join(" | ")}
`;return o+=`|===
`,o}function E(n){let r=I(n),e=r.SheetNames[0];if(!e)return"";let t=r.Sheets[e],s=O.sheet_to_csv(t);return g(s,",")}function L(n){let r=n.replace(/<head[^>]*>[\s\S]*?<\/head>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,""),t=new v({headingStyle:"atx"}).turndown(r);return f(t)}function l(n,r){let e=n;if(typeof n=="string")try{r==="json"?e=JSON.parse(n):r==="yaml"?e=u.load(n):r==="toml"?e=y(n):r==="xml"&&(e=S.parse(n))}catch{return`[source,${r}]
----
${n.trim()}
----
`}return typeof e!="object"||e===null?`[source,${r}]
----
${String(e).trim()}
----
`:k(e)}function k(n,r=1){let e="",t="*".repeat(r);for(let[s,o]of Object.entries(n))typeof o=="object"&&o!==null?(e+=`${t} *${s}:*
`,e+=k(o,r+1)):e+=`${t} *${s}:* ${o}
`;return e}function f(n){let r=[],e=n;return e=e.replace(/```(\w*)\r?\n([\s\S]*?)```/g,(t,s,o)=>{let a=`\xA7CODEBLOCK${r.length}\xA7`;return r.push(`${s?`[source,${s}]
`:`[source]
`}----
${o.trim()}
----
`),a}),e=e.replace(/^[*+_-]{3,}$/gm,"'''"),e=e.replace(/(\*\*\*|___)(.*?)\1/g,"\xA7BI\xA7$2\xA7BI\xA7"),e=e.replace(/(\*\*|__)(.*?)\1/g,"\xA7B\xA7$2\xA7B\xA7"),e=e.replace(/(\*|_)(.*?)\1/g,"\xA7I\xA7$2\xA7I\xA7"),e=e.replace(/^(?:<a id=".*"><\/a>)?######\s+(.*)$/gm,"====== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?#####\s+(.*)$/gm,"===== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?####\s+(.*)$/gm,"==== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?###\s+(.*)$/gm,"=== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?##\s+(.*)$/gm,"== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?#\s+(.*)$/gm,"= $1"),e=e.replace(/(^>.*\n?)+/gm,t=>`[quote]
____
${t.split(`
`).map(o=>o.replace(/^>\s?/,"")).filter(o=>o.length>0).join(`
`)}
____

`),e=e.replace(/^[ \t]*[-*+]\s+(.*)$/gm,"* $1"),e=e.replace(/^[ \t]*\d+\.\s+(.*)$/gm,". $1"),e=e.replace(/^(\|.*\|)\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+\r?\n((\|.*\|\r?\n?)*)/gm,(t,s,o)=>{let a=m=>m.split("|").filter((w,$,b)=>$>0&&$<b.length-1).map(w=>w.trim()),c=a(s),_=o.trim().split(`
`).map(a),i=`[options="header"]
|===
`;i+=`| ${c.join(" | ")}
`;for(let m of _)i+=`| ${m.join(" | ")}
`;return i+=`|===
`,i}),e=e.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,"image:$2[$1]"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,"$2[$1]"),e=e.replace(/§BI§/g,"***"),e=e.replace(/§B§/g,"*"),e=e.replace(/§I§/g,"_"),r.forEach((t,s)=>{e=e.replace(`\xA7CODEBLOCK${s}\xA7`,t)}),e.trim()}async function M(n,r){let e=await A.readFile(n),t=e.toString("utf-8");switch(r.toLowerCase()){case".pdf":return D(e);case".docx":return N(e);case".csv":return g(t,",");case".tsv":return g(t,"	");case".xlsx":case".ods":return E(e);case".html":case".htm":return L(t);case".json":return l(JSON.parse(t),"json");case".yaml":case".yml":return l(u.load(t),"yaml");case".toml":return l(y(t),"toml");case".xml":return l(S.parse(t),"xml");case".md":case".markdown":case".mdx":return f(t);default:return t}}async function F(n,r){if(R()&&h[r]){let t=h[r],s=[n,"-t","asciidoc"];t&&s.unshift("-f",t);let o=d("pandoc",s,{encoding:"utf-8"});if(o.status===0)return o.stdout;let a=d("pandoc",[n,"-t","asciidoc"],{encoding:"utf-8"});if(a.status===0)return a.stdout}return M(n,r)}async function W(n){let{input:r,type:e="adoc"}=n,t=p.resolve(process.cwd(),r);if(!T(t))throw new Error(`File not found "${t}"`);let s=p.extname(t).toLowerCase(),o=await F(t,s);if(e==="md"||e==="markdown"){let a=await x(o,{attributes:{doctype:"book"}});o=new v({headingStyle:"atx"}).turndown(a)}else(e==="txt"||e==="text")&&(o=(await x(o,{attributes:{doctype:"book"}})).replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/\r?\n/g," ").replace(/<h[1-6][^>]*>/gi,`

`).replace(/<p[^>]*>/gi,`

`).replace(/<br[^>]*>/gi,`
`).replace(/<li[^>]*>/gi,`
* `).replace(/<tr[^>]*>/gi,`
`).replace(/<(?:td|th)[^>]*>/gi," | ").replace(/<div[^>]*>/gi,`
`).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[ \t]+/g," ").replace(/ \| \s+/g," | ").replace(/\* \s+/g,"* ").replace(/\n\s*\n\s*\n+/g,`

`).trim());return o}export{h as PANDOC_PRIMARY_FORMATS,W as convert,g as convertCsvToAdoc,N as convertDocxToAdoc,L as convertHtmlToAdoc,M as convertNativeFallback,D as convertPdfToAdoc,E as convertSpreadsheetToAdoc,l as convertStructuredDataToAdoc,F as getAdocContent,R as isPandocAvailable,f as mdToAdoc,k as objectToAdocTree};
//# sourceMappingURL=index.js.map
