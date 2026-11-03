from pathlib import Path
from html import escape
out=Path(__file__).resolve().parent.parent/'assets'
out.mkdir(parents=True,exist_ok=True)

def scene(name,style):
    palettes={
      'bay':('#91b9c7','#d8e9d8','#234f67','#376f78','#0c435b','#efc98d'),
      'river':('#9ebc9e','#eef0d4','#376e57','#4d8162','#235f50','#efc58c'),
      'town':('#7ebfc8','#f7d5ac','#cf9a53','#c86d48','#5a8e9b','#fce2b4'),
      'city':('#92bdcd','#e1ebdf','#496c88','#6d8fa1','#1a5a6c','#ecd9ad'),
      'train':('#91b5cb','#ece5cf','#487e73','#2f6f71','#1b5866','#fac98d'),
      'food':('#9fc3ba','#eed8a9','#a66a48','#467d65','#2e5f68','#f2cb8d'),
      'temple':('#9fb5b6','#ece5d4','#9f856c','#58756d','#295b68','#f6d2a6'),
      'coast':('#8bbcc9','#e6e5cb','#538a78','#45807c','#225b72','#ffe0aa'),
    }
    sky,cloud,m1,m2,water,sun=palettes[style]
    items=''
    if style in ['bay','river','coast']:
        items='''<path d="M0 510 Q250 465 480 503 T960 500 T1440 495 V900 H0Z" fill="'''+water+'''"/><path d="M0 594 Q220 570 470 595 T940 588 T1440 604" fill="none" stroke="#ffffff" stroke-opacity=".23" stroke-width="5"/><path d="M610 669 q115 -23 220 1 l-30 13 h-152Z" fill="#e9e2cd"/><path d="M724 668 v-74 l-84 69Z" fill="#fff1d2"/><path d="M700 672 v-78 l91 71Z" fill="#f7d2a1"/>'''
    if style=='town':
        items='''<path d="M0 650 H1440 V900 H0Z" fill="'''+water+'''"/><g fill="#edbd7c"><rect x="160" y="385" width="240" height="265" rx="3"/><rect x="440" y="415" width="285" height="238" rx="3"/><rect x="830" y="383" width="275" height="280" rx="3"/></g><g fill="#9d4f41"><path d="M138 388 273 311 420 388Z"/><path d="M430 417 580 337 743 417Z"/><path d="M801 384 965 292 1126 384Z"/></g><g fill="#7d513f"><rect x="220" y="495" width="60" height="155"/><rect x="340" y="493" width="35" height="70"/><rect x="494" y="508" width="65" height="145"/><rect x="617" y="508" width="56" height="85"/><rect x="920" y="505" width="65" height="160"/></g><path d="M0 739 Q370 701 720 743 T1440 730" fill="none" stroke="#eee5c8" stroke-width="9" stroke-opacity=".38"/>'''
    if style=='city':
        items='''<path d="M0 640 H1440 V900 H0Z" fill="'''+water+'''"/><g fill="#acc7bf"><rect x="120" y="400" width="145" height="255" rx="4"/><rect x="283" y="337" width="110" height="319" rx="4"/><rect x="1000" y="372" width="120" height="284" rx="4"/><rect x="1140" y="292" width="145" height="362" rx="4"/></g><g fill="#35556c"><rect x="465" y="327" width="150" height="340" rx="4"/><rect x="645" y="420" width="125" height="237" rx="4"/><rect x="808" y="360" width="175" height="304" rx="4"/></g><g stroke="#f0e8d1" stroke-width="11" opacity=".53"><path d="M500 380h78m-78 45h78m-78 45h78m-78 45h78m-78 45h78"/><path d="M842 412h108m-108 45h108m-108 45h108"/></g>'''
    if style=='train':
        items='''<path d="M0 685 H1440 V900 H0Z" fill="'''+water+'''"/><path d="M0 698 1440 800" stroke="#f3eee0" stroke-width="13"/><path d="M0 746 1440 849" stroke="#b3a98e" stroke-width="8"/><g transform="translate(400 510)"><rect x="0" y="0" width="590" height="150" rx="24" fill="#efe4c4"/><path d="M0 104 H590 V143 Q590 150 574 150 H22 Q0 150 0 126Z" fill="#d97551"/><g fill="#235773"><rect x="46" y="29" width="98" height="67" rx="7"/><rect x="165" y="29" width="98" height="67" rx="7"/><rect x="284" y="29" width="98" height="67" rx="7"/><rect x="403" y="29" width="98" height="67" rx="7"/></g><circle cx="102" cy="152" r="20" fill="#234052"/><circle cx="488" cy="152" r="20" fill="#234052"/></g>'''
    if style=='food':
        items='''<path d="M0 580 Q680 520 1440 600 V900 H0Z" fill="'''+water+'''"/><ellipse cx="750" cy="642" rx="375" ry="160" fill="#f7f0e1"/><ellipse cx="750" cy="632" rx="319" ry="125" fill="#d09c6a"/><ellipse cx="750" cy="623" rx="273" ry="92" fill="#f3dca2"/><g fill="#51875a"><ellipse cx="630" cy="594" rx="100" ry="34" transform="rotate(-17 630 594)"/><ellipse cx="810" cy="630" rx="100" ry="25" transform="rotate(24 810 630)"/><ellipse cx="840" cy="581" rx="94" ry="28" transform="rotate(-20 840 581)"/></g><g stroke="#f9ede3" stroke-width="16" fill="none"><path d="M560 649q180 100 360 -5"/><path d="M615 589q140 115 235 -5"/></g><path d="M966 455 1350 240M984 474 1370 260" stroke="#77523d" stroke-width="13"/>'''
    if style=='temple':
        items='''<path d="M0 690H1440V900H0Z" fill="'''+water+'''"/><g fill="#e2c29b"><rect x="320" y="479" width="770" height="185"/><rect x="435" y="381" width="535" height="132"/></g><g fill="#8c5e51"><path d="M270 479q450 -162 870 0v29H270Z"/><path d="M375 375q343 -142 653 0v40H375Z"/><path d="M405 324q279 -93 563 0v30H405Z"/></g><g fill="#665049"><rect x="470" y="531" width="94" height="133"/><rect x="658" y="531" width="94" height="133"/><rect x="854" y="531" width="94" height="133"/></g>'''
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" role="img" aria-label="Stylized Vietnam travel illustration"><defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{sky}"/><stop offset="1" stop-color="{cloud}"/></linearGradient><radialGradient id="light"><stop stop-color="{sun}" stop-opacity=".9"/><stop offset="1" stop-color="{sun}" stop-opacity="0"/></radialGradient></defs><rect width="1440" height="900" fill="url(#sky)"/><circle cx="1150" cy="202" r="230" fill="url(#light)"/><circle cx="1150" cy="202" r="91" fill="{sun}" opacity=".87"/><g fill="{cloud}" opacity=".59"><ellipse cx="210" cy="188" rx="170" ry="35"/><ellipse cx="330" cy="201" rx="118" ry="27"/><ellipse cx="790" cy="145" rx="112" ry="28"/></g><path d="M0 612q100 -260 236 -194 86 25 151 -140 95 -179 198 137 120 101 208 -65 91 -181 225 90 85 98 170 -50 112 -151 252 99V900H0Z" fill="{m1}" opacity=".78"/><path d="M0 620q150 -152 300 -75 115 33 206 -92 136 -162 242 98 150 82 282 -81 125 -116 244 44 102 57 166 43V900H0Z" fill="{m2}" opacity=".86"/>{items}<rect width="1440" height="900" fill="#0c2540" opacity=".055"/></svg>'''
    (out/(name+'.svg')).write_text(svg)
for n,s in [('hero-vietnam','river'),('ninh-binh','river'),('lan-ha-bay','bay'),('hoi-an','town'),('hanoi','city'),('heritage-train','train'),('vietnam-food','food'),('hue','temple'),('vietnam-itinerary','coast')]: scene(n,s)
