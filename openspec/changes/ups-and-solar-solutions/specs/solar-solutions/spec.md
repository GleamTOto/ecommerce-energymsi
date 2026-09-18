# Solar Solutions Specification

## Purpose

Provide a responsive solar-solutions page with a transparent, informational estimate and a validated WhatsApp quotation handoff.

## Requirements

### Requirement: Present solar solutions

The page MUST be available at `/soluciones-solares` and MUST present the approved solar hero, process/integration content, calculator, result panel, and quotation form. It MUST label the estimate as approximate and state that final sizing depends on technical evaluation and installation conditions.

#### Scenario: Page loads successfully

- GIVEN a visitor opens `/soluciones-solares`
- WHEN the page finishes loading
- THEN the visitor sees the solar content, calculator, informational disclaimer, and quotation entry point

#### Scenario: Responsive presentation

- GIVEN a visitor uses a narrow viewport
- WHEN the page is rendered
- THEN calculator inputs, results, and quote fields stack in a readable order without horizontal scrolling

### Requirement: Calculate a configurable approximate estimate

The calculator MUST accept monthly kWh, average bill value, city, installation type, and an optional battery-backup preference. It MUST use a documented configurable assumption set: `estimated_kWp = monthly_kWh / (days × peak_sun_hours × performance_ratio)` and `estimated_generation = estimated_kWp × days × peak_sun_hours × performance_ratio`. Assumption values, currency/tariff treatment, rounding, and battery treatment MUST be explicitly labeled configurable; the UI MUST NOT present the result as an engineering design, guaranteed savings, or payback.

#### Scenario: Valid estimate

- GIVEN all required calculator values are valid
- WHEN the visitor requests an estimate
- THEN the result panel shows analyzed consumption, estimated kWp, estimated generation, and the selected backup state with the formula/disclaimer available

#### Scenario: Invalid calculator input

- GIVEN a required numeric value is empty, non-positive, non-numeric, or outside its supported range
- WHEN the visitor requests an estimate
- THEN inline field errors identify corrections and no misleading result is shown

### Requirement: Validate and hand off a quotation

The quotation form MUST validate name, phone, city, approximate monthly consumption, approximate last bill, and installation type before handoff. Company, email, battery preference, and additional message MUST be supported when supplied; email MUST be valid when present. A valid submission MUST open WhatsApp only with URL-encoded structured context containing the page, submitted fields, calculator summary when available, and approximate/disclaimer status. It MUST NOT persist the submission.

#### Scenario: Valid quotation

- GIVEN required fields are valid
- WHEN the visitor selects “Solicitar cotización”
- THEN a prefilled WhatsApp conversation opens and the page confirms the handoff without claiming that the quote was stored or accepted

#### Scenario: Validation or destination failure

- GIVEN fields are invalid or the configured WhatsApp destination is unavailable
- WHEN the visitor submits the form
- THEN inline errors or an accessible handoff error is shown, no malformed link opens, and entered values remain available for correction

### Requirement: Accessible calculator and form

Inputs MUST have labels, grouped controls MUST have accessible names, errors MUST be associated with fields, focus MUST move to or clearly identify the first invalid field, and all controls MUST be keyboard operable with visible focus.

## Explicit non-goals

- No production-grade solar sizing, engineering approval, guaranteed savings/payback, tariff promise, battery-capacity guarantee, lead persistence, CRM, email, authentication, payment, or internal quotation API.
