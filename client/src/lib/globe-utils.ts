export interface CountryData {
  code: string;
  name: string;
  emissions: number;
  population: number;
  emissionsPerCapita: number;
}

export interface GlobeCoordinates {
  lat: number;
  lng: number;
}

export interface GlobeInteraction {
  countryCode: string;
  coordinates: GlobeCoordinates;
  dataLayer: string;
  timestamp: Date;
}

// Mock function to map coordinates to countries (simplified)
// In a real app, you'd use proper geographic data or a geocoding service
export function getCountryFromCoords(lat: number, lng: number): string | null {
  // This is a very simplified mapping for demo purposes
  // Boundaries are approximate and for demonstration only
  
  // North America
  if (lat > 30 && lat < 50 && lng > -130 && lng < -60) return 'US';
  if (lat > 45 && lat < 75 && lng > -140 && lng < -50) return 'CA';
  if (lat > 15 && lat < 35 && lng > -120 && lng < -80) return 'MX';
  
  // Asia
  if (lat > 20 && lat < 50 && lng > 70 && lng < 140) return 'CN';
  if (lat > 5 && lat < 35 && lng > 65 && lng < 95) return 'IN';
  if (lat > 50 && lat < 70 && lng > 30 && lng < 180) return 'RU';
  if (lat > 30 && lat < 46 && lng > 130 && lng < 146) return 'JP';
  if (lat > 33 && lat < 39 && lng > 125 && lng < 132) return 'KR';
  
  // Europe
  if (lat > 47 && lat < 55 && lng > 5 && lng < 15) return 'DE';
  if (lat > 41 && lat < 51 && lng > -5 && lng < 10) return 'FR';
  if (lat > 50 && lat < 60 && lng > -8 && lng < 2) return 'GB';
  if (lat > 36 && lat < 44 && lng > -10 && lng < 5) return 'ES';
  if (lat > 35 && lat < 47 && lng > 6 && lng < 19) return 'IT';
  
  // South America
  if (lat > -35 && lat < 5 && lng > -75 && lng < -35) return 'BR';
  if (lat > -55 && lat < -20 && lng > -75 && lng < -53) return 'AR';
  if (lat > -45 && lat < 15 && lng > -82 && lng < -67) return 'PE';
  
  // Oceania
  if (lat > -45 && lat < -10 && lng > 110 && lng < 155) return 'AU';
  if (lat > -48 && lat < -34 && lng > 165 && lng < 180) return 'NZ';
  
  // Africa
  if (lat > -35 && lat < -22 && lng > 16 && lng < 33) return 'ZA';
  if (lat > 22 && lat < 32 && lng > 25 && lng < 37) return 'EG';
  if (lat > -15 && lat < 15 && lng > 8 && lng < 16) return 'NG';
  
  return null;
}

// Country code to full name mapping
export const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  CN: "China",
  IN: "India",
  RU: "Russia",
  JP: "Japan",
  DE: "Germany",
  BR: "Brazil",
  CA: "Canada",
  AU: "Australia",
  GB: "United Kingdom",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  KR: "South Korea",
  MX: "Mexico",
  AR: "Argentina",
  PE: "Peru",
  NZ: "New Zealand",
  ZA: "South Africa",
  EG: "Egypt",
  NG: "Nigeria"
};

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}

// Convert 3D globe coordinates to latitude/longitude
export function cartesianToLatLng(x: number, y: number, z: number): GlobeCoordinates {
  const radius = Math.sqrt(x * x + y * y + z * z);
  const lat = Math.asin(y / radius) * (180 / Math.PI);
  const lng = Math.atan2(z, x) * (180 / Math.PI);
  
  return { lat, lng };
}

// Convert latitude/longitude to 3D cartesian coordinates
export function latLngToCartesian(lat: number, lng: number, radius: number = 1): { x: number; y: number; z: number } {
  const latRad = lat * (Math.PI / 180);
  const lngRad = lng * (Math.PI / 180);
  
  return {
    x: radius * Math.cos(latRad) * Math.cos(lngRad),
    y: radius * Math.sin(latRad),
    z: radius * Math.cos(latRad) * Math.sin(lngRad)
  };
}

// Calculate great circle distance between two points on Earth
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get color for data visualization based on value and range
export function getDataColor(value: number, min: number, max: number, colorScheme: 'emissions' | 'population' | 'temperature' = 'emissions'): string {
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  
  switch (colorScheme) {
    case 'emissions':
      // Red to orange gradient for emissions
      const red = Math.round(255);
      const green = Math.round(165 - (normalized * 100));
      const blue = Math.round(0 + (normalized * 50));
      return `rgb(${red}, ${green}, ${blue})`;
      
    case 'population':
      // Blue gradient for population
      const blueRed = Math.round(70 + (normalized * 100));
      const blueGreen = Math.round(130 + (normalized * 100));
      const blueBlue = Math.round(180 + (normalized * 75));
      return `rgb(${blueRed}, ${blueGreen}, ${blueBlue})`;
      
    case 'temperature':
      // Blue to red gradient for temperature
      if (normalized < 0.5) {
        const tempRed = Math.round(normalized * 2 * 255);
        const tempGreen = Math.round(255);
        const tempBlue = Math.round(255 - (normalized * 2 * 255));
        return `rgb(${tempRed}, ${tempGreen}, ${tempBlue})`;
      } else {
        const tempRed = Math.round(255);
        const tempGreen = Math.round(255 - ((normalized - 0.5) * 2 * 255));
        const tempBlue = Math.round(0);
        return `rgb(${tempRed}, ${tempGreen}, ${tempBlue})`;
      }
      
    default:
      return `rgba(46, 139, 87, ${0.3 + normalized * 0.7})`;
  }
}

// Generate random coordinates within a country (simplified)
export function getRandomCoordinatesInCountry(countryCode: string): GlobeCoordinates | null {
  const countryBounds: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
    US: { minLat: 25, maxLat: 49, minLng: -125, maxLng: -66 },
    CN: { minLat: 18, maxLat: 54, minLng: 73, maxLng: 135 },
    IN: { minLat: 8, maxLat: 37, minLng: 68, maxLng: 97 },
    RU: { minLat: 41, maxLat: 82, minLng: 19, maxLng: 180 },
    JP: { minLat: 24, maxLat: 46, minLng: 123, maxLng: 146 },
    DE: { minLat: 47, maxLat: 55, minLng: 5, maxLng: 15 },
    BR: { minLat: -34, maxLat: 5, minLng: -74, maxLng: -34 },
    CA: { minLat: 42, maxLat: 83, minLng: -141, maxLng: -52 },
    AU: { minLat: -44, maxLat: -10, minLng: 113, maxLng: 154 },
    GB: { minLat: 50, maxLat: 61, minLng: -8, maxLng: 2 }
  };
  
  const bounds = countryBounds[countryCode];
  if (!bounds) return null;
  
  return {
    lat: bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat),
    lng: bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng)
  };
}

// Utility to format large numbers for display
export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
}

// Globe interaction event handlers
export class GlobeInteractionManager {
  private interactions: GlobeInteraction[] = [];
  
  recordInteraction(countryCode: string, coordinates: GlobeCoordinates, dataLayer: string): void {
    const interaction: GlobeInteraction = {
      countryCode,
      coordinates,
      dataLayer,
      timestamp: new Date()
    };
    
    this.interactions.push(interaction);
    
    // Keep only last 100 interactions to prevent memory bloat
    if (this.interactions.length > 100) {
      this.interactions = this.interactions.slice(-100);
    }
  }
  
  getInteractions(): GlobeInteraction[] {
    return [...this.interactions];
  }
  
  getUniqueCountries(): string[] {
    const countries = new Set(this.interactions.map(i => i.countryCode));
    return Array.from(countries);
  }
  
  getInteractionCount(): number {
    return this.interactions.length;
  }
  
  getLastInteraction(): GlobeInteraction | null {
    return this.interactions.length > 0 ? this.interactions[this.interactions.length - 1] : null;
  }
}
