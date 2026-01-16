import type { Restaurant, Session, Addon, TimeSlot, FeaturedExperience } from "./types"
import { addDays, isSameDay } from "date-fns"

export const RESTAURANTS: Restaurant[] = [
  {
    id: "bellini",
    name: "Mudbrick",
    location: "126 Church Bay Road, Oneroa, Waiheke Island",
    description:
      "Contemporary Italian cuisine with a focus on fresh, seasonal ingredients and traditional techniques reimagined for the modern palate.",
    cuisine: "Italian",
    priceRange: "$$$",
    rating: 4.8,
    image: "/elegant-italian-restaurant-interior-with-warm-ligh.jpg",
    isSister: false,
  },
  {
    id: "aurora",
    name: "Archive Bistro",
    location: "126 Church Bay Road, Oneroa, Waiheke Island",
    description:
      "Mediterranean-inspired dishes served in an elegant waterfront setting with panoramic views of the bay.",
    cuisine: "Mediterranean",
    priceRange: "$$$",
    rating: 4.7,
    image: "/upscale-mediterranean-restaurant-with-waterfront-v.jpg",
    isSister: true,
  },
]

export const SESSIONS: Session[] = [
  {
    id: "breakfast",
    name: "Breakfast",
    timeRange: "7:00 AM - 11:00 AM",
    icon: "🌅",
    menuPolicy: 3, // Optional menus
  },
  {
    id: "lunch",
    name: "Lunch",
    timeRange: "11:30 AM - 3:00 PM",
    icon: "☀️",
    menuPolicy: 3, // Optional menus
  },
  {
    id: "dinner",
    name: "Dinner",
    timeRange: "5:00 PM - 10:00 PM",
    icon: "🌙",
    menuPolicy: 1, // All guests same menu
  },
]

export const ADDONS: Addon[] = [
  // Dinner session - Set menus (Policy 1: All guests same menu)
  {
    uid: 1000,
    name: "Set Menu - 4 Course",
    desc: "Our signature 4-course tasting menu with seasonal ingredients",
    price: 8500, // $85.00
    per: "Guest",
    type: "Menu",
    min: 1,
    max: 20,
    parent: -1,
    sessionIds: ["dinner"],
  },
  {
    uid: 1001,
    name: "Set Menu - 6 Course",
    desc: "Extended tasting experience with chef's special courses",
    price: 12500, // $125.00
    per: "Guest",
    type: "Menu",
    min: 1,
    max: 20,
    parent: -1,
    sessionIds: ["dinner"],
  },
  {
    uid: 1002,
    name: "Set Menu - Large Party",
    desc: "Special group dining menu for parties of 6 or more",
    price: 7500, // $75.00
    per: "Guest",
    type: "Menu",
    min: 6,
    max: 20,
    parent: -1,
    sessionIds: ["dinner"],
  },
  // Options dependent on dinner menus
  {
    uid: 1003,
    name: "Wine Pairing",
    desc: "Sommelier-selected wines paired with each course",
    price: 6500, // $65.00
    per: "Guest",
    type: "Option",
    min: 1,
    max: 20,
    parent: 0, // Dependent on Set Menu - 4 Course (index 0)
    sessionIds: ["dinner"],
  },
  {
    uid: 1004,
    name: "Premium Wine Pairing",
    desc: "Reserve wine selections paired with each course",
    price: 9500, // $95.00
    per: "Guest",
    type: "Option",
    min: 1,
    max: 20,
    parent: 1, // Dependent on Set Menu - 6 Course (index 1)
    sessionIds: ["dinner"],
  },
  // Universal options for dinner (no parent)
  {
    uid: 1005,
    name: "Champagne Bottle",
    desc: "Dom Pérignon Vintage 2012, chilled and ready for your arrival",
    price: 25000, // $250.00
    per: "Party",
    type: "Option",
    min: 1,
    max: 20,
    parent: -1,
    sessionIds: ["dinner"],
  },
  {
    uid: 1006,
    name: "Celebration Cake",
    desc: "Custom decorated chocolate or vanilla cake, serves 4-6",
    price: 6500, // $65.00
    per: "Party",
    type: "Option",
    min: 1,
    max: 20,
    parent: -1,
    sessionIds: ["dinner", "lunch", "breakfast"],
  },
  {
    uid: 1007,
    name: "Rose Bouquet",
    desc: "Fresh red roses arranged at your table upon arrival",
    price: 4500, // $45.00
    per: "Party",
    type: "Option",
    min: 1,
    max: 20,
    parent: -1,
    sessionIds: ["dinner", "lunch", "breakfast"],
  },
  // Breakfast session - Optional pre-order items (Policy 3)
  {
    uid: 2000,
    name: "Continental Breakfast",
    desc: "Fresh pastries, fruits, and artisan breads",
    price: 2800, // $28.00
    per: "Guest",
    type: "Menu",
    min: 1,
    max: 20,
    parent: -1,
    sessionIds: ["breakfast"],
  },
  {
    uid: 2001,
    name: "Full English Breakfast",
    desc: "Traditional full breakfast with eggs, bacon, and all the trimmings",
    price: 3500, // $35.00
    per: "Guest",
    type: "Menu",
    min: 1,
    max: 20,
    parent: -1,
    sessionIds: ["breakfast"],
  },
  {
    uid: 2002,
    name: "Mimosa Flight",
    desc: "Four artisanal mimosas with fresh-squeezed juices",
    price: 3500, // $35.00
    per: "Party",
    type: "Option",
    min: 1,
    max: 20,
    parent: -1,
    sessionIds: ["breakfast"],
  },
  // Lunch session - Optional items (Policy 3)
  {
    uid: 3000,
    name: "Business Lunch Set",
    desc: "Quick 2-course lunch ideal for business meetings",
    price: 4500, // $45.00
    per: "Guest",
    type: "Menu",
    min: 1,
    max: 20,
    parent: -1,
    sessionIds: ["lunch"],
  },
  {
    uid: 3001,
    name: "Leisurely Lunch",
    desc: "Relaxed 3-course lunch with no time pressure",
    price: 5500, // $55.00
    per: "Guest",
    type: "Menu",
    min: 1,
    max: 20,
    parent: -1,
    sessionIds: ["lunch"],
  },
  {
    uid: 3002,
    name: "Wine by the Glass",
    desc: "Premium selection from our curated wine list",
    price: 1800, // $18.00
    per: "Guest",
    type: "Option",
    min: 1,
    max: 20,
    parent: -1,
    sessionIds: ["lunch"],
  },
  // Experience-specific addons
  {
    uid: 4000,
    name: "Omakase Tasting",
    desc: "7-course chef's selection menu for the experience",
    price: 19500, // $195.00
    per: "Guest",
    type: "Menu",
    min: 1,
    max: 8,
    parent: -1,
    experienceIds: ["chef-table-1"],
  },
  {
    uid: 4001,
    name: "Sake Pairing",
    desc: "Premium sake selections paired with each course",
    price: 6500, // $65.00
    per: "Guest",
    type: "Option",
    min: 1,
    max: 8,
    parent: 14, // Dependent on Omakase Tasting
    experienceIds: ["chef-table-1"],
  },
  {
    uid: 4002,
    name: "Photo with Chef",
    desc: "Commemorative photo and signed menu from Chef Marco",
    price: 2500, // $25.00
    per: "Party",
    type: "Option",
    min: 1,
    max: 8,
    parent: -1,
    experienceIds: ["chef-table-1"],
  },
  {
    uid: 5000,
    name: "Wine Tasting Flight",
    desc: "6 premium Tuscan wines included with your experience",
    price: 0, // Included
    per: "Guest",
    type: "Menu",
    min: 1,
    max: 12,
    parent: -1,
    experienceIds: ["wine-tasting-1"],
  },
  {
    uid: 5001,
    name: "Reserve Wine Upgrade",
    desc: "Upgrade to rare reserve vintages for your tasting",
    price: 5000, // $50.00
    per: "Guest",
    type: "Option",
    min: 1,
    max: 12,
    parent: 17, // Dependent on Wine Tasting Flight
    experienceIds: ["wine-tasting-1"],
  },
  {
    uid: 5002,
    name: "Cheese Pairing Board",
    desc: "Artisan cheeses selected to complement each wine",
    price: 3500, // $35.00
    per: "Party",
    type: "Option",
    min: 1,
    max: 12,
    parent: -1,
    experienceIds: ["wine-tasting-1"],
  },
]

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut Allergy",
  "Shellfish Allergy",
  "Halal",
  "Kosher",
]

export const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Date Night",
  "Business Dinner",
  "Engagement",
  "Graduation",
  "Other Celebration",
]

// Mock availability data - simulates limited/no availability at primary restaurant
export function getAvailableSlots(restaurantId: string, date: Date, sessionId: string): TimeSlot[] {
  const baseSlots: Record<string, string[]> = {
    breakfast: ["7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM"],
    lunch: ["11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"],
    dinner: ["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"],
  }

  const times = baseSlots[sessionId] || []
  const dayOfWeek = date.getDay()

  // Simulate different availability patterns
  // Primary restaurant (bellini) has limited availability on weekends
  if (restaurantId === "bellini" && (dayOfWeek === 5 || dayOfWeek === 6)) {
    // Friday/Saturday - very limited
    if (sessionId === "dinner") {
      return [] // No dinner availability
    }
    return times.slice(0, 2).map((time) => ({ time, available: true }))
  }

  // Sister restaurant (aurora) has better availability
  if (restaurantId === "aurora") {
    return times.map((time, i) => ({
      time,
      available: i !== 3, // One slot unavailable
    }))
  }

  // Regular availability
  return times.map((time, i) => ({
    time,
    available: i % 3 !== 0, // Some slots unavailable
  }))
}

const today = new Date()

export const FEATURED_EXPERIENCES: FeaturedExperience[] = [
  {
    id: "wine-tasting-1",
    addonId: "sommelier",
    restaurantId: "bellini",
    date: addDays(today, 3),
    sessionId: "dinner",
    name: "Tuscan Wine Evening",
    description:
      "Join our sommelier for an exclusive journey through Tuscany's finest wines paired with chef's selections",
    price: 125,
    image: "/sommelier-wine-tasting-experience.jpg",
    availableTimes: ["6:30 PM", "7:00 PM", "8:00 PM"],
    menuPolicy: 1, // All guests same menu
  },
  {
    id: "chef-table-1",
    addonId: "chef",
    restaurantId: "bellini",
    date: addDays(today, 3),
    sessionId: "dinner",
    name: "Chef's Omakase Night",
    description: "An intimate 7-course tasting menu crafted tableside by Chef Marco",
    price: 195,
    image: "/chef-table-kitchen-counter-dining.jpg",
    availableTimes: ["6:00 PM", "8:30 PM"],
    menuPolicy: 1, // All guests same menu
  },
  {
    id: "brunch-special",
    addonId: "champagne",
    restaurantId: "bellini",
    date: addDays(today, 5),
    sessionId: "breakfast",
    name: "Champagne Brunch",
    description: "Unlimited champagne paired with our weekend brunch tasting menu",
    price: 95,
    image: "/champagne-bottle-with-glasses-elegant.jpg",
    availableTimes: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM"],
    menuPolicy: 3, // Optional menus
  },
  {
    id: "sunset-dinner",
    addonId: "window",
    restaurantId: "aurora",
    date: addDays(today, 4),
    sessionId: "dinner",
    name: "Sunset Dinner Experience",
    description: "Premium waterfront seating with a curated sunset menu as the sun sets over the bay",
    price: 85,
    image: "/restaurant-window-seat-with-city-view.jpg",
    availableTimes: ["5:30 PM", "6:00 PM", "6:30 PM"],
    menuPolicy: 1, // All guests same menu
  },
  {
    id: "seafood-feast",
    addonId: "private",
    restaurantId: "aurora",
    date: addDays(today, 7),
    sessionId: "dinner",
    name: "Mediterranean Seafood Feast",
    description: "Private dining experience featuring the freshest catch and Mediterranean traditions",
    price: 175,
    image: "/private-dining-room-elegant.jpg",
    availableTimes: ["7:00 PM"],
    menuPolicy: 2, // Each guest any menu
  },
  {
    id: "wine-lunch",
    addonId: "sommelier",
    restaurantId: "aurora",
    date: addDays(today, 5),
    sessionId: "lunch",
    name: "Wine & Dine Lunch",
    description: "A relaxed afternoon of fine wines paired with our signature lunch courses",
    price: 85,
    image: "/sommelier-wine-tasting-experience.jpg",
    availableTimes: ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM"],
    menuPolicy: 3, // Optional menus
  },
]

export function getFeaturedExperiencesForDate(restaurantId: string, date: Date): FeaturedExperience[] {
  return FEATURED_EXPERIENCES.filter((exp) => exp.restaurantId === restaurantId && isSameDay(exp.date, date))
}

export function getFeaturedExperiencesForSession(
  restaurantId: string,
  date: Date,
  sessionId: string,
): FeaturedExperience[] {
  return FEATURED_EXPERIENCES.filter(
    (exp) => exp.restaurantId === restaurantId && isSameDay(exp.date, date) && exp.sessionId === sessionId,
  )
}

export function hasExperiencesOnDate(restaurantId: string, date: Date): boolean {
  return FEATURED_EXPERIENCES.some((exp) => exp.restaurantId === restaurantId && isSameDay(exp.date, date))
}

// Helper function to get addons for booking
export function getAddonsForBooking(
  sessionId: string | undefined,
  experienceId: string | undefined,
  partySize: number,
): Addon[] {
  let addons: Addon[]

  if (experienceId) {
    // If an experience is selected, show experience-specific addons
    addons = ADDONS.filter((addon) => addon.experienceIds?.includes(experienceId))
  } else if (sessionId) {
    // If only a session is selected, show session-specific addons (without experience-only ones)
    addons = ADDONS.filter((addon) => addon.sessionIds?.includes(sessionId) && !addon.experienceIds?.length)
  } else {
    return []
  }

  // Filter by party size (min/max)
  return addons.filter((addon) => partySize >= addon.min && partySize <= addon.max)
}

export function getMenuPolicy(sessionId: string | undefined, experienceId: string | undefined): number {
  if (experienceId) {
    const experience = FEATURED_EXPERIENCES.find((e) => e.id === experienceId)
    return experience?.menuPolicy ?? 3
  }

  if (sessionId) {
    const session = SESSIONS.find((s) => s.id === sessionId)
    return session?.menuPolicy ?? 3
  }

  return 3 // Default to optional
}
