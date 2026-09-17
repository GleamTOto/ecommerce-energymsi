"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Settings,
  Package,
  ChevronDown,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "./MobileNav";
import { SearchBar } from "./SearchBar";
import { useCartStore } from "@/stores/cart-store";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="120"
              height="30"
              viewBox="0 0 223 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-auto"
            >
              <path
                d="M2.812 42.5V14.76H9.652V42.5H2.812ZM8.892 42.5V36.724H20.596V42.5H8.892ZM8.892 31.29V25.514H19.798V31.29H8.892ZM8.892 20.536V14.76H20.368V20.536H8.892ZM23.8003 42.5V14.76H35.3903L44.6243 36.876H45.9543L45.1943 37.56V14.76H51.8063V42.5H40.1403L30.9063 20.384H29.5763L30.3363 19.7V42.5H23.8003ZM55.9214 42.5V14.76H62.7614V42.5H55.9214ZM62.0014 42.5V36.724H73.7054V42.5H62.0014ZM62.0014 31.29V25.514H72.9074V31.29H62.0014ZM62.0014 20.536V14.76H73.4774V20.536H62.0014ZM76.9097 42.5V14.532H83.9777V42.5H76.9097ZM93.6297 42.5L85.8397 30.72H93.5157L101.762 42.5H93.6297ZM82.1917 33.988V28.554H88.8417C89.6777 28.554 90.3997 28.3893 91.0077 28.06C91.6157 27.7307 92.0843 27.262 92.4137 26.654C92.7683 26.046 92.9457 25.3367 92.9457 24.526C92.9457 23.69 92.7683 22.968 92.4137 22.36C92.0843 21.752 91.6157 21.2833 91.0077 20.954C90.3997 20.6247 89.6777 20.46 88.8417 20.46H82.1917V14.532H88.4237C90.8303 14.532 92.9077 14.8993 94.6557 15.634C96.4037 16.3433 97.7463 17.4073 98.6837 18.826C99.621 20.2193 100.09 21.9547 100.09 24.032V24.64C100.09 26.7173 99.6083 28.4527 98.6457 29.846C97.7083 31.214 96.3657 32.2527 94.6177 32.962C92.895 33.646 90.8303 33.988 88.4237 33.988H82.1917ZM116.656 43.26C114.046 43.26 111.804 42.8293 109.93 41.968C108.055 41.0813 106.522 39.9287 105.332 38.51C104.141 37.0913 103.267 35.546 102.71 33.874C102.152 32.202 101.874 30.568 101.874 28.972V28.136C101.874 26.4133 102.165 24.716 102.748 23.044C103.33 21.3467 104.204 19.814 105.37 18.446C106.56 17.078 108.042 15.9887 109.816 15.178C111.589 14.342 113.666 13.924 116.048 13.924C118.606 13.924 120.861 14.3927 122.812 15.33C124.788 16.2673 126.371 17.572 127.562 19.244C128.752 20.8907 129.449 22.8033 129.652 24.982H122.584C122.432 24.146 122.064 23.3987 121.482 22.74C120.899 22.056 120.139 21.524 119.202 21.144C118.29 20.7387 117.238 20.536 116.048 20.536C114.908 20.536 113.894 20.7387 113.008 21.144C112.146 21.524 111.412 22.0813 110.804 22.816C110.221 23.5253 109.778 24.374 109.474 25.362C109.17 26.35 109.018 27.4267 109.018 28.592C109.018 29.7573 109.182 30.8467 109.512 31.86C109.841 32.848 110.322 33.722 110.956 34.482C111.589 35.2167 112.387 35.7867 113.35 36.192C114.312 36.5973 115.414 36.8 116.656 36.8C118.226 36.8 119.582 36.4707 120.722 35.812C121.862 35.1533 122.66 34.2793 123.116 33.19L122.584 37.37V31.328H129.044V37.028C127.878 39.0293 126.219 40.5747 124.066 41.664C121.938 42.728 119.468 43.26 116.656 43.26ZM115.896 32.696V27.756H131.324V32.696H115.896ZM137.526 32.088L129.66 14.76H136.88L142.162 27.11L141.174 26.768H143.91L142.846 27.11L147.52 14.76H154.36L147.178 32.088H137.526ZM138.894 42.5V31.176H145.81V42.5H138.894Z"
                fill="#FB8709"
              />
              <line
                x1="167"
                y1="1.75"
                x2="178"
                y2="1.75"
                stroke="#FB8709"
                strokeWidth="3.5"
              />
              <line
                x1="168.75"
                y1="3.5"
                x2="168.75"
                y2="14.5"
                stroke="#FB8709"
                strokeWidth="3.5"
              />
              <line
                x1="208"
                y1="1.75"
                x2="219"
                y2="1.75"
                stroke="#FB8709"
                strokeWidth="3.5"
              />
              <line
                x1="220.75"
                y1="3.5"
                x2="220.75"
                y2="14.5"
                stroke="#FB8709"
                strokeWidth="3.5"
              />
              <line
                x1="167"
                y1="53.75"
                x2="178"
                y2="53.75"
                stroke="#FB8709"
                strokeWidth="3.5"
              />
              <line
                x1="168.75"
                y1="44.5"
                x2="168.75"
                y2="55.5"
                stroke="#FB8709"
                strokeWidth="3.5"
              />
              <line
                x1="220.75"
                y1="44.5"
                x2="220.75"
                y2="55.5"
                stroke="#FB8709"
                strokeWidth="3.5"
              />
              <line
                x1="208"
                y1="53.75"
                x2="219"
                y2="53.75"
                stroke="#FB8709"
                strokeWidth="3.5"
              />
              <path
                d="M174.943 36V21.4H179.463L182.803 29.6H183.183L186.483 21.4H191.083V36H187.843V23.54L188.303 23.58L184.443 33.04H181.323L177.443 23.58L177.943 23.54V36H174.943ZM199.437 36.38C198.117 36.38 197.003 36.1733 196.097 35.76C195.19 35.3333 194.503 34.76 194.037 34.04C193.57 33.3067 193.337 32.4667 193.337 31.52H196.517C196.517 31.8933 196.617 32.24 196.817 32.56C197.03 32.88 197.35 33.14 197.777 33.34C198.203 33.5267 198.757 33.62 199.437 33.62C200.05 33.62 200.563 33.54 200.977 33.38C201.39 33.22 201.703 33 201.917 32.72C202.13 32.4267 202.237 32.0933 202.237 31.72C202.237 31.2533 202.037 30.8867 201.637 30.62C201.237 30.34 200.59 30.16 199.697 30.08L198.597 29.98C197.143 29.86 195.983 29.4067 195.117 28.62C194.25 27.8333 193.817 26.7933 193.817 25.5C193.817 24.5667 194.037 23.76 194.477 23.08C194.93 22.4 195.557 21.88 196.357 21.52C197.157 21.1467 198.103 20.96 199.197 20.96C200.343 20.96 201.323 21.16 202.137 21.56C202.963 21.9467 203.597 22.5 204.037 23.22C204.477 23.9267 204.697 24.76 204.697 25.72H201.497C201.497 25.36 201.41 25.0333 201.237 24.74C201.063 24.4333 200.803 24.1867 200.457 24C200.123 23.8133 199.703 23.72 199.197 23.72C198.717 23.72 198.31 23.8 197.977 23.96C197.657 24.12 197.417 24.34 197.257 24.62C197.097 24.8867 197.017 25.18 197.017 25.5C197.017 25.9133 197.163 26.2733 197.457 26.58C197.75 26.8867 198.23 27.0667 198.897 27.12L200.017 27.22C201.083 27.3133 202.023 27.5467 202.837 27.92C203.65 28.28 204.283 28.78 204.737 29.42C205.203 30.0467 205.437 30.8133 205.437 31.72C205.437 32.6533 205.19 33.4733 204.697 34.18C204.217 34.8733 203.53 35.4133 202.637 35.8C201.743 36.1867 200.677 36.38 199.437 36.38ZM207.737 36V21.4H211.017V36H207.737Z"
                fill="#FB8709"
              />
            </svg>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden flex-1 max-w-xl md:flex">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Tienda Link */}
            <Link href="/products" className="hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold gap-2 text-primary hover:text-primary hover:bg-primary/10"
              >
                <Store className="h-4 w-4" />
                TIENDA
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Favoritos</span>
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <ShoppingCart className="h-4 w-4" />
                {mounted && itemCount > 0 && (
                  <Badge
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    variant="destructive"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </Badge>
                )}
                <span className="sr-only">Carrito</span>
              </Button>
            </Link>

            {/* Auth Section */}
            {mounted && status !== "loading" && (
              <>
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="hidden h-9 gap-1 px-2 sm:flex"
                      >
                        <User className="h-4 w-4" />
                        <span className="max-w-24 truncate text-sm">
                          {session.user?.name?.split(" ")[0]}
                        </span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {session.user?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {session.user?.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Mi Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/orders" className="cursor-pointer">
                          <Package className="mr-2 h-4 w-4" />
                          Mis Pedidos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/profile/settings"
                          className="cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Configuración
                        </Link>
                      </DropdownMenuItem>
                      {session.user?.role === "ADMIN" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer">
                              <Settings className="mr-2 h-4 w-4" />
                              Panel Admin
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden items-center gap-2 sm:flex">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Ingresar
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm">Registrarse</Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu */}
            <MobileNav />
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="pb-3 md:hidden">
          <SearchBar mobile />
        </div>
      </div>
    </header>
  );
}
