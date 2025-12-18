"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Clock, TrendingUp, Users, MessageCircle, Settings } from "lucide-react"

interface MobileMenuProps {
  isDark: boolean
  isAdmin: boolean
  onAdminClick: () => void
  onShowSoldRecent?: () => void
  onShowCalendar?: () => void
  onScrollToUpcoming?: () => void
  onShowTeam?: () => void
  onShowWhy?: () => void
  onShowContact?: () => void
  onShowTerms?: () => void
  onShowSettings?: () => void
}

export default function MobileMenu({
  isDark,
  isAdmin,
  onAdminClick,
  onShowSoldRecent,
  onShowCalendar,
  onScrollToUpcoming,
  onShowTeam,
  onShowWhy,
  onShowContact,
  onShowTerms,
  onShowSettings
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      section: "Sold",
      items: [
        { label: "Recent", icon: Clock, onClick: () => onShowSoldRecent?.() },
      ]
    },
    {
      section: "Next",
      items: [
        { label: "Calendar", icon: Clock, onClick: () => onShowCalendar?.() },
        { label: "What's up next", icon: TrendingUp, onClick: () => onScrollToUpcoming?.() },
      ]
    },

    {
      section: "About",
      items: [
        { label: "Team", icon: Users, onClick: () => onShowTeam?.() },
        { label: "WHY", icon: MessageCircle, onClick: () => onShowWhy?.() },
        { label: "Contact Us", icon: MessageCircle, onClick: () => onShowContact?.() },
        { label: "T&Cs", icon: MessageCircle, onClick: () => onShowTerms?.() },
        { label: "Settings", icon: Settings, onClick: () => onShowSettings?.() },
      ]
    }
  ]

  const handleItemClick = (onClick: () => void) => {
    onClick()
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className={`p-2 bg-transparent lg:hidden border-none ${isDark
            ? "text-white hover:bg-white hover:text-black"
            : "text-black hover:bg-black hover:text-white"
            }`}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        className={`w-[300px] sm:w-[350px] ${isDark ? "bg-[#000000] border-white" : "bg-white border-black"
          }`}
      >
        <SheetHeader className="pb-4">
          <SheetTitle className={`text-lg font-bold ${isDark ? "text-white" : "text-black"
            }`}>
            Menu
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col space-y-6">
          {menuItems.map((section) => (
            <div key={section.section}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                {section.section}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Button
                      key={item.label}
                      variant="ghost"
                      onClick={() => handleItemClick(item.onClick)}
                      className="w-full justify-start text-sm font-normal bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white hover:bg-black hover:text-white hover:border-white dark:hover:bg-white dark:hover:text-black dark:hover:border-black rounded-lg"
                    >
                      <IconComponent className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}

          {isAdmin && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => {
                  onAdminClick()
                  setIsOpen(false)
                }}
                variant="ghost"
                className="w-full justify-start text-sm font-normal bg-white dark:bg-[#000000] text-black dark:text-white border border-black dark:border-white hover:bg-black hover:text-white hover:border-white dark:hover:bg-white dark:hover:text-black dark:hover:border-black rounded-lg"
              >
                <Settings className="mr-3 h-4 w-4" />
                Admin Panel
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
