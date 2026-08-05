# COP Currency Specification

## Purpose

Establish Colombian Peso (COP) as the sole currency across the application, providing a shared `formatCOP` utility and replacing all 39 hardcoded `S/` (Peruvian Sol) occurrences with proper COP formatting.

## Requirements

### Requirement: formatCOP Utility

A shared utility function `formatCOP` MUST exist at `src/lib/format-currency.ts`. It MUST use `Intl.NumberFormat` with locale `es-CO` and currency `COP`. It MUST format numbers as `$X.XXX` (COP uses thousands separators, no decimal cents in common display).

Signature: `formatCOP(amount: number): string`

#### Scenario: Format typical product price

- GIVEN a price of 150000 (COP)
- WHEN `formatCOP(150000)` is called
- THEN it MUST return `"$150.000"` (COP format with thousands separator)

#### Scenario: Format zero

- GIVEN an amount of 0
- WHEN `formatCOP(0)` is called
- THEN it MUST return `"$0"`

#### Scenario: Format large amount

- GIVEN an amount of 2500000 (2.5 million COP)
- WHEN `formatCOP(2500000)` is called
- THEN it MUST return `"$2.500.000"`

### Requirement: Replace All S/ Occurrences

All 39 hardcoded `S/` occurrences across the codebase MUST be replaced with `formatCOP()`. Affected files include:

- `ProductCard.tsx` (2 occurrences)
- `PriceFilter.tsx` (2 occurrences)
- `ProductDetail.tsx` (3 occurrences)
- `OrderSummary.tsx` (4 occurrences)
- `CartSummary.tsx` (4 occurrences)
- `CartItem.tsx` (2 occurrences)
- `profile/page.tsx` (1 occurrence)
- `profile/orders/page.tsx` (2 occurrences)
- `admin/page.tsx` (2 occurrences)
- `admin/products/page.tsx` (1 occurrence)
- `admin/products/new/page.tsx` (1 occurrence)
- `admin/users/page.tsx` (2 occurrences)
- `admin/payments/page.tsx` (6 occurrences)
- `admin/settings/page.tsx` (2 occurrences)
- `profile/settings/page.tsx` (1 occurrence)
- `api/checkout/route.ts` (3 occurrences — comments)

#### Scenario: ProductCard displays COP

- GIVEN a product with price 150000
- WHEN the ProductCard renders
- THEN it MUST display `$150.000` (not `S/ 150000.00`)

#### Scenario: Zero S/ remaining after replacement

- GIVEN the formatCOP utility is implemented
- WHEN a grep search for `S/` is run across all .ts/.tsx files
- THEN zero occurrences of `S/` used as currency prefix MUST remain
- AND only comments or non-currency references MAY remain

### Requirement: Stripe Currency Configuration

The Stripe checkout route MUST use `currency: "cop"` instead of `currency: "pen"`. Stripe amounts for COP MUST be in minor units (centavos — though COP has no centavos, Stripe expects integer amounts).

#### Scenario: Stripe checkout with COP

- GIVEN a cart total of $150.000 COP
- WHEN the Stripe checkout session is created
- THEN the amount MUST be `150000` (integer, COP has no decimal subdivisions)
- AND currency MUST be `"cop"`

### Requirement: Price Filter Range

The `PriceFilter` component MUST support COP range values (millions, not thousands). The hardcoded max of 5000 MUST be replaced with a dynamic range based on actual catalog data.

#### Scenario: Price filter with COP values

- GIVEN products ranging from $5.000 to $5.000.000 COP
- WHEN the price filter is rendered
- THEN the slider MUST support values up to at least the maximum product price
- AND labels MUST use `formatCOP()` for display

## Dependencies

- None (independent utility, can be implemented in parallel with other capabilities)

## Constraints

- Use `Intl.NumberFormat` — no manual string formatting
- Must handle both integer and decimal inputs gracefully
- COP locale: `es-CO`, no decimal places in common display (`minimumFractionDigits: 0`)
