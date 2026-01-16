"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, Users, MapPin, CreditCard, Lock, Building2, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { BookingState } from "@/lib/types"

interface BookingSummaryProps {
  booking: BookingState
  onBack: () => void
  onConfirm: () => void
}

export function BookingSummary({ booking, onBack, onConfirm }: BookingSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const addonsTotal = booking.addons.reduce((sum, a) => sum + a.price * (a.quantity || 1), 0)
  const requiresPayment = addonsTotal > 0

  const handleConfirm = async () => {
    setIsProcessing(true)
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    onConfirm()
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-medium text-foreground">
          {requiresPayment ? "Review & Pay" : "Confirm Your Booking"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {requiresPayment
            ? "Please review your reservation details and complete payment"
            : "Please review your reservation details before confirming"}
        </p>
      </div>

      <div className={requiresPayment ? "grid gap-6 lg:grid-cols-2" : "max-w-xl"}>
        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reservation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{booking.restaurant?.name}</p>
                <p className="text-sm text-muted-foreground">{booking.restaurant?.location}</p>
                {booking.isSisterRestaurant && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
                    <Building2 className="h-3 w-3" />
                    Sister Restaurant
                  </span>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">
                  {booking.date && format(booking.date, "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">{booking.session?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <p className="font-medium text-foreground">{booking.time?.time}</p>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <p className="font-medium text-foreground">
                {booking.partySize} {booking.partySize === 1 ? "Guest" : "Guests"}
              </p>
            </div>

            {booking.selectedExperience && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Featured Experience</p>
                    <p className="font-medium text-foreground">{booking.selectedExperience.name}</p>
                    <p className="text-sm text-primary">${booking.selectedExperience.price} per person</p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <p className="font-medium text-foreground">
                {booking.guest.firstName} {booking.guest.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
              <p className="text-sm text-muted-foreground">{booking.guest.phone}</p>
            </div>

            {booking.guest.dietary.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Dietary requirements:</p>
                <p className="text-sm font-medium text-foreground">{booking.guest.dietary.join(", ")}</p>
              </div>
            )}

            {booking.guest.occasion && (
              <div>
                <p className="text-sm text-muted-foreground">Occasion:</p>
                <p className="text-sm font-medium text-foreground">{booking.guest.occasion}</p>
              </div>
            )}

            {booking.guest.specialRequests && (
              <div>
                <p className="text-sm text-muted-foreground">Special requests:</p>
                <p className="text-sm text-foreground">{booking.guest.specialRequests}</p>
              </div>
            )}

            {!requiresPayment && (
              <>
                <Separator />
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Your table reservation is complimentary. No payment is required.
                  </p>
                </div>
                <Button size="lg" className="w-full gap-2" onClick={handleConfirm} disabled={isProcessing}>
                  <CheckCircle2 className="h-4 w-4" />
                  {isProcessing ? "Confirming..." : "Confirm Reservation"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {requiresPayment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {booking.addons.map((addon) => (
                  <div key={addon.uid} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {addon.name}
                      {(addon.quantity || 1) > 1 && ` x${addon.quantity}`}
                    </span>
                    <span className="font-medium text-foreground">
                      ${(addon.price * (addon.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Total</span>
                <span className="text-lg font-semibold text-foreground">${addonsTotal.toFixed(2)}</span>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  The table reservation is complimentary. You will only be charged for the add-ons selected above.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  Secure payment powered by Stripe
                </div>

                <Button size="lg" className="w-full gap-2" onClick={handleConfirm} disabled={isProcessing}>
                  <CreditCard className="h-4 w-4" />
                  {isProcessing ? "Processing..." : `Pay $${addonsTotal.toFixed(2)} & Confirm`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-start">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  )
}
