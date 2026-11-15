ARUN PLASTICS WEBSITE + AI CHATBOT - SETUP GUIDE
=================================================

FOLDER LAYOUT
  public/                    The website (this is the only folder that goes online)
    index.html, sign-boards.html, printing.html, branding.html, display.html, terms.html, privacy.html
    css/style.css            Site design
    css/chatbot.css          Chat widget design            (NEW)
    js/main.js               Site scripts
    js/chatbot.js            Chat widget + settings        (NEW)
    images/                  Logo, gallery, slider, clients
  netlify/functions/chat.js  Secure AI endpoint (holds the API key on the server)   (NEW)
  netlify/functions/lead.js  Receives finished enquiries                            (NEW)
  netlify/lib/knowledge.js   YOUR BUSINESS INFORMATION for the AI                   (NEW)
  netlify/lib/prompt.js      Builds the AI instructions from knowledge.js           (NEW)
  netlify.toml, package.json, .env.example, .gitignore                              (NEW)

1) WHAT WAS CHANGED
  Chatbot: the green WhatsApp bubble on every page is replaced by the AI chat button
  (the red call button is unchanged). Each HTML page got 2 lines: chatbot.css and chatbot.js.
  Other requested changes: removed the "Example images shown..." text; removed the
  "Need a Quick Quote?" card (contact grid is now 2 columns); the "View all sign boards /
  printing / branding / display" links now jump to the Portfolio and select LED Board /
  UV Boards / Vehicle Branding / Standee. Navigation, footer, forms, colours and SEO are untouched.

2) HOW THE CHATBOT WORKS
  Visitor types in the chat window (public/js/chatbot.js)
    -> POST /.netlify/functions/chat  (netlify/functions/chat.js, runs on the server)
    -> chat.js adds your business information + rules and calls the AI API with the secret key
    -> the AI answers ONLY from netlify/lib/knowledge.js and returns the reply + collected lead details
    -> the reply appears in the chat.
  When name + phone + service are collected, the chat sends the lead to /.netlify/functions/lead
  and shows a "Send enquiry on WhatsApp" button with all details pre-filled.
  The "Chat on WhatsApp" button is always visible in the chat window.
  If the AI cannot be reached (no key, offline, error) the chat shows an honest message with a
  WhatsApp button. It never makes up answers.

3) WHERE THE AI API KEY GOES  (never in HTML/JS!)
  Production: Netlify > Site configuration > Environment variables > add
      ANTHROPIC_API_KEY = your key
  Local testing: copy .env.example to .env and paste the key there (.env is never uploaded).
  Optional variables: CLAUDE_MODEL (default claude-haiku-5-5), ALLOWED_ORIGINS (your domain),
  LEAD_WEBHOOK_URL (Zapier/Make/Google Sheet/Slack hook that receives every finished enquiry).
  Get a key at console.anthropic.com and SET A MONTHLY SPEND LIMIT there.

4) CONFIGURE THE BUSINESS KNOWLEDGE
  Open netlify/lib/knowledge.js. Edit address, services, process, delivery, FAQs.
  IMPORTANT - fill these in so the bot can answer them:
    businessHours   (empty now, so the bot tells customers to call)
    pricing.priceGuide   (empty now, so the bot gives NO prices and collects details for a quotation)
  Empty fields are treated as "not provided". The bot will not guess them.
  Redeploy after editing.

5) CHANGE THE WHATSAPP NUMBER
  public/js/chatbot.js   -> whatsapp: '918610470488'  (country code first, no + or spaces)
  netlify/lib/knowledge.js -> contact.phone / contact.whatsapp (what the AI tells customers)
  Other places on the site (footer, buttons, contact section): Find & Replace 8610470488.

6) CHANGE THE WELCOME MESSAGE / QUICK BUTTONS
  public/js/chatbot.js -> CONFIG.welcome and CONFIG.chips (label, message sent to AI, service name).
  Colours: public/css/chatbot.css uses the site variables --red and --orange.

7) TEST LOCALLY
  1. Install Node.js 18+  (nodejs.org)
  2. In this folder:  npm install -g netlify-cli
  3. Copy .env.example to .env and add ANTHROPIC_API_KEY
  4. Run:  netlify dev      then open http://localhost:8888
  5. Click the chat button and try: "I need a glow sign board", "What are your timings?",
     "How much for visiting cards?" (it should NOT invent prices/hours).
  Opening index.html by double-click still shows the website, but the chat needs "netlify dev"
  (otherwise it shows the "not reachable" message + WhatsApp button).

8) DEPLOY SAFELY
  IMPORTANT: Netlify's drag-and-drop (app.netlify.com/drop) does NOT run functions. Use one of:
   a) GitHub: upload this whole folder to a PRIVATE GitHub repo, then Netlify > Add new site >
      Import from Git. (.gitignore already keeps .env out.)
   b) Netlify CLI:  netlify login  ->  netlify init  ->  netlify deploy --prod
  Then add ANTHROPIC_API_KEY in Netlify environment variables and redeploy.
  Checklist: key only in Netlify env vars; never paste it into any file in public/; set ALLOWED_ORIGINS
  to your domain; set a spend limit in the AI console; test the live chat after deploying.
  Built-in protections: per-visitor rate limit, input length limits, 14-message memory, strict rules
  that stop the bot from inventing prices/hours or following "ignore your rules" messages.
  Another host (Vercel, own server)? chat.js is a plain handler: POST {messages, lead, image} ->
  {reply, lead, suggestions}. Point CONFIG.endpoint in chatbot.js at your own endpoint.

NOTES ABOUT YOUR CONTENT
  - The bot also knows Visiting Cards, Letterheads, Bill Books, Envelopes, Pamphlets, Brochures and
    Rubber Stamps (from your brief). These are not listed on the website pages yet. Adding pages/
    sections for them would help SEO.
  - Placeholders still on the site: business hours text, the numbers strip (10+/500+/1200+),
    client logo names, sample gallery images, FAQ/process wording, Terms and Privacy text.

------------------------------------------------------------------
NEW: TERMS / PRIVACY POP-UPS, MAKING VIDEOS, TESTIMONIALS
------------------------------------------------------------------
TERMS & CONDITIONS / PRIVACY POLICY POP-UPS
  The footer links open a pop-up (close with X, Esc or a click outside). The text is in ONE place:
  public/js/legal.js (edit the text, the contact email and "updated" date at the top).
  terms.html and privacy.html show the same text as normal pages (for search engines and sharing).
  Have a lawyer review the wording before you rely on it.

MAKING VIDEOS (4 vertical 9:16 players)
  1. Make vertical videos (1080x1920 or 720x1280, MP4/H.264, under about 20 MB each).
  2. Name them making-video-1.mp4 ... making-video-4.mp4 and put them in public/videos/
  3. Change the 4 captions in public/index.html (search "VIDEOS"). Optional: replace the cover images in
     public/images/video-posters/ with a frame from each video (keep the same file names).
  Until a video file exists the card shows "Video coming soon". Only one video plays at a time.
  A static website cannot receive uploads from the browser, so videos are added as files (step 2),
  then you redeploy. Large videos are better hosted on YouTube/Vimeo/Cloudflare Stream - ask if you want that.
  Test mode: add <script>window.ARUN_OWNER_TOOLS = true</script> above the media.js line in index.html
  to get "Upload video" buttons and an "Add review" form for trying things on your own computer
  (nothing is saved for visitors). Remove it before going live.

TESTIMONIALS (client reviews slider)
  Search "REVIEWS" in public/index.html. Each <figure class="rcard"> is one review:
  copy a block, change the text, name and business, and delete the word "sample" from class="rcard sample".
  The slider auto-moves every 6 seconds, has arrows and swipe, and shows 3 / 2 / 1 reviews per screen.
  The 3 cards now are PLACEHOLDERS - replace them with real reviews (with the client's permission) before launch.
  For a client photo, replace <span class="rav">C</span> with <img class="rav" src="images/reviews/ravi.jpg" alt="Ravi">.

MOBILE MENU, BACK-TO-TOP, LOADING SCREEN
  public/js/ui.js builds the mobile menu (3-line button in the top bar on phones) from the links in the header,
  and the up-arrow button at the bottom right (appears after scrolling, jumps back to the top).
  To add or rename a menu link, edit the links inside <nav> in the page header; the phone menu copies them.
  Loading screen: the "WELCOME TO" text and the loading line are shifted slightly right in css/style.css
  (search "loading screen"). Change .09 to move them more or less.

------------------------------------------------------------------
EDITING THE WEBSITE (everything below is inside the public/ folder)
------------------------------------------------------------------
  Phone / email / address / Instagram : Find & Replace across public/*.html
  Business hours                      : search "Hours" in public/index.html
  Numbers strip                       : search data-n= in public/index.html
  Slider speed                        : public/js/main.js -> SLIDE_DELAY (8000 = 8 seconds)
  Gallery photos                      : search "GALLERY" in public/index.html; put photos in
                                        public/images/gallery/<category>/ and change src + alt
  Hero slider images                  : public/images/slider/slide-1..4.svg + the 4 <img class="ex"> tags
  Client logos                        : put in public/images/clients/ and replace the <div class="lg"> blocks
  Keyword pages (SEO)                 : public/sign-boards.html, printing.html, branding.html, display.html
  SEO                                 : replace YOUR-DOMAIN.com in public/robots.txt and sitemap.xml;
                                        add canonical + og:image lines (see comment in <head>);
                                        submit sitemap.xml in Google Search Console.
  Theme                               : white on all devices; brand colours at top of public/css/style.css
