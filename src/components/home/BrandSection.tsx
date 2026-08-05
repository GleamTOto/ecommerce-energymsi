import { suppliers } from "@/data/mock-products"

export function BrandSection() {
  return (
    <section className="py-12 sm:py-16 border-t">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Proveedores que Confiamos</h2>
          <p className="mt-2 text-muted-foreground">
            Trabajamos con los mejores proveedores del mercado
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: supplier.color }}
              />
              <span className="text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors">
                {supplier.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
