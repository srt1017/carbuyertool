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
  transmission: "automatic" | "manual"
}

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const {
    make,
    model,
    year,
    price,
    mmrValue,
    retailValue,
    miles,
    zip,
    category,
    doors,
    drivetrain,
    fuelType,
    truckOptions,
    options,
    imageUrl
  } = listing;

  const pctMMRAsking = ((price / mmrValue) * 100).toFixed(0);
  const pctMMRRetail = ((price / retailValue) * 100).toFixed(0);
  const diffFromMMR = Math.abs(price - mmrValue);
  const isCloseToMMR = diffFromMMR <= 1000;

  return (
    <div className="border rounded overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative">
        <img
          src={imageUrl}
          alt={`${year} ${make} ${model}`}
          className="w-full h-40 object-cover"
        />
        {isCloseToMMR && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded">
            Within $1k MMR
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold">
          {year} {make} {model}
        </h3>
        <p className="text-sm text-gray-600">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </p>
        <p className="mt-1">
          <span className="font-bold text-lg">
            ${price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 ml-2">
            (MMR ${mmrValue.toLocaleString()})
          </span>
        </p>
        <p className="text-sm text-gray-500">
          {miles.toLocaleString()} miles • {zip}
        </p>
        <div className="mt-2 space-y-1 text-xs">
          <div>Drivetrain: {drivetrain}</div>
          <div>Doors: {doors}</div>
          <div>Fuel: {fuelType}</div>
          {truckOptions.length > 0 && (
            <div>Truck Opt: {truckOptions.join(", ")}</div>
          )}
          {options.length > 0 && (
            <div>Options: {options.join(", ")}</div>
          )}
        </div>
        <div className="mt-2 text-xs flex justify-between">
          <span className="bg-blue-100 text-blue-800 px-1 rounded">
            Asked / MMR: {pctMMRAsking}%
          </span>
          <span className="bg-green-100 text-green-800 px-1 rounded">
            Asked / Retail: {pctMMRRetail}%
          </span>
        </div>
        <a
          href="#"
          className="mt-3 block text-center bg-blue-600 text-white text-sm py-1 rounded hover:bg-blue-700"
        >
          View Details
        </a>
      </div>
    </div>
  );
}
