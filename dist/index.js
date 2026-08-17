import{spawnSync as J}from"node:child_process";import{existsSync as Mt}from"node:fs";import Et from"node:fs/promises";import*as S from"node:path";import{convert as z}from"@asciidoctor/core";import G from"pandoc-binary";import It from"turndown";import{gfm as Rt}from"turndown-plugin-gfm";import{parse as U}from"csv-parse/sync";function $(e,r=","){let t=U(e,{skip_empty_lines:!0,delimiter:r});if(t.length===0)return"";let n=t[0],s=t.slice(1),o=`[options="header"]
|===
`;o+=`| ${n.map(i=>String(i).replace(/\|/g,"\\|")).join(" | ")}

`;for(let i of s)o+=`| ${i.map(c=>String(c).replace(/\|/g,"\\|")).join(" | ")}
`;return o+=`|===
`,o}import V from"word-extractor";var Z="\x07";function Q(e){return e.replace(/\r\n?/g,`
`).replaceAll(Z," ").replace(/[ \t]+\n/g,`
`).split(`
`).map(r=>r.trim()).filter((r,t,n)=>r.length>0||n[t-1]?.length>0).join(`

`).trim()}async function tt(e){let t=await new V().extract(e),n=Q(t.getBody());if(!n)throw new Error("Legacy DOC conversion produced no readable text");return n}async function C(e){return tt(e)}import et from"mammoth";import rt from"turndown";import{gfm as nt}from"turndown-plugin-gfm";function w(e){let r=[],t=e;return t=t.replace(/```(\w*)\r?\n([\s\S]*?)```/g,(n,s,o)=>{let i=`\xA7CODEBLOCK${r.length}\xA7`;return r.push(`${s?`[source,${s}]
`:`[source]
`}----
${o.trim()}
----
`),i}),t=t.replace(/^[*+_-]{3,}$/gm,"'''"),t=t.replace(/(\*\*\*|___)(.*?)\1/g,"\xA7BI\xA7$2\xA7BI\xA7"),t=t.replace(/(\*\*|__)(.*?)\1/g,"\xA7B\xA7$2\xA7B\xA7"),t=t.replace(/(\*|_)(.*?)\1/g,"\xA7I\xA7$2\xA7I\xA7"),t=t.replace(/^(?:<a id=".*"><\/a>)?######\s+(.*)$/gm,"====== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#####\s+(.*)$/gm,"===== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?####\s+(.*)$/gm,"==== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?###\s+(.*)$/gm,"=== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?##\s+(.*)$/gm,"== $1"),t=t.replace(/^(?:<a id=".*"><\/a>)?#\s+(.*)$/gm,"= $1"),t=t.replace(/(?:^[ \t]*>.*(?:\r?\n|$))+/gm,n=>{let o=n.split(/\r?\n/).map(c=>c.replace(/^[ \t]*>\s?/,""));for(;o.length>0&&o[0].trim()==="";)o.shift();for(;o.length>0&&o[o.length-1].trim()==="";)o.pop();let i=o.join(`
`);return i?`[quote]
____
${i}
____

`:""}),t=t.replace(/^[ \t]*[-*+]\s+(.*)$/gm,"* $1"),t=t.replace(/^[ \t]*\d+\.\s+(.*)$/gm,". $1"),t=t.replace(/^(\|.*\|)\r?\n\|(?:[ \t]*:?-+:?[ \t]*\|)+\r?\n((\|.*\|\r?\n?)*)/gm,(n,s,o)=>{let i=d=>d.split("|").filter((m,f,u)=>f>0&&f<u.length-1).map(m=>m.trim()),c=i(s),p=o.trim().split(`
`).map(i),l=`[options="header"]
|===
`;l+=`| ${c.join(" | ")}
`;for(let d of p)l+=`| ${d.join(" | ")}
`;return l+=`|===
`,l}),t=t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(n,s,o)=>`image:${o}[${s}]`),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(n,s,o)=>`${o}[${s}]`),t=t.replace(/§BI§/g,"***"),t=t.replace(/§B§/g,"*"),t=t.replace(/§I§/g,"_"),r.forEach((n,s)=>{t=t.replace(`\xA7CODEBLOCK${s}\xA7`,n)}),t.trim()}var Wt=w;async function ot(e){let{value:r}=await et.convertToHtml({buffer:e});return r}async function st(e){let r=await ot(e),t=new rt({headingStyle:"atx"});return t.use(nt),t.turndown(r)}async function O(e){let r=await st(e);return w(r)}import it from"turndown";import{gfm as at}from"turndown-plugin-gfm";function k(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function M(e){let r=e.replace(/<head[^>]*>[\s\S]*?<\/head>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,""),t=new it({headingStyle:"atx"});t.use(at);let n=t.turndown(r);return w(n)}import{createWorker as ct}from"tesseract.js";async function lt(e,r="eng"){let t=await ct(r);try{return(await t.recognize(e)).data.text}finally{await t.terminate()}}async function E(e,r="eng"){return(await lt(e,r)).trim()}import{spawnSync as A}from"node:child_process";import mt from"node:fs/promises";import v from"pandoc-binary";import{spawnSync as ft}from"node:child_process";import pt from"pandoc-binary";function h(){try{let e=ft(pt,["--version"],{stdio:"ignore"});return e.status===0&&!e.error}catch{return!1}}async function I(e){if(typeof e=="string"){if(h()){let t=A(v,["-f","odt",e,"-t","asciidoc"],{encoding:"utf-8"});if(t.status===0&&t.stdout)return t.stdout;let n=A(v,[e,"-t","asciidoc"],{encoding:"utf-8"});if(n.status===0&&n.stdout)return n.stdout}return(await mt.readFile(e)).toString("utf-8")}if(h()){let r=A(v,["-f","odt","-t","asciidoc"],{input:e,encoding:"utf-8"});if(r.status===0&&r.stdout)return r.stdout}return e.toString("utf-8")}import{PDFParse as ut}from"pdf-parse";import{createWorker as dt}from"tesseract.js";async function R(e,r={enableOcr:!0,lang:"eng"}){let t=null;try{t=new ut({data:e});let s=(await t.getInfo()).info?.Title?.trim(),o=await t.getText();if((o.text?.trim()??"").length>0||r.enableOcr===!1){let l=o.text??"";return s?`= ${s}

${l}`:l}let c=await t.getScreenshot();if(!c?.pages||c.pages.length===0){let l=o.text??"";return s?`= ${s}

${l}`:l}let p=null;try{p=await dt(r.lang||"eng");let l=[],d=r.maxOcrPages&&r.maxOcrPages>0?r.maxOcrPages:c.pages.length,m=c.pages.slice(0,d);for(let u of m)if(u.data){let g=Buffer.from(u.data);u.data=null;let x=await p.recognize(g);x.data.text?.trim()&&l.push(x.data.text.trim())}let f=l.join(`

`);return s?`= ${s}

${f}`:f}finally{p&&await p.terminate()}}finally{if(t&&typeof t.destroy=="function")try{await t.destroy()}catch{}}}import{spawnSync as P}from"node:child_process";import gt from"node:fs/promises";import D from"pandoc-binary";var xt=new Set(["annotation","background","colortbl","comment","datastore","defchp","defpap","do","doccomm","fonttbl","footer","footerf","footerl","footerr","ftncn","ftnsep","ftnsepc","header","headerf","headerl","headerr","info","keycode","keywords","latentstyles","listlevel","listname","listoverride","listoverridetable","listpicture","listtable","mailmerge","mmathpr","object","objclass","objdata","pict","private","propname","revtbl","rsidtbl","stylesheet","subject","themedata","title","txe","xe","xmlattrname","xmlattrvalue","xmlclose","xmlname","xmlopen"]),wt=new Map([["bullet","* "],["cell"," | "],["emdash","\u2014"],["emspace"," "],["endash","\u2013"],["enspace"," "],["ldblquote",'"'],["line",`
`],["lquote","'"],["page",`

`],["par",`

`],["qmspace"," "],["rdblquote",'"'],["row",`
`],["rquote","'"],["sect",`

`],["tab","	"]]),ht=new Map([["-",""],["_","-"],["~"," "]]),Tt=new Map([[128,"\u20AC"],[130,"\u201A"],[131,"\u0192"],[132,"\u201E"],[133,"\u2026"],[134,"\u2020"],[135,"\u2021"],[136,"\u02C6"],[137,"\u2030"],[138,"\u0160"],[139,"\u2039"],[140,"\u0152"],[142,"\u017D"],[145,"\u2018"],[146,"\u2019"],[147,"\u201C"],[148,"\u201D"],[149,"\u2022"],[150,"\u2013"],[151,"\u2014"],[152,"\u02DC"],[153,"\u2122"],[154,"\u0161"],[155,"\u203A"],[156,"\u0153"],[158,"\u017E"],[159,"\u0178"]]);function yt(e){return Tt.get(e)??String.fromCodePoint(e)}function _(e){return e.replaceAll("\0","").replace(/\r\n?/g,`
`).split(`
`).map(r=>r.replace(/[ \t]+/g," ").trim()).join(`
`).replace(/\n{3,}/g,`

`).replace(/ +\| +/g," | ").trim()}function St(e,r,t){let n=r,s=t;for(;n<e.length&&s>0;){let o=e[n];if(o==="\r"||o===`
`||o==="{"||o==="}"){n+=1;continue}if(o==="\\"){let i=e[n+1];if(i==="'"&&/^[\dA-Fa-f]{2}$/.test(e.slice(n+2,n+4))){n+=4,s-=1;continue}if(i==="\\"||i==="{"||i==="}"){n+=2,s-=1;continue}}n+=1,s-=1}return n}function bt(e){if(!e.includes("\\rtf"))return _(e);let r=[{skipDestination:!1,unicodeSkip:1}],t=0,n="",s=!1;for(;t<e.length;){let o=r[r.length-1],i=e[t];if(i==="{"){r.push({...o}),t+=1;continue}if(i==="}"){r.length>1&&r.pop(),t+=1;continue}if(i==="\r"||i===`
`){t+=1;continue}if(i!=="\\"){o.skipDestination||(n+=i),t+=1;continue}t+=1;let c=e[t];if(!c)break;if(c==="*"){s=!0,t+=1;continue}if(c==="\\"||c==="{"||c==="}"){o.skipDestination||(n+=c),t+=1,s=!1;continue}if(c==="'"){let u=e.slice(t+1,t+3);!o.skipDestination&&/^[\dA-Fa-f]{2}$/.test(u)&&(n+=yt(Number.parseInt(u,16))),t+=3,s=!1;continue}if(!/[A-Za-z]/.test(c)){o.skipDestination||(n+=ht.get(c)??""),t+=1,s=!1;continue}let p="";for(;t<e.length&&/[A-Za-z]/.test(e[t]);)p+=e[t],t+=1;let l=1;e[t]==="-"&&(l=-1,t+=1);let d="";for(;t<e.length&&/\d/.test(e[t]);)d+=e[t],t+=1;let m=d.length>0?l*Number.parseInt(d,10):void 0;e[t]===" "&&(t+=1);let f=p.toLowerCase();if(s||xt.has(f)){r[r.length-1].skipDestination=!0,s=!1;continue}if(s=!1,f==="uc"&&m!==void 0){r[r.length-1].unicodeSkip=m;continue}if(f==="u"&&m!==void 0){if(!o.skipDestination){let u=m<0?m+65536:m;n+=String.fromCodePoint(u)}t=St(e,t,r[r.length-1].unicodeSkip);continue}o.skipDestination||(n+=wt.get(f)??"")}return _(n)}function $t(e){if(typeof e=="string"){let t=P(D,["-f","rtf",e,"-t","asciidoc"],{encoding:"utf-8"});if(t.status===0&&t.stdout)return t.stdout;let n=P(D,[e,"-t","asciidoc"],{encoding:"utf-8"});return n.status===0&&n.stdout?n.stdout:null}let r=P(D,["-f","rtf","-t","asciidoc"],{input:e,encoding:"utf-8"});return r.status===0&&r.stdout?r.stdout:null}async function B(e,r={}){if(r.usePandoc!==!1&&h()){let n=$t(e);if(n)return n}let t=typeof e=="string"?await gt.readFile(e,"latin1"):e.toString("latin1");return bt(t)}import At from"exceljs";import vt from"turndown";import{gfm as Pt}from"turndown-plugin-gfm";function j(e){let r=e.value;if(r==null)return"";if(typeof r=="object"){let t=r;if("richText"in t&&Array.isArray(t.richText))return t.richText.map(n=>n.text||"").join("");if("text"in t&&typeof t.text=="string")return t.text;if("result"in t&&t.result!==void 0)return String(t.result??"");if("hyperlink"in t&&t.hyperlink)return String(t.text||t.hyperlink);if(r instanceof Date)return r.toISOString()}return String(r)}function L(e){let r=e.match(/^([A-Za-z]+)(\d+)$/);if(!r)return{row:1,col:1};let t=r[1].toUpperCase(),n=Number.parseInt(r[2],10),s=0;for(let o=0;o<t.length;o++)s=s*26+(t.charCodeAt(o)-64);return{row:n,col:s}}function F(e){let r=new Map,t=new Set,n=e.model?.merges||[];for(let s of n){let o=s.split(":"),i=L(o[0]),c=o.length>1?L(o[1]):i,p=Math.min(i.row,c.row),l=Math.max(i.row,c.row),d=Math.min(i.col,c.col),m=Math.max(i.col,c.col),f=l-p+1,u=m-d+1;r.set(o[0].toUpperCase(),{rowspan:f,colspan:u,top:p,bottom:l,left:d,right:m});for(let g=p;g<=l;g++)for(let x=d;x<=m;x++)(g!==p||x!==d)&&t.add(`${g}:${x}`)}return{merges:r,coveredCells:t}}function Dt(e){let{merges:r,coveredCells:t}=F(e),n=e.rowCount;if(n===0)return"";let s=0;if(e.eachRow({includeEmpty:!1},c=>{c.eachCell({includeEmpty:!0},(p,l)=>{l>s&&(s=l)})}),s===0)return"";let o=`<table>
`,i=!1;for(let c=1;c<=n;c++){let p=e.getRow(c),l=c===1,d=l?"th":"td",m=`    <tr>
`,f=!1;for(let u=1;u<=s;u++){if(t.has(`${c}:${u}`))continue;f=!0;let g=p.getCell(u),x=k(j(g)),T=r.get(g.address),b="";T&&(T.colspan>1&&(b+=` colspan="${T.colspan}"`),T.rowspan>1&&(b+=` rowspan="${T.rowspan}"`)),m+=`      <${d}${b}>${x}</${d}>
`}m+=`    </tr>
`,f&&(l?(o+=`  <thead>
${m}  </thead>
  <tbody>
`,i=!0):o+=m)}return i&&(o+=`  </tbody>
`),o+="</table>",o}function ye(e){let r=Dt(e);if(!r)return"";let t=new vt({headingStyle:"atx"});return t.use(Pt),t.turndown(r)}function N(e){let{merges:r,coveredCells:t}=F(e),n=e.rowCount;if(n===0)return"";let s=0;if(e.eachRow({includeEmpty:!1},i=>{i.eachCell({includeEmpty:!0},(c,p)=>{p>s&&(s=p)})}),s===0)return"";let o=`[options="header"]
|===
`;for(let i=1;i<=n;i++){let c=e.getRow(i),p=[];for(let l=1;l<=s;l++){if(t.has(`${i}:${l}`))continue;let d=c.getCell(l),m=j(d).replace(/\|/g,"\\|"),f=r.get(d.address),u="|";f&&(f.colspan>1&&f.rowspan>1?u=`${f.colspan}.${f.rowspan}+|`:f.colspan>1?u=`${f.colspan}+|`:f.rowspan>1&&(u=`.${f.rowspan}+|`)),p.push(`${u} ${m}`)}p.length>0&&(o+=`${p.join(" ")}
`,i===1&&(o+=`
`))}return o+=`|===
`,o}async function W(e){let r=new At.Workbook;await r.xlsx.load(e);let t=r.worksheets.filter(n=>n.rowCount>0);return t.length===0?"":t.length===1?N(t[0]):t.map(n=>`== ${n.name}

${N(n)}`).join(`

`)}import{XMLParser as Ct}from"fast-xml-parser";import*as X from"js-yaml";import{parse as Ot}from"smol-toml";var kt=new Ct({ignoreAttributes:!1});function H(e,r=1){let t="",n="*".repeat(r);for(let[s,o]of Object.entries(e))typeof o=="object"&&o!==null?(t+=`${n} *${s}:*
`,t+=H(o,r+1)):t+=`${n} *${s}:* ${o}
`;return t}function y(e,r){let t=e;if(typeof e=="string")try{r==="json"?t=JSON.parse(e):r==="yaml"?t=X.load(e):r==="toml"?t=Ot(e):r==="xml"&&(t=kt.parse(e))}catch{return`[source,${r}]
----
${e.trim()}
----
`}return typeof t!="object"||t===null?`[source,${r}]
----
${String(t).trim()}
----
`:H(t)}var q={APNG:".apng",BMP:".bmp",CSV:".csv",DOC:".doc",DOCX:".docx",GIF:".gif",HTM:".htm",HTML:".html",JPEG:".jpeg",JPG:".jpg",JSON:".json",MARKDOWN:".markdown",MD:".md",MDC:".mdc",MDX:".mdx",ODF:".odf",ODS:".ods",ODT:".odt",PBM:".pbm",PDF:".pdf",PNG:".png",RTF:".rtf",TIF:".tif",TIFF:".tiff",TOML:".toml",TSV:".tsv",WEBP:".webp",XLS:".xls",XLSX:".xlsx",XML:".xml",YAML:".yaml",YML:".yml"};Object.freeze(q);var Y={LATEX:".latex",MEDIAWIKI:".mediawiki",ORG:".org",RST:".rst",TEX:".tex",TYP:".typ",WIKI:".wiki"};Object.freeze(Y);var a={...q,...Y};Object.freeze(a);var K={[a.HTML]:"html",[a.HTM]:"html",[a.LATEX]:"latex",[a.MARKDOWN]:"markdown",[a.MDC]:"markdown",[a.MDX]:"markdown",[a.MD]:"markdown",[a.MEDIAWIKI]:"mediawiki",[a.ODF]:"odt",[a.ODT]:"odt",[a.ORG]:"org",[a.RST]:"rst",[a.RTF]:"rtf",[a.TEX]:"latex",[a.WIKI]:"mediawiki"};async function _t(e,r){let t=await Et.readFile(e),n=t.toString("utf-8");switch(r.toLowerCase()){case a.PDF:return R(t);case a.APNG:case a.BMP:case a.GIF:case a.JPEG:case a.JPG:case a.PBM:case a.PNG:case a.TIF:case a.TIFF:case a.WEBP:return E(t);case a.DOC:return C(t);case a.DOCX:return O(t);case a.CSV:return $(n,",");case a.TSV:return $(n,"	");case a.XLSX:case a.ODS:return W(t);case a.HTML:case a.HTM:return M(n);case a.JSON:return y(n,"json");case a.YAML:case a.YML:return y(n,"yaml");case a.TOML:return y(n,"toml");case a.XML:return y(n,"xml");case a.MD:case a.MARKDOWN:case a.MDX:case a.MDC:return w(n);case a.ODF:case a.ODT:return I(e);case a.RTF:return B(e);default:return n}}async function Bt(e,r){if(h()&&K[r]){let n=K[r],s=[e,"-t","asciidoc"];n&&s.unshift("-f",n);let o=J(G,s,{encoding:"utf-8"});if(o.status===0)return o.stdout;let i=J(G,[e,"-t","asciidoc"],{encoding:"utf-8"});if(i.status===0)return i.stdout}return _t(e,r)}async function Je(e){let{input:r,type:t="adoc"}=e,n=S.resolve(process.cwd(),r);if(!Mt(n))throw new Error(`File not found "${n}"`);let s=S.extname(n).toLowerCase(),o=await Bt(n,s);if(t==="md"||t==="markdown"){let i=await z(o,{attributes:{doctype:"book"},standalone:!1}),c=new It({headingStyle:"atx"});c.use(Rt),o=c.turndown(typeof i=="string"?i:String(i??""))}else if(t==="txt"||t==="text"){let i=await z(o,{attributes:{doctype:"book"},standalone:!1});o=(typeof i=="string"?i:String(i??"")).replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/\r?\n/g," ").replace(/<h[1-6][^>]*>/gi,`

`).replace(/<p[^>]*>/gi,`

`).replace(/<br[^>]*>/gi,`
`).replace(/<li[^>]*>/gi,`
* `).replace(/<tr[^>]*>/gi,`
`).replace(/<(?:td|th)[^>]*>/gi," | ").replace(/<div[^>]*>/gi,`
`).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[ \t]+/g," ").replace(/ \| \s+/g," | ").replace(/\* \s+/g,"* ").replace(/\n\s*\n\s*\n+/g,`

`).trim()}return o}export{Je as convert,$ as convertCsvToAdoc,C as convertDocToAdoc,tt as convertDocToText,O as convertDocxToAdoc,ot as convertDocxToHtml,st as convertDocxToMarkdown,M as convertHtmlToAdoc,E as convertImageToAdoc,Wt as convertMarkdownToAdoc,I as convertOdtToAdoc,R as convertPdfToAdoc,B as convertRtfToAdoc,W as convertSpreadsheetToAdoc,y as convertStructuredDataToAdoc,k as escapeHtml,bt as extractTextFromRtf,Bt as getAdocContent,j as getExcelCellText,F as getWorksheetMerges,h as isPandocAvailable,w as mdToAdoc,H as objectToAdocTree,L as parseCellAddress,lt as recognizeImage,N as worksheetToAdoc,Dt as worksheetToHtmlTable,ye as worksheetToMarkdown};
//# sourceMappingURL=index.js.map
