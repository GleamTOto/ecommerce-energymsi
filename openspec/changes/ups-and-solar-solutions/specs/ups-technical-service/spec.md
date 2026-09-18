# UPS Technical Service Specification

## Purpose

Provide a public, responsive UPS technical-service page with Figma-aligned presentation and WhatsApp-only contact actions.

## Requirements

### Requirement: Present UPS service information

The page MUST be available at `/servicio-tecnico-ups` and MUST present the approved UPS hero, service offerings, infrastructure/trust content, and responsive visual hierarchy. Content MUST NOT imply guaranteed engineering outcomes.

#### Scenario: Page loads successfully

- GIVEN a visitor opens `/servicio-tecnico-ups`
- WHEN the page finishes loading
- THEN the visitor sees the UPS hero, service cards, trust/infrastructure content, and contact actions

#### Scenario: Narrow viewport layout

- GIVEN a visitor uses a narrow viewport
- WHEN the page is rendered
- THEN sections stack without horizontal scrolling and actions remain visible and usable

### Requirement: Open structured WhatsApp service contact

The primary service CTA and advisor CTA MUST open the canonical configured business WhatsApp destination with URL-encoded context identifying the UPS page, selected action, and available visitor context. The page MUST NOT persist a lead internally.

#### Scenario: Service CTA handoff

- GIVEN the visitor selects “Solicitar servicio técnico”
- WHEN the CTA is activated
- THEN a new WhatsApp conversation opens with a structured UPS service-request message

#### Scenario: Advisor CTA handoff

- GIVEN the visitor selects “Contactar asesor”
- WHEN the CTA is activated
- THEN a new WhatsApp conversation opens with a structured UPS-advisor message

#### Scenario: WhatsApp configuration is unavailable

- GIVEN the configured WhatsApp destination is invalid or unavailable
- WHEN either CTA is activated
- THEN no malformed link is opened and an accessible, actionable error is shown

### Requirement: Support accessible interaction

All interactive elements MUST have accessible names, visible keyboard focus, sufficient contrast, and logical keyboard order. Decorative imagery MUST have empty alternative text; informative imagery MUST have meaningful alternative text.

#### Scenario: Keyboard activation

- GIVEN a keyboard user focuses a CTA
- WHEN the user presses Enter or Space
- THEN the same WhatsApp handoff occurs as for pointer activation

## Explicit non-goals

- No internal service-request form, database persistence, CRM, email delivery, authentication, payment, or Route Handler is required.
- No claim of diagnosis, repair time, capacity, savings, warranty, or guaranteed result is introduced by this specification.
