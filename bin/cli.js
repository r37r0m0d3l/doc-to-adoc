#!/usr/bin/env node
import v from"node:fs/promises";import U from"node:path";import{parseArgs as It}from"node:util";import{spawnSync as W}from"node:child_process";import{existsSync as kt}from"node:fs";import Ct from"node:fs/promises";import*as T from"node:path";import{convert as X}from"@asciidoctor/core";import H from"pandoc-binary";import Dt from"turndown";import{gfm as Mt}from"turndown-plugin-gfm";import{parse as K}from"csv-parse/sync";function S(e,r=","){let t=K(e,{skip_empty_lines:!0,delimiter:r});if(t.length===0)return"";let n=t[0],s=t.slice(1),o=`[options="header"]
|===
`;o+=`| ${n.map(i=>String(i).replace(/\|/g,"\\|")).join(" | ")}

`;for(let i of s)o+=`| ${i.map(c=>String(c).replace(/\|/g,"\\|")).join(" | ")}
`;return o+=`|===
`,o}import q from"word-extractor";var V="\x07";function Y(e){return e.replace(/\r\n?/g,`
`).replaceAll(V," ").replace(/[ \t]+\n/g,`
`).split(`
`).map(r=>r.trim()).filter((r,t,n)=>r.length>0||n[t-1]?.length>0).join(`

`).trim()}async function Z(e){let t=await new q().extract(e),n=Y(t.getBody());if(!n)throw new Error("Legacy DOC conversion produced no readable text");return n}async function k(e){return Z(e)}import Q from"mammoth";import tt from"turndown";import{gfm as et}from"turndown-plugin-gfm";function h(e){let r=[],t=e;return t=t.replace(/```(\w*)\r?\n([\s\S]*?)```/g,(n,s,o)=>{let i=`\xA7CODEBLOCK${r.length}\xA7`;return r.push(`${s?`[source,${s}]
`:`[source]
`}----
${o.trim()}
----
`),i}),t=t.replace(/^[*+_-]{3,}$/gm,"'''"),t=t.replace(/(\*\*\*|___)(.*?)\1/g,"\xA7BI\xA7$2\xA7BI\xA7"),t=t.replace(/(\*\*|__)(.*?)\1/g,"\xA7B\xA7$2\xA7B\xA7"),t=t.replace(/(\*|_)(.*?)\1/g,"\xA7I\xA7$2\xA7I\xA7"),t=t.replace(/^(?:<a id=".*"><\/a>)?######\s+(.*)$/gm,"====== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#####\s+(.*)$/gm,"===== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?####\s+(.*)$/gm,"==== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?###\s+(.*)$/gm,"=== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?##\s+(.*)$/gm,"== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#\s+(.*)$/gm,"= $1"),t=t.replace(/(?:^[ \t]*>.*(?:\r?\n|$))+/gm,n=>{let o=n.split(/\r?\n/).map(c=>c.replace(/^[ \t]*>\s?/,""));for(;o.length>0&&o[0].trim()==="";)o.shift();for(;o.length>0&&o[o.length-1].trim()==="";)o.pop();let i=o.join(`
`);return i?`[quote]
____
${i}
____

`:""}),t=t.replace(/^[ \t]*[-*+]\s+(.*)$/gm,"* $1"),t=t.replace(/^[ \t]*\d+\.\s+(.*)$/gm,". $1"),t=t.replace(/^(\|.*\|)\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+\r?\n((\|.*\|\r?\n?)*)/gm,(n,s,o)=>{let i=u=>u.split("|").filter((m,f,d)=>f>0&&f<d.length-1).map(m=>m.trim()),c=i(s),p=o.trim().split(`
`).map(i),l=`[options="header"]
|===
`;l+=`| ${c.join(" | ")}
`;for(let u of p)l+=`| ${u.join(" | ")}
`;return l+=`|===
`,l}),t=t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(n,s,o)=>`image:${o}[${s}]`),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(n,s,o)=>`${o}[${s}]`),t=t.replace(/§BI§/g,"***"),t=t.replace(/§B§/g,"*"),t=t.replace(/§I§/g,"_"),r.forEach((n,s)=>{t=t.replace(`\xA7CODEBLOCK${s}\xA7`,n)}),t.trim()}async function rt(e){let{value:r}=await Q.convertToHtml({buffer:e});return r}async function nt(e){let r=await rt(e),t=new tt({headingStyle:"atx"});return t.use(et),t.turndown(r)}async function C(e){let r=await nt(e);return h(r)}import ot from"turndown";import{gfm as st}from"turndown-plugin-gfm";function D(e){let r=e.replace(/<head[^>]*>[\s\S]*?<\/head>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,""),t=new ot({headingStyle:"atx"});t.use(st);let n=t.turndown(r);return h(n)}import{createWorker as it}from"tesseract.js";async function at(e,r="eng"){let t=await it(r);try{return(await t.recognize(e)).data.text}finally{await t.terminate()}}async function M(e,r="eng"){return(await at(e,r)).trim()}import{spawnSync as b}from"node:child_process";import ft from"node:fs/promises";import $ from"pandoc-binary";import{spawnSync as ct}from"node:child_process";import lt from"pandoc-binary";function x(){try{let e=ct(lt,["--version"],{stdio:"ignore"});return e.status===0&&!e.error}catch{return!1}}async function E(e){if(typeof e=="string"){if(x()){let t=b($,["-f","odt",e,"-t","asciidoc"],{encoding:"utf-8"});if(t.status===0&&t.stdout)return t.stdout;let n=b($,[e,"-t","asciidoc"],{encoding:"utf-8"});if(n.status===0&&n.stdout)return n.stdout}return(await ft.readFile(e)).toString("utf-8")}if(x()){let r=b($,["-f","odt","-t","asciidoc"],{input:e,encoding:"utf-8"});if(r.status===0&&r.stdout)return r.stdout}return e.toString("utf-8")}import{PDFParse as pt}from"pdf-parse";import{createWorker as ut}from"tesseract.js";async function R(e,r={enableOcr:!0,lang:"eng"}){let t=null;try{t=new pt({data:e});let s=(await t.getInfo()).info?.Title?.trim(),o=await t.getText();if((o.text?.trim()??"").length>0||r.enableOcr===!1){let l=o.text??"";return s?`= ${s}

${l}`:l}let c=await t.getScreenshot();if(!c?.pages||c.pages.length===0){let l=o.text??"";return s?`= ${s}

${l}`:l}let p=null;try{p=await ut(r.lang||"eng");let l=[],u=r.maxOcrPages&&r.maxOcrPages>0?r.maxOcrPages:c.pages.length,m=c.pages.slice(0,u);for(let d of m)if(d.data){let w=Buffer.from(d.data);d.data=null;let g=await p.recognize(w);g.data.text?.trim()&&l.push(g.data.text.trim())}let f=l.join(`

`);return s?`= ${s}

${f}`:f}finally{p&&await p.terminate()}}finally{if(t&&typeof t.destroy=="function")try{await t.destroy()}catch{}}}import{spawnSync as P}from"node:child_process";import mt from"node:fs/promises";import A from"pandoc-binary";var dt=new Set(["annotation","background","colortbl","comment","datastore","defchp","defpap","do","doccomm","fonttbl","footer","footerf","footerl","footerr","ftncn","ftnsep","ftnsepc","header","headerf","headerl","headerr","info","keycode","keywords","latentstyles","listlevel","listname","listoverride","listoverridetable","listpicture","listtable","mailmerge","mmathpr","object","objclass","objdata","pict","private","propname","revtbl","rsidtbl","stylesheet","subject","themedata","title","txe","xe","xmlattrname","xmlattrvalue","xmlclose","xmlname","xmlopen"]),gt=new Map([["bullet","* "],["cell"," | "],["emdash","\u2014"],["emspace"," "],["endash","\u2013"],["enspace"," "],["ldblquote",'"'],["line",`
`],["lquote","'"],["page",`

`],["par",`

`],["qmspace"," "],["rdblquote",'"'],["row",`
`],["rquote","'"],["sect",`

`],["tab","	"]]),xt=new Map([["-",""],["_","-"],["~"," "]]),wt=new Map([[128,"\u20AC"],[130,"\u201A"],[131,"\u0192"],[132,"\u201E"],[133,"\u2026"],[134,"\u2020"],[135,"\u2021"],[136,"\u02C6"],[137,"\u2030"],[138,"\u0160"],[139,"\u2039"],[140,"\u0152"],[142,"\u017D"],[145,"\u2018"],[146,"\u2019"],[147,"\u201C"],[148,"\u201D"],[149,"\u2022"],[150,"\u2013"],[151,"\u2014"],[152,"\u02DC"],[153,"\u2122"],[154,"\u0161"],[155,"\u203A"],[156,"\u0153"],[158,"\u017E"],[159,"\u0178"]]);function ht(e){return wt.get(e)??String.fromCodePoint(e)}function I(e){return e.replaceAll("\0","").replace(/\r\n?/g,`
`).split(`
`).map(r=>r.replace(/[ \t]+/g," ").trim()).join(`
`).replace(/\n{3,}/g,`

`).replace(/ +\| +/g," | ").trim()}function yt(e,r,t){let n=r,s=t;for(;n<e.length&&s>0;){let o=e[n];if(o==="\r"||o===`
`||o==="{"||o==="}"){n+=1;continue}if(o==="\\"){let i=e[n+1];if(i==="'"&&/^[\dA-Fa-f]{2}$/.test(e.slice(n+2,n+4))){n+=4,s-=1;continue}if(i==="\\"||i==="{"||i==="}"){n+=2,s-=1;continue}}n+=1,s-=1}return n}function Tt(e){if(!e.includes("\\rtf"))return I(e);let r=[{skipDestination:!1,unicodeSkip:1}],t=0,n="",s=!1;for(;t<e.length;){let o=r[r.length-1],i=e[t];if(i==="{"){r.push({...o}),t+=1;continue}if(i==="}"){r.length>1&&r.pop(),t+=1;continue}if(i==="\r"||i===`
`){t+=1;continue}if(i!=="\\"){o.skipDestination||(n+=i),t+=1;continue}t+=1;let c=e[t];if(!c)break;if(c==="*"){s=!0,t+=1;continue}if(c==="\\"||c==="{"||c==="}"){o.skipDestination||(n+=c),t+=1,s=!1;continue}if(c==="'"){let d=e.slice(t+1,t+3);!o.skipDestination&&/^[\dA-Fa-f]{2}$/.test(d)&&(n+=ht(Number.parseInt(d,16))),t+=3,s=!1;continue}if(!/[A-Za-z]/.test(c)){o.skipDestination||(n+=xt.get(c)??""),t+=1,s=!1;continue}let p="";for(;t<e.length&&/[A-Za-z]/.test(e[t]);)p+=e[t],t+=1;let l=1;e[t]==="-"&&(l=-1,t+=1);let u="";for(;t<e.length&&/\d/.test(e[t]);)u+=e[t],t+=1;let m=u.length>0?l*Number.parseInt(u,10):void 0;e[t]===" "&&(t+=1);let f=p.toLowerCase();if(s||dt.has(f)){r[r.length-1].skipDestination=!0,s=!1;continue}if(s=!1,f==="uc"&&m!==void 0){r[r.length-1].unicodeSkip=m;continue}if(f==="u"&&m!==void 0){if(!o.skipDestination){let d=m<0?m+65536:m;n+=String.fromCodePoint(d)}t=yt(e,t,r[r.length-1].unicodeSkip);continue}o.skipDestination||(n+=gt.get(f)??"")}return I(n)}function vt(e){if(typeof e=="string"){let t=P(A,["-f","rtf",e,"-t","asciidoc"],{encoding:"utf-8"});if(t.status===0&&t.stdout)return t.stdout;let n=P(A,[e,"-t","asciidoc"],{encoding:"utf-8"});return n.status===0&&n.stdout?n.stdout:null}let r=P(A,["-f","rtf","-t","asciidoc"],{input:e,encoding:"utf-8"});return r.status===0&&r.stdout?r.stdout:null}async function _(e,r={}){if(r.usePandoc!==!1&&x()){let n=vt(e);if(n)return n}let t=typeof e=="string"?await mt.readFile(e,"latin1"):e.toString("latin1");return Tt(t)}import St from"exceljs";import ye from"turndown";import{gfm as ve}from"turndown-plugin-gfm";function bt(e){let r=e.value;if(r==null)return"";if(typeof r=="object"){let t=r;if("richText"in t&&Array.isArray(t.richText))return t.richText.map(n=>n.text||"").join("");if("text"in t&&typeof t.text=="string")return t.text;if("result"in t&&t.result!==void 0)return String(t.result??"");if("hyperlink"in t&&t.hyperlink)return String(t.text||t.hyperlink);if(r instanceof Date)return r.toISOString()}return String(r)}function L(e){let r=e.match(/^([A-Za-z]+)(\d+)$/);if(!r)return{row:1,col:1};let t=r[1].toUpperCase(),n=Number.parseInt(r[2],10),s=0;for(let o=0;o<t.length;o++)s=s*26+(t.charCodeAt(o)-64);return{row:n,col:s}}function $t(e){let r=new Map,t=new Set,n=e.model?.merges||[];for(let s of n){let o=s.split(":"),i=L(o[0]),c=o.length>1?L(o[1]):i,p=Math.min(i.row,c.row),l=Math.max(i.row,c.row),u=Math.min(i.col,c.col),m=Math.max(i.col,c.col),f=l-p+1,d=m-u+1;r.set(o[0].toUpperCase(),{rowspan:f,colspan:d,top:p,bottom:l,left:u,right:m});for(let w=p;w<=l;w++)for(let g=u;g<=m;g++)(w!==p||g!==u)&&t.add(`${w}:${g}`)}return{merges:r,coveredCells:t}}function N(e){let{merges:r,coveredCells:t}=$t(e),n=e.rowCount;if(n===0)return"";let s=0;if(e.eachRow({includeEmpty:!1},i=>{i.eachCell({includeEmpty:!0},(c,p)=>{p>s&&(s=p)})}),s===0)return"";let o=`[options="header"]
|===
`;for(let i=1;i<=n;i++){let c=e.getRow(i),p=[];for(let l=1;l<=s;l++){if(t.has(`${i}:${l}`))continue;let u=c.getCell(l),m=bt(u).replace(/\|/g,"\\|"),f=r.get(u.address),d="|";f&&(f.colspan>1&&f.rowspan>1?d=`${f.colspan}.${f.rowspan}+|`:f.colspan>1?d=`${f.colspan}+|`:f.rowspan>1&&(d=`.${f.rowspan}+|`)),p.push(`${d} ${m}`)}p.length>0&&(o+=`${p.join(" ")}
`,i===1&&(o+=`
`))}return o+=`|===
`,o}async function B(e){let r=new St.Workbook;await r.xlsx.load(e);let t=r.worksheets.filter(n=>n.rowCount>0);return t.length===0?"":t.length===1?N(t[0]):t.map(n=>`== ${n.name}

${N(n)}`).join(`

`)}import{XMLParser as Pt}from"fast-xml-parser";import*as F from"js-yaml";import{parse as At}from"smol-toml";var Ot=new Pt({ignoreAttributes:!1});function j(e,r=1){let t="",n="*".repeat(r);for(let[s,o]of Object.entries(e))typeof o=="object"&&o!==null?(t+=`${n} *${s}:*
`,t+=j(o,r+1)):t+=`${n} *${s}:* ${o}
`;return t}function y(e,r){let t=e;if(typeof e=="string")try{r==="json"?t=JSON.parse(e):r==="yaml"?t=F.load(e):r==="toml"?t=At(e):r==="xml"&&(t=Ot.parse(e))}catch{return`[source,${r}]
----
${e.trim()}
----
`}return typeof t!="object"||t===null?`[source,${r}]
----
${String(t).trim()}
----
`:j(t)}var z={APNG:".apng",BMP:".bmp",CSV:".csv",DOC:".doc",DOCX:".docx",GIF:".gif",HTM:".htm",HTML:".html",JPEG:".jpeg",JPG:".jpg",JSON:".json",MARKDOWN:".markdown",MD:".md",MDC:".mdc",MDX:".mdx",ODF:".odf",ODS:".ods",ODT:".odt",PBM:".pbm",PDF:".pdf",PNG:".png",RTF:".rtf",TIF:".tif",TIFF:".tiff",TOML:".toml",TSV:".tsv",WEBP:".webp",XLS:".xls",XLSX:".xlsx",XML:".xml",YAML:".yaml",YML:".yml"};Object.freeze(z);var G={LATEX:".latex",MEDIAWIKI:".mediawiki",ORG:".org",RST:".rst",TEX:".tex",TYP:".typ",WIKI:".wiki"};Object.freeze(G);var a={...z,...G};Object.freeze(a);var J={[a.HTML]:"html",[a.HTM]:"html",[a.LATEX]:"latex",[a.MARKDOWN]:"markdown",[a.MDC]:"markdown",[a.MDX]:"markdown",[a.MD]:"markdown",[a.MEDIAWIKI]:"mediawiki",[a.ODF]:"odt",[a.ODT]:"odt",[a.ORG]:"org",[a.RST]:"rst",[a.RTF]:"rtf",[a.TEX]:"latex",[a.WIKI]:"mediawiki"};async function Et(e,r){let t=await Ct.readFile(e),n=t.toString("utf-8");switch(r.toLowerCase()){case a.PDF:return R(t);case a.APNG:case a.BMP:case a.GIF:case a.JPEG:case a.JPG:case a.PBM:case a.PNG:case a.TIF:case a.TIFF:case a.WEBP:return M(t);case a.DOC:return k(t);case a.DOCX:return C(t);case a.CSV:return S(n,",");case a.TSV:return S(n,"	");case a.XLSX:case a.ODS:return B(t);case a.HTML:case a.HTM:return D(n);case a.JSON:return y(n,"json");case a.YAML:case a.YML:return y(n,"yaml");case a.TOML:return y(n,"toml");case a.XML:return y(n,"xml");case a.MD:case a.MARKDOWN:case a.MDX:case a.MDC:return h(n);case a.ODF:case a.ODT:return E(e);case a.RTF:return _(e);default:return n}}async function Rt(e,r){if(x()&&J[r]){let n=J[r],s=[e,"-t","asciidoc"];n&&s.unshift("-f",n);let o=W(H,s,{encoding:"utf-8"});if(o.status===0)return o.stdout;let i=W(H,[e,"-t","asciidoc"],{encoding:"utf-8"});if(i.status===0)return i.stdout}return Et(e,r)}async function O(e){let{input:r,type:t="adoc"}=e,n=T.resolve(process.cwd(),r);if(!kt(n))throw new Error(`File not found "${n}"`);let s=T.extname(n).toLowerCase(),o=await Rt(n,s);if(t==="md"||t==="markdown"){let i=await X(o,{attributes:{doctype:"book"},standalone:!1}),c=new Dt({headingStyle:"atx"});c.use(Mt),o=c.turndown(typeof i=="string"?i:String(i??""))}else if(t==="txt"||t==="text"){let i=await X(o,{attributes:{doctype:"book"},standalone:!1});o=(typeof i=="string"?i:String(i??"")).replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/\r?\n/g," ").replace(/<h[1-6][^>]*>/gi,`

`).replace(/<p[^>]*>/gi,`

`).replace(/<br[^>]*>/gi,`
`).replace(/<li[^>]*>/gi,`
* `).replace(/<tr[^>]*>/gi,`
`).replace(/<(?:td|th)[^>]*>/gi," | ").replace(/<div[^>]*>/gi,`
`).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[ \t]+/g," ").replace(/ \| \s+/g," | ").replace(/\* \s+/g,"* ").replace(/\n\s*\n\s*\n+/g,`

`).trim()}return o}async function _t(){let e=new URL("../package.json",import.meta.url),r=await v.readFile(e,"utf-8"),{version:t}=JSON.parse(r);return t??"0.0.0"}async function Lt(e){await new Promise((r,t)=>{process.stdout.write(e,n=>{if(n){t(n);return}r()})})}async function Nt(){let{values:e,positionals:r}=It({options:{input:{type:"string",short:"i"},output:{type:"string",short:"o"},type:{type:"string",short:"t",default:"adoc"},force:{type:"boolean",short:"f",default:!1},version:{type:"boolean",short:"v"},help:{type:"boolean",short:"h"}},allowPositionals:!0});e.version&&(console.log(`doc-to-adoc v${await _t()}`),process.exit(0)),e.help&&(console.log(`
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
    `.trim()),process.exit(0));let t=e.input||r[0],n=e.output||r[1];t||(console.error("Error: Missing input file. Run 'doc-to-adoc --help' for usage."),process.exit(1));let s=(e.type||"adoc").toLowerCase();["adoc","asciidoc","md","markdown","txt","text"].includes(s)||(console.error(`Error: Unsupported output type '${s}'. Valid types: adoc, md, txt.`),process.exit(1));try{let o=await O({input:t,type:s});if(n){if(!e.force)try{await v.access(n),console.error(`Error: Output file '${n}' already exists. Use -f or --force to overwrite.`),process.exit(1)}catch(i){if(i.code!=="ENOENT")throw i}await v.mkdir(U.dirname(U.resolve(n)),{recursive:!0}),await v.writeFile(n,o,"utf-8")}else await Lt(o)}catch(o){console.error("Conversion failed:",o instanceof Error?o.message:o),process.exit(2)}}Nt().then(()=>process.exit(0)).catch(e=>{console.error(e),process.exit(3)});
//# sourceMappingURL=cli.js.map
