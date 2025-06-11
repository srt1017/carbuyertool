import { NextRequest, NextResponse } from 'next/server';
import { supabase, transformListing } from '@/lib/supabase';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
    }

    return NextResponse.json(transformListing(data));
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Transform and update
    const updates = {
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
    };

    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }

    return NextResponse.json(transformListing(data));
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}