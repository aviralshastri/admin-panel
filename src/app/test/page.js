"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import MapComponent from "@/components/MapComponent";

export default function LeafletLocationComponent() {
  const { location, error, loading, getCurrentLocation } = useGeolocation();

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Location on Map</h2>
        
        <button 
          onClick={getCurrentLocation} 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Getting location...' : 'Get My Location'}
        </button>
        
        {location && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Location Found!</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Latitude:</strong> {location.latitude}</p>
              <p><strong>Longitude:</strong> {location.longitude}</p>
              <p><strong>Accuracy:</strong> {location.accuracy} meters</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <MapComponent 
          location={location} 
          className="w-full h-96"
        />
      </div>

      {!location && (
        <div className="mt-4 text-center text-gray-500">
          <p>Click "Get My Location" to see your position on the map</p>
        </div>
      )}
    </div>
  );
}