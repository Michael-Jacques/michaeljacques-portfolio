#!/usr/bin/env python3
"""Generates index.html (the head), ask.html (the chat), about.html and case/<slug>.html."""
import json, os, re, hashlib, html as H
import chat_content as CC

_HASH = {}
def v(path):
    """Append a short content hash so browsers pick up every deploy."""
    if path not in _HASH:
        try:
            _HASH[path] = hashlib.md5(open(path, 'rb').read()).hexdigest()[:8]
        except OSError:
            _HASH[path] = '0'
    return f"{path}?v={_HASH[path]}"

SITE = {
  "name": "Michael Jacques",
  "location": "Fort Lauderdale, FL",
  "email": "michaelsjacques@gmail.com",
  "phone": "(954) 647-9037",
  "linkedin": "https://www.linkedin.com/in/michaeljacques",
  "year": "2026",
  "url": "https://www.michaeljacques.work",
}
from urllib.parse import quote as _q

def mailto(subject="Hello from michaeljacques.work"):
    """Every contact route on the site goes through here."""
    return f"mailto:{SITE['email']}?subject={_q(subject)}"

def telto():
    return 'tel:+1' + ''.join(ch for ch in SITE['phone'] if ch.isdigit())

D = json.load(open('cases.json'))
ALL = D['featured'] + D['archive']

LOGO_PATHS = '<path class="logo-part logo-part--m" d="M0 0h17.5v24h-6V9l-2.75 5.5L6 9v15H0z"/><path class="logo-part logo-part--j" d="M21 0h7v18l-6 6h-3v-5.5h2z"/>'
LOGO_SVG = f'<svg viewBox="0 0 28 24" fill="currentColor" aria-hidden="true">{LOGO_PATHS}</svg>'

def head(title, desc, root, extra=''):
    return f'''<!doctype html>
<html lang="en" data-theme="black">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>{H.escape(title)}</title>
<meta name="description" content="{H.escape(desc)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="{H.escape(title)}" />
<meta property="og:description" content="{H.escape(desc)}" />
<meta property="og:image" content="{SITE['url']}/assets/og.png" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" type="image/svg+xml" href="{root}assets/icons/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@400;500;600;800;900&family=Playfair+Display:ital,wght@0,600;0,800;0,900;1,600;1,700;1,800&family=Poppins:wght@400;500;600&display=swap" />
<link rel="stylesheet" href="{root}{v('styles.css')}" />
{extra}
</head>'''

def header(root, active):
    def tab(id_, label, href):
        cur = ' aria-current="page" data-click-burst' if active == id_ else ' data-click-bounce'
        return f'<a class="tab" href="{href}"{cur}>{label}</a>'
    return f'''<header class="site-header" aria-label="Main navigation">
  <div class="brand-area">
    <a class="logo-link" href="{root}index.html" data-click-burst aria-label="Home"><span class="logo" aria-hidden="true"></span></a>
    <span class="header-location" data-click-burst>{SITE['location']}</span>
  </div>
  <nav class="tabs" aria-label="Portfolio sections">
    <span class="tabs-indicator" aria-hidden="true"></span>
    {tab('work','Work', root+'index.html')}
    {tab('about','About', root+'about.html')}
  </nav>
  <div class="header-contact" aria-label="Contact links">
    <button class="email-copy" type="button" data-click-burst data-email="{SITE['email']}"><span>{SITE['email']}</span></button>
    <a class="social-link social-link--mail" href="{mailto()}" aria-label="Email Michael" data-click-bounce></a>
    <a class="social-link social-link--linkedin" href="{SITE['linkedin']}" target="_blank" rel="noreferrer" aria-label="LinkedIn" data-click-bounce></a>
  </div>
  <a class="chat-link" href="{root}ask.html" data-click-bounce><span class="chat-link__dot" aria-hidden="true"></span>Ask me anything</a>
  <button class="header-info-toggle" type="button" aria-label="Contact" aria-expanded="false"><span></span></button>
  <div class="header-info-panel" aria-hidden="true">
    <button class="email-copy" type="button" data-email="{SITE['email']}"><span>{SITE['email']}</span></button>
    <a class="social-link social-link--mail" href="{mailto()}" aria-label="Email Michael"></a>
    <a class="social-link social-link--linkedin" href="{SITE['linkedin']}" target="_blank" rel="noreferrer" aria-label="LinkedIn"></a>
  </div>
</header>
<button class="header-info-scrim" tabindex="-1" aria-hidden="true"></button>'''


def fab(root):
    return f"""<a class="chat-fab" href="{root}ask.html" aria-label="Ask the portfolio anything">
  <span class="chat-fab__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
  <span class="chat-fab__tip">Ask me anything</span>
</a>"""

def footer(root):
    return f'''<div class="footer-reveal"><footer class="site-footer" aria-label="Footer">
  <div class="footer-contact" aria-label="Footer contact links">
    <button class="email-copy footer-email" type="button" data-email="{SITE['email']}"><span>{SITE['email']}</span></button>
    <a class="social-link social-link--mail footer-social" href="{mailto()}" aria-label="Email Michael" data-click-bounce></a>
    <a class="social-link social-link--linkedin footer-social" href="{SITE['linkedin']}" target="_blank" rel="noreferrer" aria-label="LinkedIn" data-click-bounce></a>
  </div>
  <a class="footer-logo" href="{root}index.html" data-click-burst aria-label="Michael Jacques">{LOGO_SVG}</a>
  <div class="footer-bottom"><p class="footer-year" data-click-burst>{SITE['year']}</p>
    <div class="footer-socials"><a class="social-link social-link--mail footer-social" href="{mailto()}" aria-label="Email Michael"></a><a class="social-link social-link--linkedin footer-social" href="{SITE['linkedin']}" target="_blank" rel="noreferrer" aria-label="LinkedIn"></a></div>
  </div>
</footer></div>'''

def title_html(c):
    t = c['title']
    if c['titleStyle'] == 'serif':
        # "Verizon <em>RIDE</em>" -> two lines, last (em) italic
        if '<em>' in t:
            a, b = t.split('<em>'); b = b.replace('</em>', '')
            return f'<h2 class="case-title--editorial"><span class="case-title-line">{a.strip()}</span><span class="case-title-line"><em class="case-title-italic">{b}</em></span></h2>'
        return f'<h2 class="case-title--editorial"><span class="case-title-line">{t}</span></h2>'
    if c['titleStyle'] == 'sans':
        return f'<h2 class="case-title--sans"><span class="case-title-line">{t}</span></h2>'
    return f'<h2>{t}</h2>'

def plain_title(c):
    return c['title'].replace('<em>','').replace('</em>','')

def crest(c):
    funds = c.get('crest', [])
    left = ''.join(f'<span class="case-fund">{f}</span>' for f in funds[1:3])
    right = ''.join(f'<span class="case-fund">{f}</span>' for f in funds[3:5])
    return f'''<div class="case-crest">
  <span class="case-funds">{left}</span>
  <span class="case-logo case-logo--mark">{funds[0] if funds else c['client']}</span>
  <span class="case-funds">{right}</span>
</div>'''

def device(c, cls=''):
    dv = c.get('device', 'laptop')
    if dv == 'none' or not c.get('cover'):
        return ''
    return f'''<div class="case-device case-device--{dv} {cls}" aria-hidden="true"><div class="case-device__body"><img src="{{root}}{c['cover']}" alt="" loading="lazy" decoding="async"></div></div>'''

def case_section(c, i, root):
    n = i + 1
    layout = ['right', 'left', 'center'][i % 3]
    return f'''<section class="case-section" data-case-index="{i}" data-case-id="{c['slug']}" data-layout="{layout}" style="z-index:{n+4}" {'id="selected-work-start"' if i==0 else ''} aria-label="Selected work case {n}">
  {'<a class="explore-cue" href="#selected-work-start" aria-label="Explore selected work"><span>Explore</span><span class="explore-arrow" aria-hidden="true"></span></a>' if i==0 else ''}
  <div class="case-frame">
    <span class="case-number" aria-hidden="true">case {c['num']}</span>
    <div class="case-phone-mask" aria-hidden="true">{device(c).replace('{root}', root)}</div>
    <div class="case-frame__safe" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
    <div class="case-cover"><div class="case-cover__content">
      {crest(c)}
      {title_html(c)}
      <div class="case-tags">{''.join(f'<span class="case-tag">{t}</span>' for t in c['tags'])}</div>
      <a class="case-button" href="{root}case/{c['slug']}.html" data-click-bounce>Deep dive</a>
    </div></div>
  </div>
</section>'''

def index_page():
    root = ''
    words = ["DIGITAL", "CREATIVE", "INTERACTIVE", "EXPERIENTIAL", "WEB", "EVENT"]
    sections = []
    feats = D['featured']
    for i, c in enumerate(feats):
        if i == len(feats) - 1:
            sections.append('<div class="case-divider-pin" aria-hidden="true"></div>')
        sections.append(case_section(c, i, root))
    archive = ''.join(f'<li><a href="case/{a["slug"]}.html" data-click-bounce><span class="archive__title">{a["title"].replace("<em>","").replace("</em>","")}</span><span class="archive__tag">{a["tag"]}</span><span class="archive__arrow" aria-hidden="true"></span></a></li>' for a in D['archive'])
    body = f'''
<body>
<main class="page page--design" data-words='{json.dumps(words)}'>
  <div class="intro-loader intro-loader--enter" aria-hidden="true">
    <svg class="intro-loader-logo" viewBox="0 0 28 24" fill="currentColor">{LOGO_PATHS}</svg>
    <span class="intro-transition-dot"></span>
    <div class="intro-transition-character"><div class="intro-transition-character-clip"><span class="intro-transition-ring"></span></div></div>
  </div>
  <div class="header-top-fill" aria-hidden="true"></div>
  {header(root, 'work')}
  <section class="work-hero" aria-label="Selected work">
    <div class="hero-intro"><h1 class="sr-only">Creative Producer</h1><div class="sr-only" aria-label="Profile highlights"><span>Digital Manager</span><span>Creative Producer</span></div></div>
    <div class="screen-wheel">
      <div class="carousel-stage"><canvas class="carousel-canvas" aria-label="Rotating 3D project carousel"></canvas></div>
      <div class="wheel-lens-blur wheel-lens-blur--left" aria-hidden="true"></div>
      <div class="wheel-lens-blur wheel-lens-blur--right" aria-hidden="true"></div>
      <img class="hero-character-dom" src="assets/characters/hero-character.webp" alt="" aria-hidden="true">
    </div>
  </section>
  <div class="hero-marquee" aria-hidden="true"><div class="hero-marquee__track"><span class="hero-marquee__copy">DIGITAL MANAGER · CREATIVE PRODUCER · </span><span class="hero-marquee__copy">DIGITAL MANAGER · CREATIVE PRODUCER · </span></div></div>
  <div class="case-stack" id="selected-work">
    {''.join(sections)}
    <section class="archive-section" aria-label="More work">
      <div class="archive">
        <div class="archive__head"><span class="case-number">more work</span><span class="archive__count">{len(D['archive'])} projects</span></div>
        <ul class="archive__list">{archive}</ul>
      </div>
    </section>
  </div>
  {fab(root)}
  {footer(root)}
</main>
<script type="importmap">{{"imports":{{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"}}}}</script>
<script src="{root}{v('main.js')}"></script>
<script type="module" src="{root}{v('hero.js')}"></script>
</body></html>'''
    return head("Michael Jacques — Portfolio", "Digital Manager. Creative Producer. Web, apps, AR and experiential for Google, Meta, Amazon, Honda and more.", root) + body

RESUME = [
 ("Independent", "Freelance Producer, Designer &amp; Developer", "2025 – Present", "Tech, retail and entertainment",
  ["Build AI-assisted tools and prototypes: conversational interfaces, generated-image and video pipelines, and internal automations that take repetitive work off a team's plate.",
   "Design and ship digital products end to end, from the first wireframe through the live build.",
   "Run marketing programs across lifecycle and CRM, paid social, content systems and the reporting that says what to do next.",
   "Produce the work as well as make it: scope, budget, schedule and the vendor wrangling that keeps a launch on its date."]),
 ("Level Studios", "Digital Producer, Contract", "03/2024 – 12/2024", "A high-profile technology company",
  ["Produced digital work for a major technology client on a remote, contract basis out of Miami.",
   "Ran delivery across creative, design and engineering partners to keep releases on schedule."]),
 ("Media.Monks", "Senior Program Manager, Lifecycle, Contract", "09/2023 – 12/2023", "Meta (embedded)",
  ["Led cross-functional teams to execute CRM campaigns, increasing customer engagement and improving retention through data-driven strategies.",
   "Managed and developed product marketing initiatives, enhancing customer re-engagement and improving affordability for targeted segments.",
   "Collaborated with creative, performance marketing and analytics teams to build integrated marketing solutions that addressed customer needs and boosted loyalty."]),
 ("Left Field Labs", "Interactive Producer", "08/2021 – 08/2023", "Google, Meta, Amazon, DataRobot, Superblue",
  ["Produced a variety of projects including AR, VR, app and website development and interactive experiences.",
   "Ideated, structured and responded to RFPs with budget, schedule and concept pitch decks.",
   "Created schedules, ran meetings, determined burn rates and problem-solved all facets of a project.",
   "Managed multiple projects at once as the primary producer lead."]),
 ("Crafted.LA", "Marketing Manager", "05/2020 – 09/2021", "Jane Fonda, Pac Sun, Urban Outfitters, Weelicious, Untitled Talent Agency",
  ["Facilitated celebrity capsule collections with initial creative proposal, deal structure and marketing plans.",
   "Created and maintained WordPress and Shopify stores while working with the fulfillment center on order requests.",
   "Designed and ran marketing campaigns for Shopify Email and Instagram Ads.",
   "Maintained relationships with talent managers and brought in client projects."]),
 ("RPA", "Digital Producer", "05/2018 – 03/2020", "Honda and Acura",
  ["Ran cross-functional team sprints to add enhancements to Honda's website using Agile methodology.",
   "Managed project needs with Creative and UX teams to design and document site enhancements.",
   "Handled tagging requirements and reporting, working closely with Analytics and Media teams.",
   "Documented component capabilities for multiple web properties."]),
 ("Razorfish / Publicis.Sapient", "Digital Producer", "02/2016 – 03/2018", "Honda and Acura",
  ["Led content-management efforts from business request to production release for the Honda Automotive website.",
   "Managed a content-authoring team of 6 on-site authors and 2 offshore developers.",
   "Collaborated with the creative team to ensure deliverables were precise, including asset preparation in Photoshop.",
   "Worked with the Program Director to plan content roles, processes and project-plan enhancements for releases."]),
 ("Zimmerman Advertising", "Digital Account Manager", "10/2014 – 02/2016", "Keyes Automotive Group and other local dealer groups",
  ["Managed each client's digital strategy, including Google paid search, social ads and website content, at ~$20k per month.",
   "Implemented A/B testing on paid social campaigns and reported weekly, resulting in 25% more optimized spend.",
   "Executed multiple Google AdWords campaigns from conception to execution."]),
 ("Mr. 305 Inc.", "Marketing Coordinator &amp; Designer", "Miami, FL", "Pitbull's record label",
  ["Handled website updates, social posts, album covers, merchandise and banner ads for digital and physical products promoted to millions."]),
]

def about_page():
    root = ''
    jobs = ''.join(f'''<li class="resume__item">
      <div class="resume__when">{when}</div>
      <div class="resume__what"><h3>{co}</h3><p class="resume__role">{role}</p><p class="resume__clients">Clients: {clients}</p>
      <ul>{''.join(f'<li>{b}</li>' for b in bullets)}</ul></div></li>''' for co, role, when, clients, bullets in RESUME)
    body = f'''
<body>
<main class="page page--about">
  {header(root, 'about')}
  <section class="resume" aria-label="Resume">
    <div class="resume__inner">
      <div class="resume__head"><span class="case-number">experience</span><a class="case-button case-button--small" href="{mailto('Work together?')}" data-click-bounce>Get in touch</a></div>
      <ol class="resume__list">{jobs}</ol>
      <div class="resume__contact"><a href="{mailto('Work together?')}">{SITE['email']}</a><a href="{telto()}">{SITE['phone']}</a><span>{SITE['location']}</span></div>
    </div>
  </section>
  {fab(root)}
  {footer(root)}
</main>
<script src="{root}{v('main.js')}"></script>
</body></html>'''
    return head("About — Michael Jacques", "Freelance producer and designer in Fort Lauderdale working across AI, design, marketing and development.", root) + body

def case_page(c, idx):
    root = '../'
    nxt = ALL[(idx + 1) % len(ALL)]
    prv = ALL[(idx - 1) % len(ALL)]
    meta = ''.join(f'<div class="case-meta__item"><span class="case-meta__label">{k}</span><span class="case-meta__value">{v}</span></div>' for k, v in c['meta'])
    paras = ''.join(f'<p>{p}</p>' for p in c['body'])
    shots = ''.join(f'<figure class="case-shot"><img src="{root}{g}" alt="{plain_title(c)} screenshot {i+1}" loading="lazy" decoding="async"></figure>' for i, g in enumerate(c.get('gallery', [])))
    video = f'<figure class="case-shot case-shot--video"><iframe src="https://www.youtube.com/embed/{c["video"]}" title="{plain_title(c)} video" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></figure>' if c.get('video') else ''
    num = c.get('num', '')
    body = f'''
<body>
<main class="page page--case" data-case-id="{c['slug']}">
  {header(root, 'work')}
  <a class="case-contact" href="{mailto('About ' + plain_title(c))}" data-click-bounce>Ask about this project</a>
  <a class="case-back" href="{root}index.html#{c['slug']}" data-click-bounce><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H6M12 5l-7 7 7 7"/></svg><span class="case-back__label">Gallery</span></a>
  <section class="case-open-hero" data-layout="center" aria-label="{plain_title(c)}">
    <div class="case-frame case-frame--open">
      <span class="case-number" aria-hidden="true">{'case '+num if num else 'archive'}</span>
      <div class="case-phone-mask case-phone-mask--open" aria-hidden="true">{device(c).replace('{root}', root)}</div>
      <div class="case-frame__safe" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <div class="case-cover"><div class="case-cover__content">
        {crest(c)}
        {title_html(c)}
        <div class="case-tags">{''.join(f'<span class="case-tag">{t}</span>' for t in c['tags'])}</div>
      </div></div>
    </div>
  </section>
  <section class="case-page-body">
    <div class="case-page-body__inner">
      <div class="case-meta">{meta}</div>
      <p class="case-intro"><span class="case-name">{c['client']}</span> — {c.get('summary', c['body'][0])}</p>
    </div>
  </section>
  <section class="case-story">
    <div class="case-story__inner">
      <div class="case-story__text">{paras}</div>
      <div class="case-shots">{video}{shots}</div>
    </div>
  </section>
  <nav class="case-next" aria-label="Next case">
    <a class="case-next__link case-next__link--prev" href="{prv['slug']}.html" data-click-bounce><span class="case-next__kicker">Previous</span><span class="case-next__title">{plain_title(prv)}</span></a>
    <a class="case-next__link" href="{nxt['slug']}.html" data-click-bounce><span class="case-next__kicker">Next case</span><span class="case-next__title">{plain_title(nxt)}</span><span class="case-next__arrow" aria-hidden="true"></span></a>
  </nav>
  {fab(root)}
  {footer(root)}
</main>
<script src="{root}{v('main.js')}"></script>
</body></html>'''
    return head(f"{plain_title(c)} — Michael Jacques", c.get('summary', c['body'][0]), root) + body


# ---------------------------------------------------------------- chat view
EXTRA_KW = {
  "verizon-ride": ["verizon","ride","telly","led","puck","touch table","activation"],
  "superblue": ["superblue","super blue","jr","niantic","miami art","gallery app","time magazine"],
  "google-dei-site": ["google","games","dei","diversity","pledge","inclusiv"],
  "meta-quest-dev-site": ["meta","quest","developer","oculus","vr site"],
  "datarobot-event": ["datarobot","data robot","summit","booth","ai summit"],
  "honda-website": ["honda","automobiles","configurator","dealer"],
  "datarobot-aix": ["aix","virtual event","bizzabo","virtual summit"],
  "datarobot-roadshow": ["roadshow","road show","9.0","15 cities","lunch and learn"],
  "facebook-portal": ["portal","facebook","reality labs","conversational","assistant"],
  "meta-quest-social": ["quest social","social campaign","developer social"],
  "crafted-la": ["crafted","pac sun","pacsun","urban outfitters","capsule","apparel","candle","jane fonda"],
  "acura-website": ["acura","luxury vehicle"],
  "zimmerman-advertising": ["zimmerman","dealership","dealer group","keyes","paid search"],
  "mr-305": ["305","mr 305","pitbull","record label","album","merch","miami label"],
}

def chat_data():
    projects = []
    for c in ALL:
        words = set(EXTRA_KW.get(c['slug'], []))
        words.add(c['slug'].replace('-', ' '))
        words.add(c['client'].lower())
        projects.append(dict(
            slug=c['slug'], client=c['client'], title=c['title'], plain=plain_title(c),
            summary=c.get('summary', c['body'][0])[:190],
            body=c['body'][:1], meta=c['meta'][:2], tags=c['tags'],
            kw=sorted(w for w in words if len(w) > 2),
        ))
    data = dict(
        projects=projects,
        intents=[dict(id=i['id'], kw=i['kw'], w=i.get('w', 1), a=i['a'],
                      cards=i.get('cards', []), chips=i.get('chips', [])) for i in CC.INTENTS],
        starters=CC.STARTERS,
        projectChips=CC.PROJECT_CHIPS,
        logo=LOGO_SVG,
    )
    return 'window.MJ=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'

def chat_page():
    H_ = CC.HERO
    starters = ''.join(f'<button type="button">{H.escape(s)}</button>' for s in CC.STARTERS)
    return f'''<!doctype html>
<html lang="en" data-mode="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Michael Jacques — Ask the Portfolio</title>
<meta name="description" content="A conversational portfolio. Ask Michael Jacques about the projects, the clients and how a production actually runs." />
<meta property="og:type" content="website" />
<meta property="og:title" content="Michael Jacques — Ask the Portfolio" />
<meta property="og:description" content="A conversational portfolio. Ask about the projects, the clients and how a production actually runs." />
<meta property="og:image" content="{SITE['url']}/assets/og.png" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" type="image/svg+xml" href="assets/icons/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" />
<link rel="stylesheet" href="{v('chat.css')}" />
</head>
<body>
<div class="chat-shell">
  <header class="chat-header">
    <a class="brand" href="index.html" aria-label="Michael Jacques">{LOGO_SVG}<span class="brand__name">Michael Jacques</span></a>
    <div class="header-tools">
      <button class="icon-btn" id="mode" type="button" aria-label="Toggle light and dark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>
      </button>
      <a class="icon-btn" href="{mailto()}" aria-label="Email Michael" title="Email Michael">
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1.8 2.5h12.4c.7 0 1.3.6 1.3 1.3v8.4c0 .7-.6 1.3-1.3 1.3H1.8c-.7 0-1.3-.6-1.3-1.3V3.8c0-.7.6-1.3 1.3-1.3zm.4 1.6v.6L8 8.7l5.8-4V4.1zm0 2.5v5.3h11.6V6.6L8 10.5z"/></svg>
      </a>
      <a class="view-link" href="index.html">Classic view
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7"/></svg></a>
    </div>
  </header>

  <div class="chat-scroll">
    <div class="chat-inner">
      <section class="hero">
        <h1>{H.escape(H_['pre'])} <span class="hl">{H.escape(H_['highlight'])}</span> {H.escape(H_['post'])}</h1>
        <p>{H.escape(H_['sub'])}</p>
        <div class="hero__meta">
          <span><b>12</b> years producing</span>
          <span><b>Google · Meta · Amazon</b></span>
          <span><b>Telly</b> winner</span>
          <span>Fort Lauderdale</span>
        </div>
      </section>
    </div>
  </div>

  <div class="composer-wrap">
    <button class="starters-btn" type="button" aria-haspopup="true" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:13px;height:13px"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-8.1A8.4 8.4 0 1 1 21 11.5z"/></svg>
      Not sure what to ask?
    </button>
    <div class="starters" role="menu" aria-label="Conversation starters">
      <h2>Try one of these</h2>
      {starters}
    </div>
    <form class="composer" autocomplete="off">
      <button class="pulse" type="submit" aria-label="Send">
        <span class="pulse__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      </button>
      <label class="field">
        <span class="sr-only">Ask about Michael's work</span>
        <input id="ask" name="ask" type="text" placeholder="Ask about a project, a client, the process…" />
        <button class="send" type="submit" aria-label="Send question">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>
      </label>
    </form>
    <p class="composer__note">Curated answers from Michael's own case notes · <a href="index.html" style="color:inherit">browse the classic portfolio</a></p>
  </div>
</div>
<script src="{v('chat-data.js')}"></script>
<script src="{v('chat.js')}"></script>
</body></html>'''


# ---------------------------------------------------- classic view (open head)
ITEM_BLURB = {
 "verizon-ride": "An award-winning immersive activation: LED floor, LED walls and a 70-inch touch table driven by a physical puck. Move the puck, the whole room answers.",
 "superblue": "An app that made experiential art participatory \u2014 built with Niantic and the artist JR, so people could leave photos and notes in AR at real locations.",
 "google-dei-site": "A Google for Games site that turned a DEI message into action: pledge your support, download a share asset, pass it on.",
 "meta-quest-dev-site": "The Meta Quest developer site redesign, with an illustrated system built out of the Quest gradient and carried across every page.",
 "datarobot-event": "A booth we designed and fabricated: private demo stations, a merch and check-in stand, and a mini theatre. It toured the biggest events in AI.",
 "honda-website": "Four years on honda.com across two agencies and two redesign systems \u2014 inventory tools, payment estimators, a build-your-own configurator.",
 "datarobot-aix": "The fully virtual summit. Live sessions, chat, on-demand content and analytics across the whole event, run on Bizzabo.",
 "datarobot-roadshow": "The 9.0 launch taken to 15+ cities with partners like Google, EY and Amazon. Locations, swag, scheduling and a site for every stop.",
 "facebook-portal": "Conversational design for the Facebook Reality Labs team: product concepts, designs and full UX prototypes for Portal.",
 "meta-quest-social": "The Quest developer system carried into social \u2014 product announcements, feature updates and event recaps, on short deadlines.",
 "crafted-la": "Apparel and candle concepts for Pac Sun, Urban Outfitters and Fashion Nova, plus the celebrity capsule collections behind them.",
 "acura-website": "The luxury counterpart to Honda: fewer vehicles, far richer content per vehicle, and a site built to make that feel effortless.",
 "zimmerman-advertising": "Paid social and search for dealer groups at ~$20k a month per client, with A/B testing that delivered 25% more optimized spend.",
 "mr-305": "Where it started \u2014 Pitbull's label in Miami. Album covers, merch, banner ads and social, promoted to millions.",
}

def head_data():
    from PIL import Image
    items = []
    for c in ALL:
        p = f"assets/head/items/{c['slug']}.png"
        ar = 1.0
        if os.path.exists(p):
            w, h = Image.open(p).size
            ar = round(w / h, 3)
        items.append(dict(slug=c['slug'], client=c['client'], title=plain_title(c),
                          blurb=ITEM_BLURB.get(c['slug'], c.get('summary', '')),
                          meta=c['meta'][:2], ar=ar))
    return 'window.MJ_HEAD=' + json.dumps(dict(
        items=items, base='assets/head/items/', art='assets/items/', doodles='assets/head/doodles.webp'
    ), ensure_ascii=False, separators=(',', ':')) + ';\n'

def gallery_page():
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Michael Jacques \u2014 What\u2019s In My Head</title>
<meta name="description" content="Open the head and every project Michael Jacques has produced falls out. Click one to read the case." />
<meta property="og:type" content="website" />
<meta property="og:title" content="Michael Jacques \u2014 What\u2019s In My Head" />
<meta property="og:description" content="Open the head and every project falls out. Click one to read the case." />
<meta property="og:image" content="{SITE['url']}/assets/og.png" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" type="image/svg+xml" href="assets/icons/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@400;500;600;700;800&display=swap" />
<link rel="stylesheet" href="{v('head.css')}" />
</head>
<body>
<header class="bar">
  <a class="bar__brand" href="index.html" aria-label="Michael Jacques">{LOGO_SVG}<span>Michael Jacques</span></a>
  <nav class="bar__nav" aria-label="Sections">
    <a href="about.html">About</a>
    <a href="{mailto()}">Contact</a>
    <a class="is-red" href="ask.html">Ask me anything</a>
  </nav>
</header>

<main class="stage">
  <div class="headwrap">
    <div class="spill"></div>
    <button class="head" type="button" aria-expanded="false" aria-label="Open my head and see the work">
      <span class="head__hint">Ever wondered what\u2019s in my head?</span>
      <img class="head__face" src="assets/head/head-open.webp" alt="Illustration of Michael Jacques" width="793" height="1048" />
      <img class="head__cap" src="assets/head/cap.webp" alt="" aria-hidden="true" />
    </button>
  </div>
</main>

<button class="closeall" type="button">Put it back</button>
<div class="cardveil" aria-live="polite"></div>

<script src="{v('head-data.js')}"></script>
<script src="{v('head.js')}"></script>
</body></html>'''

os.makedirs('case', exist_ok=True)
# data files first: the pages hash them for cache-busting
open('chat-data.js', 'w').write(chat_data())
open('head-data.js', 'w').write(head_data())
open('wheel.html', 'w').write(index_page())
open('index.html', 'w').write(gallery_page())
open('gallery.html', 'w').write(
  '<!doctype html><html lang="en"><head><meta charset="UTF-8">'
  '<title>Michael Jacques</title>'
  '<meta http-equiv="refresh" content="0; url=index.html">'
  '<script>location.replace("index.html"+location.hash)</script></head>'
  '<body><a href="index.html">Continue to michaeljacques.work</a></body></html>')
open('ask.html', 'w').write(chat_page())
open('about.html', 'w').write(about_page())
for i, c in enumerate(ALL):
    open(f'case/{c["slug"]}.html', 'w').write(case_page(c, i))
print('built', 5 + len(ALL), 'pages')
