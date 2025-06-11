// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sampleListings = require('./src/data/sampleListings.json');

const transformedData = sampleListings.map(listing => ({
  // Map your frontend fields to DB schema
  source: 'sample_data',
  seller_type: 'dealer', // or determine based on your data
  listing_url: `https://example.com/listing/${listing.id}`,
  make: listing.make,
  model: listing.model,
  year: listing.year,
  price: listing.price,
  mmr_value: listing.mmrValue,
  retail_value: listing.retailValue,
  miles: listing.miles,
  zip: listing.zip,
  category: listing.category,
  doors: listing.doors,
  drivetrain: listing.drivetrain,
  fuel_type: listing.fuelType,
  transmission: listing.transmission,
  options: JSON.stringify(listing.options), // Convert array to JSONB
  truck_options: JSON.stringify(listing.truckOptions), // Convert array to JSONB
  images: JSON.stringify([listing.imageUrl]), // Convert single image to array
  description: `${listing.year} ${listing.make} ${listing.model}`
}));

// Save as CSV for Supabase import
const createCSV = (data) => {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

fs.writeFileSync('./listings-import.csv', createCSV(transformedData));
console.log('Created listings-import.csv for Supabase import');