/**
 * ARUN PLASTICS - CHATBOT KNOWLEDGE BASE
 * ----------------------------------------------------------------
 * This is the ONLY information the AI assistant is allowed to use.
 * Edit the text below and redeploy. Anything you leave empty ('' or [])
 * is treated as "not provided", and the bot will NOT guess it - it will
 * offer to connect the customer with your team instead.
 */
module.exports = {
  businessName: 'Arun Plastics',
  tagline: 'Sign Boards & Printing',

  contact: {
    address: 'No. 10, Arcot Road, Kodambakkam, Chennai, Tamil Nadu',
    phone: '8610470488',
    whatsapp: '8610470488',
    email: 'arunplasticskdm@gmail.com',
    instagram: 'https://www.instagram.com/arunplastics.in/',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Arun+Plastics+Chennai',
  },

  // TODO: put your real opening hours here, e.g. 'Monday to Saturday, 9:00 AM to 7:00 PM'.
  // While this is empty the bot will ask customers to call instead of guessing.
  businessHours: '',

  serviceArea:
    'Based in Kodambakkam, Chennai, and serves customers across Chennai. ' +
    'For locations outside Chennai the team will confirm after the customer shares the location.',

  services: {
    'Sign Boards': [
      'LED Sign Boards', 'Glow Sign Boards', 'ACP Sign Boards', 'Acrylic Sign Boards',
      'Backlit Boards', '3D Acrylic Letters', 'SS & Brass Letters', 'Name Boards',
    ],
    'Printing': [
      'Flex Printing', 'UV Printing', 'Digital Printing', 'Vinyl Printing', 'Visiting Cards',
      'Letterheads', 'Bill Books', 'Envelopes', 'Pamphlets', 'Brochures', 'Rubber Stamps',
    ],
    'Branding': [
      'Vehicle Branding', 'Shop Branding', 'Corporate Branding', 'Wall Graphics', 'Outdoor Branding',
    ],
    'Display': [
      'Standees', 'Roll-up Standees', 'Exhibition Displays', 'Promotional Displays',
    ],
  },

  // Short descriptions the bot can use (only say what is written here).
  serviceNotes: [
    'ACP (aluminium composite panel) boards are strong, flat and weather-resistant, popular for outdoor name boards, with plain or 3D lettering.',
    'Glow and LED sign boards are lit boards that keep the shop name visible at night.',
    'Acrylic boards suit reception areas, offices, clinics and shop names.',
    'Roll-up standees are portable banners that pull up from a base and roll back into a case.',
    'Vehicle branding covers graphics and wraps for vans, cars and fleets.',
  ],

  // Edit so it matches how you really work.
  orderProcess: [
    'Customer contacts Arun Plastics by call, WhatsApp or this chat and shares the requirement (service, size, quantity, location).',
    'The team prepares the design idea and a quotation for approval. Quotation is free.',
    'After approval the work is printed / produced.',
    'The finished work is delivered and, for sign boards, installed.',
  ],

  designServices:
    'The team can help with design. Customers can share a logo, idea or reference image, and the team prepares a design for approval.',

  delivery:
    'Arun Plastics handles printing, production and installation. The delivery or completion time depends on the job (size, material, design), ' +
    'so the team confirms the time after seeing the details. No fixed number of days is promised by the chatbot.',

  pricing: {
    note:
      'Prices depend on size, material, quantity and design. The team prepares a free quotation after the customer shares the details. ' +
      'The chatbot must not quote prices unless a price guide is listed below.',
    // OPTIONAL price guide. Example: { item: 'Visiting cards (100 pcs)', price: 'Rs. 250 onwards' }
    // The bot will present these only as approximate, subject to final quotation.
    priceGuide: [],
  },

  faqs: [
    { q: 'How can I get a free quotation?', a: 'Call 8610470488, message on WhatsApp, or share your requirement in this chat (service, size, quantity, location). The team will send a quotation.' },
    { q: 'Do you provide installation?', a: 'Yes. Arun Plastics handles printing, production and installation so the board is ready to use.' },
    { q: 'Do you also do printing?', a: 'Yes: flex, UV, digital and vinyl printing, visiting cards, letterheads, bill books, envelopes, pamphlets, brochures and rubber stamps.' },
    { q: 'Which areas do you serve?', a: 'We are based in Kodambakkam, Chennai and serve customers across Chennai. Share your location and the team will confirm.' },
  ],

  // Extra rules or notes for the bot (optional).
  extraNotes: [],
};
