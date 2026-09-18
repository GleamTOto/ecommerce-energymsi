# Apply Progress: UPS Technical Service and Solar Solutions

## Status

- **Change:** `ups-and-solar-solutions`
- **Mode:** Standard (OpenSpec `tdd: false`)
- **Delivery:** Single PR with maintainer-approved `size:exception`; estimated 650–900 line review risk accepted.
- **Progress:** 9/9 tasks complete.

## Completed Work

- Exported approved Figma imagery to `public/services/ups-hero.png`, `public/services/ups-data-center.png`, and `public/services/solar-hero.png`.
- Added the typed, configurable approximate solar calculator and visible formula/assumption disclaimer.
- Extended the canonical WhatsApp utility with validated service context builders and phone rejection.
- Added the UPS route, responsive presentation, accessible CTAs, and actionable destination errors.
- Added the solar route, responsive calculator/results, validated RHF/Zod quotation form, preserved values, live handoff state, and WhatsApp-only submission.
- Added both canonical service links to desktop and mobile navigation with active route indication and mobile-sheet closing.

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command | `npx eslint src/lib/solar-calculator.ts src/lib/whatsapp-message.ts src/components/ups src/components/solar src/components/layout/Header.tsx src/components/layout/MobileNav.tsx 'src/app/(shop)/servicio-tecnico-ups' 'src/app/(shop)/soluciones-solares'` — failed on the pre-existing `Header.tsx:36` `react-hooks/set-state-in-effect` warning promoted to an error; no new-file lint errors were reported. |
| Runtime harness | `npm run build` — passed; both routes compiled and were listed as static routes. Manual browser interaction remains for independent verification. |
| Rollback boundary | Revert the three service assets, `src/components/ups`, `src/components/solar`, both service pages, `src/lib/solar-calculator.ts`, WhatsApp service additions, navigation additions, and this change's OpenSpec progress files. Existing checkout behavior remains isolated. |

## Deviations and Risks

- No deviations from the approved route, WhatsApp-only, approximate-estimate, or non-persistence decisions.
- The existing Header lint error remains outside the requested feature scope; build is green.
- No internal persistence, API route, mock data, or checkout behavior was added.

## Remediation: Solar Form Error Association

- **Scope:** Fixed only the critical solar accessibility finding in `src/components/solar/SolarPage.tsx`.
- **Implementation:** Added stable unique IDs and matching `htmlFor` labels to every calculator and quotation radio/checkbox control; each grouped control now references its help text and conditional validation error with `aria-describedby`, and exposes `aria-invalid` when validation applies.
- **Behavior preserved:** Calculator calculations, validation behavior, WhatsApp handoff, entered values, and destination flow were not changed.
- **Verification:** `npm run build` — passed (exit 0); Next.js 16.1.1 compiled successfully, TypeScript completed, and `/servicio-tecnico-ups` plus `/soluciones-solares` were generated. The build emitted existing workspace-root and Node deprecation warnings only.
- **Rollback boundary:** Revert the accessibility-only changes in `src/components/solar/SolarPage.tsx` without reverting the solar calculator, quote submission, or WhatsApp implementation.
