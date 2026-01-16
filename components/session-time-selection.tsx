"use client"

import { useState, useMemo } from "react"
import {
  format,
  addDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  startOfDay,
  addMonths,
  getDay,
} from "date-fns"
import {
  Calendar,
  Clock,
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sparkles,
  X,
  Users,
  Check,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  SESSIONS,
  getAvailableSlots,
  RESTAURANTS,
  getFeaturedExperiencesForDate,
  getFeaturedExperiencesForSession,
  hasExperiencesOnDate,
  FEATURED_EXPERIENCES,
} from "@/lib/data"
import type { BookingState, Session, TimeSlot, FeaturedExperience } from "@/lib/types"

interface SessionTimeSelectionProps {
  booking: BookingState
  updateBooking: (updates: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
}

export function SessionTimeSelection({ booking, updateBooking, onNext, onBack }: SessionTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(booking.date)
  const [selectedSession, setSelectedSession] = useState<Session | null>(booking.session)
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(booking.time)
  const [showSisterOptions, setShowSisterOptions] = useState(false)
  const [showAdvancedCalendar, setShowAdvancedCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [viewingExperience, setViewingExperience] = useState<FeaturedExperience | null>(null)
  const [selectedExperience, setSelectedExperience] = useState<FeaturedExperience | null>(booking.selectedExperience)
  const [browseMode, setBrowseMode] = useState<"date" | "experience">("date")

  const [viewingBrowseExperience, setViewingBrowseExperience] = useState<FeaturedExperience | null>(null)

  const today = startOfDay(new Date())

  // Quick select dates - next 14 days
  const quickDates = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1))
  }, [])

  const allRestaurantExperiences = useMemo(() => {
    if (!booking.restaurant) return []
    return FEATURED_EXPERIENCES.filter(
      (exp) => exp.restaurantId === booking.restaurant!.id && !isBefore(exp.date, addDays(today, 1)),
    ).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [booking.restaurant, today])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dateExperiences = useMemo(() => {
    if (!selectedDate || !booking.restaurant) return []
    return getFeaturedExperiencesForDate(booking.restaurant.id, selectedDate)
  }, [selectedDate, booking.restaurant])

  const sessionExperiences = useMemo(() => {
    if (!selectedDate || !selectedSession || !booking.restaurant) return []
    return getFeaturedExperiencesForSession(booking.restaurant.id, selectedDate, selectedSession.id)
  }, [selectedDate, selectedSession, booking.restaurant])

  const calendarDates = useMemo(() => {
    const start = startOfMonth(calendarMonth)
    const end = endOfMonth(calendarMonth)
    return eachDayOfInterval({ start, end })
  }, [calendarMonth])

  const startingDayOffset = useMemo(() => {
    return getDay(startOfMonth(calendarMonth))
  }, [calendarMonth])

  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedSession || !booking.restaurant) return []

    // If an experience is selected, return only its available times
    if (selectedExperience) {
      return selectedExperience.availableTimes.map((time) => ({
        time,
        available: true,
      }))
    }

    return getAvailableSlots(booking.restaurant.id, selectedDate, selectedSession.id)
  }, [selectedDate, selectedSession, booking.restaurant, selectedExperience])

  const sisterRestaurant = useMemo(() => {
    if (!booking.restaurant) return null
    return RESTAURANTS.find((r) => r.id !== booking.restaurant!.id)
  }, [booking.restaurant])

  const sisterSlots = useMemo(() => {
    if (!selectedDate || !selectedSession || !sisterRestaurant) return []
    return getAvailableSlots(sisterRestaurant.id, selectedDate, selectedSession.id)
  }, [selectedDate, selectedSession, sisterRestaurant])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setShowSisterOptions(false)
    setSelectedExperience(null)
  }

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session)
    setSelectedTime(null)
    setShowSisterOptions(false)
    setSelectedExperience(null)
  }

  const handleExperienceSelect = (experience: FeaturedExperience) => {
    if (selectedExperience?.id === experience.id) {
      // Deselect if already selected
      setSelectedExperience(null)
    } else {
      setSelectedExperience(experience)
      setSelectedTime(null) // Clear time when experience changes
    }
  }

  const handleExperienceQuickSelect = (experience: FeaturedExperience) => {
    // Set the date and session from the experience
    setSelectedDate(experience.date)
    const session = SESSIONS.find((s) => s.id === experience.sessionId)
    if (session) {
      setSelectedSession(session)
    }
    setSelectedExperience(experience)
    setSelectedTime(null)
    // Switch back to date view to show the time selection
    setBrowseMode("date")
  }

  const handleClearExperience = () => {
    setSelectedExperience(null)
    setSelectedTime(null)
  }

  const handleTimeSelect = (slot: TimeSlot, isSister = false) => {
    setSelectedTime(slot)
    if (isSister && sisterRestaurant) {
      updateBooking({
        restaurant: sisterRestaurant,
        isSisterRestaurant: true,
      })
    }
  }

  const handleContinue = () => {
    if (selectedDate && selectedSession && selectedTime) {
      updateBooking({
        date: selectedDate,
        session: selectedSession,
        time: selectedTime,
        selectedExperience: selectedExperience,
      })
      onNext()
    }
  }

  const isInQuickRange = (date: Date) => {
    return quickDates.some((d) => isSameDay(d, date))
  }

  const sessionHasExperiences = (sessionId: string) => {
    if (!selectedDate || !booking.restaurant) return false
    return getFeaturedExperiencesForSession(booking.restaurant.id, selectedDate, sessionId).length > 0
  }

  const noSlotsAvailable = selectedSession && availableSlots.length === 0 && !selectedExperience

  const getSessionName = (sessionId: string) => {
    return SESSIONS.find((s) => s.id === sessionId)?.name || sessionId
  }

  return (
    <div className="space-y-8">
      {/* Booking context header showing restaurant and party size */}
      {booking.restaurant && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Booking at</p>
                <p className="font-serif text-base font-medium text-foreground truncate">{booking.restaurant.name}</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 shadow-sm transition-colors hover:bg-muted cursor-pointer group"
              title="Click to change party size"
            >
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {booking.partySize} {booking.partySize === 1 ? "Guest" : "Guests"}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-primary">Edit</span>
            </button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-center px-1">
        <div className="inline-flex w-full flex-col gap-1 rounded-lg border border-border bg-muted p-1 sm:w-auto sm:flex-row sm:gap-0">
          <button
            onClick={() => setBrowseMode("date")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              browseMode === "date"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Browse by Date</span>
          </button>
          <button
            onClick={() => setBrowseMode("experience")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              browseMode === "experience"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Sparkles className="h-4 w-4 flex-shrink-0" />
            <span>Browse by Experience</span>
            {allRestaurantExperiences.length > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-xs font-medium text-white">
                {allRestaurantExperiences.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {browseMode === "experience" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-serif text-xl font-medium text-foreground">Featured Experiences</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select an experience to view available times</p>
          </div>

          {allRestaurantExperiences.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">No upcoming experiences</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  There are no featured experiences available at this restaurant currently.
                </p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setBrowseMode("date")}>
                  Browse by Date instead
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 p-0.5">
              {allRestaurantExperiences.map((exp) => (
                <Card
                  key={exp.id}
                  className="group overflow-hidden transition-all hover:shadow-md border-2 border-transparent hover:border-amber-300"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={exp.image || "/placeholder.svg"}
                      alt={exp.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-serif text-lg font-medium text-white truncate">{exp.name}</h3>
                    </div>
                    <div className="absolute right-3 top-3 rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white">
                      ${exp.price}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{exp.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{format(exp.date, "EEE, MMM d")}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{getSessionName(exp.sessionId)}</span>
                      </span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {exp.availableTimes.length} time{exp.availableTimes.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          setViewingBrowseExperience(exp)
                        }}
                      >
                        <Info className="mr-1.5 h-3.5 w-3.5" />
                        View details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExperienceQuickSelect(exp)
                        }}
                      >
                        Select
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewingBrowseExperience && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="relative max-h-[90vh] w-full max-w-lg overflow-auto">
                <button
                  onClick={() => setViewingBrowseExperience(null)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={viewingBrowseExperience.image || "/placeholder.svg"}
                    alt={viewingBrowseExperience.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-serif text-2xl font-medium text-white">{viewingBrowseExperience.name}</h3>
                  </div>
                </div>
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      ${viewingBrowseExperience.price} per person
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                      <Calendar className="h-4 w-4" />
                      {format(viewingBrowseExperience.date, "EEEE, MMMM d")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {getSessionName(viewingBrowseExperience.sessionId)}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{viewingBrowseExperience.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Available Times</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingBrowseExperience.availableTimes.map((time) => (
                        <span
                          key={time}
                          className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      handleExperienceQuickSelect(viewingBrowseExperience)
                      setViewingBrowseExperience(null)
                    }}
                  >
                    Select this experience
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Browse by Date View (existing functionality) */}
      {browseMode === "date" && (
        <>
          {/* Date Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-medium text-foreground">Select Date</h2>
              </div>
              <button
                onClick={() => setShowAdvancedCalendar(!showAdvancedCalendar)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <CalendarDays className="h-4 w-4" />
                {showAdvancedCalendar ? "Show quick dates" : "More dates"}
              </button>
            </div>

            {!showAdvancedCalendar ? (
              // Quick date selection - next 14 days
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickDates.map((date) => {
                  const hasExperiences = booking.restaurant ? hasExperiencesOnDate(booking.restaurant.id, date) : false

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateSelect(date)}
                      className={cn(
                        "relative flex min-w-[72px] flex-col items-center rounded-lg border px-4 py-3 transition-colors hover:border-primary",
                        selectedDate && isSameDay(date, selectedDate)
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary",
                      )}
                    >
                      {hasExperiences && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
                          <Sparkles className="h-3 w-3" />
                        </span>
                      )}
                      <span className="text-xs font-medium uppercase text-muted-foreground">{format(date, "EEE")}</span>
                      <span className="mt-0.5 text-lg font-semibold">{format(date, "d")}</span>
                      <span className="text-xs text-muted-foreground">{format(date, "MMM")}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="p-4">
                  {/* Month navigation */}
                  <div className="mb-4 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
                      disabled={isBefore(startOfMonth(calendarMonth), startOfMonth(addDays(today, 1)))}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h3 className="font-serif text-lg font-medium">{format(calendarMonth, "MMMM yyyy")}</h3>
                    <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Day headers */}
                  <div className="mb-2 grid grid-cols-7 gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for offset */}
                    {Array.from({ length: startingDayOffset }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {calendarDates.map((date) => {
                      const isPast = isBefore(date, addDays(today, 1))
                      const isSelected = selectedDate && isSameDay(date, selectedDate)
                      const isQuickRange = isInQuickRange(date)
                      const hasExperiences = booking.restaurant
                        ? hasExperiencesOnDate(booking.restaurant.id, date)
                        : false

                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => !isPast && handleDateSelect(date)}
                          disabled={isPast}
                          className={cn(
                            "relative aspect-square rounded-lg text-sm font-medium transition-colors",
                            isPast && "cursor-not-allowed text-muted-foreground/40",
                            !isPast && !isSelected && "hover:bg-primary/10",
                            isSelected && "bg-primary text-primary-foreground",
                            !isPast && !isSelected && isQuickRange && "bg-primary/5 text-primary",
                            !isPast && !isSelected && !isQuickRange && "text-foreground",
                          )}
                        >
                          {format(date, "d")}
                          {hasExperiences && !isPast && (
                            <span
                              className={cn(
                                "absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                                isSelected ? "bg-primary-foreground" : "bg-amber-500",
                              )}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded bg-primary/5 ring-1 ring-primary/20" />
                      <span>Next 2 weeks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded bg-primary" />
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-amber-500">
                        <Sparkles className="h-2 w-2 text-white" />
                      </div>
                      <span>Featured experience</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {showAdvancedCalendar && selectedDate && (
              <p className="text-center text-sm text-muted-foreground">
                Selected:{" "}
                <span className="font-medium text-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
              </p>
            )}
          </div>

          {/* Session Selection */}
          {selectedDate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-medium text-foreground">Choose Session</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {SESSIONS.map((session) => {
                  const hasExperiences = sessionHasExperiences(session.id)

                  return (
                    <button
                      key={session.id}
                      onClick={() => handleSessionSelect(session)}
                      className={cn(
                        "relative flex flex-col items-center rounded-lg border px-4 py-4 transition-colors hover:border-primary",
                        selectedSession?.id === session.id ? "border-primary bg-primary/5" : "border-border bg-card",
                      )}
                    >
                      {hasExperiences && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
                          <Sparkles className="h-3 w-3" />
                        </span>
                      )}
                      <span className="text-2xl">{session.icon}</span>
                      <span className="mt-2 font-medium text-foreground">{session.name}</span>
                      <span className="text-sm text-muted-foreground">{session.timeRange}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selectedSession && sessionExperiences.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h2 className="font-serif text-xl font-medium text-foreground">Featured Experiences</h2>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                    {sessionExperiences.length} available
                  </span>
                </div>
                {selectedExperience && (
                  <button
                    onClick={handleClearExperience}
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                    Clear selection
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {sessionExperiences.map((exp) => {
                  const isSelected = selectedExperience?.id === exp.id

                  return (
                    <Card
                      key={exp.id}
                      className={cn(
                        "group transition-all hover:shadow-md border-2",
                        isSelected
                          ? "border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950 dark:to-amber-900/50"
                          : "border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:border-amber-300 dark:border-amber-900 dark:from-amber-950 dark:to-background",
                      )}
                    >
                      <CardContent className="flex flex-col gap-3 p-4">
                        <div className="flex gap-4">
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={exp.image || "/placeholder.svg"}
                              alt={exp.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center bg-amber-500/80">
                                <Check className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground line-clamp-2">{exp.name}</h3>
                            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{exp.description}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-sm font-semibold text-primary">${exp.price}</span>
                              <span className="text-xs text-muted-foreground">
                                · {exp.availableTimes.length} time{exp.availableTimes.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingExperience(exp)
                            }}
                          >
                            <Info className="mr-1.5 h-3.5 w-3.5" />
                            View details
                          </Button>
                          <Button
                            size="sm"
                            variant={isSelected ? "secondary" : "default"}
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExperienceSelect(exp)
                            }}
                          >
                            {isSelected ? (
                              <>
                                <Check className="mr-1.5 h-3.5 w-3.5" />
                                Selected
                              </>
                            ) : (
                              <>
                                Select
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {viewingExperience && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <Card className="relative max-h-[90vh] w-full max-w-lg overflow-auto">
                    <button
                      onClick={() => setViewingExperience(null)}
                      className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={viewingExperience.image || "/placeholder.svg"}
                        alt={viewingExperience.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-serif text-2xl font-medium text-white">{viewingExperience.name}</h3>
                      </div>
                    </div>
                    <CardContent className="space-y-4 p-6">
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          ${viewingExperience.price} per person
                        </span>
                      </div>
                      <p className="text-muted-foreground">{viewingExperience.description}</p>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Available Times</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingExperience.availableTimes.map((time) => (
                            <span
                              key={time}
                              className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          handleExperienceSelect(viewingExperience)
                          setViewingExperience(null)
                        }}
                      >
                        {selectedExperience?.id === viewingExperience.id ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Selected
                          </>
                        ) : (
                          <>
                            Select this experience
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                <p className="text-center text-sm text-amber-800 dark:text-amber-200">
                  {selectedExperience ? (
                    <>
                      <span className="font-medium">Experience selected:</span> Showing{" "}
                      {selectedExperience.availableTimes.length} available time
                      {selectedExperience.availableTimes.length !== 1 ? "s" : ""} for {selectedExperience.name}.{" "}
                      <button onClick={handleClearExperience} className="underline hover:no-underline">
                        View all regular times instead
                      </button>
                    </>
                  ) : (
                    <>
                      Select an experience to see its specific availability, or continue with regular booking times
                      below.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Time Selection */}
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-medium text-foreground">
                  {selectedExperience ? `Times for ${selectedExperience.name}` : "Select Time"}
                </h2>
              </div>

              {availableSlots.filter((s) => s.available).length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {availableSlots
                    .filter((slot) => slot.available)
                    .map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeSelect(slot)}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                          selectedTime?.time === slot.time
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/5",
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                </div>
              ) : noSlotsAvailable ? (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                  <CardContent className="py-6 text-center">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      No availability at {booking.restaurant?.name} for this session
                    </p>
                    {sisterRestaurant && sisterSlots.filter((s) => s.available).length > 0 && (
                      <Button
                        variant="outline"
                        className="mt-4 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900 bg-transparent"
                        onClick={() => setShowSisterOptions(true)}
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        View times at {sisterRestaurant.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {/* Sister Restaurant Options */}
              {showSisterOptions && sisterRestaurant && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                      <Building2 className="h-5 w-5 text-primary" />
                      Available at {sisterRestaurant.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{sisterRestaurant.location}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                      {sisterSlots
                        .filter((slot) => slot.available)
                        .map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => handleTimeSelect(slot, true)}
                            className={cn(
                              "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                              selectedTime?.time === slot.time && booking.isSisterRestaurant
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5",
                            )}
                          >
                            {slot.time}
                          </button>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedSession || !selectedTime}
          className="gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
