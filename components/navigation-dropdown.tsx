"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface DropdownItem {
  label: string
  onClick: () => void
}

interface NavigationDropdownProps {
  title: string
  items: DropdownItem[]
  isDark: boolean
}

export default function NavigationDropdown({ title, items, isDark }: NavigationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 px-4 py-2 text-lg font-semibold ${
          isDark ? "text-white" : "text-black"
        }`}
      >
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 ${isDark ? "text-white" : "text-black"}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown Menu */}
          <div
            className={`absolute top-full left-0 mt-2 w-48 rounded-2xl shadow-lg z-20 ${
              isDark ? "bg-[#000000] border-white" : "bg-white border-black"
            } border`}
          >
            <div className="py-2">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick()
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 text-sm ${
                    isDark ? "text-white hover:bg-white hover:text-black" : "text-black hover:bg-black hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
