import Link from "next/link"
import { Button } from "./ui/button";
import { HomeIcon, LayoutDashboard } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LoginButton from "./LoginButton";

function Navbar() {

  const links = {
    items: {
      path: "/dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
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
            ✉️ Inventory
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-4">
          {Object.values(links).map((link) => (
            <Button key={link.name} variant="ghost" className="flex items-center gap-2">
              <Link href={link.path} className="flex items-center gap-2">
                {link.icon}
                <span className="hidden lg:inline">{link.name}</span>
              </Link>
            </Button>
          ))}

          <LoginButton />

          <ThemeToggle />
        </div>

      </div>
    </nav>
  )
}

export default Navbar