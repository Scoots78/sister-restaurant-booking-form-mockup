export interface Restaurant {
  id: string
  name: string
  location: string
  description: string
  cuisine: string
  priceRange: string
  rating: number
  image: string
  isSister?: boolean
}

export interface Session {
  id: string
  name: string
  timeRange: string
  icon: string
  menuPolicy: UsagePolicy
}

export interface TimeSlot {
  time: string
  available: boolean
}

export type UsagePolicy = 0 | 1 | 2 | 3 | 4
// Policy 0: No menu selection required (hidden)
// Policy 1: All guests same menu (radio buttons)
// Policy 2: Each guest any menu (quantity selectors, total = guest count)
// Policy 3: Optional menus (checkboxes, up to maxMenuTypes)
// Policy 4: Some guests same menu (optional quantity, ≤ guest count)

export interface Addon {
  uid: number
  name: string
  desc: string
  price: number // in cents
  per: "Guest" | "Party"
  type: "Menu" | "Option"
  min: number // minimum guests this applies to
  max: number // maximum guests this applies to
  parent: number // index in addon array, -1 if no parent
  // For filtering by session/experience
  sessionIds?: string[]
  experienceIds?: string[]
  // For quantity/selection tracking in UI
  quantity?: number
  selectedMenuIndex?: number // For policy 1
}

export interface AddonSelection {
  uid: number
  quantity: number
  guestCount?: number // For per-guest items with policy 2/4
}

export interface FeaturedExperience {
  id: string
  addonId: string
  restaurantId: string
  date: Date
  sessionId: string
  name: string
  description: string
  price: number
  image: string
  availableTimes: string[]
  addonIds?: string[]
  menuPolicy: UsagePolicy
}

export interface GuestInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  dietary: string[]
  occasion: string | null
  specialRequests: string
}

export interface BookingState {
  restaurant: Restaurant | null
  date: Date | null
  session: Session | null
  time: TimeSlot | null
  partySize: number
  addons: Addon[]
  addonSelections: AddonSelection[] // Track selections separately
  guest: GuestInfo
  isSisterRestaurant: boolean
  selectedExperience: FeaturedExperience | null
}
