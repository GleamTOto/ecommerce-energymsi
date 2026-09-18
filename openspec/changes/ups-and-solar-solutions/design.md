# Design: UPS Technical Service and Solar Solutions

## Technical Approach

Add two server-rendered pages under the existing `(shop)` layout, with client components only for WhatsApp actions, calculator state, and form interaction. Reuse shadcn/ui, Tailwind tokens, the canonical WhatsApp number, and the existing `react-hook-form` + Zod convention. No API, database, server action, or lead persistence is introduced.

## Architecture Decisions

| Decision | Alternatives considered | Rationale |
|---|---|---|
| Domain components in `components/ups` and `components/solar` | One large page; generic CMS sections | Keeps sections reviewable and the solar work unit under the 400-line PR budget. |
| Shared pure solar calculator module | Formula embedded in JSX; server calculation | A pure configurable boundary is deterministic, testable, and makes the informational assumptions explicit. |
| Extend the existing WhatsApp utility | Duplicate `wa.me` construction in each CTA | Preserves the verified business number and URL encoding while supporting structured service messages. |
| Dedicated pages, not modal forms | Modal/drawer quotation form | Matches the repository rule and gives mobile users a stable, accessible form context. |

## Data Flow

```text
SolarQuoteForm ──validate──→ quote data + latest estimate ──format──→ WhatsApp URL
SolarCalculator ──config──→ calculateEstimate ──result──→ ResultsPanel
UPS CTA ───────────────────────────────────────────────────→ WhatsApp URL
```

The estimator config contains days-per-month, peak-sun-hours, performance-ratio, tariff display policy, precision, and battery presentation policy. The formula is `kWp = monthlyKWh / (days × peakSunHours × performanceRatio)` and generation is `kWp × days × peakSunHours × performanceRatio`. Bill value is contextual unless tariff display is enabled. Battery preference is reported as a backup requirement, not a capacity guarantee.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/app/(shop)/servicio-tecnico-ups/page.tsx` | Create | UPS page composition and metadata. |
| `src/app/(shop)/soluciones-solares/page.tsx` | Create | Solar page composition and metadata. |
| `src/components/ups/*` | Create | Hero, service cards, trust/infrastructure sections, and WhatsApp CTA. |
| `src/components/solar/*` | Create | Hero, process sections, calculator, results, quote form, disclaimer. |
| `src/lib/solar-calculator.ts` | Create | Config, typed input/output, pure formula, rounding, and assumptions text. |
| `src/lib/whatsapp-message.ts` | Modify | Add validated service/quote message construction using existing phone and URL builder. |
| `src/components/layout/Header.tsx` | Modify | Add both canonical service links to desktop discovery. |
| `src/components/layout/MobileNav.tsx` | Modify | Add equivalent links, close sheet on activation, and active indication. |
| `public/services/*` | Add approved assets | Store exported Figma assets with stable names; use meaningful alt text or empty alt for decoration. |

## Interfaces / Contracts

`SolarEstimateInput` includes positive monthly kWh, positive bill value, city, installation type, and backup preference. `SolarEstimate` includes consumption, kWp, generation, backup state, config snapshot, and `isApproximate: true`. Zod schemas enforce finite positive ranges, bounded text, optional valid email, phone format, and supported enums. `buildServiceWhatsAppURL(action, context)` rejects invalid phone configuration and encodes page, action, submitted fields, estimate summary, and disclaimer status.

## Validation and UX

Use `mode: "onSubmit"` with `zodResolver`; preserve values after errors, associate messages with `aria-describedby`, focus the first invalid field, and expose live handoff status. Never clear data. Success wording confirms only that WhatsApp was opened, not storage or quote acceptance.

## Responsive / Accessibility

Use mobile-first stacked grids that become two-column layouts at existing breakpoints. Avoid fixed-width content, preserve visible focus, label every control, use fieldsets/legends for grouped choices, and provide descriptive alt text for informative imagery. Decorative assets use empty alt text.

## Testing and Verification

Unit-test `calculateEstimate`, config snapshots, rounding, invalid ranges, and message encoding/phone rejection. Component-test calculator errors, results, quote validation, UPS actions, and preserved values. Verify navigation parity and active links. Run `npx eslint` and `npm run build`; manually verify narrow/desktop widths, keyboard flows, themes, and WhatsApp handoffs without persistence.

## Threat Matrix

| Boundary | Applicability | Response / RED test |
|---|---|---|
| Documentation-like paths | N/A — no executable documentation is added. | None. |
| Git repository selection | N/A — no Git command is part of the product. | None. |
| Commit state | N/A — no commit automation. | None. |
| Push state | N/A — no push automation. | None. |
| PR commands | N/A — no PR automation; PR slicing is a human delivery concern. | None. |

## Migration / Rollout

No migration or feature flag is required. Roll back by reverting routes, components, assets, calculator/message additions, and navigation together; existing checkout WhatsApp behavior remains unchanged. If changes exceed 400 lines, use slices: (1) assets, routes, UPS, navigation; (2) solar calculator/form and utilities; (3) tests and verification.

## Open Questions

None for the confirmed scope. The estimator remains explicitly approximate and configurable; final engineering sizing is outside this change.
