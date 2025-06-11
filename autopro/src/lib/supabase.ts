// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your-project-url\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types that match your schema
export interface DatabaseListing {
  id: string;
  source: string;
  seller_type: string;
  listing_url: string;
  scraped_at: string;
  posted_at: string | null;
  vin: string | null;
  make: string;
  model: string;
  year: number;
  price: number;
  mmr_value: number | null;
  retail_value: number | null;
  miles: number | null;
  zip: string | null;
  category: string | null;
  doors: number | null;
  drivetrain: string | null;
  fuel_type: string | null;
  transmission: string | null;
  options: string[] | null; // JSONB parsed as array
  truck_options: string[] | null; // JSONB parsed as array
  images: string[] | null; // JSONB parsed as array
  description: string | null;
}

// Transform DB listing to your frontend interface
export const transformListing = (dbListing: DatabaseListing): Listing => ({
  id: dbListing.id,
  make: dbListing.make,
  model: dbListing.model,
  year: dbListing.year,
  price: dbListing.price,
  mmrValue: dbListing.mmr_value || 0,
  retailValue: dbListing.retail_value || 0,
  miles: dbListing.miles || 0,
  zip: dbListing.zip || '',
  category: dbListing.category || '',
  doors: dbListing.doors || 4,
  drivetrain: dbListing.drivetrain || '',
  fuelType: dbListing.fuel_type || '',
  truckOptions: dbListing.truck_options || [],
  options: dbListing.options || [],
  imageUrl: (dbListing.images && dbListing.images.length > 0) ? dbListing.images[0] : '',
  transmission: (dbListing.transmission === 'manual' ? 'manual' : 'automatic') as 'automatic' | 'manual'
});

// Your existing Listing interface (keeping it the same)
export interface Listing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mmrValue: number;
  retailValue: number;
  miles: number;
  zip: string;
  category: string;
  doors: number;
  drivetrain: string;
  fuelType: string;
  truckOptions: string[];
  options: string[];
  imageUrl: string;
  transmission: "automatic" | "manual";
}