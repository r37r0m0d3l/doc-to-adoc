#!/usr/bin/env node
import P from"node:fs/promises";import K from"node:path";import{parseArgs as Nt}from"node:util";import{spawnSync as I}from"node:child_process";import{existsSync as Ct}from"node:fs";import Ft from"node:fs/promises";import*as T from"node:path";import{fileURLToPath as Dt}from"node:url";import{convert as J}from"@asciidoctor/core";import _ from"pandoc-binary";import Et from"turndown";import{gfm as Mt}from"turndown-plugin-gfm";import{parse as V}from"csv-parse/sync";function v(e,r=","){let t=V(e,{skip_empty_lines:!0,delimiter:r});if(t.length===0)return"";let n=t[0],i=t.slice(1),o=`[options="header"]
|===
`;o+=`| ${n.map(s=>String(s).replace(/\|/g,"\\|")).join(" | ")}

`;for(let s of i)o+=`| ${s.map(c=>String(c).replace(/\|/g,"\\|")).join(" | ")}
`;return o+=`|===
`,o}import Y from"word-extractor";var Z="\x07";function Q(e){return e.replace(/\r\n?/g,`
`).replaceAll(Z," ").replace(/[ \t]+\n/g,`
`).split(`
`).map(r=>r.trim()).filter((r,t,n)=>r.length>0||n[t-1]?.length>0).join(`

`).trim()}async function tt(e){let t=await new Y().extract(e),n=Q(t.getBody());if(!n)throw new Error("Legacy DOC conversion produced no readable text");return n}async function b(e){return tt(e)}import et from"mammoth";import rt from"turndown";import{gfm as nt}from"turndown-plugin-gfm";function w(e){let r=[],t=e;return t=t.replace(/```(\w*)\r?\n([\s\S]*?)```/g,(n,i,o)=>{let s=`\xA7CODEBLOCK${r.length}\xA7`;return r.push(`${i?`[source,${i}]
`:`[source]
`}----
${o.trim()}
----
`),s}),t=t.replace(/^[*+_-]{3,}$/gm,"'''"),t=t.replace(/(\*\*\*|___)(.*?)\1/g,"\xA7BI\xA7$2\xA7BI\xA7"),t=t.replace(/(\*\*|__)(.*?)\1/g,"\xA7B\xA7$2\xA7B\xA7"),t=t.replace(/(\*|_)(.*?)\1/g,"\xA7I\xA7$2\xA7I\xA7"),t=t.replace(/^(?:<a id=".*"><\/a>)?######\s+(.*)$/gm,"====== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#####\s+(.*)$/gm,"===== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?####\s+(.*)$/gm,"==== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?###\s+(.*)$/gm,"=== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?##\s+(.*)$/gm,"== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#\s+(.*)$/gm,"= $1"),t=t.replace(/(?:^[ \t]*>.*(?:\r?\n|$))+/gm,n=>{let o=n.split(/\r?\n/).map(c=>c.replace(/^[ \t]*>\s?/,""));for(;o.length>0&&o[0].trim()==="";)o.shift();for(;o.length>0&&o[o.length-1].trim()==="";)o.pop();let s=o.join(`
`);return s?`[quote]
____
${s}
____

`:""}),t=t.replace(/^[ \t]*[-*+]\s+(.*)$/gm,"* $1"),t=t.replace(/^[ \t]*\d+\.\s+(.*)$/gm,". $1"),t=t.replace(/^(\|.*\|)\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+\r?\n((\|.*\|\r?\n?)*)/gm,(n,i,o)=>{let s=m=>m.split("|").filter((p,l,d)=>l>0&&l<d.length-1).map(p=>p.trim()),c=s(i),u=o.trim().split(`
`).map(s),f=`[options="header"]
|===
`;f+=`| ${c.join(" | ")}
`;for(let m of u)f+=`| ${m.join(" | ")}
`;return f+=`|===
`,f}),t=t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(n,i,o)=>`image:${o}[${i}]`),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(n,i,o)=>`${o}[${i}]`),t=t.replace(/§BI§/g,"***"),t=t.replace(/§B§/g,"*"),t=t.replace(/§I§/g,"_"),r.forEach((n,i)=>{t=t.replace(`\xA7CODEBLOCK${i}\xA7`,n)}),t.trim()}async function ot(e){let{value:r}=await et.convertToHtml({buffer:e});return r}async function it(e){let r=await ot(e),t=new rt({headingStyle:"atx"});return t.use(nt),t.turndown(r)}async function $(e){let r=await it(e);return w(r)}import st from"turndown";import{gfm as at}from"turndown-plugin-gfm";function k(e){let r=e.replace(/<head[^>]*>[\s\S]*?<\/head>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,""),t=new st({headingStyle:"atx"});t.use(at);let n=t.turndown(r);return w(n)}import{createWorker as ct}from"tesseract.js";async function ft(e,r="eng"){let t=await ct(r);try{return(await t.recognize(e)).data.text}finally{await t.terminate()}}async function A(e,r="eng"){return(await ft(e,r)).trim()}import{spawnSync as O}from"node:child_process";import pt from"node:fs/promises";import B from"pandoc-binary";import{spawnSync as lt}from"node:child_process";import ut from"pandoc-binary";function h(){try{let e=lt(ut,["--version"],{stdio:"ignore"});return e.status===0&&!e.error}catch{return!1}}async function C(e){if(typeof e=="string"){if(h()){let t=O(B,["-f","odt",e,"-t","asciidoc"],{encoding:"utf-8"});if(t.status===0&&t.stdout)return t.stdout;let n=O(B,[e,"-t","asciidoc"],{encoding:"utf-8"});if(n.status===0&&n.stdout)return n.stdout}return(await pt.readFile(e)).toString("utf-8")}if(h()){let r=O(B,["-f","odt","-t","asciidoc"],{input:e,encoding:"utf-8"});if(r.status===0&&r.stdout)return r.stdout}return e.toString("utf-8")}import{PDFParse as mt}from"pdf-parse";import{createWorker as dt}from"tesseract.js";async function F(e,r={enableOcr:!0,lang:"eng"}){let t=null;try{t=new mt({data:e});let i=(await t.getInfo()).info?.Title?.trim(),o=await t.getText();if((o.text?.trim()??"").length>0||r.enableOcr===!1){let f=o.text??"";return i?`= ${i}

${f}`:f}let c=await t.getScreenshot();if(!c?.pages||c.pages.length===0){let f=o.text??"";return i?`= ${i}

${f}`:f}let u=null;try{u=await dt(r.lang||"eng");let f=[],m=r.maxOcrPages&&r.maxOcrPages>0?r.maxOcrPages:c.pages.length,p=c.pages.slice(0,m);for(let d of p)if(d.data){let y=Buffer.from(d.data);d.data=null;let x=await u.recognize(y);x.data.text?.trim()&&f.push(x.data.text.trim())}let l=f.join(`

`);return i?`= ${i}

${l}`:l}finally{u&&await u.terminate()}}finally{if(t&&typeof t.destroy=="function")try{await t.destroy()}catch{}}}import{spawnSync as D}from"node:child_process";import gt from"node:fs/promises";import E from"pandoc-binary";var ht=new Set(["annotation","background","colortbl","comment","datastore","defchp","defpap","do","doccomm","fonttbl","footer","footerf","footerl","footerr","ftncn","ftnsep","ftnsepc","header","headerf","headerl","headerr","info","keycode","keywords","latentstyles","listlevel","listname","listoverride","listoverridetable","listpicture","listtable","mailmerge","mmathpr","object","objclass","objdata","pict","private","propname","revtbl","rsidtbl","stylesheet","subject","themedata","title","txe","xe","xmlattrname","xmlattrvalue","xmlclose","xmlname","xmlopen"]),xt=new Map([["bullet","* "],["cell"," | "],["emdash","\u2014"],["emspace"," "],["endash","\u2013"],["enspace"," "],["ldblquote",'"'],["line",`
`],["lquote","'"],["page",`

`],["par",`

`],["qmspace"," "],["rdblquote",'"'],["row",`
`],["rquote","'"],["sect",`

`],["tab","	"]]),wt=new Map([["-",""],["_","-"],["~"," "]]),yt=new Map([[128,"\u20AC"],[130,"\u201A"],[131,"\u0192"],[132,"\u201E"],[133,"\u2026"],[134,"\u2020"],[135,"\u2021"],[136,"\u02C6"],[137,"\u2030"],[138,"\u0160"],[139,"\u2039"],[140,"\u0152"],[142,"\u017D"],[145,"\u2018"],[146,"\u2019"],[147,"\u201C"],[148,"\u201D"],[149,"\u2022"],[150,"\u2013"],[151,"\u2014"],[152,"\u02DC"],[153,"\u2122"],[154,"\u0161"],[155,"\u203A"],[156,"\u0153"],[158,"\u017E"],[159,"\u0178"]]);function St(e){return yt.get(e)??String.fromCodePoint(e)}function N(e){return e.replaceAll("\0","").replace(/\r\n?/g,`
`).split(`
`).map(r=>r.replace(/[ \t]+/g," ").trim()).join(`
`).replace(/\n{3,}/g,`

`).replace(/ +\| +/g," | ").trim()}function Tt(e,r,t){let n=r,i=t;for(;n<e.length&&i>0;){let o=e[n];if(o==="\r"||o===`
`||o==="{"||o==="}"){n+=1;continue}if(o==="\\"){let s=e[n+1];if(s==="'"&&/^[\dA-Fa-f]{2}$/.test(e.slice(n+2,n+4))){n+=4,i-=1;continue}if(s==="\\"||s==="{"||s==="}"){n+=2,i-=1;continue}}n+=1,i-=1}return n}function vt(e){if(!e.includes("\\rtf"))return N(e);let r=[{skipDestination:!1,unicodeSkip:1}],t=0,n="",i=!1;for(;t<e.length;){let o=r[r.length-1],s=e[t];if(s==="{"){r.push({...o}),t+=1;continue}if(s==="}"){r.length>1&&r.pop(),t+=1;continue}if(s==="\r"||s===`
`){t+=1;continue}if(s!=="\\"){o.skipDestination||(n+=s),t+=1;continue}t+=1;let c=e[t];if(!c)break;if(c==="*"){i=!0,t+=1;continue}if(c==="\\"||c==="{"||c==="}"){o.skipDestination||(n+=c),t+=1,i=!1;continue}if(c==="'"){let d=e.slice(t+1,t+3);!o.skipDestination&&/^[\dA-Fa-f]{2}$/.test(d)&&(n+=St(Number.parseInt(d,16))),t+=3,i=!1;continue}if(!/[A-Za-z]/.test(c)){o.skipDestination||(n+=wt.get(c)??""),t+=1,i=!1;continue}let u="";for(;t<e.length&&/[A-Za-z]/.test(e[t]);)u+=e[t],t+=1;let f=1;e[t]==="-"&&(f=-1,t+=1);let m="";for(;t<e.length&&/\d/.test(e[t]);)m+=e[t],t+=1;let p=m.length>0?f*Number.parseInt(m,10):void 0;e[t]===" "&&(t+=1);let l=u.toLowerCase();if(i||ht.has(l)){r[r.length-1].skipDestination=!0,i=!1;continue}if(i=!1,l==="uc"&&p!==void 0){r[r.length-1].unicodeSkip=p;continue}if(l==="u"&&p!==void 0){if(!o.skipDestination){let d=p<0?p+65536:p;n+=String.fromCodePoint(d)}t=Tt(e,t,r[r.length-1].unicodeSkip);continue}o.skipDestination||(n+=xt.get(l)??"")}return N(n)}function Pt(e){if(typeof e=="string"){let t=D(E,["-f","rtf",e,"-t","asciidoc"],{encoding:"utf-8"});if(t.status===0&&t.stdout)return t.stdout;let n=D(E,[e,"-t","asciidoc"],{encoding:"utf-8"});return n.status===0&&n.stdout?n.stdout:null}let r=D(E,["-f","rtf","-t","asciidoc"],{input:e,encoding:"utf-8"});return r.status===0&&r.stdout?r.stdout:null}async function M(e,r={}){if(r.usePandoc!==!1&&h()){let n=Pt(e);if(n)return n}let t=typeof e=="string"?await gt.readFile(e,"latin1"):e.toString("latin1");return vt(t)}import bt from"exceljs";import $e from"turndown";import{gfm as Ae}from"turndown-plugin-gfm";function $t(e){let r=e.value;if(r==null)return"";if(typeof r=="object"){let t=r;if("richText"in t&&Array.isArray(t.richText))return t.richText.map(n=>n.text||"").join("");if("text"in t&&typeof t.text=="string")return t.text;if("result"in t&&t.result!==void 0)return String(t.result??"");if("hyperlink"in t&&t.hyperlink)return String(t.text||t.hyperlink);if(r instanceof Date)return r.toISOString()}return String(r)}function W(e){let r=e.match(/^([A-Za-z]+)(\d+)$/);if(!r)return{row:1,col:1};let t=r[1].toUpperCase(),n=Number.parseInt(r[2],10),i=0;for(let o=0;o<t.length;o++)i=i*26+(t.charCodeAt(o)-64);return{row:n,col:i}}function kt(e){let r=new Map,t=new Set,n=e.model?.merges||[];for(let i of n){let o=i.split(":"),s=W(o[0]),c=o.length>1?W(o[1]):s,u=Math.min(s.row,c.row),f=Math.max(s.row,c.row),m=Math.min(s.col,c.col),p=Math.max(s.col,c.col),l=f-u+1,d=p-m+1;r.set(o[0].toUpperCase(),{rowspan:l,colspan:d,top:u,bottom:f,left:m,right:p});for(let y=u;y<=f;y++)for(let x=m;x<=p;x++)(y!==u||x!==m)&&t.add(`${y}:${x}`)}return{merges:r,coveredCells:t}}function U(e){let{merges:r,coveredCells:t}=kt(e),n=e.rowCount;if(n===0)return"";let i=0;if(e.eachRow({includeEmpty:!1},s=>{s.eachCell({includeEmpty:!0},(c,u)=>{u>i&&(i=u)})}),i===0)return"";let o=`[options="header"]
|===
`;for(let s=1;s<=n;s++){let c=e.getRow(s),u=[];for(let f=1;f<=i;f++){if(t.has(`${s}:${f}`))continue;let m=c.getCell(f),p=$t(m).replace(/\|/g,"\\|"),l=r.get(m.address),d="|";l&&(l.colspan>1&&l.rowspan>1?d=`${l.colspan}.${l.rowspan}+|`:l.colspan>1?d=`${l.colspan}+|`:l.rowspan>1&&(d=`.${l.rowspan}+|`)),u.push(`${d} ${p}`)}u.length>0&&(o+=`${u.join(" ")}
`,s===1&&(o+=`
`))}return o+=`|===
`,o}async function R(e){let r=new bt.Workbook;await r.xlsx.load(e);let t=r.worksheets.filter(n=>n.rowCount>0);return t.length===0?"":t.length===1?U(t[0]):t.map(n=>`== ${n.name}

${U(n)}`).join(`

`)}import{XMLParser as At}from"fast-xml-parser";import*as X from"js-yaml";import{parse as Ot}from"smol-toml";var Bt=new At({ignoreAttributes:!1});function H(e,r=1){let t="",n="*".repeat(r);for(let[i,o]of Object.entries(e))typeof o=="object"&&o!==null?(t+=`${n} *${i}:*
`,t+=H(o,r+1)):t+=`${n} *${i}:* ${o}
`;return t}function g(e,r){let t=e;if(typeof e=="string")try{r==="json"?t=JSON.parse(e):r==="yaml"?t=X.load(e):r==="toml"?t=Ot(e):r==="xml"&&(t=Bt.parse(e))}catch{return`[source,${r}]
----
${e.trim()}
----
`}return typeof t!="object"||t===null?`[source,${r}]
----
${String(t).trim()}
----
`:H(t)}var G={APNG:".apng",BMP:".bmp",CSV:".csv",DOC:".doc",DOCX:".docx",GIF:".gif",HTM:".htm",HTML:".html",JPEG:".jpeg",JPG:".jpg",JSON:".json",MARKDOWN:".markdown",MD:".md",MDC:".mdc",MDX:".mdx",ODF:".odf",ODS:".ods",ODT:".odt",PBM:".pbm",PDF:".pdf",PNG:".png",RTF:".rtf",TIF:".tif",TIFF:".tiff",TOML:".toml",TSV:".tsv",WEBP:".webp",XLS:".xls",XLSX:".xlsx",XML:".xml",YAML:".yaml",YML:".yml"};Object.freeze(G);var q={LATEX:".latex",MEDIAWIKI:".mediawiki",ORG:".org",RST:".rst",TEX:".tex",TYP:".typ",WIKI:".wiki"};Object.freeze(q);var a={...G,...q};Object.freeze(a);var L={[a.HTML]:"html",[a.HTM]:"html",[a.LATEX]:"latex",[a.MARKDOWN]:"markdown",[a.MDC]:"markdown",[a.MDX]:"markdown",[a.MD]:"markdown",[a.MEDIAWIKI]:"mediawiki",[a.ODF]:"odt",[a.ODT]:"odt",[a.ORG]:"org",[a.RST]:"rst",[a.RTF]:"rtf",[a.TEX]:"latex",[a.WIKI]:"mediawiki"},Rt=new Set(["adoc","asciidoc","markdown","md","text","txt"]);async function It(e,r){let t=await Ft.readFile(e),n=t.toString("utf-8");switch(r.toLowerCase()){case a.PDF:return F(t);case a.APNG:case a.BMP:case a.GIF:case a.JPEG:case a.JPG:case a.PBM:case a.PNG:case a.TIF:case a.TIFF:case a.WEBP:return A(t);case a.DOC:return b(t);case a.DOCX:return $(t);case a.CSV:return v(n,",");case a.TSV:return v(n,"	");case a.XLSX:case a.ODS:return R(t);case a.HTML:case a.HTM:return k(n);case a.JSON:return g(n,"json");case a.YAML:case a.YML:return g(n,"yaml");case a.TOML:return g(n,"toml");case a.XML:return g(n,"xml");case a.MD:case a.MARKDOWN:case a.MDX:case a.MDC:return w(n);case a.ODF:case a.ODT:return C(e);case a.RTF:return M(e);default:return n}}async function _t(e,r){if(h()&&L[r]){let n=L[r],i=[e,"-t","asciidoc"];n&&i.unshift("-f",n);let o=I(_,i,{encoding:"utf-8"});if(o.status===0)return o.stdout;let s=I(_,[e,"-t","asciidoc"],{encoding:"utf-8"});if(s.status===0)return s.stdout}return It(e,r)}function S(e){if(e)return e.replace(/^\./,"").toLowerCase()}function Lt(e){let r=[["inputFilePath",e.inputFilePath],["inputString",e.inputString],["inputBuffer",e.inputBuffer]].filter(([,o])=>o!==void 0);if(r.length!==1)throw new Error(`Exactly one input source must be provided: inputFilePath, inputString, or inputBuffer. Received [${r.length}].`);let[t,n]=r[0];if(t==="inputFilePath"){if(typeof n=="string")return{kind:"inputFilePath",filePath:T.resolve(process.cwd(),n),format:S(e.fromFormat??T.extname(n).replace(/^\./,""))};if(n instanceof URL){if(n.protocol!=="file:")throw new Error(`inputFilePath URL must use the file: protocol. Received "${n.protocol}".`);let o=Dt(n),s=S(e.fromFormat??T.extname(o).replace(/^\./,""));if(!s)throw new Error("fromFormat is required when using a Buffer inputFilePath.");return{kind:"inputFilePath",filePath:o,format:s}}if(Buffer.isBuffer(n)){let o=S(e.fromFormat);if(!o)throw new Error("fromFormat is required when using a Buffer inputFilePath.");return{kind:"inputBuffer",content:n,format:o}}throw new Error(`Unsupported input source type: ${typeof n}`)}if(t==="inputString"){if(typeof n!="string")throw new Error("inputString input must be a string value.");return{kind:"inputString",content:n,format:S(e.fromFormat)??"markdown"}}return{kind:"inputBuffer",content:Buffer.isBuffer(n)?n:Buffer.from(n),format:S(e.fromFormat)}}async function z(e,r){if(r==="md"||r==="markdown"){let t=await J(e,{attributes:{doctype:"book"},standalone:!1}),n=new Et({headingStyle:"atx"});return n.use(Mt),n.turndown(typeof t=="string"?t:String(t??""))}if(r==="txt"||r==="text"){let t=await J(e,{attributes:{doctype:"book"},standalone:!1});return(typeof t=="string"?t:String(t??"")).replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/\r?\n/g," ").replace(/<h[1-6][^>]*>/gi,`

`).replace(/<p[^>]*>/gi,`

`).replace(/<br[^>]*>/gi,`
`).replace(/<li[^>]*>/gi,`
* `).replace(/<tr[^>]*>/gi,`
`).replace(/<(?:td|th)[^>]*>/gi," | ").replace(/<div[^>]*>/gi,`
`).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[ \t]+/g," ").replace(/ \| \s+/g," | ").replace(/\* \s+/g,"* ").replace(/\n\s*\n\s*\n+/g,`

`).trim()}return e}async function jt(e,r){let t=S(r)??"text",n=h(),i=L[`.${t}`]??t;if(n&&i){let s=I(_,["-f",i,"-t","asciidoc"],{input:e,encoding:"utf-8"});if(s.status===0)return s.stdout}let o=typeof e=="string"?e:e.toString("utf-8");switch(t){case"csv":return v(o,",");case"tsv":return v(o,"	");case"html":case"htm":return k(o);case"json":return g(o,"json");case"yaml":case"yml":return g(o,"yaml");case"toml":return g(o,"toml");case"xml":return g(o,"xml");case"markdown":case"md":case"mdx":case"mdc":return w(o);case"pdf":return F(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8"));case"apng":case"bmp":case"gif":case"jpeg":case"jpg":case"pbm":case"png":case"tif":case"tiff":case"webp":return A(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8"));case"doc":return b(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8"));case"docx":return $(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8"));case"xlsx":case"ods":return R(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8"));case"odf":case"odt":return C(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8").toString());case"rtf":return M(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8").toString());default:return o}}async function j(e){let r=e.inputFilePath,t=e.inputBuffer,n=e.inputString,i=e.toFormat,s={fromFormat:e.fromFormat,inputBuffer:t,inputFilePath:r,inputString:n,toFormat:i};if(i===void 0&&(i="adoc"),!Rt.has(i))throw new Error(`Unknown output format: [${i}]`);let c=Lt(s);if(c.kind==="inputFilePath"){let p=c.filePath;if(!p||!Ct(p))throw new Error(`File not found "${p??""}"`);let l=T.extname(p).toLowerCase(),d=await _t(p,l);return z(d,i)}let u=c.content??"",f=c.format??"text",m=await jt(u,f);return z(m,i)}async function Wt(){let e=new URL("../package.json",import.meta.url),r=await P.readFile(e,"utf-8"),{version:t}=JSON.parse(r);return t??"0.0.0"}async function Ut(e){await new Promise((r,t)=>{process.stdout.write(e,n=>{if(n){t(n);return}r()})})}async function Xt(){let{values:e,positionals:r}=Nt({options:{input:{type:"string",short:"i"},output:{type:"string",short:"o"},type:{type:"string",short:"t",default:"adoc"},force:{type:"boolean",short:"f",default:!1},version:{type:"boolean",short:"v"},help:{type:"boolean",short:"h"}},allowPositionals:!0});e.version&&(console.log(`doc-to-adoc v${await Wt()}`),process.exit(0)),e.help&&(console.log(`
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
    `.trim()),process.exit(0));let t=e.input||r[0],n=e.output||r[1];t||(console.error("Error: Missing input file. Run 'doc-to-adoc --help' for usage."),process.exit(1));let i=(e.type||"adoc").toLowerCase();["adoc","asciidoc","md","markdown","txt","text"].includes(i)||(console.error(`Error: Unsupported output type '${i}'. Valid types: adoc, md, txt.`),process.exit(1));try{let o=await j({inputFilePath:t,toFormat:i});if(n){if(!e.force)try{await P.access(n),console.error(`Error: Output file '${n}' already exists. Use -f or --force to overwrite.`),process.exit(1)}catch(s){if(s.code!=="ENOENT")throw s}await P.mkdir(K.dirname(K.resolve(n)),{recursive:!0}),await P.writeFile(n,o,"utf-8")}else await Ut(o)}catch(o){console.error("Conversion failed:",o instanceof Error?o.message:o),process.exit(2)}}Xt().then(()=>process.exit(0)).catch(e=>{console.error(e),process.exit(3)});
//# sourceMappingURL=cli.js.map
