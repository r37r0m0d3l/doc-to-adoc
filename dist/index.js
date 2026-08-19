import{spawnSync as N}from"node:child_process";import{existsSync as At}from"node:fs";import Pt from"node:fs/promises";import*as y from"node:path";import{convert as F}from"@asciidoctor/core";import W from"pandoc-binary";import Dt from"turndown";import{gfm as Ct}from"turndown-plugin-gfm";import{parse as z}from"csv-parse/sync";function S(e,r=","){let t=z(e,{skip_empty_lines:!0,delimiter:r});if(t.length===0)return"";let n=t[0],s=t.slice(1),o=`[options="header"]
|===
`;o+=`| ${n.map(i=>String(i).replace(/\|/g,"\\|")).join(" | ")}

`;for(let i of s)o+=`| ${i.map(c=>String(c).replace(/\|/g,"\\|")).join(" | ")}
`;return o+=`|===
`,o}import G from"word-extractor";var K="\x07";function q(e){return e.replace(/\r\n?/g,`
`).replaceAll(K," ").replace(/[ \t]+\n/g,`
`).split(`
`).map(r=>r.trim()).filter((r,t,n)=>r.length>0||n[t-1]?.length>0).join(`

`).trim()}async function Y(e){let t=await new G().extract(e),n=q(t.getBody());if(!n)throw new Error("Legacy DOC conversion produced no readable text");return n}async function P(e){return Y(e)}import U from"mammoth";import V from"turndown";import{gfm as Z}from"turndown-plugin-gfm";function h(e){let r=[],t=e;return t=t.replace(/```(\w*)\r?\n([\s\S]*?)```/g,(n,s,o)=>{let i=`\xA7CODEBLOCK${r.length}\xA7`;return r.push(`${s?`[source,${s}]
`:`[source]
`}----
${o.trim()}
----
`),i}),t=t.replace(/^[*+_-]{3,}$/gm,"'''"),t=t.replace(/(\*\*\*|___)(.*?)\1/g,"\xA7BI\xA7$2\xA7BI\xA7"),t=t.replace(/(\*\*|__)(.*?)\1/g,"\xA7B\xA7$2\xA7B\xA7"),t=t.replace(/(\*|_)(.*?)\1/g,"\xA7I\xA7$2\xA7I\xA7"),t=t.replace(/^(?:<a id=".*"><\/a>)?######\s+(.*)$/gm,"====== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#####\s+(.*)$/gm,"===== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?####\s+(.*)$/gm,"==== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?###\s+(.*)$/gm,"=== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?##\s+(.*)$/gm,"== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#\s+(.*)$/gm,"= $1"),t=t.replace(/(?:^[ \t]*>.*(?:\r?\n|$))+/gm,n=>{let o=n.split(/\r?\n/).map(c=>c.replace(/^[ \t]*>\s?/,""));for(;o.length>0&&o[0].trim()==="";)o.shift();for(;o.length>0&&o[o.length-1].trim()==="";)o.pop();let i=o.join(`
`);return i?`[quote]
____
${i}
____

`:""}),t=t.replace(/^[ \t]*[-*+]\s+(.*)$/gm,"* $1"),t=t.replace(/^[ \t]*\d+\.\s+(.*)$/gm,". $1"),t=t.replace(/^(\|.*\|)\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+\r?\n((\|.*\|\r?\n?)*)/gm,(n,s,o)=>{let i=m=>m.split("|").filter((u,f,d)=>f>0&&f<d.length-1).map(u=>u.trim()),c=i(s),p=o.trim().split(`
`).map(i),l=`[options="header"]
|===
`;l+=`| ${c.join(" | ")}
`;for(let m of p)l+=`| ${m.join(" | ")}
`;return l+=`|===
`,l}),t=t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(n,s,o)=>`image:${o}[${s}]`),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(n,s,o)=>`${o}[${s}]`),t=t.replace(/§BI§/g,"***"),t=t.replace(/§B§/g,"*"),t=t.replace(/§I§/g,"_"),r.forEach((n,s)=>{t=t.replace(`\xA7CODEBLOCK${s}\xA7`,n)}),t.trim()}async function Q(e){let{value:r}=await U.convertToHtml({buffer:e});return r}async function tt(e){let r=await Q(e),t=new V({headingStyle:"atx"});return t.use(Z),t.turndown(r)}async function D(e){let r=await tt(e);return h(r)}import et from"turndown";import{gfm as rt}from"turndown-plugin-gfm";function C(e){let r=e.replace(/<head[^>]*>[\s\S]*?<\/head>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,""),t=new et({headingStyle:"atx"});t.use(rt);let n=t.turndown(r);return h(n)}import{createWorker as nt}from"tesseract.js";async function ot(e,r="eng"){let t=await nt(r);try{return(await t.recognize(e)).data.text}finally{await t.terminate()}}async function O(e,r="eng"){return(await ot(e,r)).trim()}import{spawnSync as b}from"node:child_process";import at from"node:fs/promises";import $ from"pandoc-binary";import{spawnSync as st}from"node:child_process";import it from"pandoc-binary";function x(){try{let e=st(it,["--version"],{stdio:"ignore"});return e.status===0&&!e.error}catch{return!1}}async function k(e){if(typeof e=="string"){if(x()){let t=b($,["-f","odt",e,"-t","asciidoc"],{encoding:"utf-8"});if(t.status===0&&t.stdout)return t.stdout;let n=b($,[e,"-t","asciidoc"],{encoding:"utf-8"});if(n.status===0&&n.stdout)return n.stdout}return(await at.readFile(e)).toString("utf-8")}if(x()){let r=b($,["-f","odt","-t","asciidoc"],{input:e,encoding:"utf-8"});if(r.status===0&&r.stdout)return r.stdout}return e.toString("utf-8")}import{PDFParse as ct}from"pdf-parse";import{createWorker as lt}from"tesseract.js";async function M(e,r={enableOcr:!0,lang:"eng"}){let t=null;try{t=new ct({data:e});let s=(await t.getInfo()).info?.Title?.trim(),o=await t.getText();if((o.text?.trim()??"").length>0||r.enableOcr===!1){let l=o.text??"";return s?`= ${s}

${l}`:l}let c=await t.getScreenshot();if(!c?.pages||c.pages.length===0){let l=o.text??"";return s?`= ${s}

${l}`:l}let p=null;try{p=await lt(r.lang||"eng");let l=[],m=r.maxOcrPages&&r.maxOcrPages>0?r.maxOcrPages:c.pages.length,u=c.pages.slice(0,m);for(let d of u)if(d.data){let w=Buffer.from(d.data);d.data=null;let g=await p.recognize(w);g.data.text?.trim()&&l.push(g.data.text.trim())}let f=l.join(`

`);return s?`= ${s}

${f}`:f}finally{p&&await p.terminate()}}finally{if(t&&typeof t.destroy=="function")try{await t.destroy()}catch{}}}import{spawnSync as v}from"node:child_process";import ft from"node:fs/promises";import A from"pandoc-binary";var pt=new Set(["annotation","background","colortbl","comment","datastore","defchp","defpap","do","doccomm","fonttbl","footer","footerf","footerl","footerr","ftncn","ftnsep","ftnsepc","header","headerf","headerl","headerr","info","keycode","keywords","latentstyles","listlevel","listname","listoverride","listoverridetable","listpicture","listtable","mailmerge","mmathpr","object","objclass","objdata","pict","private","propname","revtbl","rsidtbl","stylesheet","subject","themedata","title","txe","xe","xmlattrname","xmlattrvalue","xmlclose","xmlname","xmlopen"]),mt=new Map([["bullet","* "],["cell"," | "],["emdash","\u2014"],["emspace"," "],["endash","\u2013"],["enspace"," "],["ldblquote",'"'],["line",`
`],["lquote","'"],["page",`

`],["par",`

`],["qmspace"," "],["rdblquote",'"'],["row",`
`],["rquote","'"],["sect",`

`],["tab","	"]]),ut=new Map([["-",""],["_","-"],["~"," "]]),dt=new Map([[128,"\u20AC"],[130,"\u201A"],[131,"\u0192"],[132,"\u201E"],[133,"\u2026"],[134,"\u2020"],[135,"\u2021"],[136,"\u02C6"],[137,"\u2030"],[138,"\u0160"],[139,"\u2039"],[140,"\u0152"],[142,"\u017D"],[145,"\u2018"],[146,"\u2019"],[147,"\u201C"],[148,"\u201D"],[149,"\u2022"],[150,"\u2013"],[151,"\u2014"],[152,"\u02DC"],[153,"\u2122"],[154,"\u0161"],[155,"\u203A"],[156,"\u0153"],[158,"\u017E"],[159,"\u0178"]]);function gt(e){return dt.get(e)??String.fromCodePoint(e)}function E(e){return e.replaceAll("\0","").replace(/\r\n?/g,`
`).split(`
`).map(r=>r.replace(/[ \t]+/g," ").trim()).join(`
`).replace(/\n{3,}/g,`

`).replace(/ +\| +/g," | ").trim()}function xt(e,r,t){let n=r,s=t;for(;n<e.length&&s>0;){let o=e[n];if(o==="\r"||o===`
`||o==="{"||o==="}"){n+=1;continue}if(o==="\\"){let i=e[n+1];if(i==="'"&&/^[\dA-Fa-f]{2}$/.test(e.slice(n+2,n+4))){n+=4,s-=1;continue}if(i==="\\"||i==="{"||i==="}"){n+=2,s-=1;continue}}n+=1,s-=1}return n}function wt(e){if(!e.includes("\\rtf"))return E(e);let r=[{skipDestination:!1,unicodeSkip:1}],t=0,n="",s=!1;for(;t<e.length;){let o=r[r.length-1],i=e[t];if(i==="{"){r.push({...o}),t+=1;continue}if(i==="}"){r.length>1&&r.pop(),t+=1;continue}if(i==="\r"||i===`
`){t+=1;continue}if(i!=="\\"){o.skipDestination||(n+=i),t+=1;continue}t+=1;let c=e[t];if(!c)break;if(c==="*"){s=!0,t+=1;continue}if(c==="\\"||c==="{"||c==="}"){o.skipDestination||(n+=c),t+=1,s=!1;continue}if(c==="'"){let d=e.slice(t+1,t+3);!o.skipDestination&&/^[\dA-Fa-f]{2}$/.test(d)&&(n+=gt(Number.parseInt(d,16))),t+=3,s=!1;continue}if(!/[A-Za-z]/.test(c)){o.skipDestination||(n+=ut.get(c)??""),t+=1,s=!1;continue}let p="";for(;t<e.length&&/[A-Za-z]/.test(e[t]);)p+=e[t],t+=1;let l=1;e[t]==="-"&&(l=-1,t+=1);let m="";for(;t<e.length&&/\d/.test(e[t]);)m+=e[t],t+=1;let u=m.length>0?l*Number.parseInt(m,10):void 0;e[t]===" "&&(t+=1);let f=p.toLowerCase();if(s||pt.has(f)){r[r.length-1].skipDestination=!0,s=!1;continue}if(s=!1,f==="uc"&&u!==void 0){r[r.length-1].unicodeSkip=u;continue}if(f==="u"&&u!==void 0){if(!o.skipDestination){let d=u<0?u+65536:u;n+=String.fromCodePoint(d)}t=xt(e,t,r[r.length-1].unicodeSkip);continue}o.skipDestination||(n+=mt.get(f)??"")}return E(n)}function ht(e){if(typeof e=="string"){let t=v(A,["-f","rtf",e,"-t","asciidoc"],{encoding:"utf-8"});if(t.status===0&&t.stdout)return t.stdout;let n=v(A,[e,"-t","asciidoc"],{encoding:"utf-8"});return n.status===0&&n.stdout?n.stdout:null}let r=v(A,["-f","rtf","-t","asciidoc"],{input:e,encoding:"utf-8"});return r.status===0&&r.stdout?r.stdout:null}async function I(e,r={}){if(r.usePandoc!==!1&&x()){let n=ht(e);if(n)return n}let t=typeof e=="string"?await ft.readFile(e,"latin1"):e.toString("latin1");return wt(t)}import Tt from"exceljs";import ue from"turndown";import{gfm as ge}from"turndown-plugin-gfm";function yt(e){let r=e.value;if(r==null)return"";if(typeof r=="object"){let t=r;if("richText"in t&&Array.isArray(t.richText))return t.richText.map(n=>n.text||"").join("");if("text"in t&&typeof t.text=="string")return t.text;if("result"in t&&t.result!==void 0)return String(t.result??"");if("hyperlink"in t&&t.hyperlink)return String(t.text||t.hyperlink);if(r instanceof Date)return r.toISOString()}return String(r)}function R(e){let r=e.match(/^([A-Za-z]+)(\d+)$/);if(!r)return{row:1,col:1};let t=r[1].toUpperCase(),n=Number.parseInt(r[2],10),s=0;for(let o=0;o<t.length;o++)s=s*26+(t.charCodeAt(o)-64);return{row:n,col:s}}function St(e){let r=new Map,t=new Set,n=e.model?.merges||[];for(let s of n){let o=s.split(":"),i=R(o[0]),c=o.length>1?R(o[1]):i,p=Math.min(i.row,c.row),l=Math.max(i.row,c.row),m=Math.min(i.col,c.col),u=Math.max(i.col,c.col),f=l-p+1,d=u-m+1;r.set(o[0].toUpperCase(),{rowspan:f,colspan:d,top:p,bottom:l,left:m,right:u});for(let w=p;w<=l;w++)for(let g=m;g<=u;g++)(w!==p||g!==m)&&t.add(`${w}:${g}`)}return{merges:r,coveredCells:t}}function _(e){let{merges:r,coveredCells:t}=St(e),n=e.rowCount;if(n===0)return"";let s=0;if(e.eachRow({includeEmpty:!1},i=>{i.eachCell({includeEmpty:!0},(c,p)=>{p>s&&(s=p)})}),s===0)return"";let o=`[options="header"]
|===
`;for(let i=1;i<=n;i++){let c=e.getRow(i),p=[];for(let l=1;l<=s;l++){if(t.has(`${i}:${l}`))continue;let m=c.getCell(l),u=yt(m).replace(/\|/g,"\\|"),f=r.get(m.address),d="|";f&&(f.colspan>1&&f.rowspan>1?d=`${f.colspan}.${f.rowspan}+|`:f.colspan>1?d=`${f.colspan}+|`:f.rowspan>1&&(d=`.${f.rowspan}+|`)),p.push(`${d} ${u}`)}p.length>0&&(o+=`${p.join(" ")}
`,i===1&&(o+=`
`))}return o+=`|===
`,o}async function B(e){let r=new Tt.Workbook;await r.xlsx.load(e);let t=r.worksheets.filter(n=>n.rowCount>0);return t.length===0?"":t.length===1?_(t[0]):t.map(n=>`== ${n.name}

${_(n)}`).join(`

`)}import{XMLParser as bt}from"fast-xml-parser";import*as L from"js-yaml";import{parse as $t}from"smol-toml";var vt=new bt({ignoreAttributes:!1});function j(e,r=1){let t="",n="*".repeat(r);for(let[s,o]of Object.entries(e))typeof o=="object"&&o!==null?(t+=`${n} *${s}:*
`,t+=j(o,r+1)):t+=`${n} *${s}:* ${o}
`;return t}function T(e,r){let t=e;if(typeof e=="string")try{r==="json"?t=JSON.parse(e):r==="yaml"?t=L.load(e):r==="toml"?t=$t(e):r==="xml"&&(t=vt.parse(e))}catch{return`[source,${r}]
----
${e.trim()}
----
`}return typeof t!="object"||t===null?`[source,${r}]
----
${String(t).trim()}
----
`:j(t)}var H={APNG:".apng",BMP:".bmp",CSV:".csv",DOC:".doc",DOCX:".docx",GIF:".gif",HTM:".htm",HTML:".html",JPEG:".jpeg",JPG:".jpg",JSON:".json",MARKDOWN:".markdown",MD:".md",MDC:".mdc",MDX:".mdx",ODF:".odf",ODS:".ods",ODT:".odt",PBM:".pbm",PDF:".pdf",PNG:".png",RTF:".rtf",TIF:".tif",TIFF:".tiff",TOML:".toml",TSV:".tsv",WEBP:".webp",XLS:".xls",XLSX:".xlsx",XML:".xml",YAML:".yaml",YML:".yml"};Object.freeze(H);var J={LATEX:".latex",MEDIAWIKI:".mediawiki",ORG:".org",RST:".rst",TEX:".tex",TYP:".typ",WIKI:".wiki"};Object.freeze(J);var a={...H,...J};Object.freeze(a);var X={[a.HTML]:"html",[a.HTM]:"html",[a.LATEX]:"latex",[a.MARKDOWN]:"markdown",[a.MDC]:"markdown",[a.MDX]:"markdown",[a.MD]:"markdown",[a.MEDIAWIKI]:"mediawiki",[a.ODF]:"odt",[a.ODT]:"odt",[a.ORG]:"org",[a.RST]:"rst",[a.RTF]:"rtf",[a.TEX]:"latex",[a.WIKI]:"mediawiki"};async function Ot(e,r){let t=await Pt.readFile(e),n=t.toString("utf-8");switch(r.toLowerCase()){case a.PDF:return M(t);case a.APNG:case a.BMP:case a.GIF:case a.JPEG:case a.JPG:case a.PBM:case a.PNG:case a.TIF:case a.TIFF:case a.WEBP:return O(t);case a.DOC:return P(t);case a.DOCX:return D(t);case a.CSV:return S(n,",");case a.TSV:return S(n,"	");case a.XLSX:case a.ODS:return B(t);case a.HTML:case a.HTM:return C(n);case a.JSON:return T(n,"json");case a.YAML:case a.YML:return T(n,"yaml");case a.TOML:return T(n,"toml");case a.XML:return T(n,"xml");case a.MD:case a.MARKDOWN:case a.MDX:case a.MDC:return h(n);case a.ODF:case a.ODT:return k(e);case a.RTF:return I(e);default:return n}}async function kt(e,r){if(x()&&X[r]){let n=X[r],s=[e,"-t","asciidoc"];n&&s.unshift("-f",n);let o=N(W,s,{encoding:"utf-8"});if(o.status===0)return o.stdout;let i=N(W,[e,"-t","asciidoc"],{encoding:"utf-8"});if(i.status===0)return i.stdout}return Ot(e,r)}async function Mt(e){let{input:r,type:t="adoc"}=e,n=y.resolve(process.cwd(),r);if(!At(n))throw new Error(`File not found "${n}"`);let s=y.extname(n).toLowerCase(),o=await kt(n,s);if(t==="md"||t==="markdown"){let i=await F(o,{attributes:{doctype:"book"},standalone:!1}),c=new Dt({headingStyle:"atx"});c.use(Ct),o=c.turndown(typeof i=="string"?i:String(i??""))}else if(t==="txt"||t==="text"){let i=await F(o,{attributes:{doctype:"book"},standalone:!1});o=(typeof i=="string"?i:String(i??"")).replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/\r?\n/g," ").replace(/<h[1-6][^>]*>/gi,`

`).replace(/<p[^>]*>/gi,`

`).replace(/<br[^>]*>/gi,`
`).replace(/<li[^>]*>/gi,`
* `).replace(/<tr[^>]*>/gi,`
`).replace(/<(?:td|th)[^>]*>/gi," | ").replace(/<div[^>]*>/gi,`
`).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[ \t]+/g," ").replace(/ \| \s+/g," | ").replace(/\* \s+/g,"* ").replace(/\n\s*\n\s*\n+/g,`

`).trim()}return o}export{Mt as convert};
//# sourceMappingURL=index.js.map
