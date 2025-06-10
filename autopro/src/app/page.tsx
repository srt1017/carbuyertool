"use client";

import { useState, useMemo } from "react";
import FilterPanel, { Filters } from "../components/FilterPanel";
import ListingCard, { Listing } from "../components/ListingCard";
import ChatWidget from "../components/ChatWidget";
import sampleListingsData from "../data/sampleListings.json";

export default function HomePage() {
  const sampleListings: Listing[] = sampleListingsData.map((listing) => ({
  ...listing,
  transmission: listing.transmission === "manual" ? "manual" : "automatic",
}));

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

  const filtered = useMemo(() => {
    let results = sampleListings.filter((listing) => {
      const {
        zip,
        yearMin,
        yearMax,
        make,
        model,
        maxMiles,
        category,
        doors,
        drivetrain,
        fuelType,
        lifted,
        drw,
        transmission,

        maxPctOfMMRAsking,
        maxPctOfMMRRetail,
      } = filters;

      // Basic filters
      if (zip && listing.zip !== zip) return false;
      if (yearMin !== null && listing.year < yearMin) return false;
      if (yearMax !== null && listing.year > yearMax) return false;
      if (make && listing.make.toLowerCase() !== make.toLowerCase())
        return false;
      if (model && listing.model.toLowerCase() !== model.toLowerCase())
        return false;
      if (maxMiles !== null && listing.miles > maxMiles) return false;

      // Price/MMR filters
      const pctAsking = (listing.price / listing.mmrValue) * 100;
      if (maxPctOfMMRAsking !== null && pctAsking > maxPctOfMMRAsking)
        return false;

      const pctRetail = (listing.price / listing.retailValue) * 100;
      if (maxPctOfMMRRetail !== null && pctRetail > maxPctOfMMRRetail)
        return false;

      // Category and specs
      if (category && listing.category !== category) return false;
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

      // NEW: transmission filter
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
        // Only by category now
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
        // Placeholder: show first 5
        results = results.slice(0, 5);
        break;
    }

    return results;
  }, [filters, sampleListings, quickFilter]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r overflow-y-auto">
        <FilterPanel filters={filters} setFilters={setFilters} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard */}
        {/* (your quickFilter buttons go here) */}

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
                    transmission: "",         // reset
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
