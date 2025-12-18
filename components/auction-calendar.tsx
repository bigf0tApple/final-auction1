"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { X, ChevronLeft, ChevronRight, CalendarIcon, ChevronDown, Bell } from "lucide-react"
import { upcomingAuctions, type AuctionEvent, getAuctionStatusWithTime } from "@/lib/auction-data"
import ReminderModal from "./reminder-modal"
import { useChatPinned } from "@/hooks/use-chat-pinned"

interface AuctionCalendarProps {
  onClose: () => void
  isDark: boolean
}

export default function AuctionCalendar({ onClose, isDark }: AuctionCalendarProps) {
  const { isChatPinnedLeft, isChatPinnedRight } = useChatPinned()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"week" | "month" | "year">("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedAuctionForReminder, setSelectedAuctionForReminder] = useState<AuctionEvent | null>(null)

  // Use shared auction data from lib/auction-data.ts
  const auctionEvents = upcomingAuctions

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: Date) => {
    return auctionEvents.filter((event) => {
      const eventDate = new Date(event.startTime)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateYear = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setFullYear(prev.getFullYear() - 1)
      } else {
        newDate.setFullYear(prev.getFullYear() + 1)
      }
      return newDate
    })
  }

  const handleSetReminder = (auction: AuctionEvent) => {
    setSelectedAuctionForReminder(auction)
  }

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Day headers
    const dayHeaders = dayNames.map((day) => (
      <div key={day} className={`p-2 text-center text-xs sm:text-sm font-semibold ${isDark ? "text-gray-400" : "text-gray-600"} border-r border-b ${isDark ? "border-gray-700" : "border-gray-200"} last:border-r-0`}>
        {day}
      </div>
    ))

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className={`p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] border-r border-b ${isDark ? "border-gray-700" : "border-gray-200"} last:border-r-0`}></div>
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const events = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

      days.push(
        <div
          key={day}
          className={`p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] border-r border-b cursor-pointer transition-colors relative ${
            isDark 
              ? "border-gray-700 hover:bg-white hover:text-black" 
              : "border-gray-200 hover:bg-black hover:text-white"
          } ${isToday ? (isDark ? "bg-gray-800" : "bg-blue-50") : ""} ${
            isSelected ? (isDark ? "bg-blue-900" : "bg-blue-100") : ""
          } last:border-r-0`}
          onClick={() => setSelectedDate(date)}
        >
          <div
            className={`text-xs sm:text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-black"} ${isToday ? "text-blue-600" : ""}`}
          >
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {events.slice(0, 1).map((event) => (
              <div key={event.id} className="group">
                <div
                  className={`text-[10px] sm:text-xs p-1 rounded truncate leading-tight cursor-pointer ${
                    event.status === "live"
                      ? "bg-green-500 text-white"
                      : event.status === "upcoming"
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-500 text-white"
                  }`}
                  title={event.title}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (event.status === "upcoming") {
                      handleSetReminder(event)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1">{event.title}</span>
                    {event.status === "upcoming" && (
                      <Bell className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {events.length > 1 && (
              <div className={`text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                +{events.length - 1} more
              </div>
            )}
          </div>
        </div>,
      )
    }

    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7">{dayHeaders}</div>
        <div className="grid grid-cols-7">{days}</div>
      </div>
    )
  }

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day)
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 sm:gap-4">
        {weekDays.map((day, index) => {
          const events = getEventsForDate(day)
          const isToday = day.toDateString() === new Date().toDateString()
          return (
            <div key={index} className={`p-3 sm:p-4 border rounded-lg transition-colors ${
              isDark 
                ? "border-gray-600 hover:bg-white hover:text-black hover:border-black" 
                : "border-gray-300 hover:bg-black hover:text-white hover:border-white"
            } ${isToday ? (isDark ? "bg-gray-800 border-blue-500" : "bg-blue-50 border-blue-300") : ""}`}>
              <div className={`text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-black"} ${isToday ? "text-blue-600" : ""}`}>
                {day.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
              </div>
              <div className="space-y-1 sm:space-y-2">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="group">
                    <div
                      className={`text-xs p-1 sm:p-2 rounded cursor-pointer ${
                        event.status === "live"
                          ? "bg-green-500 text-white"
                          : event.status === "upcoming"
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-500 text-white"
                      }`}
                      onClick={() => {
                        if (event.status === "upcoming") {
                          handleSetReminder(event)
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold truncate">{event.title}</div>
                          <div className="hidden sm:block">{event.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                        {event.status === "upcoming" && (
                          <Bell className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {events.length > 3 && (
                  <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>+{events.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderYearView = () => {
    const months = []
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(currentDate.getFullYear(), month, 1)
      const monthEvents = auctionEvents.filter((event) => {
        return event.startTime.getFullYear() === currentDate.getFullYear() && event.startTime.getMonth() === month
      })

      months.push(
        <div
          key={month}
          className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
            isDark 
              ? "border-gray-600 hover:bg-white hover:text-black hover:border-black" 
              : "border-gray-300 hover:bg-black hover:text-white hover:border-white"
          }`}
          onClick={() => {
            setCurrentDate(monthDate)
            setView("month")
          }}
        >
          <div className={`text-base sm:text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-black"}`}>
            {monthDate.toLocaleDateString("en-US", { month: "long" })}
          </div>
          <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {monthEvents.length} auction{monthEvents.length !== 1 ? "s" : ""}
          </div>
          {monthEvents.length > 0 && (
            <div className="mt-2 space-y-1">
              {monthEvents.slice(0, 2).map((event) => (
                <div key={event.id} className={`text-xs p-1 rounded truncate ${
                  event.status === "live" ? "bg-green-500 text-white" :
                  event.status === "upcoming" ? "bg-blue-500 text-white" : "bg-gray-500 text-white"
                }`}>
                  {event.title}
                </div>
              ))}
              {monthEvents.length > 2 && (
                <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  +{monthEvents.length - 2} more
                </div>
              )}
            </div>
          )}
        </div>,
      )
    }

    return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">{months}</div>
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
      isChatPinnedLeft ? 'modal-with-chat-left' : isChatPinnedRight ? 'modal-with-chat-right' : ''
    }`}>
      <div
        className={`${isDark ? "bg-black border-white" : "bg-white border-black"} border-2 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-4 sm:p-6 border-b ${isDark ? "border-white" : "border-black"}`}>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <CalendarIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${isDark ? "text-white" : "text-black"}`} />
            <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>Auction Calendar</h2>
          </div>
          <Button 
            onClick={onClose} 
            variant="ghost"
            className={`p-2 bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-none ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Controls */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b ${isDark ? "border-white" : "border-black"}`}>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => (view === "year" ? navigateYear("prev") : navigateMonth("prev"))}
              variant="outline"
              size="sm"
              className={`${isDark ? "bg-[#000000] border-white text-white" : "bg-white border-black text-black"} rounded-lg`}
            >
              <ChevronLeft className={`h-4 w-4 ${isDark ? "text-white" : "text-black"}`} />
            </Button>
            <h3 className={`text-lg sm:text-xl font-semibold ${isDark ? "text-white" : "text-black"} min-w-[200px] text-center`}>
              {view === "year"
                ? currentDate.getFullYear()
                : view === "week"
                ? `Week of ${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <Button
              onClick={() => (view === "year" ? navigateYear("next") : navigateMonth("next"))}
              variant="outline"
              size="sm"
              className={`${isDark ? "bg-[#000000] border-white text-white" : "bg-white border-black text-black"} rounded-lg`}
            >
              <ChevronRight className={`h-4 w-4 ${isDark ? "text-white" : "text-black"}`} />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`${isDark ? "bg-[#000000] border-white text-white" : "bg-white border-black text-black"} rounded-lg min-w-[100px] justify-between`}
              >
                <span className="capitalize">{view}</span>
                <ChevronDown className={`h-4 w-4 ml-2 ${isDark ? "text-white" : "text-black"}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className={`${isDark ? "bg-[#000000] border-white text-white" : "bg-white border-black text-black"} border rounded-lg`}
              align="end"
            >
              {["week", "month", "year"].map((viewType) => (
                <DropdownMenuItem
                  key={viewType}
                  onClick={() => setView(viewType as "week" | "month" | "year")}
                  className={`capitalize cursor-pointer ${
                    view === viewType
                      ? isDark ? "bg-white text-black" : "bg-black text-white"
                      : isDark ? "hover:bg-white hover:text-black text-white" : "hover:bg-black hover:text-white text-black"
                  }`}
                >
                  {viewType}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {view === "month" && renderMonthView()}
          {view === "week" && renderWeekView()}
          {view === "year" && renderYearView()}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className={`p-3 sm:p-4 border-t ${isDark ? "border-white" : "border-black"} max-h-[200px] overflow-y-auto`}>
            <h4 className={`text-base sm:text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-black"}`}>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h4>
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className={`p-2 sm:p-3 rounded-lg border ${isDark ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-gray-50"}`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <h5 className={`font-semibold text-sm sm:text-base ${isDark ? "text-white" : "text-black"}`}>{event.title}</h5>
                        <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>by {event.artist}</p>
                        <p className={`text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          {event.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} -
                          {event.endTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <Badge
                          className={`${
                            event.status === "live"
                              ? "bg-green-500 text-white"
                              : event.status === "upcoming"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-500 text-white"
                          } rounded-lg mb-1 text-xs`}
                        >
                          {event.status}
                        </Badge>
                        <p className={`text-xs sm:text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}>
                          Starting: {event.startingBid}
                        </p>
                      </div>
                    </div>
                    
                    {/* Set Reminder Button for upcoming auctions */}
                    {event.status === "upcoming" && (
                      <Button
                        onClick={() => handleSetReminder(event)}
                        variant="outline"
                        size="sm"
                        className={`w-full ${
                          isDark
                            ? "bg-[#000000] border-white text-white"
                            : "bg-white border-black text-black"
                        } rounded-lg flex items-center justify-center gap-2`}
                      >
                        <Bell className="h-4 w-4" />
                        Set Reminder
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {getEventsForDate(selectedDate).length === 0 && (
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  No auctions scheduled for this date.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {selectedAuctionForReminder && (
        <ReminderModal
          auction={{
            id: selectedAuctionForReminder.id,
            title: selectedAuctionForReminder.title,
            artist: selectedAuctionForReminder.artist,
            startingBid: selectedAuctionForReminder.startingBid,
            status: getAuctionStatusWithTime(selectedAuctionForReminder)
          }}
          onClose={() => setSelectedAuctionForReminder(null)}
          isDark={isDark}
        />
      )}
    </div>
  )
}