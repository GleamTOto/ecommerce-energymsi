# Proposal: UPS Technical Service and Solar Solutions

## Intent

Add two Figma-aligned public pages for UPS support and solar solutions, including an approximate estimate and WhatsApp advisor contact.

## Scope

### In Scope
- Add `/servicio-tecnico-ups` with the UPS hero, service cards, infrastructure/trust content, and structured WhatsApp CTAs.
- Add `/soluciones-solares` with the solar hero, process/integration sections, responsive calculator, and documented approximate formula and assumptions.
- Add validated solar quotation fields that open WhatsApp with submitted context; do not persist leads internally.
- Add both routes to desktop `Header.tsx` and keep `MobileNav.tsx` aligned.
- Reuse theme, shadcn/ui, WhatsApp, and form conventions; use approved Figma assets.

### Out of Scope
- Database models, Route Handlers, CRM/email delivery, admin lead management, or persistence.
- Production-grade engineering sizing, guaranteed savings/payback, payments, or authentication.

## Capabilities

### New Capabilities
- `ups-technical-service`: Public UPS service presentation and structured WhatsApp service-request/advisor CTAs.
- `solar-solutions`: Public solar presentation, transparent informational calculator, validated quotation-to-WhatsApp handoff, and disclaimers.
- `service-navigation`: Desktop and mobile discovery links for both canonical service routes.

### Modified Capabilities
- None.

## Approach

Create dedicated `(shop)` pages with domain components and shared hero, heading, card, and CTA primitives. Implement the calculator client-side with react-hook-form and zod; document its formula, COP assumptions, rounding, and limitations in the specification and UI disclaimer. Build WhatsApp messages with page, customer, calculator, and quotation context. Use responsive stacking and accessible states. Split work if the solar forecast exceeds 400 lines.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/(shop)/servicio-tecnico-ups`, `src/app/(shop)/soluciones-solares` | New | Public pages. |
| `src/components/ups`, `src/components/solar`, shared service UI | New | Page sections, estimator, and quote form. |
| `src/components/layout/Header.tsx`, `MobileNav.tsx` | Modified | Synchronized service navigation. |
| `public/` or approved asset source | New/Modified | Approved imagery delivery. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Calculator appears authoritative | Medium | Show formula, assumptions, approximation label, and technical-evaluation disclaimer. |
| Solar scope exceeds review budget | High | Keep components domain-scoped and split into reviewable work units. |
| Missing or unlicensed imagery | Medium | Confirm approved assets; use intentional fallback styling. |

## Rollback Plan

Revert the service pages, assets, and navigation together. Existing routes and WhatsApp checkout remain unchanged because no persistence or API contract is introduced.

## Success Criteria

- [ ] Both routes render responsive Figma-aligned sections.
- [ ] UPS and solar CTAs open WhatsApp with structured, accurate context.
- [ ] The solar estimate is visibly approximate and its formula/assumptions are documented.
- [ ] Desktop and mobile navigation expose the same two service destinations.
- [ ] Lint/build validation passes without changing existing checkout behavior.
