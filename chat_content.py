# -*- coding: utf-8 -*-
"""Hand-written knowledge base for the conversational portfolio.
Every answer is Mike's own material — no invented facts."""

BIO_SHORT = ("I'm Michael Jacques — a digital manager and creative producer in Los Angeles. "
             "I take innovative projects from RFP to launch: web, apps, AR, and experiential.")

# Each intent: keywords (weighted), answer text, optional project slugs to render, follow-up chips.
INTENTS = [
 dict(id="greeting", kw=["hi","hello","hey","yo","howdy","sup","good morning","good evening"], w=3,
   a=["Hey — I'm Michael's portfolio, and I answer in his voice.\n\nHe's a digital manager and creative producer in LA who takes innovative projects from RFP to launch. Ask about a project, a client, how he runs a production, or what he's looking for next."],
   chips=["What projects have you worked on?","Who have you worked with?","How do you run a project?"]),

 dict(id="who", kw=["who are you","about you","about michael","tell me about yourself","introduce","your background","who is michael","bio"], w=3,
   a=["I'm Michael Jacques — a digital manager and creative producer based in Los Angeles.\n\nOver the years I've built a pretty unique set of experience managing and producing innovative work: web design, social campaigns, AR experiences, experiential events. My client list includes Google, Meta, Amazon, Honda and more. I bring a positive mentality to every team, and I'm always looking to push the creative to the next level.\n\nRight now I'm an Interactive Producer at Left Field Labs, where I lead projects for Google, Meta, Amazon, DataRobot and Superblue."],
   chips=["What projects have you worked on?","Walk me through your career","What are you looking for next?"]),

 dict(id="projects", kw=["project","projects","work","portfolio","case stud","show me","what have you done","what have you built","best work","examples"], w=2,
   a=["Here's a slice of the work. Most of it lives where strategy meets production — big brands, tight timelines, and formats that didn't exist last year.\n\nThese six are the ones I'd lead with:"],
   cards=["verizon-ride","superblue","google-dei-site","meta-quest-dev-site","datarobot-event","honda-website"],
   chips=["Tell me about Verizon RIDE","What was the hardest one?","Show me the AR and VR work"]),

 dict(id="clients", kw=["client","clients","brand","brands","who have you worked with","companies","worked for","logos"], w=2,
   a=["The list covers tech, automotive, entertainment and enterprise:\n\n**Google** — a Google for Games site built around DEI pledges.\n**Meta** — the Quest developer site redesign and the social campaign that followed.\n**Verizon** — an award-winning experiential activation for their New Business Incubation team.\n**Superblue** — an AR art app with Niantic and the artist JR.\n**DataRobot** — a fabricated booth, a 15-city roadshow and a fully virtual summit.\n**Honda and Acura** — four years on honda.com across two agencies.\n**Amazon**, **Pitbull's Mr. 305**, **Pac Sun**, **Urban Outfitters**, **Jane Fonda** and a long tail of dealer groups.\n\nAgency side: Left Field Labs, RPA, Razorfish / Publicis.Sapient, Zimmerman Advertising, Crafted.LA."],
   cards=["google-dei-site","meta-quest-dev-site","verizon-ride"],
   chips=["Tell me about the Meta work","What did you do for Google?","Walk me through your career"]),

 dict(id="resume", kw=["resume","cv","career","experience","history","where have you worked","jobs","roles","timeline","how long"], w=2,
   a=["Twelve years, five shops, one throughline — producing digital work that has to ship.\n\n**Left Field Labs** — Interactive Producer, 2021 to now. AR, VR, apps and sites for Google, Meta, Amazon, DataRobot and Superblue. I respond to RFPs with budget, schedule and concept decks, then run the projects I win.\n\n**Crafted.LA** — Marketing Manager, 2020 to 2021. Celebrity capsule collections, Shopify and WordPress storefronts, email and Instagram campaigns.\n\n**RPA** — Digital Producer, 2018 to 2020. Agile sprints on Honda's website with creative, UX, analytics and media.\n\n**Razorfish / Publicis.Sapient** — Digital Producer, 2016 to 2018. Led content management for honda.com with a team of six authors and two offshore developers.\n\n**Zimmerman Advertising** — Digital Account Manager, 2014 to 2016. Roughly $20k a month in paid search and social per client; A/B testing that cut wasted spend by 25%.\n\n**Mr. 305 Inc.** — where it started. Marketing and design for Pitbull's label in Miami."],
   chips=["What are you strongest at?","Tell me about Left Field Labs","How do you run a project?"]),

 dict(id="skills", kw=["skill","skills","strength","strong","good at","specialty","specialize","what do you do","capabilit","services","offer"], w=2,
   a=["Production is the core skill: I turn a vague brief into a schedule, a budget and a team that hits the date.\n\nAround that:\n\n**Pitching** — RFP responses with budget, schedule and concept decks. Several of the projects here started as decks I wrote.\n**Running the room** — cross-functional sprints with creative, UX, engineering, analytics and media.\n**Emerging formats** — AR, VR and interactive installations, where nobody has a template and you're inventing the process as you go.\n**Events** — booths, roadshows and virtual summits, including run-of-show and on-site support.\n**Web at scale** — four years on an automotive site with a content team and a release calendar.\n\nAnd a positive mentality. Producers set the temperature of a project, so that part matters more than it sounds."],
   chips=["How do you run a project?","Show me the AR and VR work","What projects have you worked on?"]),

 dict(id="process", kw=["process","how do you work","approach","methodology","run a project","manage","produce","workflow","agile","sprint"], w=2,
   a=["Every project runs on the same spine, whatever the format.\n\n**Scope it honestly.** I'd rather have the hard conversation in week one than in week nine. Budget, schedule and burn rate get set before anyone opens a design file.\n\n**Put the right people in the room.** Creative, UX, engineering, analytics — and then keep them talking. Most project failures are communication failures wearing a technical costume.\n\n**Protect the creative.** The producer's job isn't to say no. It's to find the version of the ambitious idea that can actually be built in the time you have.\n\n**Stay on site.** For events and installations I'm there for the run of show. Things break, and they break faster when nobody with decision-making authority is standing there.\n\nOn the Honda work that meant Agile sprints and a release calendar. On Verizon RIDE it meant a fabrication partner, an LED vendor and a touch-table build all landing on the same day."],
   chips=["What was the hardest one?","Tell me about the events work","What are you looking for next?"]),

 dict(id="ar", kw=["ar","vr","xr","augmented","virtual reality","immersive","quest","headset","3d","spatial","niantic","metaverse"], w=3,
   a=["Emerging formats are the most fun part of the job, because there's no template to fall back on.\n\n**Superblue** — an app that let people walk into a real location and leave photos and notes in AR, built with Niantic and the artist JR. Time and Complex both covered it.\n\n**Meta Quest** — the developer site redesign, then the social system that carried the same illustrated language across their channels.\n\n**Verizon RIDE** — not AR, but the same instinct: an immersive set with LED floor and walls wired to a 70-inch touch table, driven by a physical puck.\n\n**Facebook Portal** — conversational design concepts and full UX prototypes for the Reality Labs team."],
   cards=["superblue","meta-quest-dev-site","verizon-ride","facebook-portal"],
   chips=["Tell me about Superblue","Tell me about Verizon RIDE","What projects have you worked on?"]),

 dict(id="events", kw=["event","events","experiential","booth","activation","roadshow","conference","summit","fabrication","trade show","on-site","live"], w=3,
   a=["Events are production with no undo button, which is exactly why I like them.\n\n**DataRobot AI Summit** — a booth we designed and fabricated with a partner: private demo stations, a check-in and merch stand, and a mini theatre with seating. It toured the biggest events in AI.\n\n**DataRobot Roadshow** — the 9.0 product launch taken to 15+ cities with partners like Google, EY and Amazon. Locations, swag, scheduling and a site per city.\n\n**DataRobot AIX** — the fully virtual one. Live sessions, chat, on-demand content, all on Bizzabo, with analytics across the whole event.\n\n**Verizon RIDE** — the immersive activation, and the one that won a Telly."],
   cards=["datarobot-event","datarobot-roadshow","datarobot-aix","verizon-ride"],
   chips=["Tell me about Verizon RIDE","How do you run a project?","What projects have you worked on?"]),

 dict(id="web", kw=["website","websites","web","site","sites","dot com","honda.com","frontend","cms","content management"], w=2,
   a=["The web work splits into two kinds.\n\n**Enterprise at scale** — four years on Honda's .com across Razorfish and RPA, through two different redesign systems. Inventory tools, payment estimators, a build-your-own configurator, dealer browsing. At Razorfish I led content management with six on-site authors and two offshore developers.\n\n**Campaign and product sites** — the Google for Games DEI site with interactive pledges and downloadable share assets, the Meta Quest developer site, and the Acura vehicles site where the luxury approach meant fewer cars and much richer content per car."],
   cards=["honda-website","google-dei-site","meta-quest-dev-site","acura-website"],
   chips=["What did you do for Google?","Tell me about the Honda work","What are you looking for next?"]),

 dict(id="social", kw=["social","instagram","campaign","paid","ads","advertising","marketing","content","posts"], w=2,
   a=["Social shows up in a few places on the list.\n\n**Meta Quest** — carrying the developer site's illustrated system into their channels: product announcements, feature updates, event recaps. Secured information, tight deadlines.\n\n**Zimmerman Advertising** — paid social and search for dealer groups, roughly $20k a month per client. A/B testing on paid social that got 25% more optimized spend, reported weekly.\n\n**Crafted.LA** — Shopify Email and Instagram Ads for celebrity capsule collections.\n\n**Mr. 305** — album covers, merch, banner ads and social for Pitbull's label, promoted to millions."],
   cards=["meta-quest-social","zimmerman-advertising","crafted-la","mr-305"],
   chips=["Tell me about Mr. 305","Walk me through your career","Who have you worked with?"]),

 dict(id="awards", kw=["award","awards","telly","recognition","press","featured","won","win"], w=3,
   a=["**Telly Award** for Verizon RIDE — the immersive activation for Verizon's New Business Incubation team.\n\n**Superblue** picked up press in Time and Complex when the JR and Niantic AR experience launched.\n\nThe rest of the recognition is the quieter kind: clients who come back. DataRobot went from one booth to a 15-city roadshow to a virtual summit. Meta went from the developer site to the social campaign."],
   cards=["verizon-ride","superblue"],
   chips=["Tell me about Verizon RIDE","Tell me about Superblue","What projects have you worked on?"]),

 dict(id="hardest", kw=["hardest","challenge","difficult","proud","favorite","favourite","toughest","biggest","learned","failure","wrong"], w=3,
   a=["**Verizon RIDE** was the hardest and the one I'm proudest of. An LED floor, LED walls and a 70-inch touch table all had to talk to each other, and a puck on the table had to trigger the right content on the right surface at the right moment. Fabrication, vendors and content production all converged on one install date. It won a Telly.\n\n**Honda** was hard in a completely different way — four years, two agencies, two redesign systems, a content team and a release calendar that never stopped. Nothing dramatic, just relentless.\n\nThe lesson from both: the schedule is the deliverable. Everything else follows it."],
   cards=["verizon-ride","honda-website"],
   chips=["How do you run a project?","What are you looking for next?","Show me the AR and VR work"]),

 dict(id="looking", kw=["looking for","next","hire","hiring","available","opportunit","open to","role","job","freelance","work together","interested"], w=3,
   a=["I'm open to conversations about producing ambitious digital work — the kind where the format is still being figured out.\n\nWhat I want from the next thing: a team that takes the creative seriously, clients who'll go somewhere new, and enough rope to build the process rather than inherit it.\n\nEasiest way in is michaelsjacques@gmail.com, or (954) 647-9037. I'm in Los Angeles."],
   chips=["How do you run a project?","What are you strongest at?","Who have you worked with?"]),

 dict(id="contact", kw=["contact","email","reach","get in touch","phone","call","linkedin","connect","talk"], w=3,
   a=["**michaelsjacques@gmail.com**\n**(954) 647-9037**\nLos Angeles, CA\n\nEmail is the fastest. Say what you're building and when it has to be live, and I'll tell you honestly whether I'm the right producer for it."],
   chips=["What are you looking for next?","What projects have you worked on?","Who have you worked with?"]),

 dict(id="location", kw=["where","location","based","live","city","los angeles","la","remote","relocate"], w=2,
   a=["Los Angeles. Most of the agency work has been LA-based — Left Field Labs, RPA, Crafted.LA — with earlier years in Miami at Zimmerman and Mr. 305.\n\nThe event work travels. The DataRobot roadshow alone was 15+ cities."],
   chips=["Walk me through your career","Tell me about the events work","How can I reach you?"]),

 dict(id="fun", kw=["fun","hobby","hobbies","outside","personal","interesting","random","weird","pitbull","miami"], w=2,
   a=["The first real job was Pitbull's record label in Miami. I was the marketing coordinator and designer, which meant album covers, merch, banner ads, website updates — whatever came down the pipeline that week.\n\nMerch I designed got sold on tour. Albums I worked on got pressed and released. Starting on physical products that ship to real people is a good way to learn that a deadline is a deadline.\n\nGoing from that to producing AR experiences for Meta is a strange arc, but the job is the same: get the thing made, on time, better than the brief."],
   cards=["mr-305"],
   chips=["Walk me through your career","What projects have you worked on?","What are you looking for next?"]),

 dict(id="why", kw=["why","why should","why hire","what makes","different","unique","stand out","value"], w=2,
   a=["Most producers come up through one lane. I came up through several.\n\nI've shipped an enterprise automotive site with a release calendar, an AR app with an artist and Niantic, a fabricated booth that toured the country, a virtual summit on Bizzabo, and paid social for car dealerships. That range means I can scope work that doesn't look like anything I've done before, because most of it didn't when I started it.\n\nThe other half is temperament. I'm the person who keeps the room calm when the install is tomorrow and the LED vendor is late."],
   chips=["How do you run a project?","What was the hardest one?","What are you looking for next?"]),
]

STARTERS = [
  "What projects have you worked on?",
  "Who have you worked with?",
  "Walk me through your career",
  "Show me the AR and VR work",
  "How do you run a project?",
  "What was the hardest one?",
  "What are you looking for next?",
  "How can I reach you?",
]

HERO = dict(
  pre="Michael produces",
  highlight="digital work that ships",
  post="— so his portfolio answers questions instead of making you hunt",
  sub="Ask about the projects, the clients, how a production actually runs. You'll get his own material, in his own words.",
)

# Per-project follow-up answers keyed by slug, used when someone asks about one case.
PROJECT_CHIPS = ["What was your role?","How do you run a project?","What projects have you worked on?"]
