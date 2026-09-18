# Service Navigation Specification

## Purpose

Make both new public service destinations discoverable consistently from desktop and mobile storefront navigation.

## Requirements

### Requirement: Expose canonical service routes consistently

Desktop `Header.tsx` and mobile `MobileNav.tsx` MUST both expose links to exactly these canonical destinations: `/servicio-tecnico-ups` and `/soluciones-solares`. Labels and destination meaning MUST be equivalent across viewports.

#### Scenario: Desktop discovery

- GIVEN a visitor uses the desktop storefront header
- WHEN the navigation is visible
- THEN both service links are present and navigate to their canonical routes

#### Scenario: Mobile discovery

- GIVEN a visitor opens the mobile navigation
- WHEN the navigation sheet is visible
- THEN both service links are present and navigate to the same canonical routes

#### Scenario: Active route

- GIVEN the visitor is on either service route
- WHEN the corresponding navigation is displayed
- THEN its link has an accessible active/current indication without changing the destination

### Requirement: Preserve responsive and accessible navigation behavior

The service links MUST follow existing header/mobile navigation interaction patterns, remain keyboard operable, expose accessible link names, and not introduce horizontal overflow or obscure existing storefront navigation.

#### Scenario: Mobile sheet operation

- GIVEN a keyboard or pointer user opens mobile navigation
- WHEN the user activates a service link
- THEN navigation occurs and the mobile navigation closes or otherwise returns control according to its existing pattern

#### Scenario: Existing navigation preservation

- GIVEN a visitor uses existing product, category, account, or cart links
- WHEN the service links are added
- THEN existing destinations and interactions remain available and unchanged

## Explicit non-goals

- No redirect aliases, dynamic service navigation from a database, admin navigation, authorization, analytics contract, or changes to checkout behavior.
