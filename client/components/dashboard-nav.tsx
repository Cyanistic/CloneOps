"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Bot, MessageSquare, Globe, Wrench, Shield } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Agents",
    href: "/agents",
    icon: <Bot className="h-4 w-4" />,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    title: "Social Feed",
    href: "/social",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    title: "Tools",
    href: "/tools",
    icon: <Wrench className="h-4 w-4" />,
  },
  {
    title: "Security",
    href: "/security",
    icon: <Shield className="h-4 w-4" />,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 py-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              asChild
              className={cn("justify-start", pathname === item.href && "bg-accent text-accent-foreground")}
            >
              <Link href={item.href}>
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  )
}
