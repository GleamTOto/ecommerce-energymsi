# Product Image Placeholders Specification

## Purpose

Provide a shared `ProductImage` component that renders skeleton placeholders when product images are missing, ensuring consistent visual experience across all 6+ image display locations in the application.

## Requirements

### Requirement: ProductImage Component

A shared `ProductImage` component MUST exist at `src/components/products/ProductImage.tsx`. It MUST accept: `src?` (string), `alt` (string), `className?` (string), `priority?` (boolean). When `src` is provided, it MUST render a Next.js `<Image>`. When `src` is absent/empty, it MUST render a skeleton placeholder.

#### Scenario: Product with image

- GIVEN a product that has at least one image URL
- WHEN `<ProductImage src={product.images[0]} alt={product.name} />` is rendered
- THEN the component MUST display the image using Next.js `<Image>`
- AND it MUST apply the provided className

#### Scenario: Product without image

- GIVEN a product with no images (empty array or undefined)
- WHEN `<ProductImage alt={product.name} />` is rendered
- THEN the component MUST display a skeleton placeholder
- AND the skeleton MUST use shadcn/ui `Skeleton` component
- AND the skeleton MUST show a package/image icon centered in the placeholder area

#### Scenario: Image fails to load

- GIVEN a product with an image URL that returns 404
- WHEN the image fails to load
- THEN the component MUST fall back to the skeleton placeholder
- AND it MUST NOT show a broken image icon

### Requirement: Replace All Image Display Locations

All existing image display locations MUST be replaced with the `ProductImage` component. This includes at minimum:

1. `ProductCard.tsx` — product grid cards
2. `ProductGallery.tsx` — product detail gallery
3. `CartItem.tsx` — cart item thumbnails
4. `OrderSummary.tsx` — checkout order summary
5. `admin/products/page.tsx` — admin product list
6. `profile/orders/page.tsx` — order history

#### Scenario: ProductCard shows placeholder

- GIVEN a product without images in the catalog grid
- WHEN the ProductCard renders
- THEN it MUST use `<ProductImage>` instead of direct `<Image>` with `images[0]`
- AND a skeleton placeholder MUST be visible

#### Scenario: CartItem shows placeholder

- GIVEN a cart item whose product has no images
- WHEN the CartItem renders
- THEN it MUST use `<ProductImage>` and show a skeleton

### Requirement: Skeleton Visual Design

The skeleton placeholder MUST match the application's visual design. It MUST use the same aspect ratio as product images (1:1 square for cards, 4:3 for gallery). It MUST respect dark/light theme via CSS variables.

#### Scenario: Skeleton in dark mode

- GIVEN the application is in dark mode
- WHEN a skeleton placeholder is rendered
- THEN the skeleton MUST use `bg-muted` or equivalent theme-aware color
- AND it MUST be visually consistent with other skeleton loaders

## Dependencies

- `product-data-model`: Product type must have optional `images` field
- shadcn/ui `Skeleton` component must be available

## Constraints

- Must be a Client Component if using Next.js `<Image>` with dynamic src
- Use `cn()` utility from `@/lib/utils` for class merging
- Must support responsive sizes via className prop
