# Admin Product CRUD Specification

## Purpose

Provide complete admin CRUD (Create, Read, Update, Delete) for products with the new data model fields (SKU, supplier, cost, margin, unit, minStock, status), enabling daily operational use.

## Requirements

### Requirement: Admin Product List

The admin product list at `/admin/products` MUST display all products with columns: image thumbnail, SKU, name, supplier, category, price (COP), stock, status, actions (edit/delete). It MUST support search by name/SKU, filter by supplier/category/status, and pagination.

#### Scenario: List with new columns

- GIVEN 106 products in the database
- WHEN the admin navigates to `/admin/products`
- THEN the table MUST show SKU, supplier, status columns
- AND prices MUST use `formatCOP()`
- AND the list MUST be paginated (20 per page)

#### Scenario: Search by SKU

- GIVEN a product with SKU "NET-001"
- WHEN the admin types "NET-001" in the search box
- THEN only that product MUST appear in the results

#### Scenario: Filter by status

- GIVEN products with ACTIVE, INACTIVE, and OUT_OF_STOCK statuses
- WHEN the admin filters by "OUT_OF_STOCK"
- THEN only out-of-stock products MUST be shown

### Requirement: Admin Product Create

The create form at `/admin/products/new` MUST include fields for all new data model properties: name, SKU, description, supplier (select), category (select), unit (select), cost (COP), price (COP), margin (auto-calculated or manual), stock, minStock, status. Images MUST be optional (not required).

The form MUST use `react-hook-form` with `zod` validation. On submit, it MUST call a Route Handler (`POST /api/products`).

#### Scenario: Create product with all fields

- GIVEN the admin fills in all required fields
- WHEN the form is submitted
- THEN a new Product MUST be created via Route Handler
- AND the admin MUST be redirected to the product list
- AND a success toast MUST appear

#### Scenario: Auto-calculate margin

- GIVEN cost = 100000 and price = 150000
- WHEN both fields are filled
- THEN margin MUST auto-calculate to 33.33% (or display computed value)
- AND the admin MAY override it manually

#### Scenario: Create product without images

- GIVEN the admin does not upload any images
- WHEN the form is submitted
- THEN the product MUST be created successfully
- AND the product MUST show a skeleton placeholder in the list

### Requirement: Admin Product Edit

A dedicated edit page MUST exist at `/admin/products/[id]/edit`. It MUST pre-fill all fields with current product data. It MUST use `react-hook-form` with `zod` validation. On submit, it MUST call a Route Handler (`PUT /api/products/[id]`).

#### Scenario: Edit product price

- GIVEN an existing product with price 150000
- WHEN the admin changes price to 180000 and saves
- THEN the product price MUST be updated to 180000
- AND the change MUST be reflected in the catalog immediately

#### Scenario: Edit page loads product data

- GIVEN a product with SKU "NET-001"
- WHEN the admin navigates to `/admin/products/{id}/edit`
- THEN all fields MUST be pre-filled with current values
- AND supplier and category selects MUST show current selections

### Requirement: Admin Product Delete

The admin MUST be able to delete products. A delete button MUST exist on the edit page and/or list page. Deletion MUST require confirmation (dialog or confirmation step). It MUST call a Route Handler (`DELETE /api/products/[id]`).

#### Scenario: Delete product with confirmation

- GIVEN an existing product
- WHEN the admin clicks delete and confirms
- THEN the product MUST be removed from the database
- AND the admin MUST be redirected to the product list
- AND a success toast MUST appear

#### Scenario: Delete cancelled

- GIVEN an existing product
- WHEN the admin clicks delete but cancels the confirmation
- THEN the product MUST NOT be deleted

### Requirement: Route Handlers

All CRUD operations MUST use Route Handlers (not Server Actions):

- `GET /api/products` — list with search, filter, pagination
- `POST /api/products` — create
- `GET /api/products/[id]` — get single product
- `PUT /api/products/[id]` — update
- `DELETE /api/products/[id]` — delete

#### Scenario: API returns paginated results

- GIVEN 106 products and request `GET /api/products?page=2&limit=20`
- WHEN the Route Handler processes the request
- THEN it MUST return products 21-40
- AND the response MUST include total count and page info

### Requirement: Form Validation with Zod

All forms MUST validate with zod schemas:

- `sku`: required, string, unique
- `name`: required, min 3 characters
- `price`: required, number > 0
- `cost`: required, number >= 0
- `stock`: required, integer >= 0
- `minStock`: optional, integer >= 0
- `supplierId`: required
- `categoryId`: required

#### Scenario: Validation error on submit

- GIVEN the admin submits the form with price = -100
- WHEN zod validation runs
- THEN an error message MUST appear next to the price field
- AND the form MUST NOT be submitted

## Dependencies

- `product-data-model`: All new fields must exist in Prisma schema and types
- `cop-currency`: formatCOP must be available for price display
- `product-image-placeholders`: ProductImage component for thumbnails

## Constraints

- No modals for forms — use dedicated pages (project rule)
- No Server Actions — use Route Handlers (project rule)
- Use `react-hook-form` + `zod` for all forms (project rule)
- Use `Zustand` if global state needed for form state
- Server Components by default, `"use client"` only for form interactivity
- Use `cn()` from `@/lib/utils` for class merging
