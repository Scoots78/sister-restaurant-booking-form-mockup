"use client"

import { useState } from "react"
import { User, Mail, Phone, Heart, PartyPopper, MessageSquare, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { DIETARY_OPTIONS, OCCASIONS } from "@/lib/data"
import type { BookingState, GuestInfo } from "@/lib/types"

interface GuestDetailsProps {
  booking: BookingState
  updateBooking: (updates: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
}

export function GuestDetails({ booking, updateBooking, onNext, onBack }: GuestDetailsProps) {
  const [guest, setGuest] = useState<GuestInfo>(booking.guest)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateGuest = (updates: Partial<GuestInfo>) => {
    setGuest((prev) => ({ ...prev, ...updates }))
    // Clear errors on change
    Object.keys(updates).forEach((key) => {
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: "" }))
      }
    })
  }

  const toggleDietary = (option: string) => {
    setGuest((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(option) ? prev.dietary.filter((d) => d !== option) : [...prev.dietary, option],
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!guest.firstName.trim()) newErrors.firstName = "First name is required"
    if (!guest.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!guest.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) {
      newErrors.email = "Invalid email address"
    }
    if (!guest.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (validate()) {
      updateBooking({ guest })
      onNext()
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-medium text-foreground">Guest Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about yourself so we can personalize your experience
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-6 p-6">
          {/* Name Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                First Name
              </Label>
              <Input
                id="firstName"
                value={guest.firstName}
                onChange={(e) => updateGuest({ firstName: e.target.value })}
                placeholder="John"
                className={cn(errors.firstName && "border-destructive")}
              />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={guest.lastName}
                onChange={(e) => updateGuest({ lastName: e.target.value })}
                placeholder="Smith"
                className={cn(errors.lastName && "border-destructive")}
              />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={guest.email}
                onChange={(e) => updateGuest({ email: e.target.value })}
                placeholder="john@example.com"
                className={cn(errors.email && "border-destructive")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={guest.phone}
                onChange={(e) => updateGuest({ phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className={cn(errors.phone && "border-destructive")}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>

          {/* Dietary Requirements */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              Dietary Requirements
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietary(option)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    guest.dietary.includes(option)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {guest.dietary.includes(option) && <Check className="h-3 w-3" />}
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <PartyPopper className="h-4 w-4 text-muted-foreground" />
              Special Occasion
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((occasion) => (
                <button
                  key={occasion}
                  type="button"
                  onClick={() => updateGuest({ occasion: guest.occasion === occasion ? null : occasion })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    guest.occasion === occasion
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {occasion}
                </button>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="requests" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Special Requests
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="requests"
              value={guest.specialRequests}
              onChange={(e) => updateGuest({ specialRequests: e.target.value })}
              placeholder="Any special requests or preferences we should know about..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" onClick={handleContinue}>
          Review Booking
        </Button>
      </div>
    </div>
  )
}
