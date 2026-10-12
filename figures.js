/* Анимации-человечки. Вид сбоку считается по углам суставов (кинематика),
   поэтому длина рук и ног не «плывёт», а корпус остаётся жёстким.
   Углы в градусах: 0 — вправо, 90 — вниз, −90 — вверх, 180 — влево. Человек смотрит вправо.
   Темп как в плане: подъём ~1 с, пауза 1 с, опускание 2–3 с. */
(function(){
"use strict";
var L={T:44,N:13,U:27,F:25,TH:32,SH:31,FT:9};
function rad(a){return a*Math.PI/180}
function pt(o,a,len){return [o[0]+Math.cos(rad(a))*len,o[1]+Math.sin(rad(a))*len]}
function f1(n){return Math.round(n*10)/10}
function P2(p){return f1(p[0])+" "+f1(p[1])}
function seg(a,b){return "M"+P2(a)+"L"+P2(b)}
function lerp(a,b,t){
  if(typeof a==="number") return a+((b==null?a:b)-a)*t;
  if(Array.isArray(a)) return a.map(function(v,i){return lerp(v,b?b[i]:v,t)});
  if(a&&typeof a==="object"){var o={};for(var k in a)o[k]=lerp(a[k],b?b[k]:null,t);return o}
  return a;
}
function k(p,n){return p.k&&p.k[n]!=null?p.k[n]:1}

/* ---------- Templates: params -> points + segments ---------- */
function side(p){
  var H=p.h,S=pt(H,p.t,L.T*k(p,"t")),Hd=pt(S,p.t+(p.hd||0),L.N);
  var P={H:H,S:S,Hd:Hd};
  var an=p.an,af=p.af||p.an,ln=p.ln,lf=p.lf||p.ln;
  P.En=pt(S,an[0],L.U*k(p,"un"));P.Wn=pt(P.En,an[1],L.F*k(p,"fn"));
  P.Ef=pt(S,af[0],L.U*k(p,"uf"));P.Wf=pt(P.Ef,af[1],L.F*k(p,"ff"));
  P.Kn=pt(H,ln[0],L.TH*k(p,"thn"));P.An=pt(P.Kn,ln[1],L.SH*k(p,"shn"));P.Fn=pt(P.An,ln[1]-90,L.FT);
  P.Kf=pt(H,lf[0],L.TH*k(p,"thf"));P.Af=pt(P.Kf,lf[1],L.SH*k(p,"shf"));P.Ff=pt(P.Af,lf[1]-90,L.FT);
  P.angles={t:p.t,an:an,af:af,ln:ln,lf:lf};
  P.far={uf:[S,P.Ef],ff:[P.Ef,P.Wf],thf:[H,P.Kf],shf:[P.Kf,P.Af],ftf:[P.Af,P.Ff]};
  P.near={t:[H,S],thn:[H,P.Kn],shn:[P.Kn,P.An],ftn:[P.An,P.Fn],un:[S,P.En],fn:[P.En,P.Wn]};
  P.head=Hd;
  return P;
}
function front(p){
  var c=p.c,hy=p.hy,T=p.T||L.T;
  var SR=[c+15,hy-T],SL=[c-15,hy-T],HR=[c+8,hy],HL=[c-8,hy];
  var P={SR:SR,SL:SL,HR:HR,HL:HL,N:[c,hy-T],H:[c,hy]};
  P.ER=pt(SR,p.aR[0],L.U*k(p,"u"));P.WR=pt(P.ER,p.aR[1],L.F*k(p,"f"));
  P.EL=pt(SL,p.aL[0],L.U*k(p,"u"));P.WL=pt(P.EL,p.aL[1],L.F*k(p,"f"));
  P.KR=pt(HR,p.lR[0],L.TH*k(p,"th"));P.AR=pt(P.KR,p.lR[1],L.SH*k(p,"sh"));
  P.KL=pt(HL,p.lL[0],L.TH*k(p,"th"));P.AL=pt(P.KL,p.lL[1],L.SH*k(p,"sh"));
  P.angles={aR:p.aR,aL:p.aL,lR:p.lR,lL:p.lL};
  P.far={};
  P.near={t:[P.N,P.H],sh:[SL,SR],hp:[HL,HR],uR:[SR,P.ER],fR:[P.ER,P.WR],uL:[SL,P.EL],fL:[P.EL,P.WL],
    tR:[HR,P.KR],sR:[P.KR,P.AR],tL:[HL,P.KL],sL:[P.KL,P.AL]};
  P.head=[c,hy-T-14];
  return P;
}
function top(p){
  var E=[132,94],W=pt(E,p.a,27);
  var P={E:E,W:W,far:{},near:{fn:[E,W]},head:null,top:true};
  return P;
}
var TPL={side:side,front:front,top:top};

/* ---------- Tools ---------- */
function cable(a,b){return '<path d="'+seg(a,b)+'" stroke="var(--equip)" stroke-width="1.6" fill="none"/>'}
function handle(W,dir){ // dir: "h" horizontal, "v" vertical
  return dir==="v"?'<rect x="'+f1(W[0]-2.5)+'" y="'+f1(W[1]-9)+'" width="5" height="18" rx="2.5" fill="var(--accent)"/>'
                  :'<rect x="'+f1(W[0]-7)+'" y="'+f1(W[1]-2.5)+'" width="14" height="5" rx="2.5" fill="var(--accent)"/>';
}
function db(W,ang){ // dumbbell perpendicular to the forearm
  var a=pt(W,ang+90,9),b=pt(W,ang-90,9);
  return '<path d="'+seg(a,b)+'" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round"/>'+
    '<circle cx="'+f1(a[0])+'" cy="'+f1(a[1])+'" r="4.5" fill="var(--accent)"/><circle cx="'+f1(b[0])+'" cy="'+f1(b[1])+'" r="4.5" fill="var(--accent)"/>';
}
function dbEnd(W){return '<rect x="'+f1(W[0]-5)+'" y="'+f1(W[1]-5)+'" width="10" height="10" rx="2" fill="var(--accent)"/>'}
function rope(W){return '<circle cx="'+f1(W[0])+'" cy="'+f1(W[1])+'" r="3.6" fill="var(--accent)"/><path d="M'+P2([W[0]-2,W[1]+3])+'l-2 6M'+P2([W[0]+2,W[1]+3])+'l2 6" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round"/>'}
function roller(A,ang){var r=pt(A,ang,6);return '<circle cx="'+f1(r[0])+'" cy="'+f1(r[1])+'" r="6" fill="var(--accent)"/>'}
function lever(piv,W){return '<path d="'+seg(piv,W)+'" stroke="var(--equip)" stroke-width="4" stroke-linecap="round"/>'}
function g(s){return '<g fill="var(--equip)">'+s+'</g>'}
function guide(d){return '<path d="'+d+'" stroke="var(--guide)" stroke-width="1.4" stroke-dasharray="4 4" fill="none"/>'}
function gtext(x,y,t,anchor){return '<text x="'+x+'" y="'+y+'" class="gt"'+(anchor?' text-anchor="'+anchor+'"':'')+'>'+t+'</text>'}
var FLOOR='<rect x="8" y="148" width="184" height="3" rx="1.5"/>';

/* ---------- Exercises ---------- */
var X={
 pulldown:{view:"side",
  eq:g('<rect x="146" y="2" width="5" height="148"/><rect x="92" y="2" width="58" height="4"/><circle cx="95" cy="9" r="4"/><rect x="76" y="114" width="36" height="6" rx="2"/><rect x="91" y="120" width="6" height="30"/><rect x="112" y="99" width="22" height="7" rx="3.5"/><rect x="128" y="106" width="5" height="44"/>'),
  A:{h:[95,112],t:-100,an:[-84,-86],ln:[0,90],k:{un:1}},
  M:{h:[95,112],t:-100,an:[10,-70],ln:[0,90],k:{un:.35}},
  B:{h:[95,112],t:-100,an:[100,-55],ln:[0,90],k:{un:1}},
  ph:["вниз к груди · ~1 с","пауза · 1 с","вверх медленно · 2–3 с",""],
  dyn:function(P){return {back:cable([95,9],P.Wn),front:handle(P.Wn,"h")}},
  hl:["t"],guide:guide("M95 112L84.6 53")+gtext(80,98,"угол не меняется","end"),
  cue:"Корпус 10–15° назад и неподвижен · сначала лопатки вниз, потом локти к рёбрам"},
 row:{view:"side",
  eq:g('<rect x="30" y="140" width="160" height="4"/><rect x="40" y="121" width="46" height="6" rx="2"/><rect x="58" y="127" width="6" height="13"/><rect x="132" y="100" width="5" height="40"/><rect x="184" y="62" width="6" height="78"/><circle cx="182" cy="84" r="4"/>'),
  A:{h:[70,118],t:-90,an:[4,4],ln:[-18,12]},
  B:{h:[70,118],t:-90,an:[150,8],ln:[-18,12]},
  ph:["к себе · ~1 с","пауза · 1 с","вперёд медленно · 2–3 с",""],
  dyn:function(P){return {back:cable([182,84],P.Wn),front:handle(P.Wn,"v")}},
  hl:["t"],guide:guide("M70 118L70 58")+gtext(78,38,"корпус вертикален"),
  cue:"Корпус не качается · локти назад к нижним рёбрам · пауза 1 с"},
 hammer:{view:"side",eq:g(FLOOR),
  A:{h:[100,87],t:-90,an:[90,90],ln:[90,90],lf:[92,88]},
  B:{h:[100,87],t:-90,an:[88,-48],ln:[90,90],lf:[92,88]},
  dyn:function(P){return {front:db(P.Wn,P.angles.an[1])+db(P.Wf,P.angles.af[1])}},
  hl:["un","fn"],guide:guide("M108 43L108 72")+gtext(90,62,"плечо на месте","end"),
  cue:"Плечо неподвижно · двигается только локоть · вниз без броска"},
 curl:{view:"side",
  eq:g('<path d="M72.3 84.2L93 101.6" stroke="var(--equip)" stroke-width="9" stroke-linecap="round"/><rect x="86" y="104" width="6" height="46"/><rect x="48" y="122" width="38" height="6" rx="2"/><rect x="62" y="128" width="6" height="22"/>'),
  A:{h:[70,120],t:-85,an:[40,30],ln:[10,95]},
  B:{h:[70,120],t:-85,an:[40,-90],ln:[10,95]},
  dyn:function(P){return {front:handle(P.Wn,"h")}},
  hl:["un"],guide:guide("M94.5 93.6L118 113.4")+gtext(120,124,"не до упора"),
  cue:"Локти на подушке · внизу не выпрямлять руку до конца · вверху сжать 1 с"},
 facepull:{view:"side",
  eq:g('<rect x="186" y="4" width="6" height="146"/><circle cx="182" cy="40" r="4"/>'+FLOOR),
  A:{h:[80,87],t:-90,an:[-12,-12],ln:[86,94],lf:[98,86],k:{un:1,fn:1}},
  B:{h:[80,87],t:-90,an:[-12,-100],ln:[86,94],lf:[98,86],k:{un:.15,fn:.6}},
  ph:["к лицу · ~1 с","пауза · 1 с","назад медленно · 2–3 с",""],
  dyn:function(P){return {back:cable([182,40],P.Wn),front:rope(P.Wn)}},
  hl:[],dot:["S"],guide:guide("M56 43L114 43")+gtext(8,36,"плечи не вверх"),
  cue:"Локти на уровне плеч · кулаки за уши · шея длинная"},
 extrot:{view:"top",
  eq:g('<circle cx="22" cy="56" r="5"/><rect x="14" y="56" width="5" height="60" rx="2"/>'),
  A:{a:-150},B:{a:-70},
  ph:["наружу · ~1 с","пауза · 1 с","обратно · 2–3 с",""],
  dyn:function(P){return {back:cable([22,56],P.W),front:handle(P.W,"v")}},
  guide:'<circle cx="132" cy="94" r="10" stroke="var(--guide)" stroke-width="1.4" stroke-dasharray="3 3" fill="none"/>'+gtext(192,124,"локоть у бока","end")+gtext(8,150,"вид сверху"),
  cue:"Локоть прижат к боку · вращай предплечье наружу на 60–90°"},
 legcurl:{view:"side",
  eq:g('<rect x="38" y="109" width="122" height="7" rx="3"/><rect x="54" y="116" width="5" height="34"/><rect x="140" y="116" width="5" height="34"/>'),
  A:{h:[92,104],t:0,hd:-25,an:[100,40],ln:[180,180]},
  B:{h:[92,104],t:0,hd:-25,an:[100,40],ln:[180,305]},
  dyn:function(P){return {front:roller(P.An,P.angles.ln[1]-90)}},
  hl:["thn"],guide:guide("M74 97L112 97")+gtext(70,92,"таз прижат","end"),
  cue:"Таз прижат к скамье · старт плавный, без рывка"},
 legext:{view:"side",
  eq:g('<path d="M65 112L59 62" stroke="var(--equip)" stroke-width="7" stroke-linecap="round"/><rect x="58" y="110" width="58" height="7" rx="2"/><rect x="80" y="117" width="6" height="33"/>'),
  A:{h:[80,108],t:-97,an:[80,20],ln:[0,90]},
  B:{h:[80,108],t:-97,an:[80,20],ln:[0,45]},
  dyn:function(P){return {front:roller(P.An,P.angles.ln[1]-90)}},
  hl:["thn"],
  guide:'<path d="M112 144A36 36 0 0 0 137.5 133.5" stroke="var(--hl)" stroke-width="3" fill="none"/><path d="M137.5 133.5A36 36 0 0 0 148 108" stroke="var(--guide)" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>'+gtext(150,128,"до 45°"),
  cue:"Пока колено болит — только 90°→45°, медленно, боль ≤ 3/10"},
 hipabd:{view:"front",
  eq:g('<rect x="80" y="44" width="40" height="64" rx="6" opacity=".55"/><rect x="74" y="104" width="52" height="7" rx="2"/>'),
  A:{c:100,hy:104,aR:[70,95],aL:[110,85],lR:[86,90],lL:[94,90],k:{th:.45}},
  B:{c:100,hy:104,aR:[70,95],aL:[110,85],lR:[28,90],lL:[152,90],k:{th:.45}},
  ph:["колени наружу · ~1 с","пауза · 1 с","обратно · 2–3 с",""],
  dyn:function(P){return {front:'<rect x="'+f1(P.KR[0]+4)+'" y="'+f1(P.KR[1]-6)+'" width="6" height="16" rx="3" fill="var(--accent)"/><rect x="'+f1(P.KL[0]-10)+'" y="'+f1(P.KL[1]-6)+'" width="6" height="16" rx="3" fill="var(--accent)"/>'}},
  dot:["HR","HL"],cue:"Колени наружу без рывка · амплитуду не форсировать"},
 raise:{view:"front",eq:g(FLOOR),
  A:{c:100,hy:88,aR:[80,84],aL:[100,96],lR:[86,90],lL:[94,90]},
  B:{c:100,hy:88,aR:[0,-4],aL:[180,184],lR:[86,90],lL:[94,90]},
  dyn:function(P){return {front:dbEnd(P.WR)+dbEnd(P.WL)}},
  dot:["SR","SL"],guide:guide("M40 44L160 44")+gtext(192,28,"не выше плеч","end")+gtext(8,155,"вид спереди, стоя"),
  cue:"До уровня плеч · руки чуть впереди корпуса · плечи не к ушам"},
 press:{view:"side",
  eq:g('<rect x="32" y="70" width="6" height="80"/><circle cx="38" cy="78" r="5"/><path d="M63 118L58 66" stroke="var(--equip)" stroke-width="7" stroke-linecap="round"/><rect x="50" y="120" width="42" height="6" rx="2"/><rect x="64" y="126" width="6" height="24"/>'),
  A:{h:[70,118],t:-96,an:[150,0],ln:[0,90],k:{un:.8}},
  B:{h:[70,118],t:-96,an:[5,2],ln:[0,90],k:{un:1}},
  ph:["от себя · ~1 с","пауза · 1 с","к груди медленно · 2–3 с",""],
  dyn:function(P){return {back:lever([38,78],P.Wn),front:handle(P.Wn,"v")}},
  dot:["S"],guide:guide("M74 70L74 100")+gtext(100,64,"не глубже груди")+gtext(8,155,"хват: ладони друг к другу"),
  cue:"Толкай от себя · локти 30–45° к корпусу · назад к груди медленно · без блокировки"},
 csrow:{view:"side",
  eq:g('<path d="M87 109L109 86" stroke="var(--equip)" stroke-width="8" stroke-linecap="round"/><rect x="104" y="96" width="5" height="54"/><rect x="50" y="118" width="32" height="6" rx="2"/><rect x="62" y="124" width="6" height="26"/>'),
  A:{h:[70,116],t:-45,hd:-10,an:[90,90],ln:[8,95]},
  B:{h:[70,116],t:-45,hd:-10,an:[196,78],ln:[8,95]},
  ph:["к себе · ~1 с","пауза · 1 с","вниз медленно · 2–3 с",""],
  dyn:function(P){return {front:handle(P.Wn,"v")}},
  hl:["t"],guide:guide("M70 116L118 68")+gtext(120,64,"спина неподвижна"),
  cue:"Грудь на упоре · локти назад вдоль корпуса · пауза 1 с"},
 revfly:{view:"front",
  eq:g('<rect x="84" y="22" width="32" height="120" rx="6" opacity=".55"/>'),
  A:{c:100,hy:96,aR:[0,0],aL:[180,180],lR:[90,90],lL:[90,90],k:{u:.18,f:.18,th:.7,sh:.4}},
  B:{c:100,hy:96,aR:[0,0],aL:[180,180],lR:[90,90],lL:[90,90],k:{u:1,f:1,th:.7,sh:.4}},
  ph:["руки в стороны · ~1 с","пауза · 1 с","вниз медленно · 2–3 с",""],
  dyn:function(P){return {front:dbEnd(P.WR)+dbEnd(P.WL)}},
  dot:["SR","SL"],guide:gtext(8,155,"вид сверху · грудью на скамье"),
  cue:"Лёжа грудью на скамье · руки висят вниз → в стороны до уровня плеч · сведи лопатки"},
 pushdown:{view:"side",
  eq:g('<rect x="150" y="4" width="6" height="146"/><circle cx="146" cy="10" r="4"/>'+FLOOR),
  A:{h:[84,88],t:-85,an:[92,-5],ln:[88,92],lf:[94,86]},
  B:{h:[84,88],t:-85,an:[92,90],ln:[88,92],lf:[94,86]},
  ph:["вниз · ~1 с","пауза · 1 с","вверх медленно · 2–3 с",""],
  dyn:function(P){return {back:cable([146,10],P.Wn),front:handle(P.Wn,"h")}},
  hl:["un"],guide:guide("M94 44L94 74")+gtext(80,62,"локти на месте","end"),
  cue:"Локти прижаты к бокам · корпус не наваливается · пауза внизу"},
 dbcurl:{view:"side",
  eq:g('<path d="M74 122L56 72" stroke="var(--equip)" stroke-width="7" stroke-linecap="round"/><rect x="64" y="120" width="40" height="6" rx="2"/><rect x="78" y="126" width="6" height="24"/>'),
  A:{h:[80,118],t:-110,hd:15,an:[92,90],ln:[0,90]},
  B:{h:[80,118],t:-110,hd:15,an:[92,-40],ln:[0,90]},
  dyn:function(P){return {front:db(P.Wn,P.angles.an[1])}},
  hl:["un"],guide:guide("M70 76L70 104")+gtext(48,98,"плечо","end"),
  cue:"Плечо не уходит вперёд · внизу рука почти прямая"},
 yraise:{view:"side",
  eq:g('<path d="M53 116L100 90" stroke="var(--equip)" stroke-width="8" stroke-linecap="round"/><rect x="70" y="104" width="5" height="46"/>'),
  A:{h:[58,106],t:-30,an:[90,90],ln:[160,100]},
  B:{h:[58,106],t:-30,an:[-40,-40],ln:[160,100]},
  dyn:function(){return {}},
  dot:["S"],cue:"Руки буквой Y до уровня ушей · пауза 2 с · без шрага"},
 yfloor:{view:"side",eq:g(FLOOR),
  A:{h:[70,141],t:0,hd:-12,an:[0,0],ln:[180,180]},
  B:{h:[70,141],t:0,hd:-12,an:[-18,-18],ln:[180,180]},
  dot:["S"],cue:"Руки буквой Y, приподнять над полом · пауза 2 с · без шрага"},
 bridge:{view:"side",eq:g('<rect x="8" y="147" width="184" height="3" rx="1.5"/>'),
  A:{h:[95,140],t:180,hd:10,an:[2,0],ln:[-50,95]},
  B:{h:[90,118],t:148,hd:28,an:[8,0],ln:[-12,100]},
  dot:["H"],guide:guide("M51 140L124 109")+gtext(128,104,"одна линия"),
  cue:"Плечи–таз–колени в одну линию · пауза 2 с · поясница не прогибается"},
 sideplank:{view:"side",hold:true,eq:g('<rect x="8" y="141" width="184" height="3" rx="1.5"/>'),
  A:{h:[100,124],t:-20,hd:-5,an:[90,0],ln:[165,168]},
  hl:["t"],guide:guide("M36 139L146 107")+gtext(192,96,"прямая линия","end"),
  cue:"Локоть под плечом · тело прямое · таз не провисает"},
 ellipse:{view:"side",loop:true,
  eq:g('<rect x="60" y="141" width="92" height="8" rx="3"/><path d="M138 141L140 40" stroke="var(--equip)" stroke-width="4"/>'),
  A:{h:[100,80],t:-86,an:[60,-25],af:[80,-40],ln:[55,105],lf:[120,85]},
  B:{h:[100,80],t:-86,an:[80,-40],af:[60,-25],ln:[120,85],lf:[55,105]}},
 walk:{view:"side",loop:true,eq:g(FLOOR),
  A:{h:[100,84],t:-88,an:[110,95],af:[70,80],ln:[65,105],lf:[115,95]},
  B:{h:[100,84],t:-88,an:[70,80],af:[110,95],ln:[115,95],lf:[65,105]}},
 bike:{view:"side",loop:true,
  eq:g('<rect x="74" y="88" width="22" height="5" rx="2"/><path d="M84 93L100 132M100 132L134 70M128 66L140 66" stroke="var(--equip)" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="132" r="4"/>'+FLOOR),
  A:{h:[85,82],t:-72,an:[18,10],ln:[28,108],lf:[60,100]},
  B:{h:[85,82],t:-72,an:[18,10],ln:[60,100],lf:[28,108]}},
 joints:{view:"front",loop:true,eq:g(FLOOR),
  A:{c:100,hy:88,aR:[80,85],aL:[100,95],lR:[86,90],lL:[94,90]},
  B:{c:100,hy:88,aR:[-80,-85],aL:[260,265],lR:[86,90],lL:[94,90]}},
 doctor:{view:"side",eq:g('<rect x="8" y="145" width="184" height="3" rx="1.5"/>'),
  A:{h:[70,139],t:0,hd:-10,an:[0,0],af:[0,0],ln:[180,180],lf:[180,180]},
  B:{h:[70,139],t:0,hd:-10,an:[-16,-16],af:[0,0],ln:[180,180],lf:[196,196]},
  ph:["подъём · ~1 с","пауза","опускание · 2–3 с",""],
  dot:["S"],guide:gtext(8,155,"лёжа на животе, руки за головой"),
  cue:"Правая рука + левая нога, потом наоборот · невысоко, поясница не прогибается"},
 wallsit:{view:"side",hold:true,eq:g('<rect x="44" y="8" width="6" height="142"/>'+FLOOR),
  A:{h:[62,90],t:-90,an:[90,90],ln:[60,105]},
  hl:["thn"],guide:gtext(96,104,"колено ≤ 45°"),cue:"Спина у стены · колено согнуто неглубоко · боль ≤ 3/10"},
 door:{view:"top",hold:true,
  eq:g('<rect x="150" y="20" width="8" height="90" rx="2"/>'),
  A:{a:-50},
  guide:'<path d="M150 64l-10 0m4 -4l-4 4l4 4" stroke="var(--hl)" stroke-width="2" fill="none" stroke-linecap="round"/>'+gtext(8,150,"вид сверху · давить в косяк"),
  cue:"Локоть у бока · давить кистью наружу в косяк, рука не двигается"},
 stretch:{view:"side",hold:true,eq:g('<rect x="40" y="8" width="6" height="142"/>'+FLOOR),
  A:{h:[100,87],t:-88,hd:5,an:[178,176],af:[176,176],ln:[84,96],lf:[100,84]},
  dot:["S"],guide:gtext(192,30,"растяжка груди у стены","end"),
  cue:"Пример: грудные у стены, 30 с · спокойно, без боли · не перед силовой"}
};

/* ---------- Rendering ---------- */
var SVGNS="http://www.w3.org/2000/svg",figs=[];
var PHASE=["вверх · ~1 с","пауза · 1 с","вниз · 2–3 с",""];
function mk(anim,big){
  var d=X[anim]; if(!d) return null;
  var s=document.createElementNS(SVGNS,"svg");
  s.setAttribute("viewBox","0 0 200 160");s.setAttribute("class",big?"fig-big":"fig");s.setAttribute("aria-hidden","true");
  s.innerHTML=(d.eq||"")+'<g class="dyn"></g>'+(big&&d.guide?'<g class="guides">'+d.guide+'</g>':"")+
    (big&&!d.loop&&!d.hold?'<text class="ph" x="8" y="14"></text>':"");
  var f={el:s,d:d,dyn:s.querySelector(".dyn"),ph:s.querySelector(".ph"),big:big,vis:true,last:-1};
  figs.push(f);
  if(window.IntersectionObserver){if(!io)io=new IntersectionObserver(function(es){es.forEach(function(e){var x=e.target.__fig;if(x)x.vis=e.isIntersecting})});s.__fig=f;io.observe(s)}
  draw(f,d.hold?0:(d.loop?.5:1),true);
  return s;
}
var io=null;
function draw(f,p,force){
  var d=f.d,par=d.hold?d.A:(d.M?(p<.5?lerp(d.A,d.M,p*2):lerp(d.M,d.B,(p-.5)*2)):lerp(d.A,d.B,p)),P=TPL[d.view](par),h="";
  var dyn=d.dyn?d.dyn(P):{};
  if(d.view==="top"){
    h+=(dyn.back||"")+'<ellipse cx="100" cy="94" rx="36" ry="12" fill="var(--figfar)"/><circle cx="100" cy="90" r="11" fill="var(--fig)"/>'+
      '<circle cx="132" cy="94" r="5" fill="var(--fig)"/><path d="'+seg(P.E,P.W)+'" stroke="var(--fig)" stroke-width="8" stroke-linecap="round"/>'+
      '<circle cx="132" cy="94" r="4" fill="var(--hl)"/>'+(dyn.front||"");
    f.dyn.innerHTML=h;return;
  }
  var far="",body="",hl="",hs=d.hl||[];
  for(var a in P.far) far+=seg(P.far[a][0],P.far[a][1]);
  for(var b in P.near){var sg=seg(P.near[b][0],P.near[b][1]);if(hs.indexOf(b)>=0)hl+=sg;else body+=sg}
  h+=(dyn.back||"");
  if(far) h+='<path d="'+far+'" stroke="var(--figfar)" stroke-width="7" stroke-linecap="round" fill="none"/>';
  h+='<path d="'+body+'" stroke="var(--fig)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  if(hl) h+='<path d="'+hl+'" stroke="var(--hl)" stroke-width="8" stroke-linecap="round" fill="none"/>';
  h+='<circle cx="'+f1(P.head[0])+'" cy="'+f1(P.head[1])+'" r="9" fill="var(--fig)"/>';
  (d.dot||[]).forEach(function(n){var q=P[n];if(q)h+='<circle cx="'+f1(q[0])+'" cy="'+f1(q[1])+'" r="5.5" fill="var(--hl)"/>'});
  h+=(dyn.front||"");
  f.dyn.innerHTML=h;
}
function ease(x){return .5-.5*Math.cos(Math.PI*x)}
function phase(t){ // returns [position 0..1, phase index]
  if(t<.2) return [ease(t/.2),0]; if(t<.4) return [1,1]; if(t<.9) return [1-ease((t-.4)/.5),2]; return [0,3];
}
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches,lastT=0;
function tick(now){
  if(now-lastT>32){lastT=now;
    figs.forEach(function(f){
      if(f.d.hold||!f.vis||!f.el.isConnected||f.el.getClientRects().length===0) return;
      if(f.d.loop){var t=(now%1600)/1600;draw(f,ease(t<.5?t*2:2-t*2));return}
      var r=phase((now%5000)/5000);draw(f,r[0]);
      if(f.ph&&f.last!==r[1]){f.last=r[1];f.ph.textContent=(f.d.ph||PHASE)[r[1]]}
    });
  }
  requestAnimationFrame(tick);
}
function reset(){figs=[];if(io){io.disconnect()}}
function cue(anim){return X[anim]&&X[anim].cue||""}
var started=false;
function start(){if(started||reduce)return;started=true;requestAnimationFrame(tick)}
function still(anim,p){ // static frame, used for previews and checks
  var d=X[anim];if(!d)return null;var s=document.createElementNS(SVGNS,"svg");s.setAttribute("viewBox","0 0 200 160");s.setAttribute("class","fig-big");
  s.innerHTML=(d.eq||"")+'<g class="dyn"></g>'+(d.guide?'<g class="guides">'+d.guide+'</g>':"");
  draw({el:s,d:d,dyn:s.querySelector(".dyn")},p);return s;
}
window.GymFig={make:mk,reset:reset,cue:cue,start:start,still:still,list:function(){return Object.keys(X)},has:function(a){return !!X[a]}};
})();
