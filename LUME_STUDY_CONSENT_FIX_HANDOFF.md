# Lume Study — Consent Checkbox Fix Handoff (for Gemini)

**Repo:** `cryptocreeper94-sudo/lume`
**Live site:** `study.tlid.io`
**Affected files:** `study/public/lume-core.html`, `study/public/dla.html`

---

## ROOT CAUSE

There are 4 studies, all reachable from the landing page at `study.tlid.io`: Lume Core (`/lume-core`), DLA (`/dla`), Lume-V (`/lumev`), FLA (`/fla`).

Each consent page has two checkboxes: "18 or older" and "I agree to participate." Two of the four pages (**Lume Core** and **DLA**) wire these checkboxes with **order-dependent** logic: if the user checks "I agree" *before* checking "18 or older," the code force-unchecks the "I agree" box and shows a small red error message below it.

Confirmed live at `study.tlid.io/lume-core` — this is the exact code:

```js
consentCheck.addEventListener('change', function(e) {
    if (e.target.checked && !ageCheck.checked) {
        e.target.checked = false;              // <-- silently un-checks the box the user just checked
        ageError.style.display = 'block';
        screenerSection.style.display = 'none';
    } else {
        ageError.style.display = 'none';
        screenerSection.style.display = e.target.checked ? 'block' : 'none';
        ...
    }
});
```

To a real user this looks exactly like "I checked the box and nothing happened" — the checkbox visually resets itself, and the small red text explaining why is easy to miss. This is very likely why testers report getting stuck immediately after consent on the Lume Core study, and would intermittently affect the DLA study the same way.

The other two studies (`fla.html`, `lumev.html`) already use simpler, **order-independent** logic that just checks both boxes' current state on any change — they do not have this bug:

```js
function updateUI() {
    beginSection.style.display = (consentCheck.checked && ageCheck.checked) ? 'block' : 'none';
}
consentCheck.addEventListener('change', updateUI);
ageCheck.addEventListener('change', updateUI);
```

## FIX

Replace the order-dependent logic in **both** `lume-core.html` and `dla.html` with the same order-independent pattern already used successfully in `fla.html`/`lumev.html`. Never force-uncheck a box the user just checked — only gate visibility of the next section on both boxes being checked, and show a hint (not an alarming reset) if consent is checked before age.

### `study/public/lume-core.html`

Find this block (inside the `DOMContentLoaded` handler):

```js
            consentCheck.addEventListener('change', function(e) {
                if (e.target.checked && !ageCheck.checked) {
                    e.target.checked = false;
                    ageError.style.display = 'block';
                    screenerSection.style.display = 'none';
                } else {
                    ageError.style.display = 'none';
                    screenerSection.style.display = e.target.checked ? 'block' : 'none';
                    if (e.target.checked) {
                        setTimeout(function() {
                            screenerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                    }
                }
            });

            ageCheck.addEventListener('change', function(e) {
                if (e.target.checked) ageError.style.display = 'none';
                if (!e.target.checked) {
                    consentCheck.checked = false;
                    screenerSection.style.display = 'none';
                }
            });
```

Replace with:

```js
            function updateConsentUI() {
                var bothChecked = consentCheck.checked && ageCheck.checked;
                if (consentCheck.checked && !ageCheck.checked) {
                    ageError.style.display = 'block';
                } else {
                    ageError.style.display = 'none';
                }
                screenerSection.style.display = bothChecked ? 'block' : 'none';
                if (bothChecked) {
                    setTimeout(function() {
                        screenerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
            }

            consentCheck.addEventListener('change', updateConsentUI);
            ageCheck.addEventListener('change', updateConsentUI);
```

### `study/public/dla.html`

Find this block:

```js
        consentCheck.addEventListener('change', (e) => {
            if (e.target.checked && !ageCheck.checked) {
                e.target.checked = false;
                ageError.style.display = 'block';
                beginSection.style.display = 'none';
            } else {
                ageError.style.display = 'none';
                beginSection.style.display = e.target.checked ? 'block' : 'none';
            }
        });

        ageCheck.addEventListener('change', (e) => {
            if (e.target.checked) ageError.style.display = 'none';
            if (!e.target.checked) {
                consentCheck.checked = false;
                beginSection.style.display = 'none';
            }
        });
```

Replace with:

```js
        function updateConsentUI() {
            const bothChecked = consentCheck.checked && ageCheck.checked;
            ageError.style.display = (consentCheck.checked && !ageCheck.checked) ? 'block' : 'none';
            beginSection.style.display = bothChecked ? 'block' : 'none';
        }

        consentCheck.addEventListener('change', updateConsentUI);
        ageCheck.addEventListener('change', updateConsentUI);
```

## WHY THIS IS SAFE

No server-side code, API routes, or data files are touched. This only changes how two checkboxes on two static HTML pages reveal the next section of the page — pure client-side UI logic, matching the pattern already proven working on the other two study pages.

## VERIFICATION

1. Open `study.tlid.io/lume-core`.
2. Check "I have read the above and agree to participate" **first**, before checking "18 or older."
3. Before the fix: the box un-checks itself, small red text appears, nothing else happens.
4. After the fix: the box stays checked, and once you also check "18 or older," the screener section appears — in either click order.
5. Repeat the same test on `study.tlid.io/dla`, checking that clicking "I agree" first still reveals the "Begin Study" button once both boxes are checked.
