// src/components/FilterPanel.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";

export interface Filters {
  zip: string;
  yearMin: number | null;
  yearMax: number | null;
  make: string;
  model: string;
  maxMiles: number | null;
  category: string;
  doors: number | null;
  drivetrain: string;
  fuelType: string;
  lifted: boolean;
  drw: boolean;
  bucketSeats: boolean;
  carbonBrakes: boolean;
  sunroof: boolean;
  performanceTrim: boolean;
  maxPctOfMMRAsking: number | null;
  maxPctOfMMRRetail: number | null;
}

interface Props {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

export default function FilterPanel({ filters, setFilters }: Props) {
  const [local, setLocal] = useState<Filters>(filters);

  // Push local changes back up
  useEffect(() => {
    setFilters(local);
  }, [local, setFilters]);

  // Fields that should be parsed as numbers (nullable)
  const numericFields: Array<keyof Filters> = [
    "yearMin",
    "yearMax",
    "maxMiles",
    "doors",
    "maxPctOfMMRAsking",
    "maxPctOfMMRRetail",
  ];

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    // Cast so we can read .checked on both <input type="checkbox"> and <select>
    const target = e.target as HTMLInputElement;
    const name = target.name as keyof Filters;
    const type = target.type;
    const value = target.value;
    const checked = target.checked;

    setLocal((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : numericFields.includes(name)
          ? (value === "" ? null : Number(value))
          : value,
    }));
  }

  return (
    <div className="p-4 space-y-4 border-r h-screen overflow-y-auto">
      <h2 className="text-xl font-semibold">Filters</h2>

      {/* ZIP */}
      <div>
        <label className="block text-sm font-medium">ZIP Code</label>
        <input
          type="text"
          name="zip"
          value={local.zip}
          onChange={handleChange}
          className="mt-1 p-1 w-full border rounded"
          placeholder="e.g. 75201"
        />
      </div>

      {/* Year Range */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">Year Min</label>
          <input
            type="number"
            name="yearMin"
            value={local.yearMin ?? ""}
            onChange={handleChange}
            className="mt-1 p-1 w-full border rounded"
            placeholder="e.g. 2015"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Year Max</label>
          <input
            type="number"
            name="yearMax"
            value={local.yearMax ?? ""}
            onChange={handleChange}
            className="mt-1 p-1 w-full border rounded"
            placeholder="e.g. 2022"
          />
        </div>
      </div>

      {/* Make / Model */}
      <div>
        <label className="block text-sm font-medium">Make</label>
        <input
          type="text"
          name="make"
          value={local.make}
          onChange={handleChange}
          className="mt-1 p-1 w-full border rounded"
          placeholder="e.g. Ford"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Model</label>
        <input
          type="text"
          name="model"
          value={local.model}
          onChange={handleChange}
          className="mt-1 p-1 w-full border rounded"
          placeholder="e.g. Mustang"
        />
      </div>

      {/* Miles */}
      <div>
        <label className="block text-sm font-medium">Max Miles</label>
        <input
          type="number"
          name="maxMiles"
          value={local.maxMiles ?? ""}
          onChange={handleChange}
          className="mt-1 p-1 w-full border rounded"
          placeholder="e.g. 50000"
        />
      </div>

      {/* MMR % Filters */}
      <div>
        <label className="block text-sm font-medium">
          % of MMR ≤ Asking
        </label>
        <input
          type="number"
          name="maxPctOfMMRAsking"
          value={local.maxPctOfMMRAsking ?? ""}
          onChange={handleChange}
          className="mt-1 p-1 w-full border rounded"
          placeholder="e.g. 105"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">
          % of MMR ≤ Retail
        </label>
        <input
          type="number"
          name="maxPctOfMMRRetail"
          value={local.maxPctOfMMRRetail ?? ""}
          onChange={handleChange}
          className="mt-1 p-1 w-full border rounded"
          placeholder="e.g. 95"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium">Category</label>
        <select
          name="category"
          value={local.category}
          onChange={handleChange}
          className="mt-1 p-1 w-full border rounded"
        >
          <option value="">Any</option>
          <option value="muscle car">Muscle Car</option>
          <option value="sports car">Sports Car</option>
          <option value="convertible">Convertible</option>
          <option value="luxury">Luxury</option>
          <option value="sedan">Sedan</option>
          <option value="crossover">Crossover</option>
          <option value="suv">SUV</option>
          <option value="truck">Truck</option>
        </select>
      </div>

      {/* Doors / Drivetrain / Fuel */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">Doors</label>
          <select
            name="doors"
            value={local.doors ?? ""}
            onChange={handleChange}
            className="mt-1 p-1 w-full border rounded"
          >
            <option value="">Any</option>
            <option value="2">2</option>
            <option value="4">4</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Drivetrain</label>
          <select
            name="drivetrain"
            value={local.drivetrain}
            onChange={handleChange}
            className="mt-1 p-1 w-full border rounded"
          >
            <option value="">Any</option>
            <option value="AWD">AWD</option>
            <option value="RWD">RWD</option>
            <option value="FWD">FWD</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Fuel Type</label>
        <select
          name="fuelType"
          value={local.fuelType}
          onChange={handleChange}
          className="mt-1 p-1 w-full border rounded"
        >
          <option value="">Any</option>
          <option value="Gas">Gas</option>
          <option value="Diesel">Diesel</option>
          <option value="Electric">Electric</option>
        </select>
      </div>

      {/* Truck Options */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">Truck Options</label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="lifted"
            checked={local.lifted}
            onChange={handleChange}
            className="mr-2"
          />
          Lifted
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="drw"
            checked={local.drw}
            onChange={handleChange}
            className="mr-2"
          />
          Dual Rear Wheel
        </label>
      </div>

      {/* Specific Options */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">
          Specific Options
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="bucketSeats"
            checked={local.bucketSeats}
            onChange={handleChange}
            className="mr-2"
          />
          Bucket Seats
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="carbonBrakes"
            checked={local.carbonBrakes}
            onChange={handleChange}
            className="mr-2"
          />
          Carbon Ceramic Brakes
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="sunroof"
            checked={local.sunroof}
            onChange={handleChange}
            className="mr-2"
          />
          Sunroof
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="performanceTrim"
            checked={local.performanceTrim}
            onChange={handleChange}
            className="mr-2"
          />
          Performance Trim
        </label>
      </div>
    </div>
  );
}
