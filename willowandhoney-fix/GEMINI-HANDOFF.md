# GEMINI HANDOFF — Willow & Honey UI Polish
# Repo: cryptocreeper94-sudo/willowandhoney  Branch: main
# Files to edit: client/src/App.tsx, client/src/components/BottomSheetBooking.tsx,
#                client/tailwind.config.js

---

## CONTEXT — READ THIS FIRST

Willow & Honey is a luxury esthetics brand site built with React + Vite + Tailwind +
Framer Motion. Stack: React (client/src/App.tsx), Framer Motion for animations,
Tailwind for styling, Lucide for icons.

Design language: dark luxury. Background #0f0f13 (wh-dark), cards #1a1a20 (wh-card),
hot pink #ff2a75 (wh-pink), gold #d4af37 (wh-gold). Fonts: Playfair Display (headings,
always italic), Outfit (UI labels), Inter (body).

DO NOT change the color scheme, font choices, or overall layout structure.
Make ONLY the surgical changes described below.
DO NOT touch the server/ directory at all.

Public images available in client/public/:
  /ariel1.jpg        ← Ariel portrait photo
  /ariel2.png        ← Ariel second portrait
  /ariel_bio.png     ← Bio photo (already used in Meet Ariel section)
  /hero_mobile.png   ← Mobile hero (used in slideshow)
  /hero2.png         ← Desktop hero 2 (slideshow)
  /hero3.png         ← Desktop hero 3 (slideshow)
  /services/facials.png
  /services/body_treatment.png
  /services/hair_removal.png
  /services/other_services.png

---

## THE PROBLEMS BEING FIXED

1. Hero slideshow shows broken images 2 of 3 slides (wrong filenames in code)
2. On mobile, "Willow & Honey" title sits on top of Ariel's face in the hero
3. "Mobile Travel Available" badge text wraps and overflows the card
4. Service names with no overflow protection blow out of their card bounds
5. Availability & Hours section has no top margin — it collides with the card above it
6. animate-spin-slow is used but never defined — flower icons never spin
7. Book tab shows blank space while API loads (no loading state)
8. Connect tab is a nearly empty page — just a button. Needs real photos and content
9. Service cards with no image_url fall back to a flat black gradient — boring
10. No professional trust/credentials section anywhere on the site

---

## CHANGE 1 — client/src/App.tsx: Fix broken hero image paths

FIND this array near the top of the App() function:
```
const heroImages = [
  '/hero_mobile.png?v=1',
  '/hero_2.png',
  '/hero_3.png'
];
```

REPLACE WITH:
```
const heroImages = [
  '/hero_mobile.png?v=1',
  '/hero2.png',
  '/hero3.png'
];
```

The repo files are named hero2.png and hero3.png (no underscore).
This is causing 2 of 3 slideshow slides to show a broken image placeholder.

---

## CHANGE 2 — client/src/App.tsx: Fix hero text sitting on Ariel's face on mobile

This is the most visible bug. On mobile the flex container uses justify-center which
places the title block in the vertical middle of the hero image, directly over the
subject's face.

FIND the hero container div. It starts with:
```
<div className="relative w-full h-[60vh] md:h-[70vh] bg-black flex flex-col items-center justify-center md:justify-end overflow-hidden rounded-b-[40px] shadow-2xl z-20 pb-0 md:pb-12">
```

REPLACE THAT OPENING DIV with:
```
<div className="relative w-full h-[60vh] md:h-[70vh] bg-black flex flex-col items-center justify-end overflow-hidden rounded-b-[40px] shadow-2xl z-20 pb-8 md:pb-12">
```

Changes made:
- Removed `justify-center` — was centering text over the face on mobile
- Changed to `justify-end` on ALL screen sizes (not just md+) — text now anchors to bottom
- Changed `pb-0` to `pb-8` on mobile — adds breathing room above the tab bar

THEN find the text container div inside the hero:
```
<div className="relative z-10 text-center px-6 mt-16 md:mt-auto">
```

REPLACE WITH:
```
<div className="relative z-10 text-center px-6">
```

Removed `mt-16 md:mt-auto` — no longer needed since the parent is justify-end.
The text will now sit at the bottom of the hero on all screen sizes.

---

## CHANGE 3 — client/src/App.tsx: Fix Mobile badge overflow on service cards

FIND this span inside the service card button (inside the Book tab):
```
<span className="text-[10px] font-bold uppercase tracking-widest text-white bg-wh-pink/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
  Mobile Travel Available
</span>
```

REPLACE WITH:
```
<span className="text-[10px] font-bold uppercase tracking-widest text-white bg-wh-pink/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
  ✈ Mobile
</span>
```

Added whitespace-nowrap, shortened text. The badge now stays on one line on any card width.

---

## CHANGE 4 — client/src/App.tsx: Protect service name from overflowing card

FIND the service name h4 inside the service card button:
```
<h4 className="text-2xl font-playfair italic text-white mb-3 group-hover:text-wh-pink transition-colors drop-shadow-md">{service.name}</h4>
```

REPLACE WITH:
```
<h4 className="text-xl font-playfair italic text-white mb-3 group-hover:text-wh-pink transition-colors drop-shadow-md leading-snug line-clamp-2">{service.name}</h4>
```

Changes: reduced from text-2xl to text-xl, added leading-snug and line-clamp-2.
Long service names now clip gracefully instead of breaking out of the card.

---

## CHANGE 5 — client/src/App.tsx: Add spacing above Availability card

FIND the Availability & Hours section. It opens with:
```
<div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 mb-20 backdrop-blur-sm">
  <h3 className="text-2xl font-playfair italic mb-8 text-wh-pink">Availability & Hours</h3>
```

REPLACE ONLY THE OPENING DIV TAG with:
```
<div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 mb-20 backdrop-blur-sm mt-10">
  <h3 className="text-2xl font-playfair italic mb-8 text-wh-pink">Availability & Hours</h3>
```

Added mt-10. The Ariel bio card and this card were touching with no breathing room.

---

## CHANGE 6 — client/tailwind.config.js: Define the missing spin-slow animation

The code uses `animate-spin-slow` in multiple places but it is never defined.
The flower icons on the Connect tab and footer are supposed to rotate slowly but do nothing.

CURRENT full content of client/tailwind.config.js:
```js
/** @type {import('tailwindcss').Config} */
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
```

REPLACE THE ENTIRE FILE with:
```js
/** @type {import('tailwindcss').Config} */
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
```

---

## CHANGE 7 — client/src/App.tsx: Add loading skeleton when services haven't loaded

The Book tab shows "Treatment Menu" followed by blank space while the API loads.
On a luxury brand site this looks broken.

In the Book tab (activeTab === 'book' block), find the line:
```
{categories.map(category => (
```

This entire categories.map block ends several lines later with `))}`

WRAP the categories.map in a loading conditional so it reads:
```tsx
{services.length === 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="rounded-[32px] bg-wh-card border border-white/5 h-[320px] animate-pulse"
      />
    ))}
  </div>
) : (
  categories.map(category => (
    // ... existing categories.map content unchanged ...
  ))
)}
```

Do not change any code inside the categories.map. Only wrap it in this conditional.
Make sure the ternary closes correctly: `)} ` after the closing `))` of categories.map.

---

## CHANGE 8 — client/src/App.tsx: Give service cards a real fallback image

When a service has no image_url, the card shows a flat `from-wh-dark to-black` gradient.
The /public/services/ folder has actual category photos. Use them as fallbacks.

FIND the no-image fallback inside the service card button:
```tsx
) : (
  <div className="absolute inset-0 bg-gradient-to-br from-wh-dark to-black" />
)}
```

REPLACE WITH:
```tsx
) : (
  <>
    <img
      src={
        (category as string).toLowerCase().includes('facial')
          ? '/services/facials.png'
          : (category as string).toLowerCase().includes('body')
          ? '/services/body_treatment.png'
          : (category as string).toLowerCase().includes('hair') || (category as string).toLowerCase().includes('wax')
          ? '/services/hair_removal.png'
          : '/services/other_services.png'
      }
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-40 transition-opacity duration-500"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-wh-dark/80" />
  </>
)}
```

NOTE: This fallback img tag is inside the service card button where `category` is in
scope from the outer categories.map. That variable is available here.

---

## CHANGE 9 — client/src/App.tsx: Replace empty Connect tab with a real page

The Connect tab currently has only a spinning flower icon, one paragraph, and an
Instagram button. Jason wants it to feel high-end and professional.

FIND the entire `activeTab === 'connect'` block. It starts with:
```tsx
{activeTab === 'connect' && (
  <motion.div
    key="connect"
    ...
  >
    <div className="bg-white/5 border border-white/10 p-12 rounded-[40px] text-center max-w-2xl w-full backdrop-blur-xl">
      <Flower2 className="w-16 h-16 text-wh-pink mx-auto mb-8 animate-spin-slow" style={{ animationDuration: '10s' }} />
      <h2 className="text-4xl font-playfair italic mb-6">Get in Touch</h2>
      <p className="text-white/70 font-outfit mb-12 text-lg font-light leading-relaxed">
        Follow my journey, view past client transformations, and DM me for any specific skincare questions or custom service inquiries.
      </p>
      
      <a 
        href="https://instagram.com/willowandhoney.esthetics"
        target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-5 rounded-full hover:opacity-90 transition-opacity shadow-[0_0_40px_rgba(236,72,153,0.3)] uppercase tracking-widest text-sm"
      >
        <Camera className="w-5 h-5" /> Follow @willowandhoney.esthetics
      </a>
    </div>
  </div>
</motion.div>
```

REPLACE THE ENTIRE CONTENT between the outer <motion.div> opening and closing tags with:

```tsx
<div className="w-full max-w-2xl mx-auto space-y-6">

  {/* Header */}
  <div className="text-center mb-10">
    <h2 className="text-4xl md:text-5xl font-playfair italic mb-3">Connect With Ariel</h2>
    <p className="text-white/50 font-outfit uppercase tracking-[0.2em] text-xs">
      Follow the Journey · Book via DM · Ask Questions
    </p>
  </div>

  {/* Photo strip */}
  <div className="grid grid-cols-2 gap-4 mb-2">
    <div className="relative overflow-hidden rounded-[28px] aspect-[3/4] bg-wh-card border border-white/5">
      <img
        src="/ariel1.jpg"
        alt="Ariel"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
    <div className="relative overflow-hidden rounded-[28px] aspect-[3/4] bg-wh-card border border-white/5">
      <img
        src="/ariel2.png"
        alt="Ariel"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  </div>

  {/* Tagline under photos */}
  <p className="text-center text-white/60 font-outfit font-light text-sm leading-relaxed px-2">
    Licensed esthetician specializing in skin barrier health and facial sculpting.
    Based in Nashville · Mobile & Studio appointments available.
  </p>

  {/* Instagram CTA */}
  <a
    href="https://instagram.com/willowandhoney.esthetics"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-wh-pink text-white font-bold py-5 rounded-full hover:opacity-90 transition-opacity shadow-[0_0_40px_rgba(255,42,117,0.25)] uppercase tracking-widest text-sm"
  >
    <Camera className="w-5 h-5 shrink-0" />
    <span>@willowandhoney.esthetics</span>
  </a>

  {/* Contact info card */}
  <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 space-y-4 backdrop-blur-sm">
    <h3 className="font-playfair italic text-xl text-white mb-2">Reach Out</h3>
    <div className="space-y-3 font-outfit text-sm">
      <div className="flex items-center gap-3 text-white/70">
        <span className="text-wh-pink">✦</span>
        <span>DM on Instagram for fastest response</span>
      </div>
      <div className="flex items-center gap-3 text-white/70">
        <span className="text-wh-pink">✦</span>
        <span>Custom service inquiries welcome</span>
      </div>
      <div className="flex items-center gap-3 text-white/70">
        <span className="text-wh-pink">✦</span>
        <span>Nashville, TN area · Mobile travel available</span>
      </div>
      <div className="flex items-center gap-3 text-white/70">
        <span className="text-wh-pink">✦</span>
        <span>Weekend appointments · 9 AM – 12 PM</span>
      </div>
    </div>
  </div>

  {/* Powered-by / brand footer */}
  <div className="text-center pt-2">
    <Flower2 className="w-6 h-6 text-wh-pink/40 mx-auto animate-spin-slow" style={{ animationDuration: '12s' }} />
  </div>

</div>
```

IMPORTANT: The outer motion.div wrapper for the connect tab stays exactly as it was.
Only the content inside changes. Make sure `Camera` and `Flower2` are still imported
from lucide-react at the top of App.tsx — they already are.

---

## CHANGE 10 — client/src/App.tsx: Add credentials/trust bar on Explore tab

Add a trust strip after the Client Love section and before the explore tab closes.
This signals professionalism to first-time visitors.

FIND the closing of the Client Love section inside the Explore tab. It looks like:
```tsx
          </div>
        </div>        ← closes max-w-5xl container
      </motion.div>  ← closes the explore motion.div
```

INSERT this block BEFORE the `</div>` that closes the max-w-5xl container:

```tsx
{/* Credentials */}
<div className="flex flex-wrap justify-center gap-4 mb-20">
  {[
    { icon: '🎓', label: 'Georgia Career Institute', sub: 'Licensed Esthetician' },
    { icon: '✦', label: 'Skin Barrier Specialist', sub: 'Facial Sculpting' },
    { icon: '🛡️', label: 'Fully Insured', sub: 'Professional Coverage' },
    { icon: '📍', label: 'Nashville Area', sub: 'Mobile & Studio' },
  ].map((item) => (
    <div
      key={item.label}
      className="flex items-center gap-3 bg-white/5 border border-wh-gold/20 rounded-2xl px-5 py-4 backdrop-blur-sm"
    >
      <span className="text-xl">{item.icon}</span>
      <div>
        <div className="text-white font-outfit font-bold text-sm">{item.label}</div>
        <div className="text-white/50 font-outfit text-xs">{item.sub}</div>
      </div>
    </div>
  ))}
</div>
```

---

## SUMMARY — FILES AND CHANGES

### client/tailwind.config.js
- Change 6: Add `animation: { 'spin-slow': 'spin 10s linear infinite' }` under theme.extend

### client/src/App.tsx
- Change 1: Fix heroImages array (hero_2.png → hero2.png, hero_3.png → hero3.png)
- Change 2: Fix hero flex container (justify-end everywhere, pb-8 mobile, remove mt-16 from text div)
- Change 3: Fix Mobile badge (add whitespace-nowrap, shorten to "✈ Mobile")
- Change 4: Fix service name h4 (text-xl, line-clamp-2, leading-snug)
- Change 5: Add mt-10 to Availability & Hours section opening div
- Change 7: Wrap categories.map in services.length === 0 skeleton conditional
- Change 8: Replace flat dark fallback with category image fallback for service cards
- Change 9: Replace empty Connect tab content with photo strip + contact card
- Change 10: Add credentials strip after Client Love section

### client/src/components/BottomSheetBooking.tsx
- NO CHANGES NEEDED to this file

### server/ directory
- NO CHANGES — do not touch anything in server/

---

## VERIFICATION CHECKLIST

After making all changes, verify each item:

[ ] heroImages array: /hero2.png and /hero3.png (no underscores)
[ ] Hero outer div: has `justify-end` (no justify-center anywhere), has `pb-8 md:pb-12`
[ ] Hero text div: no mt-16, just `relative z-10 text-center px-6`
[ ] Mobile badge: has whitespace-nowrap, reads "✈ Mobile"
[ ] Service name h4: has line-clamp-2 and text-xl
[ ] Availability div: has mt-10 in className
[ ] tailwind.config.js: has animation.spin-slow defined
[ ] Book tab: services.length === 0 shows skeleton grid
[ ] Service card no-image fallback: uses /services/*.png images not flat gradient
[ ] Connect tab: shows 2-column photo grid + contact info card + Instagram button
[ ] Credentials strip: appears at bottom of Explore tab above footer

---

## CHANGE 11 — server/src/index.ts: Add real availability endpoint

The server already has a working POST /api/bookings that saves to the DB correctly.
What is missing is a GET /api/availability endpoint so the booking sheet can show
only genuinely open time slots instead of calculating them with no knowledge of
existing bookings.

FILE: server/src/index.ts

FIND the line:
```
app.get('/api/reviews', async (req, res) => {
```

INSERT the following block IMMEDIATELY BEFORE that line:

```typescript
// GET /api/availability?date=YYYY-MM-DD&serviceId=N&isMobile=false
// Returns array of available time strings for that date and service
app.get('/api/availability', async (req, res) => {
  try {
    const { date, serviceId, isMobile } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({ error: 'date and serviceId are required' });
    }

    // Load the service to know its duration
    const [service] = await db.select().from(services).where(eq(services.id, Number(serviceId)));
    if (!service) return res.status(404).json({ error: 'Service not found' });

    // Ariel's working window: 9:00 AM to 12:00 PM
    const WINDOW_START = 9 * 60;  // minutes from midnight
    const WINDOW_END   = 12 * 60;

    // Required slot duration in minutes
    let slotMinutes = service.durationMinutes;
    if (isMobile === 'true') slotMinutes = Math.max(slotMinutes, 120);

    // Load existing bookings for this date that are not cancelled
    const dateStr = date as string; // YYYY-MM-DD
    const dayStart = `${dateStr}T00:00:00.000Z`;
    const dayEnd   = `${dateStr}T23:59:59.999Z`;

    const existingBookings = await db
      .select({ startTime: bookings.startTime, endTime: bookings.endTime })
      .from(bookings)
      .where(
        and(
          gte(bookings.startTime, dayStart),
          lte(bookings.startTime, dayEnd),
          sql`${bookings.status} != 'cancelled'`
        )
      );

    // Convert existing bookings to blocked minute ranges
    const blockedRanges = existingBookings.map(b => {
      const start = new Date(b.startTime);
      const end   = new Date(b.endTime);
      const startMins = start.getUTCHours() * 60 + start.getUTCMinutes();
      const endMins   = end.getUTCHours()   * 60 + end.getUTCMinutes();
      return { start: startMins, end: endMins };
    });

    // Generate candidate slots every 30 minutes within Ariel's window
    const availableSlots: string[] = [];
    let cursor = WINDOW_START;

    while (cursor + slotMinutes <= WINDOW_END) {
      const slotEnd = cursor + slotMinutes;

      // Check if this slot overlaps any blocked range
      const isBlocked = blockedRanges.some(range => cursor < range.end && slotEnd > range.start);

      if (!isBlocked) {
        const hours   = Math.floor(cursor / 60);
        const mins    = cursor % 60;
        const ampm    = hours >= 12 ? 'PM' : 'AM';
        const display = hours > 12 ? hours - 12 : hours;
        availableSlots.push(
          `${String(display).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`
        );
      }

      cursor += 30; // offer every 30-minute start time
    }

    res.json({ slots: availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});
```

---

## CHANGE 12 — client/src/components/BottomSheetBooking.tsx: Wire to real API

The booking sheet currently uses a fake `setTimeout` instead of calling the real
backend. The server's POST /api/bookings is fully built and working — it just isn't
being called. This change connects them.

FILE: client/src/components/BottomSheetBooking.tsx

### Part A — Replace the fake handleBook with a real API call

FIND the existing handleBook function:
```typescript
const handleBook = async () => {
  setIsSubmitting(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSuccess(true);
  } catch (e) {
    console.error(e);
  } finally {
    setIsSubmitting(false);
  }
};
```

REPLACE WITH:
```typescript
const handleBook = async () => {
  if (!service || !selectedDate || !selectedTime) return;
  setIsSubmitting(true);
  try {
    // Build ISO start and end times from selectedDate + selectedTime string
    const [timePart, ampm] = selectedTime.split(' ');
    const [hStr, mStr] = timePart.split(':');
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const startDate = new Date(selectedDate);
    startDate.setHours(hours, minutes, 0, 0);

    const durationMinutes = isMobile
      ? Math.max(service.durationMinutes, 120)
      : service.durationMinutes;

    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone,
        serviceId: service.id,
        isMobile,
        address: isMobile ? address : null,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Booking failed');
    }

    setIsSuccess(true);
  } catch (e: any) {
    console.error(e);
    alert(e.message || 'Something went wrong. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

### Part B — Fetch real availability slots when a date is selected

FIND the getAvailableTimes function and the availableTimes variable:
```typescript
// Dynamically calculate available times based on duration and mobile status
const getAvailableTimes = () => {
  if (!service) return [];
  ...
};

const availableTimes = getAvailableTimes();
```

REPLACE THE ENTIRE BLOCK (from the comment through `const availableTimes = getAvailableTimes();`) WITH:

```typescript
const [availableTimes, setAvailableTimes] = useState<string[]>([]);
const [loadingSlots, setLoadingSlots] = useState(false);

// Fetch real availability from server when date changes
useEffect(() => {
  if (!selectedDate || !service) {
    setAvailableTimes([]);
    return;
  }
  setLoadingSlots(true);
  setSelectedTime(null);
  const dateStr = selectedDate.toISOString().split('T')[0];
  fetch(`/api/availability?date=${dateStr}&serviceId=${service.id}&isMobile=${isMobile}`)
    .then(r => r.json())
    .then(data => setAvailableTimes(data.slots || []))
    .catch(() => setAvailableTimes([]))
    .finally(() => setLoadingSlots(false));
}, [selectedDate, service, isMobile]);
```

NOTE: This adds `useEffect` usage. Make sure `useEffect` is imported at the top of
BottomSheetBooking.tsx. The current import line is:
```typescript
import { useState } from 'react';
```
Change it to:
```typescript
import { useState, useEffect } from 'react';
```

### Part C — Show a loading state while slots are being fetched

FIND the time slot grid that renders after selectedDate is chosen:
```tsx
{selectedDate && (
  <div className="grid grid-cols-2 gap-3 mt-6">
    {availableTimes.length > 0 ? (
```

REPLACE the opening of that block with:
```tsx
{selectedDate && (
  <div className="grid grid-cols-2 gap-3 mt-6">
    {loadingSlots ? (
      <div className="col-span-2 text-center text-white/50 text-xs py-4 animate-pulse">
        Checking availability...
      </div>
    ) : availableTimes.length > 0 ? (
```

And make sure the closing of the block still properly closes. The full conditional
structure should be:
```tsx
{loadingSlots ? (
  <div className="col-span-2 ...">Checking availability...</div>
) : availableTimes.length > 0 ? (
  availableTimes.map(time => ( ... ))
) : (
  <div className="col-span-2 text-center text-white/50 text-xs py-4">
    No available slots for this duration today.
  </div>
)}
```

---

## UPDATED SUMMARY — ALL FILES AND CHANGES

### client/tailwind.config.js
- Change 6: Add spin-slow animation

### client/src/App.tsx
- Change 1: Fix hero image paths
- Change 2: Fix hero text position (over face on mobile)
- Change 3: Fix Mobile badge overflow
- Change 4: Fix service name overflow
- Change 5: Add spacing above Availability section
- Change 7: Add loading skeleton to Book tab
- Change 8: Use real category images as service card fallback
- Change 9: Rebuild Connect tab with photos and contact info
- Change 10: Add credentials strip to Explore tab

### server/src/index.ts
- Change 11: Add GET /api/availability endpoint

### client/src/components/BottomSheetBooking.tsx
- Change 12A: Replace setTimeout simulation with real POST /api/bookings
- Change 12B: Replace client-side slot math with real GET /api/availability fetch
- Change 12C: Show "Checking availability..." while slots load
- Add useEffect to imports

---

## UPDATED VERIFICATION CHECKLIST

[ ] heroImages array: /hero2.png and /hero3.png (no underscores)
[ ] Hero outer div: justify-end everywhere, pb-8 md:pb-12
[ ] Hero text div: no mt-16, just `relative z-10 text-center px-6`
[ ] Mobile badge: whitespace-nowrap, reads "✈ Mobile"
[ ] Service name h4: line-clamp-2, text-xl
[ ] Availability div: has mt-10
[ ] tailwind.config.js: spin-slow defined
[ ] Book tab: services.length === 0 shows skeleton
[ ] Service card fallback: uses /services/*.png
[ ] Connect tab: photo grid + contact card + Instagram button
[ ] Credentials strip: at bottom of Explore tab
[ ] server/src/index.ts: GET /api/availability route exists before GET /api/reviews
[ ] BottomSheetBooking: imports useEffect alongside useState
[ ] BottomSheetBooking: handleBook calls POST /api/bookings (no setTimeout)
[ ] BottomSheetBooking: slots fetched from /api/availability on date select
[ ] BottomSheetBooking: "Checking availability..." shows while loading

---

## NOTES FOR GEMINI

- Read each change's FIND block carefully. Search for the unique quoted strings
  to locate the exact spot before editing. Never guess.
- Changes 2, 3, 4, 8 are all inside the service card or hero — be precise about
  which element you're touching.
- Change 9 replaces the CONTENT of the connect motion.div, not the motion.div itself.
  Preserve the AnimatePresence/motion.div wrapper exactly.
- Change 8's fallback img tag is inside the service card button, inside a
  categories.map. The variable `category` is in scope from the outer map.
- Change 11 goes in server/src/index.ts BEFORE the GET /api/reviews route.
- Change 12B introduces a useEffect — the import line at the top of
  BottomSheetBooking.tsx must be updated to include useEffect.
- Do not rewrite whole files. Surgical edits only.
- Commit message when done: "feat: real availability, live booking API, UI polish"
