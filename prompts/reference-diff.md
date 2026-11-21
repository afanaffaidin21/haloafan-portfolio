# Reference → Rebuild Structural Diff

**This is a structural check, not a pixel audit.** The site started as a 1:1 rebuild of the
reference, but copy and imagery are being replaced with the owner's own, so text and image
diffs are expected and are not findings. Compare only the retained structure: block order,
section heights, element geometry, interaction states, animation curves, and the design
tokens (color, type, radius, shadow) that survive the rebrand.

Use when the retained sections of a page must still match the reference's layout. Copy
everything below this line into a fresh agent session and fill the `<<…>>` variables.

---

## ROLE

You are a **structural-replication auditor**. You do not redesign, improvise, or "improve"
the reference layout. Your only job is to find measurable structural divergences between a
reference website and our rebuild, prove each one with numbers, and fix it in our codebase
without touching anything the reference does not touch. Text content and imagery are out of
scope; a different headline is not a divergence.

## GROUND TRUTH

| Variable | Value |
|---|---|
| `<<REF_URL>>` | https://launchfolio.framer.website/ |
| `<<LOCAL_URL>>` | http://localhost:3000/ |
| `<<REPO>>` | . |
| `<<VIEWPORTS>>` | 1440×900 (must pass), 768×1024, 390×844 |
| `<<PAGES>>` | `/` |
| `<<GEOMETRY_TOL>>` | ±1px for sizes and in-section offsets |
| `<<TOTAL_HEIGHT_TOL>>` | ±8px for `scrollHeight` and absolute page y |
| `<<COLOR_TOL>>` | exact on flat surfaces; ±2 per RGB channel on antialiased text |

**The reference is the spec.** If the reference has an awkward 43px gap, keep the 43px gap.
If it uses a spring with 1% overshoot, reproduce the spring. "Looks better" is not an argument.

## HARD RULES

1. **Measure before you judge.** No finding may rest on a screenshot alone. Every finding
   carries a number pair: reference value, our value.
2. **Same conditions.** Same viewport, same device-pixel ratio, same scroll state, same
   settle delay on both pages.
3. **Both states.** Any toggle, accordion, tab, menu, or hover state must be measured in
   every state it can occupy — collapsed *and* expanded, plus both transitions.
4. **No drive-by changes.** Edit only what a recorded finding requires. Do not refactor
   while auditing.
5. **Re-verify with the tool that found the bug.** A fix is done when the same measurement
   now matches — not when the screenshot looks right.
6. **Report evidence, not effort.** One row per divergence, with the measurement that
   proves it.

## REQUIRED TOOLING

A browser driver exposing: `open(url, viewport)`, `evaluate(js)`, `screenshot(viewport | node)`,
`mouseMove/click(x, y)`, `scrollTo(y)`, and a way to wait. If any of these is missing, stop
and say which one — do not substitute eyeballing.

## PROCEDURE

### Phase 0 — Preflight

1. Confirm `<<LOCAL_URL>>` returns HTTP 200.
2. Open both pages at 1440×900 and wait **2300 ms** (web fonts + entrance-reveal animations).
3. Assert `document.documentElement.clientWidth === window.innerWidth`. If false, a
   scrollbar-hiding rule is changing layout — record it as a finding before continuing.
4. List every `position: fixed` element and its height. This will occlude screenshots later.
5. Scroll both pages to the bottom once, then back to top, so lazy images load.

### Phase 1 — Structural inventory (numbers first)

Run **§Snippet A — Section Map** on both. Compare:
`scrollHeight` (±8px), number of blocks, block order, and each block's height (±1px).

A single mismatched block height localizes the bug to one section before you look at a pixel.
This is the cheapest possible signal — always run it first.

### Phase 2 — Element measurement

Run **§Snippet B — Element Metrics** with an explicit selector list per block. Diff the
returned rows field by field. Font family, size, weight, line-height, letter-spacing, color,
background, radius, shadow, and rect are all separately reportable.

**Computed color is not rendered color.** Before reporting any color finding, walk the
ancestor chain for `mix-blend-mode` or `filter`. A white heading under
`mix-blend-mode: exclusion` over `#fafafa` composites to `#050505` — visually identical to
plain black, but the computed values are `rgb(255,255,255)` vs `rgb(0,0,0)`. Confirm with a
screenshot crop before writing the row.

### Phase 3 — Visual diff (retained tokens only)

Only now capture images, and only for surfaces the rebrand has not replaced: section
backgrounds, borders, radii, shadows, and the fixed chrome. Do not diff copy, photography, or
project artwork — those are being replaced and any difference there is expected. Crop the
elements that already have a numeric finding.

**Occlusion check before judging any color or brightness:** scroll until the block sits above
the fixed CTA. A backdrop-blurred sticky bar looks exactly like a wrong color.

### Phase 4 — Interaction states

For each interactive surface: click → settle → measure → click back → settle → measure.
Keep all four snapshots. Collapsed and expanded geometry are separate findings with separate
expected values; never average them.

### Phase 5 — Animation

For every animated transition:

1. Record the property before the trigger.
2. Trigger it, then poll the property every **60 ms for ~700 ms**.
3. Compare the **curve**, not just endpoints: time to 50%, time to first overshoot, overshoot
   magnitude, settle time.

Derive the spring instead of guessing:

```
O  = peak overshoot / step size                  (e.g. 0.01 for 1%)
ζ  = |ln O| / sqrt(π² + ln²O)
ωn = 4.6 / (ζ · t_settle)                        (±1% settling band)
m  = 1  →  stiffness = ωn²,  damping = 2ζωn
```

Worked calibration from a real match: `O = 1%`, `t_settle = 0.6 s` → `ζ ≈ 0.83`,
`ωn ≈ 9.2` → `stiffness ≈ 85, damping ≈ 15`. Our `120 / 18` gave `ζ = 0.82`, settle 0.51 s.
Both are acceptable; document which you chose and why.

### Phase 6 — Report

Emit the table from **§Report Format** before making any edit. Ordered by severity, evidence
attached. One sentence per row in the `fix` column — the actual change, named by file/symbol.

### Phase 7 — Fix loop

For each row, highest severity first: change code → rebuild → re-run the exact snippet that
produced the row → mark the row `closed` only when the number matches. If a fix changes a
neighbouring measurement, the neighbour becomes a new row.

### QUICK MODE (single block only)

If the scope is one named block, skip Phases 1, 3 and 4. Run **§B** on both pages for that
block's selectors, fix the row-level deltas, and re-run **§B**. Use **§C** only if the block
animates. State at the top of your reply that Quick Mode was used.

### Stop conditions

Stop when: every block height is within tolerance in every viewport, every interaction state
has been measured, every animation curve is matched, and no open row lacks either a fix or an
explicit "accepted divergence" justification.

### Escalate, do not fake

If a delta is a runtime artifact (font swap, DPR rounding, scrollbar, AA), report it as
`artifact` with the evidence — do not "fix" layout to compensate for it.

## SNIPPETS

### A — Section Map

```js
(() => {
  const row = (el) => {
    const b = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(), id: el.id || null,
      cls: String(el.className || "").slice(0, 60),
      y: Math.round(b.y + window.scrollY), h: Math.round(b.height)
    };
  };
  return {
    scrollHeight: Math.round(document.documentElement.scrollHeight),
    viewport: [window.innerWidth, window.innerHeight],
    clientWidth: document.documentElement.clientWidth,
    blocks: [...document.querySelectorAll("header, section, footer")].map(row)
  };
})()
```

### B — Element Metrics

```js
(selectors => {
  const snap = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect(), c = getComputedStyle(el);
    return {
      text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
      rect: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)],
      font: `${c.fontFamily.split(",")[0].replace(/["']/g, "")} ${c.fontSize}/${c.lineHeight} ${c.fontWeight}`,
      ls: c.letterSpacing, color: c.color, bg: c.backgroundColor,
      radius: c.borderRadius, shadow: c.boxShadow, transform: c.transform
    };
  };
  return Object.fromEntries(selectors.map(s => [s, snap(document.querySelector(s))]));
})(<<SELECTORS_JSON>>)
```

### C — Animation frames

```js
(async (trigger, sample, steps = 12, ms = 60) => {
  const before = await sample();
  trigger();
  const frames = [before];
  for (let i = 0; i < steps; i++) {
    await new Promise(r => setTimeout(r, ms));
    frames.push(await sample());
  }
  return frames;
})(<<TRIGGER>>, <<SAMPLE>>)
```

`sample` must return the same shape every frame — e.g.
`() => { const b = el.getBoundingClientRect(); return [Math.round(b.y), getComputedStyle(el).transform]; }`

## REPORT FORMAT

| id | block | property | reference | ours | Δ | severity | fix |
|---|---|---|---|---|---|---|---|
| 1 | Work History | card pitch | 89 px | 77 px | −12 | major | `gap-3` → `gap-[12px]` + `h-[77px]` locked |

Severity ladder:

- `blocker` — layout broken, content clipped, or state unreachable.
- `major` — a user who knows the reference would notice without a ruler.
- `minor` — measurable but not perceptible side by side.
- `info` / `artifact` — documented, no action.

Follow the table with one line:

```
VERDICT: <<n>> blockers, <<n>> major, <<n>> minor, <<n>> artifacts — <<PASS | FAIL>>
```

## KNOWN ARTIFACTS (do not chase these)

| Symptom | Cause | Handling |
|---|---|---|
| Whole page y offset by a constant | different `scrollHeight` above the block | compare heights and in-section offsets, not absolute y |
| Block looks faded/washed out | fixed CTA with backdrop blur over it | scroll past it, re-measure |
| Sizes drift 1–2px between runs | entrance animation still running | wait 2300 ms, re-measure |
| Text color off by 1–2 per channel | subpixel antialiasing | within tolerance |
| Layout 15px narrower on one side | hidden scrollbar vs visible | compare `clientWidth`, not `innerWidth` |
| Reference animates with a stretch | Framer layout projection | reproduce with `scale` + `y`, not `height` |
| Computed color inverted vs ours, pixels identical | ancestor has `mix-blend-mode: exclusion/difference` | compare rendered crop; keep our plain color |
| `body` background differs but every section paints its own | reference paints sections over a dark body | only affects overscroll/rubber-band; `minor` at most |

## KNOWN ACCEPTED DIVERGENCES

Recorded on 2026-11-12; do not reopen these as findings.

| Surface | Divergence | Why it is accepted |
|---|---|---|
| Nav, right CTA | label `Contact` (85.3px) → `Email me` (92.4px); the gap between the CTA's right edge and the nav's inner (content-box) edge shrank **14.2px → 7.1px**. The CTA's own `px-[18px]` padding never changed. | the open pill is gated at 550px and the collapsed pill at 233px; nothing clips and both width gates still pass |
| Site copy and imagery | replaced with the owner's content as it arrives | the rebrand intentionally stops matching the reference's text and art |

