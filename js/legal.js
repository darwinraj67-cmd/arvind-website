/* ARUN PLASTICS - Terms & Conditions and Privacy Policy
   Opens as a pop-up when a footer link with data-legal="terms" / "privacy" is clicked.
   The same text is shown on terms.html and privacy.html. EDIT THE TEXT HERE (one place). */
(function () {
  'use strict';
  var EMAIL = 'arunplasticskdm@gmail.com', PHONE = '8610470488';
  var LEGAL = {
    terms: {
      title: 'Terms &amp; Conditions', updated: 'October 2026',
      intro: 'By accessing our website or using our services, you agree to the following Terms &amp; Conditions.',
      sections: [
        { h: 'Services', p: 'Arun Plastics provides sign board, printing, branding and display services including:',
          list: ['LED &amp; Glow Sign Boards', 'ACP &amp; Acrylic Sign Boards', '3D Letters, SS &amp; Brass Letters', 'Flex, UV, Vinyl &amp; Digital Printing', 'Visiting Cards, Stationery &amp; Rubber Stamps', 'Vehicle, Shop &amp; Corporate Branding', 'Wall Graphics', 'Standees &amp; Exhibition Displays'],
          after: 'Service scope, timelines and costs are confirmed with you before work begins.' },
        { h: 'Quotations and Orders', p: 'Quotations are estimates based on the details you share, such as size, material, quantity and design. Work begins once the order, design and price are confirmed.' },
        { h: 'Client Responsibilities', list: ['Provide accurate sizes, text, logos and artwork.', 'Check and approve the final design or proof before production.', 'Make sure any artwork or content you supply does not infringe anyone else\'s rights.', 'Provide site access and arrange any permission needed from the landlord or authorities for displaying boards.'] },
        { h: 'Design Approval and Changes', p: 'Please review the final design carefully. Once a design is approved, further changes may be charged separately.' },
        { h: 'Colours and Materials', p: 'Printed and lit colours can differ slightly from screens and proofs. Material finish may vary within normal limits.' },
        { h: 'Payments and Cancellation', p: 'Payment terms are agreed when the order is placed. Custom-made items cannot be cancelled once production has started.' },
        { h: 'Delivery and Installation', p: 'Timelines are estimates and may change because of weather, approvals or site conditions.' },
        { h: 'Complaints', p: 'If you find an issue with your order, please contact us promptly so we can inspect it and put it right.' },
        { h: 'Limitation of Liability', p: 'Arun Plastics is not responsible for delays or damage caused by events outside our control, or for permissions and approvals required to display a board or advertisement.' },
        { h: 'Changes to These Terms', p: 'We may update these terms from time to time. The latest version is always on this website.' },
        { h: 'Contact', p: 'Questions about these terms? Email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> or call ' + PHONE + '.' }
      ]
    },
    privacy: {
      title: 'Privacy Policy', updated: 'October 2026',
      intro: 'At Arun Plastics, we value your privacy and are committed to protecting the information you share with us. This Privacy Policy explains how we collect, use and protect it while delivering our sign board, printing and branding services.',
      sections: [
        { h: 'Information We Collect', list: ['Name and business name', 'Phone number, WhatsApp number and email address', 'Business address and location details', 'Project details such as service, size, quantity and reference images', 'Messages sent through our website forms, chat assistant, WhatsApp, email or calls'],
          after: 'We do not collect card, bank or other sensitive personal data through this website.' },
        { h: 'How We Use Your Information', p: 'We use the information you share only to reply to your enquiry, prepare quotations, deliver and install your order, follow up on your project and improve our website and services.' },
        { h: 'AI Chat Assistant', p: 'Messages you type (and images you attach) in the chat assistant are processed by an AI service provider to generate replies. Please do not share passwords or payment details in the chat.' },
        { h: 'Sharing of Information', p: 'We do not sell your information. It is shared only with service providers needed to run our website and communicate with you (such as hosting, messaging and AI services), or when the law requires.' },
        { h: 'Third-Party Services', p: 'This website uses Google Maps and links to WhatsApp and Instagram. These services have their own privacy policies and may set their own cookies.' },
        { h: 'Data Security', p: 'We take reasonable steps to protect your information. No method of transmission over the internet is completely secure.' },
        { h: 'Your Choices', p: 'You can ask us to correct or delete the details you have shared by writing to <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.' },
        { h: 'Contact', p: 'For any privacy question, email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> or call ' + PHONE + '.' }
      ]
    }
  };

  function doc(key) {
    var d = LEGAL[key], h = '<h2 class="lgt">' + d.title + '</h2><p class="lgu">Last updated: ' + d.updated + '</p><p>' + d.intro + '</p>';
    d.sections.forEach(function (s) {
      h += '<h3>' + s.h + '</h3>';
      if (s.p) h += '<p>' + s.p + '</p>';
      if (s.list) h += '<ul>' + s.list.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
      if (s.after) h += '<p>' + s.after + '</p>';
    });
    return h;
  }

  var md, last;
  function build() {
    md = document.createElement('div'); md.className = 'lgm'; md.setAttribute('role', 'dialog'); md.setAttribute('aria-modal', 'true'); md.setAttribute('aria-hidden', 'true');
    md.innerHTML = '<div class="lgw"><button type="button" class="lgx" aria-label="Close">&times;</button><div class="lgb"></div></div>';
    document.body.appendChild(md);
    md.addEventListener('click', function (e) { if (e.target === md || (e.target.classList && e.target.classList.contains('lgx'))) closeM(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeM(); });
  }
  function openM(key) {
    if (!LEGAL[key]) return;
    if (!md) build();
    var b = md.querySelector('.lgb'); b.innerHTML = doc(key); b.scrollTop = 0;
    md.classList.add('on'); md.setAttribute('aria-hidden', 'false'); document.body.classList.add('lgopen');
    last = document.activeElement; md.querySelector('.lgx').focus();
  }
  function closeM() {
    if (!md || !md.classList.contains('on')) return;
    md.classList.remove('on'); md.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lgopen');
    if (last && last.focus) last.focus();
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-legal]');
    if (a) { e.preventDefault(); openM(a.getAttribute('data-legal')); }
  });
  var pg = document.getElementById('legal-page');
  if (pg) pg.innerHTML = doc(pg.getAttribute('data-doc'));
})();
