# Exploration: UPS technical service and solar solutions

The requested change adds two public service sections based on Figma references and exposes both from the storefront navigation. The repository already has a shared shop shell and a reusable shadcn/ui foundation, but neither service route or its domain data/form behavior exists yet. The solar reference is materially larger than a static landing page because it includes an estimator and a quotation form.

## Current State

### Application and routing

- Next.js 16 App Router uses the `(shop)` route group for public storefront pages. `src/app/(shop)/layout.tsx` renders `TopBar`, `Header`, `main`, and `Footer` for every shop route.
- Existing public routes are home, products, product detail, cart, checkout redirect, and profile pages. No service, UPS, solar, about, or contact page currently exists despite placeholder footer links to those paths.
- The home page is a thin composition of `HeroBanner`, `CategoryGrid`, `FeaturedProducts`, and `SupplierSection`; section-specific UI is implemented in `src/components/home/` rather than directly in the page.

### Navigation

- Desktop navigation in `src/components/layout/Header.tsx` currently exposes only the `TIENDA` link (`/products`) alongside favorites, cart, and authentication actions. It has no service menu or public informational links.
- `src/components/layout/MobileNav.tsx` has an independent mobile menu with account actions, database-backed product categories, settings, and store navigation. Adding desktop-only links would create a responsive navigation mismatch; mobile parity should be considered even though the request names `Header.tsx`.
- `Header` is a client component because it owns cart/session state and mounts `MobileNav`; static service links can be added without introducing new global state.

### Existing UI, forms, and styling

- Tailwind CSS v4, shadcn/ui, CSS variables, and `lucide-react` are already configured. The global palette contains the Figma orange (`#FB8709`), dark text (`#1C1B1B`), warm border (`#DDC1AF`), and light warm surface equivalents, so the Figma visual language can be implemented without a new theme.
- Poppins is available through `next/font/google` as `--font-label`; Hanken Grotesk and Inter are also loaded globally. Figma specifies Poppins for the service content.
- Existing reusable primitives include `Button`, `Card`, `Input`, `Textarea`, `Label`, `Select`, `Switch`, `Separator`, and `Skeleton`. `ProductForm` demonstrates the project-standard `react-hook-form` + `zod` pattern, while `ShippingForm` is a simpler uncontrolled form.
- Project rules require dedicated pages for new forms, Route Handlers rather than Server Actions, Zustand for global state, and `react-hook-form` + `zod` for forms. No service inquiry API, persistence model, or service-specific store exists.
- `next.config.ts` permits remote images, but the repository has no local assets corresponding to the Figma hero, data-center, or integrated-system image references. Figma image refs are not application URLs and will need an asset delivery decision.

## Figma Findings

### UPS technical service — node `79:4`

- Page canvas: warm off-white background, 64px vertical / 24px horizontal outer padding, 80px section gap.
- Hero: 480px image-backed panel with dark overlay and 16px radius; orange badge, title “Servicio Técnico Especializado”, supporting copy, and “Solicitar Evaluación” CTA.
- Services: “Nuestros Servicios Técnicos” followed by six cards in two rows of three: preventive maintenance, corrective maintenance, diagnosis/evaluation, battery review, technical support, and replacement evaluation. Cards use orange icon badges and warm borders.
- Experience: two-column copy plus a 532x320 data-center image; includes “Infraestructura Crítica” label and “Clientes atendidos / Canal Capital” trust card.
- CTA: dark panel with service request and advisor contact actions.
- Figma uses settings, wrench, activity, battery, headphones, and refresh-cw icons, all available or representable with `lucide-react`.

### Solar solutions — node `79:96`

- Shares the same page shell, palette, hero treatment, section header/underline, and card language. Hero is 500px and includes “Soluciones de Energía Solar”, a consumption-based subtitle, description, and evaluation CTA.
- “Cómo Funciona” is a four-step card grid: know consumption, evaluate needs, size the solution, and receive a quote.
- “Estimación de Solución Solar” contains a two-column calculator: monthly kWh, average bill value, city, installation type, submit action, and a dark results panel. The reference displays illustrative results (`6.5 kWp`, `520 kWh/mes`, optional battery backup), not a defined calculation contract.
- “Cotice su Solución Solar” contains a multi-row form for name, company, phone, email, city, monthly consumption, last bill value, installation type, battery-backup toggle, additional message, and submission.
- “Soluciones Integrales de Energía” contains a solar → storage → backup → consumption flow and a second 532x320 image.
- The Figma reference ends at the integration section; it does not define success/error states, validation rules, API destination, calculation formula, privacy consent, or whether submissions open WhatsApp/email or persist server-side.

## Affected Areas

- `src/app/(shop)/ups-service/page.tsx` — likely dedicated public UPS service route; route name is unresolved.
- `src/app/(shop)/solar-solutions/page.tsx` — likely dedicated public solar route; route name is unresolved.
- `src/components/layout/Header.tsx` — add desktop links for both sections, preserving existing client/session/cart behavior.
- `src/components/layout/MobileNav.tsx` — recommended companion update to keep mobile navigation aligned with desktop.
- `src/components/` — likely new domain components under `services/`, `ups/`, or `solar/`; the repository currently has no service component namespace.
- `src/app/api/` — only needed if inquiry/quote submissions or calculator computation require server-side handling; no matching endpoint exists.
- `prisma/schema.prisma` and migrations — only needed if leads/requests must persist; no persistence requirement is stated.
- `public/` or an external image provider — needed for the three Figma image areas unless approved assets already exist outside this checkout.
- `src/app/layout.tsx` — likely metadata update for new pages only if route-level metadata is added; global metadata currently describes the product store.

## Ambiguities and Unresolved Decisions

1. **Route slugs and labels:** Figma names are Spanish, while implementation-friendly candidates are `/servicio-tecnico-ups` and `/soluciones-solares`; the exact canonical URLs and nav labels are not specified.
2. **Navigation scope:** The request explicitly names `Header.tsx`, but mobile navigation is separate and would otherwise omit the new sections.
3. **CTA behavior:** “Solicitar evaluación”, “Solicitar servicio técnico”, “Contactar asesor”, and solar quote actions have no defined destination. Existing WhatsApp utilities may be reusable, but a service-specific message contract is not defined.
4. **Solar calculator:** The reference shows sample output but gives no formula, irradiance assumptions, tariff/currency rules, minimum input requirements, or whether output is informational only.
5. **Solar quote submission:** Persistence, notification channel, API contract, spam protection, privacy consent, and success/error UX are unspecified.
6. **UPS request form:** The UPS design shows CTAs but no actual form fields or request flow.
7. **Image licensing and delivery:** Figma image refs need to be exported/downloaded or replaced with approved assets. The current public assets do not include these images.
8. **Responsive behavior:** Desktop dimensions and card arrangements are defined, but mobile breakpoints, stacking order, and calculator/form behavior are not.
9. **Language consistency:** The product UI is predominantly Spanish, while the technical artifact and source conventions are English-oriented; new UI copy should follow the existing Spanish storefront language.

## Approaches

1. **Static route-first landing pages with client-only inquiry/estimator behavior**
   - Pros: Closely matches the Figma scope, keeps the first delivery focused, reuses existing shadcn primitives, and avoids premature schema/API design.
   - Cons: Quote submissions need a temporary destination or cannot be functional; the calculator must either be explicitly illustrative or use undocumented assumptions.
   - Effort: Medium.

2. **Full lead-capture feature with Route Handlers and persistence**
   - Pros: Makes CTAs and solar quotes operational, validates with zod, supports future admin follow-up, and provides an auditable submission path.
   - Cons: Requires product decisions for lead schema, notification/storage, privacy, authentication/rate limiting, migrations, and operational handling beyond the supplied Figma.
   - Effort: High.

3. **Single shared service-page system driven by configuration**
   - Pros: Reuses hero/cards/CTA/layout primitives across UPS and solar and reduces long-term visual drift.
   - Cons: Solar’s calculator, quote form, and integration flow are substantially different from UPS; over-generalization could obscure domain behavior and increase initial complexity.
   - Effort: Medium-High.

## Recommendation

Proceed with dedicated `(shop)` pages and domain-specific components, sharing only stable presentation primitives such as section headers, hero shell, service cards, and CTA styling. Implement the visual Figma scope first, with responsive stacking and accessible form controls. Treat the calculator and inquiry forms as explicit product decisions: either ship a clearly labeled informational estimator and a defined existing contact/WhatsApp handoff, or split persistence/notifications into a follow-up change. Add both links to desktop and mobile navigation for parity, using final slugs only after the orchestrator resolves naming. Keep the first implementation below the 400-line review budget by separating shared layout primitives from the solar form/calculator work if necessary.

## Risks

- The solar page can easily exceed the review budget because it combines a landing page, calculator, quote form, and integration diagram.
- Implementing sample calculator values without an agreed formula could present misleading energy or sizing advice.
- CTAs that look functional but have no agreed destination create a broken conversion path.
- Figma image references cannot be copied directly into the app; missing or unlicensed assets can block visual parity.
- Adding links only to `Header.tsx` would leave mobile users without equivalent discovery paths.
- A new lead API or Prisma model introduces privacy, validation, abuse, migration, and operational responsibilities not covered by the request.
- The global metadata currently describes a technology store, so SEO metadata for service pages should be handled deliberately rather than copied from the root.

## Ready for Proposal

Yes, for a visual-first proposal. The orchestrator should record the unresolved route, CTA/submission, calculator, asset, and responsive decisions before implementation. If fully operational quote capture is required, this should be treated as a separate scoped capability or explicitly accepted as a high-risk expansion.
