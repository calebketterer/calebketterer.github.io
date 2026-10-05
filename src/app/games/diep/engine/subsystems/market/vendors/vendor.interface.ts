export interface DiepVendorProfile {
  id: string;
  name: string;
  subtitle: string;
  type: 'GENERAL' | 'COSMETICS' | 'WEAPONS' | 'ABILITIES';
  
  // OPTIONAL: Omit these to automatically spawn the vendor at a random on-screen location
  initialX?: number;
  initialY?: number;
}