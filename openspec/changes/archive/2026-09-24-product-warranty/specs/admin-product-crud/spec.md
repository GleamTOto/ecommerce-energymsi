# Delta for Admin Product CRUD

## ADDED Requirements

### Requirement: Warranty Input in Product Form

The `ProductForm` component MUST include a text input for `warranty` in the "Informacion Basica" card. The input MUST be optional — leaving it empty MUST be valid. The zod schema MUST define `warranty: z.string().optional()` (or equivalent that accepts empty/undefined). The `ProductFormInitialData` interface MUST include `warranty?: string | null`. The placeholder SHOULD suggest the expected format (e.g. "Ej: 1 ano, 6 meses").

#### Scenario: Create product with warranty

- GIVEN the admin is on the create product page
- WHEN the admin fills in "1 ano de garantia" in the warranty field and submits
- THEN the POST request MUST include `warranty: "1 ano de garantia"`
- AND the product MUST be created successfully

#### Scenario: Create product without warranty

- GIVEN the admin is on the create product page
- WHEN the admin leaves the warranty field empty and submits
- THEN the POST request MUST include `warranty: undefined` or omit the field
- AND the product MUST be created successfully with warranty = null in the database

#### Scenario: Edit product pre-fills warranty

- GIVEN an existing product with warranty = "2 anos"
- WHEN the admin navigates to the edit page
- THEN the warranty input MUST be pre-filled with "2 anos"

#### Scenario: Edit product clears warranty

- GIVEN an existing product with warranty = "1 ano"
- WHEN the admin clears the warranty field and saves
- THEN the PUT request MUST send warranty as empty string or null
- AND the product MUST be updated with warranty = null in the database

#### Scenario: Warranty validation accepts special characters

- GIVEN the admin types "Garantia limitada de 2 anos (cobertura total)" in the warranty field
- WHEN the form validates
- THEN the value MUST pass validation without errors
- AND special characters (parentheses, accents) MUST be preserved

### Requirement: API Endpoints Accept Warranty

The `POST /api/products` route handler MUST accept and persist the `warranty` field from the request body. The `PUT /api/products/[id]` route handler MUST accept and persist the `warranty` field. The `GET /api/products/[id]` route handler MUST return the `warranty` field in its response. Empty string warranty values SHOULD be normalized to null before persisting.

#### Scenario: POST creates product with warranty

- GIVEN a POST request to `/api/products` with body containing `warranty: "6 meses"`
- WHEN the route handler processes the request
- THEN the product MUST be created with warranty = "6 meses" in the database
- AND the response MUST include the warranty field

#### Scenario: POST creates product without warranty

- GIVEN a POST request to `/api/products` with no `warranty` field in the body
- WHEN the route handler processes the request
- THEN the product MUST be created with warranty = null in the database

#### Scenario: PUT updates warranty value

- GIVEN a PUT request to `/api/products/abc123` with body containing `warranty: "3 anos"`
- WHEN the route handler processes the request
- THEN the product's warranty MUST be updated to "3 anos"

#### Scenario: PUT clears warranty to null

- GIVEN a PUT request to `/api/products/abc123` with body containing `warranty: ""`
- WHEN the route handler processes the request
- THEN the product's warranty MUST be set to null in the database

#### Scenario: GET returns warranty field

- GIVEN a product with warranty = "1 ano" in the database
- WHEN a GET request is made to `/api/products/{id}`
- THEN the response JSON MUST include `warranty: "1 ano"`

#### Scenario: GET returns warranty as null

- GIVEN a product with warranty = null in the database
- WHEN a GET request is made to `/api/products/{id}`
- THEN the response JSON MUST include `warranty: null` or omit the field

### Requirement: Edit Page Includes Warranty in Initial Data

The edit page at `/admin/products/[id]/edit/page.tsx` MUST include `warranty` when constructing the `ProductFormInitialData` object from the API response.

#### Scenario: Edit page passes warranty to form

- GIVEN a product fetched from the API with warranty = "2 anos"
- WHEN the edit page constructs initialData
- THEN initialData.warranty MUST be "2 anos"
- AND the ProductForm MUST receive this value and pre-fill the input
