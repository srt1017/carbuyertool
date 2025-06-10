"use client";

import { useState, FormEvent, ChangeEvent, useRef, useEffect } from "react";
import sampleListings from "../data/sampleListings.json";
import { Listing } from "./ListingCard";

interface ParsedQuery {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  maxPrice?: number;
  minPrice?: number;
  location?: string;
  radius?: number;
  category?: string;
  features?: string[];
}

interface ChatMessage {
  from: "user" | "bot";
  text: string;
  listings?: Listing[];
  showMore?: boolean;
}

export default function ChatWidget() {
  const listings: Listing[] = sampleListings;
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      from: "bot", 
      text: "Hi! I can help you find cars. Try asking:\n• 'Show me BMW M3s under $60k'\n• 'Find 2020+ trucks with sunroof'\n• 'Any muscle cars near 75201?'" 
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enhanced query parser
  function parseQuery(query: string): ParsedQuery {
    const lowerQuery = query.toLowerCase();
    const parsed: ParsedQuery = {};

    // Extract make/model
    const makes = ["ford", "chevrolet", "bmw", "audi", "mercedes", "toyota", "dodge", "cadillac", "tesla", "lexus", "ram", "gmc", "nissan", "alfa romeo", "ferrari", "rolls-royce"];
    for (const make of makes) {
      if (lowerQuery.includes(make)) {
        parsed.make = make;
        break;
      }
    }

    // Extract specific models
    const modelPatterns = {
      "m3": "M3",
      "m4": "M4",
      "m5": "M5",
      "mustang": "Mustang",
      "camaro": "Camaro",
      "corvette": "Corvette",
      "f-150": "F-150",
      "f150": "F-150",
      "tundra": "Tundra",
      "tacoma": "Tacoma",
      "hellcat": "Hellcat",
      "demon": "Demon",
      "raptor": "Raptor",
      "trx": "TRX"
    };

    for (const [pattern, model] of Object.entries(modelPatterns)) {
      if (lowerQuery.includes(pattern)) {
        parsed.model = model;
        break;
      }
    }

    // Extract year ranges
    const yearMatch = lowerQuery.match(/(\d{4})\+|(\d{4})-(\d{4})|(\d{4})/);
    if (yearMatch) {
      if (yearMatch[1]) {
        parsed.yearMin = parseInt(yearMatch[1]);
      } else if (yearMatch[2] && yearMatch[3]) {
        parsed.yearMin = parseInt(yearMatch[2]);
        parsed.yearMax = parseInt(yearMatch[3]);
      } else if (yearMatch[4]) {
        parsed.yearMin = parseInt(yearMatch[4]);
        parsed.yearMax = parseInt(yearMatch[4]);
      }
    }

    // Extract price
    const priceMatch = lowerQuery.match(/under\s*\$?(\d+)k?|below\s*\$?(\d+)k?|less than\s*\$?(\d+)k?|max\s*\$?(\d+)k?|\$?(\d+)k?\s*-\s*\$?(\d+)k?/);
    if (priceMatch) {
      if (priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4]) {
        const priceValue = priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4];
        parsed.maxPrice = parseInt(priceValue) * (priceValue.length <= 3 ? 1000 : 1);
      } else if (priceMatch[5] && priceMatch[6]) {
        parsed.minPrice = parseInt(priceMatch[5]) * (priceMatch[5].length <= 3 ? 1000 : 1);
        parsed.maxPrice = parseInt(priceMatch[6]) * (priceMatch[6].length <= 3 ? 1000 : 1);
      }
    }

    // Extract location (ZIP codes)
    const zipMatch = lowerQuery.match(/\b(\d{5})\b/);
    if (zipMatch) {
      parsed.location = zipMatch[1];
    }

    // Extract categories
    const categories = ["muscle car", "sports car", "truck", "suv", "sedan", "luxury", "exotic"];
    for (const cat of categories) {
      if (lowerQuery.includes(cat)) {
        parsed.category = cat;
        break;
      }
    }

    // Extract features
    const features = [];
    if (lowerQuery.includes("sunroof")) features.push("sunroof");
    if (lowerQuery.includes("bucket seat")) features.push("bucket seats");
    if (lowerQuery.includes("carbon") || lowerQuery.includes("ceramic")) features.push("carbon ceramic brakes");
    if (lowerQuery.includes("performance")) features.push("performance trim");
    if (lowerQuery.includes("lifted")) features.push("lifted");
    if (features.length > 0) parsed.features = features;

    return parsed;
  }

  // Apply parsed query to filter listings
  function filterListings(parsed: ParsedQuery): Listing[] {
    return listings.filter(listing => {
      if (parsed.make && !listing.make.toLowerCase().includes(parsed.make)) return false;
      if (parsed.model && !listing.model.includes(parsed.model)) return false;
      if (parsed.yearMin && listing.year < parsed.yearMin) return false;
      if (parsed.yearMax && listing.year > parsed.yearMax) return false;
      if (parsed.maxPrice && listing.price > parsed.maxPrice) return false;
      if (parsed.minPrice && listing.price < parsed.minPrice) return false;
      if (parsed.location && listing.zip !== parsed.location) return false;
      if (parsed.category && listing.category !== parsed.category) return false;
      if (parsed.features) {
        for (const feature of parsed.features) {
          const hasFeature = listing.options.includes(feature) || 
                           (feature === "lifted" && listing.truckOptions.includes("lifted"));
          if (!hasFeature) return false;
        }
      }
      return true;
    });
  }

  // Generate natural language response
  function generateResponse(matches: Listing[], parsed: ParsedQuery): string {
    if (matches.length === 0) {
      return "I couldn't find any cars matching your criteria. Try adjusting your search or ask me to show you what's available.";
    }

    let response = `I found ${matches.length} ${matches.length === 1 ? 'car' : 'cars'}`;
    
    // Add search context
    const conditions = [];
    if (parsed.make) conditions.push(`${parsed.make.charAt(0).toUpperCase() + parsed.make.slice(1)}`);
    if (parsed.model) conditions.push(parsed.model);
    if (parsed.yearMin && parsed.yearMax && parsed.yearMin !== parsed.yearMax) {
      conditions.push(`${parsed.yearMin}-${parsed.yearMax}`);
    } else if (parsed.yearMin) {
      conditions.push(`${parsed.yearMin}+`);
    }
    if (parsed.maxPrice) conditions.push(`under $${parsed.maxPrice.toLocaleString()}`);
    
    if (conditions.length > 0) {
      response += ` matching: ${conditions.join(' ')}`;
    }
    
    response += ":";
    return response;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { from: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const parsed = parseQuery(input);
      const matches = filterListings(parsed);
      const responseText = generateResponse(matches, parsed);
      
      const botMsg: ChatMessage = {
        from: "bot",
        text: responseText,
        listings: matches.slice(0, 5), // Show max 5 initially
        showMore: matches.length > 5
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);

    setInput("");
  }

  function showAllResults(index: number) {
    setMessages(prev => prev.map((msg, i) => {
      if (i === index && msg.listings) {
        const parsed = parseQuery(messages[index - 1].text); // Get user's query
        const allMatches = filterListings(parsed);
        return { ...msg, listings: allMatches, showMore: false };
      }
      return msg;
    }));
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border rounded-lg shadow-lg">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full bg-blue-600 text-white py-3 rounded-t-lg hover:bg-blue-700 transition-colors flex items-center justify-between px-4"
      >
        <span className="font-medium">{open ? "Close Chat" : "Car Search Assistant"}</span>
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>
      
      {open && (
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${
                    msg.from === "user"
                      ? "bg-blue-600 text-white rounded-bl-lg rounded-tl-lg rounded-tr-lg"
                      : "bg-gray-100 text-gray-800 rounded-br-lg rounded-tr-lg rounded-tl-lg"
                  } px-4 py-2`}>
                    {msg.text.split("\n").map((line, idx) => (
                      <p key={idx} className={idx > 0 ? "mt-1" : ""}>{line}</p>
                    ))}
                  </div>
                </div>
                
                {/* Show listing cards if present */}
                {msg.listings && msg.listings.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.listings.map(listing => (
                      <div key={listing.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {listing.year} {listing.make} {listing.model}
                            </div>
                            <div className="text-gray-600">
                              ${listing.price.toLocaleString()} • {listing.miles.toLocaleString()} mi • {listing.zip}
                            </div>
                            {Math.abs(listing.price - listing.mmrValue) <= 1000 && (
                              <span className="inline-block mt-1 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded">
                                Within $1k MMR
                              </span>
                            )}
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-xs">
                            View →
                          </button>
                        </div>
                      </div>
                    ))}
                    {msg.showMore && (
                      <button
                        onClick={() => showAllResults(i)}
                        className="w-full text-center text-blue-600 hover:text-blue-800 text-sm py-1"
                      >
                        Show all results
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                placeholder="Ask about cars..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Try: &quot;BMW M3 under $60k&quot; or &quot;2020+ trucks with sunroof&quot;
            </div>
          </form>
        </div>
      )}
    </div>
  );
}