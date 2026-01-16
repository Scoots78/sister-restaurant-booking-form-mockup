"use client"

import { useState, useMemo } from "react"
import { RestaurantSelection } from "./restaurant-selection"
import { SessionTimeSelection } from "./session-time-selection"
import { AddonsSelection } from "./addons-selection"
import { GuestDetails } from "./guest-details"
import { BookingSummary } from "./booking-summary"
import { BookingConfirmation } from "./booking-confirmation"
import { ProgressIndicator } from "./progress-indicator"
import type { BookingState } from "@/lib/types"

export function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [booking, setBooking] = useState<BookingState>({
    restaurant: null,
    date: null,
    session: null,
    time: null,
    partySize: 2,
    addons: [],
    addonSelections: [],
    guest: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dietary: [],
      occasion: null,
      specialRequests: "",
    },
    isSisterRestaurant: false,
    selectedExperience: null,
  })
  const [isConfirmed, setIsConfirmed] = useState(false)

  const addonsTotal = useMemo(() => {
    return booking.addons.reduce((sum, a) => sum + a.price * (a.quantity || 1), 0)
  }, [booking.addons])

  const requiresPayment = addonsTotal > 0

  const steps = useMemo(
    () => [
      { id: 1, name: "Restaurant" },
      { id: 2, name: "Date & Time" },
      { id: 3, name: "Add-ons" },
      { id: 4, name: "Details" },
      { id: 5, name: requiresPayment ? "Confirm & Pay" : "Confirm" },
    ],
    [requiresPayment],
  )

  const updateBooking = (updates: Partial<BookingState>) => {
    setBooking((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const goToStep = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId)
    }
  }

  const handleConfirmation = () => {
    setIsConfirmed(true)
  }

  if (isConfirmed) {
    return <BookingConfirmation booking={booking} />
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          Reserve Your Table
        </h1>
        <p className="mt-2 text-muted-foreground">Experience exceptional dining at our award-winning restaurants</p>
      </header>

      <ProgressIndicator steps={steps} currentStep={currentStep} onStepClick={goToStep} />

      <div className="mt-8">
        {currentStep === 1 && <RestaurantSelection booking={booking} updateBooking={updateBooking} onNext={nextStep} />}
        {currentStep === 2 && (
          <SessionTimeSelection booking={booking} updateBooking={updateBooking} onNext={nextStep} onBack={prevStep} />
        )}
        {currentStep === 3 && (
          <AddonsSelection booking={booking} updateBooking={updateBooking} onNext={nextStep} onBack={prevStep} />
        )}
        {currentStep === 4 && (
          <GuestDetails booking={booking} updateBooking={updateBooking} onNext={nextStep} onBack={prevStep} />
        )}
        {currentStep === 5 && <BookingSummary booking={booking} onBack={prevStep} onConfirm={handleConfirmation} />}
      </div>
    </div>
  )
}
