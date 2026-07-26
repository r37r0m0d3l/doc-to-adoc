import{spawnSync as d}from"node:child_process";import{existsSync as P}from"node:fs";import j from"node:fs/promises";import*as p from"node:path";import{convert as $}from"@asciidoctor/core";import{parse as B}from"csv-parse/sync";import{XMLParser as C}from"fast-xml-parser";import*as u from"js-yaml";import y from"mammoth";import{PDFParse as v}from"pdf-parse";import{parse as S}from"smol-toml";import k from"turndown";import{utils as O,read as I}from"xlsx";var _=new C({ignoreAttributes:!1}),h={".docx":"docx",".htm":"html",".html":"html",".latex":"latex",".markdown":"markdown",".md":"markdown",".mdx":"markdown",".mediawiki":"mediawiki",".odf":"odt",".odt":"odt",".org":"org",".rst":"rst",".rtf":"rtf",".tex":"latex",".wiki":"mediawiki"};function R(){try{let n=d("pandoc",["--version"],{stdio:"ignore"});return n.status===0&&!n.error}catch{return!1}}async function Q(n){let r=new v({data:n}),t=(await r.getInfo()).info?.Title?.trim(),o=await r.getText();return t?`= ${t}

${o.text}`:o.text}async function V(n){let{value:r}=await y.convertToMarkdown({buffer:n});return f(r)}function g(n,r=","){let e=B(n,{skip_empty_lines:!0,delimiter:r});if(e.length===0)return"";let t=e[0],o=e.slice(1),s=`[options="header"]
|===
`;s+=`| ${t.map(a=>String(a).replace(/\|/g,"\\|")).join(" | ")}

`;for(let a of o)s+=`| ${a.map(c=>String(c).replace(/\|/g,"\\|")).join(" | ")}
`;return s+=`|===
`,s}function D(n){let r=I(n),e=r.SheetNames[0];if(!e)return"";let t=r.Sheets[e],o=O.sheet_to_csv(t);return g(o,",")}function N(n){let r=n.replace(/<head[^>]*>[\s\S]*?<\/head>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,""),t=new k({headingStyle:"atx"}).turndown(r);return f(t)}function l(n,r){let e=n;if(typeof n=="string")try{r==="json"?e=JSON.parse(n):r==="yaml"?e=u.load(n):r==="toml"?e=S(n):r==="xml"&&(e=_.parse(n))}catch{return`[source,${r}]
----
${n.trim()}
----
`}return typeof e!="object"||e===null?`[source,${r}]
----
${String(e).trim()}
----
`:T(e)}function T(n,r=1){let e="",t="*".repeat(r);for(let[o,s]of Object.entries(n))typeof s=="object"&&s!==null?(e+=`${t} *${o}:*
`,e+=T(s,r+1)):e+=`${t} *${o}:* ${s}
`;return e}function f(n){let r=[],e=n;return e=e.replace(/```(\w*)\r?\n([\s\S]*?)```/g,(t,o,s)=>{let a=`\xA7CODEBLOCK${r.length}\xA7`;return r.push(`${o?`[source,${o}]
`:`[source]
`}----
${s.trim()}
----
`),a}),e=e.replace(/^[*+_-]{3,}$/gm,"'''"),e=e.replace(/(\*\*\*|___)(.*?)\1/g,"\xA7BI\xA7$2\xA7BI\xA7"),e=e.replace(/(\*\*|__)(.*?)\1/g,"\xA7B\xA7$2\xA7B\xA7"),e=e.replace(/(\*|_)(.*?)\1/g,"\xA7I\xA7$2\xA7I\xA7"),e=e.replace(/^(?:<a id=".*"><\/a>)?######\s+(.*)$/gm,"====== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?#####\s+(.*)$/gm,"===== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?####\s+(.*)$/gm,"==== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?###\s+(.*)$/gm,"=== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?##\s+(.*)$/gm,"== $1"),e=e.replace(/^(?:<a id=".*"><\/a>)?#\s+(.*)$/gm,"= $1"),e=e.replace(/(^>.*\n?)+/gm,t=>`[quote]
____
${t.split(`
`).map(s=>s.replace(/^>\s?/,"")).filter(s=>s.length>0).join(`
`)}
____

`),e=e.replace(/^[ \t]*[-*+]\s+(.*)$/gm,"* $1"),e=e.replace(/^[ \t]*\d+\.\s+(.*)$/gm,". $1"),e=e.replace(/^(\|.*\|)\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+\r?\n((\|.*\|\r?\n?)*)/gm,(t,o,s)=>{let a=m=>m.split("|").filter((w,x,A)=>x>0&&x<A.length-1).map(w=>w.trim()),c=a(o),b=s.trim().split(`
`).map(a),i=`[options="header"]
|===
`;i+=`| ${c.join(" | ")}
`;for(let m of b)i+=`| ${m.join(" | ")}
`;return i+=`|===
`,i}),e=e.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,"image:$2[$1]"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,"$2[$1]"),e=e.replace(/§BI§/g,"***"),e=e.replace(/§B§/g,"*"),e=e.replace(/§I§/g,"_"),r.forEach((t,o)=>{e=e.replace(`\xA7CODEBLOCK${o}\xA7`,t)}),e.trim()}async function E(n,r){let e=await j.readFile(n),t=e.toString("utf-8");switch(r.toLowerCase()){case".pdf":{let o=new v({data:e});try{let a=(await o.getInfo()).info?.Title?.trim(),c=await o.getText();return a?`= ${a}

${c.text}`:c.text}finally{await o.destroy()}}case".docx":return(await y.extractRawText({buffer:e})).value;case".csv":return g(t,",");case".tsv":return g(t,"	");case".xlsx":case".ods":return D(e);case".html":case".htm":return N(t);case".json":return l(JSON.parse(t),"json");case".yaml":case".yml":return l(u.load(t),"yaml");case".toml":return l(S(t),"toml");case".xml":return l(_.parse(t),"xml");case".md":case".markdown":case".mdx":return f(t);default:return t}}async function L(n,r){if(R()&&h[r]){let t=h[r],o=[n,"-t","asciidoc"];t&&o.unshift("-f",t);let s=d("pandoc",o,{encoding:"utf-8"});if(s.status===0)return s.stdout;let a=d("pandoc",[n,"-t","asciidoc"],{encoding:"utf-8"});if(a.status===0)return a.stdout}return E(n,r)}async function W(n){let{input:r,type:e="adoc"}=n,t=p.resolve(process.cwd(),r);if(!P(t))throw new Error(`File not found "${t}"`);let o=p.extname(t).toLowerCase(),s=await L(t,o);if(e==="md"||e==="markdown"){let a=await $(s,{attributes:{doctype:"book"}});s=new k({headingStyle:"atx"}).turndown(a)}else(e==="txt"||e==="text")&&(s=(await $(s,{attributes:{doctype:"book"}})).replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/\r?\n/g," ").replace(/<h[1-6][^>]*>/gi,`

`).replace(/<p[^>]*>/gi,`

`).replace(/<br[^>]*>/gi,`
`).replace(/<li[^>]*>/gi,`
* `).replace(/<tr[^>]*>/gi,`
`).replace(/<(?:td|th)[^>]*>/gi," | ").replace(/<div[^>]*>/gi,`
`).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[ \t]+/g," ").replace(/ \| \s+/g," | ").replace(/\* \s+/g,"* ").replace(/\n\s*\n\s*\n+/g,`

`).trim());return s}export{h as PANDOC_PRIMARY_FORMATS,W as convert,g as convertCsvToAdoc,V as convertDocxToAdoc,N as convertHtmlToAdoc,E as convertNativeFallback,Q as convertPdfToAdoc,D as convertSpreadsheetToAdoc,l as convertStructuredDataToAdoc,L as getAdocContent,R as isPandocAvailable,f as mdToAdoc,T as objectToAdocTree};
//# sourceMappingURL=index.js.map
