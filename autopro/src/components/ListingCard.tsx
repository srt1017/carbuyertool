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
    imageUrl,
    transmission,
  } = listing;

  const pctMMRAsking = (price / mmrValue) * 100;
  const pctMMRRetail = (price / retailValue) * 100;
  const diffFromMMR = Math.abs(price - mmrValue);
  const isCloseToMMR = diffFromMMR <= 1000;

  const dealColor = pctMMRAsking <= 95
    ? "bg-green-100 text-green-800"
    : pctMMRAsking <= 102
    ? "bg-yellow-100 text-yellow-800"
    : "bg-red-100 text-red-800";

  const dealLabel = pctMMRAsking <= 95
    ? `${(100 - pctMMRAsking).toFixed(1)}% below wholesale`
    : `${(pctMMRAsking - 100).toFixed(1)}% above wholesale`;

  const tags = [drivetrain, `${doors} Door`, fuelType, transmission, ...truckOptions, ...options];

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white">
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
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900">
          {year} {make} {model}
        </h3>
        <p className="text-sm text-gray-600 mb-1 capitalize">
          {category} • {zip} • {miles.toLocaleString()} mi
        </p>

        <p className="text-xl font-bold text-gray-900">
          ${price.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">MMR: ${mmrValue.toLocaleString()}</p>

        <div className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded ${dealColor}`}>
          Deal: {pctMMRAsking.toFixed(1)}% of MMR ({dealLabel})
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((item) => (
            <span
              key={item}
              className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>

        <a
          href="#"
          className="mt-4 block text-center bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700"
        >
          View Details
        </a>
      </div>
    </div>
  );
}
