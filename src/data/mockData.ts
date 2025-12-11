import { Residence, RoomType, Feature, Step, Booking, Settings } from "@/types";
import { Timestamp } from "firebase/firestore";

export const residences: Residence[] = [
  {
    id: "lisbon-central",
    name: "Nine Living Lisbon Central",
    city: "Lisbon",
    address: "Avenida da Liberdade 123, 1250-096 Lisboa",
    description: "Modern student accommodation in the heart of Lisbon, steps away from major universities.",
    fullDescription: "Experience the best of student life in Lisbon at our flagship residence. Located on the iconic Avenida da Liberdade, you'll be within walking distance of ISCTE, Universidade de Lisboa, and the vibrant city center. Our beautifully designed spaces combine comfort with functionality, featuring modern amenities, collaborative study areas, and a rooftop terrace with stunning city views. Join our thriving community of international students and make memories that last a lifetime.",
    imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    amenities: ["High-Speed WiFi", "Gym", "Study Rooms", "Rooftop Terrace", "Laundry", "24/7 Security", "Bike Storage", "Common Kitchen"],
    active: true,
    startingPrice: 650,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "porto-riverside",
    name: "Nine Living Porto Riverside",
    city: "Porto",
    address: "Rua das Flores 45, 4050-262 Porto",
    description: "Charming residence overlooking the Douro River in Porto's historic district.",
    fullDescription: "Discover Porto's magic from our riverside residence. Set in a beautifully restored building in the UNESCO World Heritage historic center, you'll wake up to views of the iconic Dom Luís I Bridge and the colorful Ribeira district. Just a short walk from Universidade do Porto and FEUP, this residence offers the perfect blend of historic charm and modern comfort. Enjoy our wine tasting events, Portuguese language exchanges, and weekend trips to the stunning Douro Valley.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    amenities: ["High-Speed WiFi", "Study Rooms", "River View Lounge", "Laundry", "24/7 Security", "Common Kitchen", "Event Space"],
    active: true,
    startingPrice: 550,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "coimbra-university",
    name: "Nine Living Coimbra",
    city: "Coimbra",
    address: "Rua Larga 78, 3004-516 Coimbra",
    description: "Traditional yet modern living near Portugal's oldest and most prestigious university.",
    fullDescription: "Join the centuries-old academic tradition of Coimbra at our residence near the historic University of Coimbra. This purpose-built student accommodation combines the city's rich heritage with contemporary living spaces. Located in the Alta district, you'll be surrounded by fellow students, traditional fado bars, and the famous Joanina Library. Our residence features quiet study zones, a traditional Portuguese courtyard, and regular cultural events celebrating Coimbra's unique student traditions.",
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    amenities: ["High-Speed WiFi", "Library", "Study Rooms", "Courtyard", "Laundry", "24/7 Security", "Common Kitchen", "Music Room"],
    active: true,
    startingPrice: 450,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "braga-campus",
    name: "Nine Living Braga Campus",
    city: "Braga",
    address: "Campus de Gualtar, 4710-057 Braga",
    description: "Purpose-built modern residence right on the University of Minho campus.",
    fullDescription: "Live where you learn at our Braga Campus residence. Situated directly on the University of Minho's Gualtar campus, you'll never be late for class again. This modern, eco-friendly building features sustainable design, energy-efficient systems, and green spaces throughout. Perfect for students who want to focus on their studies while being part of a close-knit community. Enjoy our sports facilities, regular barbecue nights, and easy access to Braga's beautiful historic center.",
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    amenities: ["High-Speed WiFi", "Gym", "Study Rooms", "Garden", "Laundry", "24/7 Security", "Bike Storage", "BBQ Area", "Sports Court"],
    active: true,
    startingPrice: 400,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

export const roomTypes: RoomType[] = [
  // Lisbon
  {
    id: "lisbon-studio",
    residenceId: "lisbon-central",
    name: "Studio Apartment",
    description: "Private studio with kitchenette and ensuite bathroom. Perfect for independent living.",
    basePrice: 850,
    maxOccupancy: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "lisbon-ensuite",
    residenceId: "lisbon-central",
    name: "Ensuite Room",
    description: "Private room with ensuite bathroom in a shared apartment. Shared kitchen and living area.",
    basePrice: 650,
    maxOccupancy: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "lisbon-shared",
    residenceId: "lisbon-central",
    name: "Shared Twin Room",
    description: "Twin room shared with one other student. Shared bathroom, kitchen, and living area.",
    basePrice: 450,
    maxOccupancy: 2,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  // Porto
  {
    id: "porto-studio",
    residenceId: "porto-riverside",
    name: "River View Studio",
    description: "Stunning studio apartment overlooking the Douro River with full kitchen.",
    basePrice: 750,
    maxOccupancy: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "porto-ensuite",
    residenceId: "porto-riverside",
    name: "Ensuite Room",
    description: "Cozy private room with ensuite bathroom. Shared kitchen and common areas.",
    basePrice: 550,
    maxOccupancy: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  // Coimbra
  {
    id: "coimbra-single",
    residenceId: "coimbra-university",
    name: "Single Room",
    description: "Comfortable single room with shared bathroom facilities. Great value option.",
    basePrice: 450,
    maxOccupancy: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "coimbra-ensuite",
    residenceId: "coimbra-university",
    name: "Ensuite Room",
    description: "Private room with ensuite bathroom and study desk. Shared kitchen.",
    basePrice: 550,
    maxOccupancy: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "coimbra-shared",
    residenceId: "coimbra-university",
    name: "Shared Room",
    description: "Budget-friendly shared room option. Perfect for social students.",
    basePrice: 350,
    maxOccupancy: 2,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  // Braga
  {
    id: "braga-single",
    residenceId: "braga-campus",
    name: "Campus Single",
    description: "Modern single room with study area. Steps from lecture halls.",
    basePrice: 400,
    maxOccupancy: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "braga-ensuite",
    residenceId: "braga-campus",
    name: "Campus Ensuite",
    description: "Premium ensuite room with garden views. Private bathroom included.",
    basePrice: 500,
    maxOccupancy: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

export const bookings: Booking[] = [
  {
    id: "booking-1",
    residenceId: "lisbon-central",
    roomTypeId: "lisbon-studio",
    checkIn: Timestamp.fromDate(new Date("2025-02-01")),
    checkOut: Timestamp.fromDate(new Date("2025-07-01")),
    guestName: "Maria Silva",
    guestEmail: "maria.silva@student.pt",
    guestPhone: "+351 912 345 678",
    notes: "Exchange student from Brazil",
    status: "approved",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "booking-2",
    residenceId: "porto-riverside",
    roomTypeId: "porto-ensuite",
    checkIn: Timestamp.fromDate(new Date("2025-03-01")),
    checkOut: Timestamp.fromDate(new Date("2025-08-31")),
    guestName: "João Santos",
    guestEmail: "joao.santos@email.com",
    guestPhone: "+351 923 456 789",
    status: "pending",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "booking-3",
    residenceId: "coimbra-university",
    roomTypeId: "coimbra-single",
    checkIn: Timestamp.fromDate(new Date("2025-01-15")),
    checkOut: Timestamp.fromDate(new Date("2025-06-15")),
    guestName: "Anna Müller",
    guestEmail: "anna.mueller@email.de",
    guestPhone: "+49 176 123 4567",
    notes: "Erasmus student from Germany",
    status: "pending",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "booking-4",
    residenceId: "braga-campus",
    roomTypeId: "braga-ensuite",
    checkIn: Timestamp.fromDate(new Date("2025-02-15")),
    checkOut: Timestamp.fromDate(new Date("2025-12-15")),
    guestName: "Pierre Dubois",
    guestEmail: "pierre.dubois@email.fr",
    guestPhone: "+33 6 12 34 56 78",
    status: "approved",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "booking-5",
    residenceId: "lisbon-central",
    roomTypeId: "lisbon-ensuite",
    checkIn: Timestamp.fromDate(new Date("2025-04-01")),
    checkOut: Timestamp.fromDate(new Date("2025-09-01")),
    guestName: "Sofia Costa",
    guestEmail: "sofia.costa@student.pt",
    guestPhone: "+351 934 567 890",
    status: "rejected",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: "booking-6",
    residenceId: "porto-riverside",
    roomTypeId: "porto-studio",
    checkIn: Timestamp.fromDate(new Date("2025-05-01")),
    checkOut: Timestamp.fromDate(new Date("2025-10-01")),
    guestName: "Miguel Ferreira",
    guestEmail: "miguel.ferreira@email.com",
    guestPhone: "+351 945 678 901",
    notes: "Medical student, needs quiet room",
    status: "pending",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

export const settings: Settings = {
  minimumStayMonths: 1,
  updatedAt: Timestamp.now(),
  updatedBy: "admin@nineliving.pt",
};

export const features: Feature[] = [
  {
    icon: "MapPin",
    title: "Prime Locations",
    description: "All our residences are strategically located near universities, public transport, and city centers.",
  },
  {
    icon: "Sparkles",
    title: "All-Inclusive",
    description: "Bills, high-speed WiFi, weekly cleaning, and maintenance all included in your rent.",
  },
  {
    icon: "Users",
    title: "Community",
    description: "Regular events, shared spaces, and a welcoming community of international students.",
  },
  {
    icon: "Calendar",
    title: "Flexible Stays",
    description: "From 1 month to a full academic year, choose the stay length that suits you best.",
  },
];

export const steps: Step[] = [
  {
    number: 1,
    title: "Choose Residence",
    description: "Browse our residences and find the perfect location for your studies.",
  },
  {
    number: 2,
    title: "Select Dates",
    description: "Pick your check-in and check-out dates based on your academic calendar.",
  },
  {
    number: 3,
    title: "Submit Request",
    description: "Complete the booking form and we'll confirm your reservation within 24 hours.",
  },
];

export const getResidenceById = (id: string): Residence | undefined => {
  return residences.find((r) => r.id === id);
};

export const getRoomTypesByResidence = (residenceId: string): RoomType[] => {
  return roomTypes.filter((r) => r.residenceId === residenceId);
};

export const getActiveResidences = (): Residence[] => {
  return residences.filter((r) => r.active);
};

export const getRoomTypeById = (id: string): RoomType | undefined => {
  return roomTypes.find((r) => r.id === id);
};

export const getBookingsByStatus = (status?: Booking['status']): Booking[] => {
  if (!status) return bookings;
  return bookings.filter((b) => b.status === status);
};

export const cities = ["Lisbon", "Porto", "Coimbra", "Braga"] as const;

export const amenitiesList = [
  "WiFi",
  "Gym",
  "Study Rooms",
  "Laundry",
  "Kitchen",
  "Cleaning",
  "Security",
  "Bike Storage",
  "Garden",
  "BBQ Area",
] as const;
