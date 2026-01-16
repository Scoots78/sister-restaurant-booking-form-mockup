"use client"

import { useState, useMemo } from "react"
import { Minus, Plus, UtensilsCrossed, Sparkles, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getAddonsForBooking, getMenuPolicy, ADDONS } from "@/lib/data"
import type { BookingState, Addon, AddonSelection, UsagePolicy } from "@/lib/types"

interface AddonsSelectionProps {
  booking: BookingState
  updateBooking: (updates: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
}

// Format price from cents to display string
function formatPrice(cents: number): string {
  if (cents === 0) return "Included"
  return `$${(cents / 100).toFixed(2)}`
}

// Get price label with per Guest/Party indicator
function getPriceLabel(addon: Addon): string {
  const price = formatPrice(addon.price)
  if (addon.price === 0) return price
  return addon.per === "Guest" ? `${price}/guest` : `${price}`
}

export function AddonsSelection({ booking, updateBooking, onNext, onBack }: AddonsSelectionProps) {
  const [selections, setSelections] = useState<AddonSelection[]>(booking.addonSelections || [])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedMenuIndex, setSelectedMenuIndex] = useState<number | null>(null)

  const policy = getMenuPolicy(booking.session?.id, booking.selectedExperience?.id) as UsagePolicy
  const partySize = booking.partySize

  const availableAddons = useMemo(
    () => getAddonsForBooking(booking.session?.id, booking.selectedExperience?.id, partySize),
    [booking.session?.id, booking.selectedExperience?.id, partySize],
  )

  // Separate menus and options
  const menus = useMemo(() => availableAddons.filter((a) => a.type === "Menu"), [availableAddons])
  const options = useMemo(() => availableAddons.filter((a) => a.type === "Option"), [availableAddons])

  // Get options that are available based on selected menu (parent dependency)
  const availableOptions = useMemo(() => {
    return options.filter((opt) => {
      if (opt.parent === -1) return true // No parent dependency
      // Check if parent menu is selected
      const parentAddon = ADDONS[opt.parent]
      if (!parentAddon) return false
      return selections.some((s) => s.uid === parentAddon.uid)
    })
  }, [options, selections])

  // Selection helpers
  const isSelected = (uid: number) => selections.some((s) => s.uid === uid)
  const getSelection = (uid: number) => selections.find((s) => s.uid === uid)

  // Handle menu selection based on policy
  const handleMenuSelect = (addon: Addon, checked: boolean) => {
    if (policy === 1) {
      // Policy 1: All guests same menu - radio, only one
      if (checked) {
        // Remove all other menus, add this one with quantity = partySize
        setSelections((prev) => {
          const withoutMenus = prev.filter((s) => !menus.some((m) => m.uid === s.uid))
          // Also remove options that depend on other menus
          const withoutDependentOptions = withoutMenus.filter((s) => {
            const opt = options.find((o) => o.uid === s.uid)
            if (!opt || opt.parent === -1) return true
            const parentAddon = ADDONS[opt.parent]
            return parentAddon?.uid === addon.uid
          })
          return [...withoutDependentOptions, { uid: addon.uid, quantity: partySize, guestCount: partySize }]
        })
        setSelectedMenuIndex(ADDONS.findIndex((a) => a.uid === addon.uid))
      }
    } else if (policy === 2) {
      // Policy 2: Each guest any menu - quantity selectors, total = guest count
      if (checked) {
        setSelections((prev) => [...prev, { uid: addon.uid, quantity: 1, guestCount: 1 }])
      } else {
        setSelections((prev) => prev.filter((s) => s.uid !== addon.uid))
      }
    } else if (policy === 3 || policy === 4) {
      // Policy 3/4: Optional menus - checkboxes
      if (checked) {
        setSelections((prev) => [
          ...prev,
          { uid: addon.uid, quantity: 1, guestCount: addon.per === "Guest" ? partySize : undefined },
        ])
      } else {
        // Also remove dependent options
        setSelections((prev) => {
          const addonIndex = ADDONS.findIndex((a) => a.uid === addon.uid)
          return prev.filter((s) => {
            if (s.uid === addon.uid) return false
            const opt = options.find((o) => o.uid === s.uid)
            if (opt && opt.parent === addonIndex) return false
            return true
          })
        })
      }
    }
  }

  // Handle quantity change for policy 2
  const handleMenuQuantityChange = (addon: Addon, delta: number) => {
    const totalAssigned = selections
      .filter((s) => menus.some((m) => m.uid === s.uid))
      .reduce((sum, s) => sum + (s.guestCount || 0), 0)

    setSelections((prev) =>
      prev.map((s) => {
        if (s.uid === addon.uid) {
          const currentCount = s.guestCount || 1
          const otherTotal = totalAssigned - currentCount
          const maxAllowed = partySize - otherTotal
          const newCount = Math.max(1, Math.min(maxAllowed, currentCount + delta))
          return { ...s, quantity: newCount, guestCount: newCount }
        }
        return s
      }),
    )
  }

  // Handle option selection
  const handleOptionSelect = (addon: Addon, checked: boolean) => {
    if (checked) {
      const guestCount = addon.per === "Guest" ? partySize : undefined
      setSelections((prev) => [...prev, { uid: addon.uid, quantity: 1, guestCount }])
    } else {
      setSelections((prev) => prev.filter((s) => s.uid !== addon.uid))
    }
  }

  // Handle option quantity
  const handleOptionQuantityChange = (addon: Addon, delta: number) => {
    setSelections((prev) =>
      prev.map((s) => {
        if (s.uid === addon.uid) {
          const newQty = Math.max(1, Math.min(10, (s.quantity || 1) + delta))
          return { ...s, quantity: newQty }
        }
        return s
      }),
    )
  }

  // Calculate total
  const total = useMemo(() => {
    return selections.reduce((sum, sel) => {
      const addon = ADDONS.find((a) => a.uid === sel.uid)
      if (!addon) return sum
      if (addon.per === "Guest") {
        return sum + addon.price * (sel.guestCount || partySize)
      }
      return sum + addon.price * sel.quantity
    }, 0)
  }, [selections, partySize])

  // Policy 2 validation: total guest count must equal party size
  const policy2Valid = useMemo(() => {
    if (policy !== 2) return true
    if (menus.length === 0) return true
    const totalAssigned = selections
      .filter((s) => menus.some((m) => m.uid === s.uid))
      .reduce((sum, s) => sum + (s.guestCount || 0), 0)
    return totalAssigned === partySize || totalAssigned === 0
  }, [policy, menus, selections, partySize])

  const handleContinue = () => {
    const selectedAddons = selections.map((sel) => {
      const addon = ADDONS.find((a) => a.uid === sel.uid)!
      return { ...addon, quantity: sel.quantity }
    })
    updateBooking({ addons: selectedAddons, addonSelections: selections })
    onNext()
  }

  const contextLabel = booking.selectedExperience ? booking.selectedExperience.name : booking.session?.name

  // Policy description
  const policyDescriptions: Record<UsagePolicy, string> = {
    0: "",
    1: "All guests will have the same menu selection",
    2: `Assign a menu to each of your ${partySize} guests`,
    3: "Optionally pre-order items for your visit",
    4: "Select menus for some or all guests",
  }

  // Don't show anything for policy 0
  if (policy === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-medium text-foreground">Add-ons</h2>
          <p className="mt-1 text-sm text-muted-foreground">No menu selection is required for this booking.</p>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button size="lg" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-visible p-1">
      <div>
        <h2 className="font-serif text-2xl font-medium text-foreground">Enhance Your Experience</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add special touches to make your dining experience memorable
        </p>
      </div>

      {/* Context indicator */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm">
            {booking.selectedExperience ? (
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <UtensilsCrossed className="h-4 w-4 text-primary shrink-0" />
            )}
            <span className="text-muted-foreground">Selections for</span>
            <span className="font-medium text-foreground">{contextLabel}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {partySize} guest{partySize > 1 ? "s" : ""}
            </span>
          </div>
          {policyDescriptions[policy] && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <Info className="h-3 w-3 shrink-0" />
              {policyDescriptions[policy]}
            </p>
          )}
        </div>
      </div>

      {availableAddons.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No add-ons are currently available for this {booking.selectedExperience ? "experience" : "session"}.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Menus Section */}
          {menus.length > 0 && (
            <div className="space-y-4 p-0.5">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Menu</h3>
              </div>

              {policy === 1 ? (
                // Policy 1: Radio buttons
                <RadioGroup
                  value={selections.find((s) => menus.some((m) => m.uid === s.uid))?.uid.toString()}
                  onValueChange={(val) => {
                    const menu = menus.find((m) => m.uid === Number.parseInt(val))
                    if (menu) handleMenuSelect(menu, true)
                  }}
                  className="space-y-3"
                >
                  {menus.map((menu) => (
                    <Card
                      key={menu.uid}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md border-2",
                        isSelected(menu.uid) ? "border-primary" : "border-transparent",
                      )}
                    >
                      <label className="flex cursor-pointer">
                        <div className="flex items-center p-4">
                          <RadioGroupItem value={menu.uid.toString()} id={`menu-${menu.uid}`} />
                        </div>
                        <CardContent className="flex-1 p-4 pl-0 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Label
                                htmlFor={`menu-${menu.uid}`}
                                className="font-medium text-foreground cursor-pointer"
                              >
                                {menu.name}
                              </Label>
                              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{menu.desc}</p>
                            </div>
                            <span className="shrink-0 text-sm font-medium text-foreground">{getPriceLabel(menu)}</span>
                          </div>
                        </CardContent>
                      </label>
                    </Card>
                  ))}
                </RadioGroup>
              ) : (
                // Policy 2, 3, 4: Checkboxes with optional quantity
                <div className="space-y-3">
                  {menus.map((menu) => {
                    const selection = getSelection(menu.uid)
                    return (
                      <Card
                        key={menu.uid}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md border-2",
                          isSelected(menu.uid) ? "border-primary" : "border-transparent",
                        )}
                      >
                        <div className="flex">
                          <div className="flex items-center p-4">
                            <Checkbox
                              id={`menu-${menu.uid}`}
                              checked={isSelected(menu.uid)}
                              onCheckedChange={(checked) => handleMenuSelect(menu, checked as boolean)}
                            />
                          </div>
                          <CardContent className="flex-1 p-4 pl-0 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <Label
                                  htmlFor={`menu-${menu.uid}`}
                                  className="font-medium text-foreground cursor-pointer"
                                >
                                  {menu.name}
                                </Label>
                                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{menu.desc}</p>
                              </div>
                              <span className="shrink-0 text-sm font-medium text-foreground">
                                {getPriceLabel(menu)}
                              </span>
                            </div>
                            {/* Policy 2: Guest quantity selector */}
                            {policy === 2 && isSelected(menu.uid) && (
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Guests:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleMenuQuantityChange(menu, -1)}
                                    className="rounded-full border p-1 hover:bg-muted"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-medium">
                                    {selection?.guestCount || 1}
                                  </span>
                                  <button
                                    onClick={() => handleMenuQuantityChange(menu, 1)}
                                    className="rounded-full border p-1 hover:bg-muted"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </div>
                      </Card>
                    )
                  })}
                  {/* Policy 2: Guest count validation */}
                  {policy === 2 && selections.some((s) => menus.some((m) => m.uid === s.uid)) && (
                    <div
                      className={cn(
                        "text-sm p-2 rounded-md",
                        policy2Valid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700",
                      )}
                    >
                      {(() => {
                        const assigned = selections
                          .filter((s) => menus.some((m) => m.uid === s.uid))
                          .reduce((sum, s) => sum + (s.guestCount || 0), 0)
                        return policy2Valid
                          ? `All ${partySize} guests assigned`
                          : `${assigned} of ${partySize} guests assigned`
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Options Section */}
          {availableOptions.length > 0 && (
            <div className="space-y-4 p-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Options</h3>
              </div>
              <div className="space-y-3">
                {availableOptions.map((option) => {
                  const selection = getSelection(option.uid)
                  const parentAddon = option.parent !== -1 ? ADDONS[option.parent] : null
                  return (
                    <Card
                      key={option.uid}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md border-2",
                        isSelected(option.uid) ? "border-primary" : "border-transparent",
                      )}
                    >
                      <div className="flex">
                        <div className="flex items-center p-4">
                          <Checkbox
                            id={`option-${option.uid}`}
                            checked={isSelected(option.uid)}
                            onCheckedChange={(checked) => handleOptionSelect(option, checked as boolean)}
                          />
                        </div>
                        <CardContent className="flex-1 p-4 pl-0 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Label
                                htmlFor={`option-${option.uid}`}
                                className="font-medium text-foreground cursor-pointer"
                              >
                                {option.name}
                              </Label>
                              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{option.desc}</p>
                              {parentAddon && (
                                <p className="mt-1 text-xs text-primary">Available with {parentAddon.name}</p>
                              )}
                            </div>
                            <span className="shrink-0 text-sm font-medium text-foreground">
                              {getPriceLabel(option)}
                            </span>
                          </div>
                          {/* Quantity for per-Party options */}
                          {isSelected(option.uid) && option.per === "Party" && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Quantity:</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOptionQuantityChange(option, -1)}
                                  className="rounded-full border p-1 hover:bg-muted"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-medium">{selection?.quantity || 1}</span>
                                <button
                                  onClick={() => handleOptionQuantityChange(option, 1)}
                                  className="rounded-full border p-1 hover:bg-muted"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Total */}
      {selections.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selections.length} selection{selections.length > 1 ? "s" : ""}
            </span>
            <span className="font-medium text-foreground">+{formatPrice(total)}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={policy === 2 && !policy2Valid && selections.some((s) => menus.some((m) => m.uid === s.uid))}
        >
          {selections.length > 0 ? "Continue with Selections" : "Skip Add-ons"}
        </Button>
      </div>
    </div>
  )
}
