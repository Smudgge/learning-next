import Link from "next/link"
import { Button } from "./ui/button";
import { HomeIcon, ShoppingBasket } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

function Navbar() {

  const links = {
    items: {
      path: "/items",
      name: "Items",
      icon: <ShoppingBasket className="w-4 h-4" />,
    },
    home: {
      path: "/",
      name: "Home",
      icon: <HomeIcon className="w-4 h-4" />,
    },
  }

  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur 
                    supports-backdrop-filter:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-16 justify-between">

        {/* Logo */}
        <div className="flex items-center">
          <Link
            href="/" 
            className="text-xl font-bold text-primary font-mono tracking-wider"
          >
            🧺 Items
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-4">
          {Object.values(links).map((link) => (
            <Button key={link.name} variant="ghost" className="flex items-center gap-2" asChild>
              <Link href={link.path}>
                {link.icon}
                <span className="hidden lg:inline">{link.name}</span>
              </Link>
            </Button>
          ))}

          <ThemeToggle />
        </div>

      </div>
    </nav>
  )
}

export default Navbar