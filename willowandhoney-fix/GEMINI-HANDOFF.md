# GEMINI HANDOFF — Willow & Honey UI Polish
# Repo: cryptocreeper94-sudo/willowandhoney (branch: main)
# Files to edit: client/src/ directory and client/tailwind.config.js ONLY

---

## CONTEXT — READ THIS FIRST

Willow & Honey is a luxury esthetics brand site built with React + Vite + Tailwind +
Framer Motion. The main UI file is client/src/App.tsx. The booking sheet is in
client/src/components/BottomSheetBooking.tsx.

The design intent is: dark luxury, high-end, professional spa brand. Pink (#ff2a75),
gold (#d4af37), deep charcoal (#0f0f13). Fonts: Playfair Display (headings),
Outfit (labels/UI), Inter (body).

DO NOT change the overall design direction, color scheme, or layout structure.
You are making surgical fixes and polish improvements ONLY.

---

## WHAT YOU ARE FIXING — 7 CHANGES

---

### CHANGE 1 — App.tsx: Fix broken hero image paths (CRITICAL)

FILE: client/src/App.tsx

FIND this array near the top of the App() function:
  const heroImages = [
    '/hero_mobile.png?v=1',
    '/hero_2.png',
    '/hero_3.png'
  ];

REPLACE WITH:
  const heroImages = [
    '/hero_mobile.png?v=1',
    '/hero2.png',
    '/hero3.png'
  ];

The files in the repo are named hero2.png and hero3.png (no underscore).
The current code references hero_2.png and hero_3.png which do not exist.
This is causing 2 of 3 hero slideshow slides to show broken images.

That is the ONLY change in this section of App.tsx.

---

### CHANGE 2 — App.tsx: Fix Mobile Travel Available badge overflow

FILE: client/src/App.tsx

FIND the Mobile Travel Available badge span inside the service card button.
It currently reads:
  <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-wh-pink/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
    Mobile Travel Available
  </span>

REPLACE WITH:
  <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-wh-pink/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
    Mobile ✈ Available
  </span>

Two changes: added `whitespace-nowrap` to prevent wrapping, shortened text to prevent overflow.

---

### CHANGE 3 — App.tsx: Protect service name from overflowing card

FILE: client/src/App.tsx

FIND the service name heading inside the service card button:
  <h4 className="text-2xl font-playfair italic text-white mb-3 group-hover:text-wh-pink transition-colors drop-shadow-md">{service.name}</h4>

REPLACE WITH:
  <h4 className="text-2xl font-playfair italic text-white mb-3 group-hover:text-wh-pink transition-colors drop-shadow-md leading-tight line-clamp-2">{service.name}</h4>

Added `leading-tight` and `line-clamp-2` to prevent long service names from overflowing.

---

### CHANGE 4 — App.tsx: Add spacing between Ariel bio card and Availability card

FILE: client/src/App.tsx

FIND the Availability & Hours div. It starts with:
  <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 mb-20 backdrop-blur-sm">
    <h3 className="text-2xl font-playfair italic mb-8 text-wh-pink">Availability & Hours</h3>

REPLACE the opening div tag ONLY with:
  <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 mb-20 backdrop-blur-sm mt-12">
    <h3 className="text-2xl font-playfair italic mb-8 text-wh-pink">Availability & Hours</h3>

Added `mt-12` to create breathing room between the bio card above and this section.

---

### CHANGE 5 — tailwind.config.js: Define the missing spin-slow animation

FILE: client/tailwind.config.js

The code uses `animate-spin-slow` in two places (Connect tab flower icon and footer
flower icon) but Tailwind does not know what spin-slow means. The icons are static
when they should be slowly rotating.

CURRENT content of tailwind.config.js:
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          outfit: ['Outfit', 'sans-serif'],
          playfair: ['Playfair Display', 'serif'],
          inter: ['Inter', 'sans-serif'],
        },
        colors: {
          'wh-pink': '#ff2a75',
          'wh-dark': '#0f0f13',
          'wh-card': '#1a1a20',
          'wh-gold': '#d4af37',
        },
      },
    },
    plugins: [],
  }

REPLACE WITH:
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          outfit: ['Outfit', 'sans-serif'],
          playfair: ['Playfair Display', 'serif'],
          inter: ['Inter', 'sans-serif'],
        },
        colors: {
          'wh-pink': '#ff2a75',
          'wh-dark': '#0f0f13',
          'wh-card': '#1a1a20',
          'wh-gold': '#d4af37',
        },
        animation: {
          'spin-slow': 'spin 10s linear infinite',
        },
      },
    },
    plugins: [],
  }

---

### CHANGE 6 — App.tsx: Add loading skeleton when services haven't loaded yet

FILE: client/src/App.tsx

The Book tab currently renders a blank space if the API hasn't returned services yet.

FIND the Book tab content. Inside the `activeTab === 'book'` block, find this line:
  {categories.map(category => (

REPLACE it (and wrap the entire categories.map) with:

  {services.length === 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-[32px] bg-wh-card border border-white/5 h-[320px] animate-pulse" />
      ))}
    </div>
  ) : (
    categories.map(category => (
      <div key={category as string} className="mb-20">
        <h3 className="text-wh-pink font-outfit uppercase tracking-[0.2em] text-lg mb-8 flex items-center gap-6">
          <span className="shrink-0">{category as string}</span>
          <div className="h-px bg-gradient-to-r from-wh-pink/50 to-transparent flex-1" />
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.filter(s => s.category === category).map(service => (
            <button
              key={service.id}
              onClick={() => openBooking(service)}
              className="text-left group relative overflow-hidden rounded-[32px] bg-black border border-white/10 hover:border-wh-pink/50 transition-all shadow-2xl h-[320px] flex flex-col justify-end"
            >
              {service.image_url ? (
                <img 
                  src={service.image_url} 
                  alt={service.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-wh-dark to-black" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

              <div className="relative z-10 p-8 flex flex-col h-full justify-end">
                <div className="mb-auto flex justify-end">
                  {service.isMobileEligible && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-wh-pink/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                      Mobile ✈ Available
                    </span>
                  )}
                </div>
                
                <div>
                  <h4 className="text-2xl font-playfair italic text-white mb-3 group-hover:text-wh-pink transition-colors drop-shadow-md leading-tight line-clamp-2">{service.name}</h4>
                  
                  {service.description && (
                    <p className="text-white/70 text-sm font-outfit mb-4 line-clamp-2">{service.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white/90 font-outfit font-medium">
                      <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">${service.price}</span>
                      <span className="text-white/50 text-sm">{service.durationMinutes} mins</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                      <Plus className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    ))
  )}

NOTE: You are wrapping the existing categories.map in a ternary. The service card
JSX inside the map should be IDENTICAL to what was already there except with the
badge and heading fixes from Changes 2 and 3 already applied. Do not accidentally
revert those fixes.

Also close the ternary with a closing parenthesis `)` after the last `))` of
categories.map. The structure is:
  {services.length === 0 ? (
    ...skeleton...
  ) : (
    categories.map(...)
  )}

---

### CHANGE 7 — App.tsx: Add a trust / credentials bar on the Explore tab

FILE: client/src/App.tsx

This adds a professional credential strip between the "Client Love" section and
the end of the explore tab content. It signals professionalism and builds trust.

FIND the closing tag of the Client Love div on the Explore tab:
  </div>
</div>
</motion.div>

The structure looks like:
  {/* Client Love / Testimonials */}
  <div className="mb-20">
    ...reviews...
  </div>
</div>          ← closes max-w-5xl container
</motion.div>   ← closes explore AnimatePresence block

INSERT the following BEFORE the closing `</div>` that closes the `max-w-5xl` container
(i.e., after the Client Love div and before the outer container closes):

  {/* Trust Bar */}
  <div className="flex flex-wrap justify-center gap-6 mb-20">
    {[
      { icon: '🎓', label: 'Georgia Career Institute', sub: 'Licensed Esthetician' },
      { icon: '✦', label: 'Skin Barrier Specialist', sub: 'Facial Sculpting' },
      { icon: '🛡️', label: 'Fully Insured', sub: 'Professional Coverage' },
      { icon: '📍', label: 'Mobile & Studio', sub: 'Nashville Area' },
    ].map((item) => (
      <div key={item.label} className="flex items-center gap-3 bg-white/5 border border-wh-gold/20 rounded-2xl px-5 py-4 backdrop-blur-sm">
        <span className="text-2xl">{item.icon}</span>
        <div>
          <div className="text-white font-outfit font-bold text-sm">{item.label}</div>
          <div className="text-white/50 font-outfit text-xs">{item.sub}</div>
        </div>
      </div>
    ))}
  </div>

---

## FILES YOU WILL TOUCH

1. client/src/App.tsx         — Changes 1, 2, 3, 4, 6, 7
2. client/tailwind.config.js  — Change 5 only

## FILES YOU WILL NOT TOUCH

- client/src/components/BottomSheetBooking.tsx
- client/src/components/BookingWidget.tsx
- client/src/index.css
- client/src/App.css
- server/ (anything in the server directory)
- Dockerfile
- Anything not listed above

---

## VERIFICATION STEPS (do these after making changes)

1. Check App.tsx heroImages array — confirm paths are /hero2.png and /hero3.png (no underscore)
2. Check tailwind.config.js — confirm spin-slow is defined under animation
3. In the service card JSX — confirm the badge span has whitespace-nowrap
4. In the service card JSX — confirm the h4 has line-clamp-2
5. In the Availability & Hours div — confirm opening tag includes mt-12
6. In the Book tab — confirm services.length === 0 check exists before categories.map
7. In the Explore tab — confirm the Trust Bar section exists after Client Love

---

## IMPORTANT NOTES FOR GEMINI

- Do NOT rewrite entire files. Make targeted edits only.
- Do NOT change the color scheme, font choices, or overall layout.
- Do NOT touch server/ under any circumstances.
- The service card JSX in Change 6 is a REWRITE of the existing card content wrapped
  in a conditional. The card itself does not change — only the skeleton wrapper is new.
  Make sure the card JSX in your Change 6 matches Changes 2 and 3 already applied
  (badge has whitespace-nowrap, h4 has line-clamp-2).
- After all changes, confirm every file was saved before marking complete.
- If you are unsure about the exact location of any element, search for the unique
  text strings provided (e.g., "Mobile Travel Available", "Availability & Hours",
  "Client Love") to find the right place.
