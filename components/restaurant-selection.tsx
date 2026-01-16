"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { RESTAURANTS } from "@/lib/data"
import type { BookingState, Restaurant } from "@/lib/types"

interface RestaurantSelectionProps {
  booking: BookingState
  updateBooking: (updates: Partial<BookingState>) => void
  onNext: () => void
}

export function RestaurantSelection({ booking, updateBooking, onNext }: RestaurantSelectionProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(booking.restaurant)
  const [partySize, setPartySize] = useState(booking.partySize)

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
  }

  const handleContinue = () => {
    if (selectedRestaurant && partySize) {
      updateBooking({ restaurant: selectedRestaurant, partySize })
      onNext()
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-foreground">Choose Your Restaurant</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select from our collection of exceptional dining venues</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {RESTAURANTS.map((restaurant) => (
            <Card
              key={restaurant.id}
              className={cn(
                "cursor-pointer overflow-hidden transition-all hover:shadow-lg",
                selectedRestaurant?.id === restaurant.id && "ring-2 ring-primary",
              )}
              onClick={() => handleRestaurantSelect(restaurant)}
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={restaurant.image || "/placeholder.svg"}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
                {restaurant.isSister && (
                  <span className="absolute right-3 top-3 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                    Sister Restaurant
                  </span>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-foreground">{restaurant.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {restaurant.location}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{restaurant.description}</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {restaurant.cuisine} · {restaurant.priceRange}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedRestaurant && (
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">How many guests?</h3>
              <p className="text-sm text-muted-foreground">Select your party size for {selectedRestaurant.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((size) => (
              <button
                key={size}
                onClick={() => setPartySize(size)}
                className={cn(
                  "flex h-12 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                  partySize === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5",
                )}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {partySize} {partySize === 1 ? "guest" : "guests"} selected
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button size="lg" onClick={handleContinue} disabled={!selectedRestaurant || !partySize}>
          Continue
        </Button>
      </div>
    </div>
  )
}
