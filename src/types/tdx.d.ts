declare namespace TDX {
  interface Scene {
    id: string;
    name: string;
    city: string;
    image: string;
  }

  interface Restaurant {
    id: string;
    name: string;
    city: string;
    address: string;
    openingHours: string;
    contactNumber: string;
    image: string;
  }

  type Hotel = Restaurant;

  interface City {
    id: string;
    name: string;
    image: string;
    description: string;
  }
}
