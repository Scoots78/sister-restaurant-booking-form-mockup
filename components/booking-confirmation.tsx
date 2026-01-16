"use client"

import { format } from "date-fns"
import { CheckCircle2, Calendar, Clock, MapPin, Users, Download, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { BookingState } from "@/lib/types"

interface BookingConfirmationProps {
  booking: BookingState
}

export function BookingConfirmation({ booking }: BookingConfirmationProps) {
  const confirmationNumber = `RES-${Date.now().toString(36).toUpperCase()}`

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-foreground">Booking Confirmed!</h1>
        <p className="mt-2 text-muted-foreground">Your reservation has been successfully confirmed</p>
        <p className="mt-1 text-sm text-muted-foreground">Confirmation #{confirmationNumber}</p>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">{booking.restaurant?.name}</p>
                <p className="text-sm text-muted-foreground">{booking.restaurant?.location}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{booking.date && format(booking.date, "MMM d, yyyy")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">{booking.time?.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Party Size</p>
                  <p className="font-medium text-foreground">
                    {booking.partySize} {booking.partySize === 1 ? "Guest" : "Guests"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Booked by</p>
              <p className="font-medium text-foreground">
                {booking.guest.firstName} {booking.guest.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
            </div>

            {booking.addons.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Add-ons</p>
                  <ul className="space-y-1">
                    {booking.addons.map((addon) => (
                      <li key={addon.uid} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {addon.name}
                          {(addon.quantity || 1) > 1 && ` x${addon.quantity}`}
                        </span>
                        <span className="text-foreground">${(addon.price * (addon.quantity || 1)).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Download Confirmation
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Mail className="h-4 w-4" />
          Resend Email
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        A confirmation email has been sent to {booking.guest.email}
      </p>
    </div>
  )
}
