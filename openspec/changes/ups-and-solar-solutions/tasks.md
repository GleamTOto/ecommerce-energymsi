# Tasks: UPS Technical Service and Solar Solutions

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 650–900 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: assets, UPS, navigation; PR 2: solar calculator/form; PR 3: verification and polish |
| Delivery strategy | single-pr with maintainer-approved size exception |
| Chain strategy | not applicable |

Decision needed before apply: No — maintainer-approved single PR size exception recorded
Chained PRs recommended: Yes
Chain strategy: not applicable
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Assets, UPS page, and synchronized links | PR 1 | `npx eslint src/app/\(shop\)/servicio-tecnico-ups src/components/ups src/components/layout/Header.tsx src/components/layout/MobileNav.tsx` | Visit both navs and activate both UPS CTAs | Revert UPS files, service assets, and nav edits |
| 2 | Solar calculator, quote form, and WhatsApp contracts | PR 2 | `npx eslint src/lib/solar-calculator.ts src/lib/whatsapp-message.ts src/components/solar` | Submit valid/invalid solar flows at narrow and desktop widths | Revert solar files and utility additions |
| 3 | Full regression and accessibility verification | PR 3 | `npx eslint && npm run build` | Keyboard/theme/mobile smoke pass on both routes | Revert only test/polish changes |

## Phase 1: Foundation and Assets

- [x] 1.1 Export approved Figma imagery into `public/services/*` and define stable names, meaningful/empty alt text, responsive-safe dimensions, and intentional decorative fallbacks.
- [x] 1.2 Create `src/lib/solar-calculator.ts` with typed configurable assumptions, finite positive bounds, documented formula, rounding, backup presentation, and `isApproximate` output; add focused assertions for valid, invalid, and config-snapshot cases.
- [x] 1.3 Extend `src/lib/whatsapp-message.ts` with validated UPS/service/solar quote context builders that reject invalid phone configuration and URL-encode all fields without changing checkout behavior.

## Phase 2: UPS Route and Navigation

- [x] 2.1 Create `src/components/ups/*` and `src/app/(shop)/servicio-tecnico-ups/page.tsx` for Figma-aligned hero, service cards, infrastructure/trust content, metadata, accessible CTAs, and actionable WhatsApp configuration errors.
- [x] 2.2 Modify `src/components/layout/Header.tsx` and `src/components/layout/MobileNav.tsx` to expose exactly `/servicio-tecnico-ups` and `/soluciones-solares`, preserve existing links, active state, keyboard behavior, and mobile-sheet closing.

## Phase 3: Solar Route

- [x] 3.1 Create `src/components/solar/*` and `src/app/(shop)/soluciones-solares/page.tsx` with hero, process/integration sections, calculator/results, approximate-formula disclaimer, and responsive Figma structure.
- [x] 3.2 Implement the quote form with `react-hook-form`/Zod: required fields, bounded numeric/text validation, optional email/company/message/battery fields, preserved values, first-error focus, associated errors, live handoff status, and WhatsApp-only success/error behavior.

## Phase 4: Verification

- [x] 4.1 Verify scenarios for both routes, CTA encoding/destination failure, calculator invalid/valid results, quote validation, active desktop/mobile links, keyboard focus, themes, narrow widths, and no horizontal overflow; all threat-matrix rows are N/A, so no threat RED tests are required.
- [x] 4.2 Run `npx eslint` and `npm run build`; record results and confirm no persistence, API, checkout, or unrelated navigation regressions.

## Next Step

Apply completed as a single PR under the explicitly approved maintainer `size:exception`; independent SDD verification is the next phase.
