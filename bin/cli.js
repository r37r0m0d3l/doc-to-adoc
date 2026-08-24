#!/usr/bin/env node
import P from"node:fs/promises";import q from"node:path";import{parseArgs as jt}from"node:util";import{spawnSync as I}from"node:child_process";import{existsSync as Dt}from"node:fs";import Et from"node:fs/promises";import*as v from"node:path";import{fileURLToPath as J}from"node:url";import{convert as z}from"@asciidoctor/core";import _ from"pandoc-binary";import Mt from"turndown";import{gfm as Ft}from"turndown-plugin-gfm";import{parse as Y}from"csv-parse/sync";function T(e,r=","){let t=Y(e,{skip_empty_lines:!0,delimiter:r});if(t.length===0)return"";let n=t[0],i=t.slice(1),o=`[options="header"]
|===
`;o+=`| ${n.map(s=>String(s).replace(/\|/g,"\\|")).join(" | ")}

`;for(let s of i)o+=`| ${s.map(c=>String(c).replace(/\|/g,"\\|")).join(" | ")}
`;return o+=`|===
`,o}import Z from"word-extractor";var Q="\x07";function tt(e){return e.replace(/\r\n?/g,`
`).replaceAll(Q," ").replace(/[ \t]+\n/g,`
`).split(`
`).map(r=>r.trim()).filter((r,t,n)=>r.length>0||n[t-1]?.length>0).join(`

`).trim()}async function et(e){let t=await new Z().extract(e),n=tt(t.getBody());if(!n)throw new Error("Legacy DOC conversion produced no readable text");return n}async function b(e){return et(e)}import rt from"mammoth";import nt from"turndown";import{gfm as ot}from"turndown-plugin-gfm";function w(e){let r=[],t=e;return t=t.replace(/```(\w*)\r?\n([\s\S]*?)```/g,(n,i,o)=>{let s=`\xA7CODEBLOCK${r.length}\xA7`;return r.push(`${i?`[source,${i}]
`:`[source]
`}----
${o.trim()}
----
`),s}),t=t.replace(/^[*+_-]{3,}$/gm,"'''"),t=t.replace(/(\*\*\*|___)(.*?)\1/g,"\xA7BI\xA7$2\xA7BI\xA7"),t=t.replace(/(\*\*|__)(.*?)\1/g,"\xA7B\xA7$2\xA7B\xA7"),t=t.replace(/(\*|_)(.*?)\1/g,"\xA7I\xA7$2\xA7I\xA7"),t=t.replace(/^(?:<a id=".*"><\/a>)?######\s+(.*)$/gm,"====== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#####\s+(.*)$/gm,"===== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?####\s+(.*)$/gm,"==== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?###\s+(.*)$/gm,"=== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?##\s+(.*)$/gm,"== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#\s+(.*)$/gm,"= $1"),t=t.replace(/(?:^[ \t]*>.*(?:\r?\n|$))+/gm,n=>{let o=n.split(/\r?\n/).map(c=>c.replace(/^[ \t]*>\s?/,""));for(;o.length>0&&o[0].trim()==="";)o.shift();for(;o.length>0&&o[o.length-1].trim()==="";)o.pop();let s=o.join(`
`);return s?`[quote]
____
${s}
____

`:""}),t=t.replace(/^[ \t]*[-*+]\s+(.*)$/gm,"* $1"),t=t.replace(/^[ \t]*\d+\.\s+(.*)$/gm,". $1"),t=t.replace(/^(\|.*\|)\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+\r?\n((\|.*\|\r?\n?)*)/gm,(n,i,o)=>{let s=p=>p.split("|").filter((m,l,d)=>l>0&&l<d.length-1).map(m=>m.trim()),c=s(i),u=o.trim().split(`
`).map(s),f=`[options="header"]
|===
`;f+=`| ${c.join(" | ")}
`;for(let p of u)f+=`| ${p.join(" | ")}
`;return f+=`|===
`,f}),t=t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(n,i,o)=>`image:${o}[${i}]`),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(n,i,o)=>`${o}[${i}]`),t=t.replace(/§BI§/g,"***"),t=t.replace(/§B§/g,"*"),t=t.replace(/§I§/g,"_"),r.forEach((n,i)=>{t=t.replace(`\xA7CODEBLOCK${i}\xA7`,n)}),t.trim()}async function it(e){let{value:r}=await rt.convertToHtml({buffer:e});return r}async function st(e){let r=await it(e),t=new nt({headingStyle:"atx"});return t.use(ot),t.turndown(r)}async function $(e){let r=await st(e);return w(r)}import at from"turndown";import{gfm as ct}from"turndown-plugin-gfm";function k(e){let r=e.replace(/<head[^>]*>[\s\S]*?<\/head>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,""),t=new at({headingStyle:"atx"});t.use(ct);let n=t.turndown(r);return w(n)}import{createWorker as ft}from"tesseract.js";async function lt(e,r="eng"){let t=await ft(r);try{return(await t.recognize(e)).data.text}finally{await t.terminate()}}async function A(e,r="eng"){return(await lt(e,r)).trim()}import{spawnSync as O}from"node:child_process";import mt from"node:fs/promises";import B from"pandoc-binary";import{spawnSync as ut}from"node:child_process";import pt from"pandoc-binary";function x(){try{let e=ut(pt,["--version"],{stdio:"ignore"});return e.status===0&&!e.error}catch{return!1}}async function C(e){if(typeof e=="string"){if(x()){let t=O(B,["-f","odt",e,"-t","asciidoc"],{encoding:"utf-8"});if(t.status===0&&t.stdout)return t.stdout;let n=O(B,[e,"-t","asciidoc"],{encoding:"utf-8"});if(n.status===0&&n.stdout)return n.stdout}return(await mt.readFile(e)).toString("utf-8")}if(x()){let r=O(B,["-f","odt","-t","asciidoc"],{input:e,encoding:"utf-8"});if(r.status===0&&r.stdout)return r.stdout}return e.toString("utf-8")}import{PDFParse as dt}from"pdf-parse";import{createWorker as gt}from"tesseract.js";async function D(e,r={enableOcr:!0,lang:"eng"}){let t=null;try{t=new dt({data:e});let i=(await t.getInfo()).info?.Title?.trim(),o=await t.getText();if((o.text?.trim()??"").length>0||r.enableOcr===!1){let f=o.text??"";return i?`= ${i}

${f}`:f}let c=await t.getScreenshot();if(!c?.pages||c.pages.length===0){let f=o.text??"";return i?`= ${i}

${f}`:f}let u=null;try{u=await gt(r.lang||"eng");let f=[],p=r.maxOcrPages&&r.maxOcrPages>0?r.maxOcrPages:c.pages.length,m=c.pages.slice(0,p);for(let d of m)if(d.data){let y=Buffer.from(d.data);d.data=null;let h=await u.recognize(y);h.data.text?.trim()&&f.push(h.data.text.trim())}let l=f.join(`

`);return i?`= ${i}

${l}`:l}finally{u&&await u.terminate()}}finally{if(t&&typeof t.destroy=="function")try{await t.destroy()}catch{}}}import{spawnSync as E}from"node:child_process";import xt from"node:fs/promises";import M from"pandoc-binary";var ht=new Set(["annotation","background","colortbl","comment","datastore","defchp","defpap","do","doccomm","fonttbl","footer","footerf","footerl","footerr","ftncn","ftnsep","ftnsepc","header","headerf","headerl","headerr","info","keycode","keywords","latentstyles","listlevel","listname","listoverride","listoverridetable","listpicture","listtable","mailmerge","mmathpr","object","objclass","objdata","pict","private","propname","revtbl","rsidtbl","stylesheet","subject","themedata","title","txe","xe","xmlattrname","xmlattrvalue","xmlclose","xmlname","xmlopen"]),wt=new Map([["bullet","* "],["cell"," | "],["emdash","\u2014"],["emspace"," "],["endash","\u2013"],["enspace"," "],["ldblquote",'"'],["line",`
`],["lquote","'"],["page",`

`],["par",`

`],["qmspace"," "],["rdblquote",'"'],["row",`
`],["rquote","'"],["sect",`

`],["tab","	"]]),yt=new Map([["-",""],["_","-"],["~"," "]]),St=new Map([[128,"\u20AC"],[130,"\u201A"],[131,"\u0192"],[132,"\u201E"],[133,"\u2026"],[134,"\u2020"],[135,"\u2021"],[136,"\u02C6"],[137,"\u2030"],[138,"\u0160"],[139,"\u2039"],[140,"\u0152"],[142,"\u017D"],[145,"\u2018"],[146,"\u2019"],[147,"\u201C"],[148,"\u201D"],[149,"\u2022"],[150,"\u2013"],[151,"\u2014"],[152,"\u02DC"],[153,"\u2122"],[154,"\u0161"],[155,"\u203A"],[156,"\u0153"],[158,"\u017E"],[159,"\u0178"]]);function vt(e){return St.get(e)??String.fromCodePoint(e)}function N(e){return e.replaceAll("\0","").replace(/\r\n?/g,`
`).split(`
`).map(r=>r.replace(/[ \t]+/g," ").trim()).join(`
`).replace(/\n{3,}/g,`

`).replace(/ +\| +/g," | ").trim()}function Tt(e,r,t){let n=r,i=t;for(;n<e.length&&i>0;){let o=e[n];if(o==="\r"||o===`
`||o==="{"||o==="}"){n+=1;continue}if(o==="\\"){let s=e[n+1];if(s==="'"&&/^[\dA-Fa-f]{2}$/.test(e.slice(n+2,n+4))){n+=4,i-=1;continue}if(s==="\\"||s==="{"||s==="}"){n+=2,i-=1;continue}}n+=1,i-=1}return n}function Pt(e){if(!e.includes("\\rtf"))return N(e);let r=[{skipDestination:!1,unicodeSkip:1}],t=0,n="",i=!1;for(;t<e.length;){let o=r[r.length-1],s=e[t];if(s==="{"){r.push({...o}),t+=1;continue}if(s==="}"){r.length>1&&r.pop(),t+=1;continue}if(s==="\r"||s===`
`){t+=1;continue}if(s!=="\\"){o.skipDestination||(n+=s),t+=1;continue}t+=1;let c=e[t];if(!c)break;if(c==="*"){i=!0,t+=1;continue}if(c==="\\"||c==="{"||c==="}"){o.skipDestination||(n+=c),t+=1,i=!1;continue}if(c==="'"){let d=e.slice(t+1,t+3);!o.skipDestination&&/^[\dA-Fa-f]{2}$/.test(d)&&(n+=vt(Number.parseInt(d,16))),t+=3,i=!1;continue}if(!/[A-Za-z]/.test(c)){o.skipDestination||(n+=yt.get(c)??""),t+=1,i=!1;continue}let u="";for(;t<e.length&&/[A-Za-z]/.test(e[t]);)u+=e[t],t+=1;let f=1;e[t]==="-"&&(f=-1,t+=1);let p="";for(;t<e.length&&/\d/.test(e[t]);)p+=e[t],t+=1;let m=p.length>0?f*Number.parseInt(p,10):void 0;e[t]===" "&&(t+=1);let l=u.toLowerCase();if(i||ht.has(l)){r[r.length-1].skipDestination=!0,i=!1;continue}if(i=!1,l==="uc"&&m!==void 0){r[r.length-1].unicodeSkip=m;continue}if(l==="u"&&m!==void 0){if(!o.skipDestination){let d=m<0?m+65536:m;n+=String.fromCodePoint(d)}t=Tt(e,t,r[r.length-1].unicodeSkip);continue}o.skipDestination||(n+=wt.get(l)??"")}return N(n)}function bt(e){if(typeof e=="string"){let t=E(M,["-f","rtf",e,"-t","asciidoc"],{encoding:"utf-8"});if(t.status===0&&t.stdout)return t.stdout;let n=E(M,[e,"-t","asciidoc"],{encoding:"utf-8"});return n.status===0&&n.stdout?n.stdout:null}let r=E(M,["-f","rtf","-t","asciidoc"],{input:e,encoding:"utf-8"});return r.status===0&&r.stdout?r.stdout:null}async function F(e,r={}){if(r.usePandoc!==!1&&x()){let n=bt(e);if(n)return n}let t=typeof e=="string"?await xt.readFile(e,"latin1"):e.toString("latin1");return Pt(t)}import $t from"exceljs";import be from"turndown";import{gfm as ke}from"turndown-plugin-gfm";function kt(e){let r=e.value;if(r==null)return"";if(typeof r=="object"){let t=r;if("richText"in t&&Array.isArray(t.richText))return t.richText.map(n=>n.text||"").join("");if("text"in t&&typeof t.text=="string")return t.text;if("result"in t&&t.result!==void 0)return String(t.result??"");if("hyperlink"in t&&t.hyperlink)return String(t.text||t.hyperlink);if(r instanceof Date)return r.toISOString()}return String(r)}function W(e){let r=e.match(/^([A-Za-z]+)(\d+)$/);if(!r)return{row:1,col:1};let t=r[1].toUpperCase(),n=Number.parseInt(r[2],10),i=0;for(let o=0;o<t.length;o++)i=i*26+(t.charCodeAt(o)-64);return{row:n,col:i}}function At(e){let r=new Map,t=new Set,n=e.model?.merges||[];for(let i of n){let o=i.split(":"),s=W(o[0]),c=o.length>1?W(o[1]):s,u=Math.min(s.row,c.row),f=Math.max(s.row,c.row),p=Math.min(s.col,c.col),m=Math.max(s.col,c.col),l=f-u+1,d=m-p+1;r.set(o[0].toUpperCase(),{rowspan:l,colspan:d,top:u,bottom:f,left:p,right:m});for(let y=u;y<=f;y++)for(let h=p;h<=m;h++)(y!==u||h!==p)&&t.add(`${y}:${h}`)}return{merges:r,coveredCells:t}}function X(e){let{merges:r,coveredCells:t}=At(e),n=e.rowCount;if(n===0)return"";let i=0;if(e.eachRow({includeEmpty:!1},s=>{s.eachCell({includeEmpty:!0},(c,u)=>{u>i&&(i=u)})}),i===0)return"";let o=`[options="header"]
|===
`;for(let s=1;s<=n;s++){let c=e.getRow(s),u=[];for(let f=1;f<=i;f++){if(t.has(`${s}:${f}`))continue;let p=c.getCell(f),m=kt(p).replace(/\|/g,"\\|"),l=r.get(p.address),d="|";l&&(l.colspan>1&&l.rowspan>1?d=`${l.colspan}.${l.rowspan}+|`:l.colspan>1?d=`${l.colspan}+|`:l.rowspan>1&&(d=`.${l.rowspan}+|`)),u.push(`${d} ${m}`)}u.length>0&&(o+=`${u.join(" ")}
`,s===1&&(o+=`
`))}return o+=`|===
`,o}async function R(e){let r=new $t.Workbook;await r.xlsx.load(e);let t=r.worksheets.filter(n=>n.rowCount>0);return t.length===0?"":t.length===1?X(t[0]):t.map(n=>`== ${n.name}

${X(n)}`).join(`

`)}import{XMLParser as Ot}from"fast-xml-parser";import*as U from"js-yaml";import{parse as Bt}from"smol-toml";var Ct=new Ot({ignoreAttributes:!1});function H(e,r=1){let t="",n="*".repeat(r);for(let[i,o]of Object.entries(e))typeof o=="object"&&o!==null?(t+=`${n} *${i}:*
`,t+=H(o,r+1)):t+=`${n} *${i}:* ${o}
`;return t}function g(e,r){let t=e;if(typeof e=="string")try{r==="json"?t=JSON.parse(e):r==="yaml"?t=U.load(e):r==="toml"?t=Bt(e):r==="xml"&&(t=Ct.parse(e))}catch{return`[source,${r}]
----
${e.trim()}
----
`}return typeof t!="object"||t===null?`[source,${r}]
----
${String(t).trim()}
----
`:H(t)}var K={APNG:".apng",BMP:".bmp",CSV:".csv",DOC:".doc",DOCX:".docx",GIF:".gif",HTM:".htm",HTML:".html",JPEG:".jpeg",JPG:".jpg",JSON:".json",MARKDOWN:".markdown",MD:".md",MDC:".mdc",MDX:".mdx",ODF:".odf",ODS:".ods",ODT:".odt",PBM:".pbm",PDF:".pdf",PNG:".png",RTF:".rtf",TIF:".tif",TIFF:".tiff",TOML:".toml",TSV:".tsv",WEBP:".webp",XLS:".xls",XLSX:".xlsx",XML:".xml",YAML:".yaml",YML:".yml"};Object.freeze(K);var V={LATEX:".latex",MEDIAWIKI:".mediawiki",ORG:".org",RST:".rst",TEX:".tex",TYP:".typ",WIKI:".wiki"};Object.freeze(V);var a={...K,...V};Object.freeze(a);var L={[a.HTML]:"html",[a.HTM]:"html",[a.LATEX]:"latex",[a.MARKDOWN]:"markdown",[a.MDC]:"markdown",[a.MDX]:"markdown",[a.MD]:"markdown",[a.MEDIAWIKI]:"mediawiki",[a.ODF]:"odt",[a.ODT]:"odt",[a.ORG]:"org",[a.RST]:"rst",[a.RTF]:"rtf",[a.TEX]:"latex",[a.WIKI]:"mediawiki"};async function Rt(e,r){let t=await Et.readFile(e),n=t.toString("utf-8");switch(r.toLowerCase()){case a.PDF:return D(t);case a.APNG:case a.BMP:case a.GIF:case a.JPEG:case a.JPG:case a.PBM:case a.PNG:case a.TIF:case a.TIFF:case a.WEBP:return A(t);case a.DOC:return b(t);case a.DOCX:return $(t);case a.CSV:return T(n,",");case a.TSV:return T(n,"	");case a.XLSX:case a.ODS:return R(t);case a.HTML:case a.HTM:return k(n);case a.JSON:return g(n,"json");case a.YAML:case a.YML:return g(n,"yaml");case a.TOML:return g(n,"toml");case a.XML:return g(n,"xml");case a.MD:case a.MARKDOWN:case a.MDX:case a.MDC:return w(n);case a.ODF:case a.ODT:return C(e);case a.RTF:return F(e);default:return n}}async function It(e,r){if(x()&&L[r]){let n=L[r],i=[e,"-t","asciidoc"];n&&i.unshift("-f",n);let o=I(_,i,{encoding:"utf-8"});if(o.status===0)return o.stdout;let s=I(_,[e,"-t","asciidoc"],{encoding:"utf-8"});if(s.status===0)return s.stdout}return Rt(e,r)}function S(e){if(e)return e.replace(/^\./,"").toLowerCase()}function _t(e){let r=[["inputFilePath",e.inputFilePath],["inputString",e.inputString],["inputBuffer",e.inputBuffer]].filter(([,o])=>o!==void 0);if(r.length!==1)throw new Error(`Exactly one input source must be provided: inputFilePath, inputString, or inputBuffer. Received ${r.length}.`);let[t,n]=r[0];if(t==="inputFilePath"){if(typeof n=="string")return{kind:"file",filePath:v.resolve(process.cwd(),n),format:S(e.fromFormat??v.extname(n).replace(/^\./,""))};if(n instanceof URL)return{kind:"file",filePath:J(n),format:S(e.fromFormat??v.extname(J(n)).replace(/^\./,""))};if(Buffer.isBuffer(n))return{kind:"inputBuffer",content:n,format:S(e.fromFormat)};throw new Error(`Unsupported input source type: ${typeof n}`)}if(t==="inputString"){if(typeof n!="string")throw new Error("inputString input must be a string value.");return{kind:"inputString",content:n,format:S(e.fromFormat)??"markdown"}}return{kind:"inputBuffer",content:Buffer.isBuffer(n)?n:Buffer.from(n),format:S(e.fromFormat)}}async function G(e,r){if(r==="md"||r==="markdown"){let t=await z(e,{attributes:{doctype:"book"},standalone:!1}),n=new Mt({headingStyle:"atx"});return n.use(Ft),n.turndown(typeof t=="string"?t:String(t??""))}if(r==="txt"||r==="text"){let t=await z(e,{attributes:{doctype:"book"},standalone:!1});return(typeof t=="string"?t:String(t??"")).replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/\r?\n/g," ").replace(/<h[1-6][^>]*>/gi,`

`).replace(/<p[^>]*>/gi,`

`).replace(/<br[^>]*>/gi,`
`).replace(/<li[^>]*>/gi,`
* `).replace(/<tr[^>]*>/gi,`
`).replace(/<(?:td|th)[^>]*>/gi," | ").replace(/<div[^>]*>/gi,`
`).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[ \t]+/g," ").replace(/ \| \s+/g," | ").replace(/\* \s+/g,"* ").replace(/\n\s*\n\s*\n+/g,`

`).trim()}return e}async function Lt(e,r){let t=S(r)??"text",n=x(),i=L[`.${t}`]??t;if(n&&i){let s=I(_,["-f",i,"-t","asciidoc"],{input:e,encoding:"utf-8"});if(s.status===0)return s.stdout}let o=typeof e=="string"?e:e.toString("utf-8");switch(t){case"csv":return T(o,",");case"tsv":return T(o,"	");case"html":case"htm":return k(o);case"json":return g(o,"json");case"yaml":case"yml":return g(o,"yaml");case"toml":return g(o,"toml");case"xml":return g(o,"xml");case"markdown":case"md":case"mdx":case"mdc":return w(o);case"pdf":return D(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8"));case"apng":case"bmp":case"gif":case"jpeg":case"jpg":case"pbm":case"png":case"tif":case"tiff":case"webp":return A(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8"));case"doc":return b(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8"));case"docx":return $(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8"));case"xlsx":case"ods":return R(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8"));case"odf":case"odt":return C(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8").toString());case"rtf":return F(Buffer.isBuffer(e)?e:Buffer.from(o,"utf-8").toString());default:return o}}async function j(e){let r=e,t=e.inputFilePath??r.input,n=e.inputBuffer,i=e.toFormat??r.type??"adoc",o={...e,inputFilePath:t,inputBuffer:n,toFormat:i},s=_t(o);if(s.kind==="file"){let p=s.filePath;if(!p||!Dt(p))throw new Error(`File not found "${p??""}"`);let m=v.extname(p).toLowerCase(),l=await It(p,m);return G(l,i)}let c=s.content??"",u=s.format??"text",f=await Lt(c,u);return G(f,i)}async function Nt(){let e=new URL("../package.json",import.meta.url),r=await P.readFile(e,"utf-8"),{version:t}=JSON.parse(r);return t??"0.0.0"}async function Wt(e){await new Promise((r,t)=>{process.stdout.write(e,n=>{if(n){t(n);return}r()})})}async function Xt(){let{values:e,positionals:r}=jt({options:{input:{type:"string",short:"i"},output:{type:"string",short:"o"},type:{type:"string",short:"t",default:"adoc"},force:{type:"boolean",short:"f",default:!1},version:{type:"boolean",short:"v"},help:{type:"boolean",short:"h"}},allowPositionals:!0});e.version&&(console.log(`doc-to-adoc v${await Nt()}`),process.exit(0)),e.help&&(console.log(`
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
    `.trim()),process.exit(0));let t=e.input||r[0],n=e.output||r[1];t||(console.error("Error: Missing input file. Run 'doc-to-adoc --help' for usage."),process.exit(1));let i=(e.type||"adoc").toLowerCase();["adoc","asciidoc","md","markdown","txt","text"].includes(i)||(console.error(`Error: Unsupported output type '${i}'. Valid types: adoc, md, txt.`),process.exit(1));try{let o=await j({inputFilePath:t,toFormat:i});if(n){if(!e.force)try{await P.access(n),console.error(`Error: Output file '${n}' already exists. Use -f or --force to overwrite.`),process.exit(1)}catch(s){if(s.code!=="ENOENT")throw s}await P.mkdir(q.dirname(q.resolve(n)),{recursive:!0}),await P.writeFile(n,o,"utf-8")}else await Wt(o)}catch(o){console.error("Conversion failed:",o instanceof Error?o.message:o),process.exit(2)}}Xt().then(()=>process.exit(0)).catch(e=>{console.error(e),process.exit(3)});
//# sourceMappingURL=cli.js.map
