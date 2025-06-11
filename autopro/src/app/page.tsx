// app/page.tsx
"use client";

import { useState, useMemo } from "react";
import FilterPanel, { Filters } from "../components/FilterPanel";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ListingCard, { Listing } from "../components/ListingCard";
import ChatWidget from "../components/ChatWidget";
import { useListings } from "../hooks/useListings";

export default function HomePage() {
  const [quickFilter, setQuickFilter] = useState<string>("all");

  // -------------- UPDATED FILTER STATE --------------
  const [filters, setFilters] = useState<Filters>({
    zip: "",
    yearMin: null,
    yearMax: null,
    make: "",
    model: "",
    maxMiles: null,
    category: "",
    doors: null,
    drivetrain: "",
    fuelType: "",
    lifted: false,
    drw: false,
    transmission: "",
    maxPctOfMMRAsking: null,
    maxPctOfMMRRetail: null,
  });

  // Fetch listings from API with basic filters
  const { 
    listings: apiListings, 
    loading, 
    error, 
    refetch 
  } = useListings({
    make: filters.make || undefined,
    model: filters.model || undefined,
    yearMin: filters.yearMin || undefined,
    yearMax: filters.yearMax || undefined,
    zip: filters.zip || undefined,
    category: filters.category || undefined,
    maxMiles: filters.maxMiles || undefined,
  });

  // Apply client-side filters that are complex (percentages, truck options, etc.)
  const filtered = useMemo(() => {
    if (loading || !apiListings) return [];

    let results = apiListings.filter((listing) => {
      const {
        doors,
        drivetrain,
        fuelType,
        lifted,
        drw,
        transmission,
        maxPctOfMMRAsking,
        maxPctOfMMRRetail,
      } = filters;

      // Client-side filters (complex logic that's better done in memory)
      const pctAsking = (listing.price / listing.mmrValue) * 100;
      if (maxPctOfMMRAsking !== null && pctAsking > maxPctOfMMRAsking)
        return false;

      const pctRetail = (listing.price / listing.retailValue) * 100;
      if (maxPctOfMMRRetail !== null && pctRetail > maxPctOfMMRRetail)
        return false;

      // Remaining filters
      if (doors !== null && listing.doors !== doors) return false;
      if (drivetrain && listing.drivetrain !== drivetrain) return false;
      if (fuelType && listing.fuelType !== fuelType) return false;

      // Truck options
      if (lifted && !listing.truckOptions.includes("lifted")) return false;
      if (
        drw &&
        !listing.truckOptions.includes("drw") &&
        !listing.truckOptions.includes("DRW")
      )
        return false;

      // Transmission filter
      if (transmission && listing.transmission !== transmission.toLowerCase())
        return false;

      return true;
    });

    // Apply quick filters from dashboard
    switch (quickFilter) {
      case "hot-deals":
        results = results.filter((l) => l.price <= l.mmrValue - 5000);
        break;
      case "great-deals":
        results = results.filter(
          (l) =>
            l.price <= l.mmrValue - 2000 && l.price > l.mmrValue - 5000
        );
        break;
      case "under-mmr":
        results = results.filter((l) => l.price < l.mmrValue);
        break;
      case "performance":
        results = results.filter((l) =>
          ["muscle car", "sports car", "exotic"].includes(l.category)
        );
        break;
      case "luxury":
        results = results.filter(
          (l) => l.category === "luxury" || l.category === "exotic"
        );
        break;
      case "trucks":
        results = results.filter(
          (l) => l.category === "truck" || l.category === "suv"
        );
        break;
      case "recent":
        results = results.slice(0, 5);
        break;
    }

    return results;
  }, [filters, apiListings, quickFilter, loading]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading listings: {error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r overflow-y-auto">
        <FilterPanel filters={filters} setFilters={setFilters} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard - Add your quick filter buttons here */}
        
        {/* Listings Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Car Listings
              {quickFilter !== "all" && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Filtered)
                </span>
              )}
            </h1>
            <div className="text-sm text-gray-500">
              {filtered.length}{" "}
              {filtered.length === 1 ? "result" : "results"}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No listings match your filters.
              </p>
              <button
                onClick={() => {
                  setFilters({
                    zip: "",
                    yearMin: null,
                    yearMax: null,
                    make: "",
                    model: "",
                    maxMiles: null,
                    category: "",
                    doors: null,
                    drivetrain: "",
                    fuelType: "",
                    lifted: false,
                    drw: false,
                    transmission: "",
                    maxPctOfMMRAsking: null,
                    maxPctOfMMRRetail: null,
                  });
                  setQuickFilter("all");
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}