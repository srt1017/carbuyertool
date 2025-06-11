import { NextRequest, NextResponse } from 'next/server';
import { supabase, transformListing } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    let query = supabase
      .from('listings')
      .select('*');

    // Add filtering based on query params
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const yearMin = searchParams.get('yearMin');
    const yearMax = searchParams.get('yearMax');
    const maxPrice = searchParams.get('maxPrice');
    const minPrice = searchParams.get('minPrice');
    const zip = searchParams.get('zip');
    const category = searchParams.get('category');
    const maxMiles = searchParams.get('maxMiles');

    if (make) query = query.ilike('make', `%${make}%`);
    if (model) query = query.ilike('model', `%${model}%`);
    if (yearMin) query = query.gte('year', parseInt(yearMin));
    if (yearMax) query = query.lte('year', parseInt(yearMax));
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    if (zip) query = query.eq('zip', zip);
    if (category) query = query.eq('category', category);
    if (maxMiles) query = query.lte('miles', parseInt(maxMiles));

    // Order by scraped_at desc by default
    query = query.order('scraped_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    // Transform to match your frontend interface
    const transformedListings = data?.map(transformListing) || [];

    return NextResponse.json(transformedListings);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transform frontend listing to database format
    const dbListing = {
      source: body.source || 'manual',
      seller_type: body.sellerType || 'dealer',
      listing_url: body.listingUrl || '',
      make: body.make,
      model: body.model,
      year: body.year,
      price: body.price,
      mmr_value: body.mmrValue,
      retail_value: body.retailValue,
      miles: body.miles,
      zip: body.zip,
      category: body.category,
      doors: body.doors,
      drivetrain: body.drivetrain,
      fuel_type: body.fuelType,
      transmission: body.transmission,
      options: body.options,
      truck_options: body.truckOptions,
      images: body.imageUrl ? [body.imageUrl] : [],
      description: body.description
    };

    const { data, error } = await supabase
      .from('listings')
      .insert([dbListing])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
    }

    return NextResponse.json(transformListing(data), { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}