# Research: Solar calculator and quotation behavior

**Artifact type:** `gentle-ai.sdd-research/v1`  
**Revision:** 2  
**Outcome:** `partial`  
**Change:** `ups-and-solar-solutions`

## Selected research intent

Resolve the solar section's calculator behavior and quotation/lead-submission behavior, plus any UPS technical interaction required by the supplied Figma references. Keep implementation choices separate from evidence.

## Admission

- **Requested source classes:** `documentation`, `open-web`
- **Declared evidence grants:**
  - `documentation=["/home/cristian/Proyectos/ecommerce-energymsi"]`
  - `open-web=["https://www.figma.com/design/vJkxrLICPks4v1xmN9LAVt/EnergyMSI?node-id=79-4&m=dev", "https://www.figma.com/design/vJkxrLICPks4v1xmN9LAVt/EnergyMSI?node-id=79-96&m=dev"]`
- **Admission result:** admitted for both declared classes
- **Observed grants:** same as declared above
- **Evidence boundary:** repository evidence is admitted under `documentation`; Figma evidence is admitted under `open-web`. Persistence access is not evidence and contributes no claims.

## Sources

| ID | Class | Title | Publisher | URL | Accessed | Evidence excerpt |
|---|---|---|---|---|---|---|
| `repo-header` | documentation | Storefront header navigation | EnergyMSI repository | `file:///home/cristian/Proyectos/ecommerce-energymsi/src/components/layout/Header.tsx` | 2026-09-18 | The desktop header exposes a `/products` store link and mounts `MobileNav`; it has no UPS or solar links. |
| `repo-mobile-nav` | documentation | Mobile storefront navigation | EnergyMSI repository | `file:///home/cristian/Proyectos/ecommerce-energymsi/src/components/layout/MobileNav.tsx` | 2026-09-18 | The mobile sheet has an independent navigation structure with product categories and a store link. |
| `repo-whatsapp` | documentation | WhatsApp checkout handoff | EnergyMSI repository | `file:///home/cristian/Proyectos/ecommerce-energymsi/src/lib/whatsapp-message.ts` | 2026-09-18 | The repository defines a canonical business WhatsApp number and a `wa.me` deep-link builder. |
| `repo-whatsapp-ui` | documentation | WhatsApp checkout interaction | EnergyMSI repository | `file:///home/cristian/Proyectos/ecommerce-energymsi/src/components/cart/WhatsAppCheckoutButton.tsx` | 2026-09-18 | Existing checkout validates the configured phone, builds a message, clears the cart, and opens WhatsApp in a new window. |
| `repo-form-pattern` | documentation | Product form validation pattern | EnergyMSI repository | `file:///home/cristian/Proyectos/ecommerce-energymsi/src/components/admin/ProductForm.tsx` | 2026-09-18 | Existing forms use `react-hook-form`, `zodResolver`, and a Zod schema. |
| `repo-api-pattern` | documentation | Route Handler API pattern | EnergyMSI repository | `file:///home/cristian/Proyectos/ecommerce-energymsi/src/app/api/hero-banner/route.ts` | 2026-09-18 | API behavior is implemented with Next.js Route Handler `GET`/`PUT` functions and JSON responses. |
| `figma-ups-79-4` | open-web | UPS technical service section | Figma / EnergyMSI | `https://www.figma.com/design/vJkxrLICPks4v1xmN9LAVt/EnergyMSI?node-id=79-4&m=dev` | 2026-09-18 | The UPS page has hero and CTA buttons labeled “Solicitar servicio técnico” and “Contactar asesor”; the reference does not specify their destinations or a request form. |
| `figma-solar-79-96` | open-web | Solar solutions section | Figma / EnergyMSI | `https://www.figma.com/design/vJkxrLICPks4v1xmN9LAVt/EnergyMSI?node-id=79-96&m=dev` | 2026-09-18 | The solar page includes a calculator, results panel, quote form, battery toggle, and “Solicitar cotización” action. It also labels the estimate as informational and says the definitive solution depends on technical evaluation and installation conditions. |
| `figma-solar-calculator` | open-web | Solar calculator nodes | Figma / EnergyMSI | `https://www.figma.com/design/vJkxrLICPks4v1xmN9LAVt/EnergyMSI?node-id=79-96&m=dev` | 2026-09-18 | Calculator inputs are monthly kWh, average bill value, city, and installation type; illustrative results show analyzed consumption, estimated kWp, estimated generation, and optional backup. No formula or assumptions are provided. |
| `figma-solar-quote-form` | open-web | Solar quotation form nodes | Figma / EnergyMSI | `https://www.figma.com/design/vJkxrLICPks4v1xmN9LAVt/EnergyMSI?node-id=79-96&m=dev` | 2026-09-18 | The form requests name, company, contact phone, email, city, approximate monthly consumption, approximate last bill, installation type, battery-backup preference, and an additional message. No submission destination, persistence, notification, consent, or outcome state is provided. |

## Validated claims

1. **Calculator presentation:** The Figma reference defines the calculator's visible inputs and result categories, but explicitly presents the result as informational. `figma-solar-79-96`, `figma-solar-calculator`
2. **Calculator contract gap:** Neither the admitted Figma reference nor the admitted repository evidence defines the sizing formula, irradiance assumptions, tariff/currency rules, validation thresholds, rounding, or whether battery output is computed. `figma-solar-79-96`, `figma-solar-calculator`
3. **Quotation capture shape:** The Figma reference defines the fields and a “Solicitar cotización” action, but does not define where the submission goes or what success and error states look like. `figma-solar-quote-form`
4. **Existing contact precedent:** The repository has a WhatsApp deep-link convention that can open a prefilled business message, but it is currently implemented for cart checkout, not service leads. `repo-whatsapp`, `repo-whatsapp-ui`
5. **UPS interaction gap:** The UPS Figma reference defines service-request and advisor-contact CTAs but no fields, destination, validation, persistence, or confirmation behavior. `figma-ups-79-4`
6. **Navigation impact:** Desktop and mobile navigation are separate implementations; adding links only to `Header.tsx` would not add equivalent mobile discovery. `repo-header`, `repo-mobile-nav`

## Unsupported questions and uncertainty

- The calculator cannot be made evidence-backed as a production sizing tool without a formula and assumptions.
- The quote form cannot be assigned a WhatsApp, email, Route Handler, CRM, or database destination from the admitted sources.
- The UPS CTAs cannot be assigned a route or lead workflow from the admitted sources.
- Required-field rules, privacy consent, spam protection, rate limiting, and success/error UX are unspecified.
- Figma image references establish visual content but do not establish an application asset license or delivery mechanism.

## Product choices kept separate

The following are not evidence claims and require orchestrator confirmation:

- Ship an informational estimator with an explicit disclaimer, or define and implement a sizing model.
- Use a WhatsApp handoff, a Route Handler, or another lead destination for quote and UPS actions.
- Persist leads and add notification/admin follow-up, or keep the first delivery non-persistent.
- Choose canonical route slugs and whether desktop and mobile navigation receive the same links.

## Research outcome

The evidence lane is **partial**: the references establish the UI shape and the repository establishes reusable contact/form conventions, but they do not resolve the calculator formula or lead-submission behavior. Proposal readiness remains blocked until the orchestrator confirms product decisions or narrows the implementation to an explicitly informational, non-persistent behavior.
