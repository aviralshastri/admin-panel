"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import MapComponent from "./MapComponent";

export default function LocationWithMap() {
  const { location, error, loading, getCurrentLocation } = useGeolocation();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Get Your Location</h2>
        
        <button 
          onClick={getCurrentLocation} 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          {loading ? 'Getting location...' : 'Get My Location'}
        </button>
        
        {location && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800 mb-2">Location Found:</h3>
            <p className="text-sm text-green-700">
              <strong>Latitude:</strong> {location.latitude.toFixed(6)}
            </p>
            <p className="text-sm text-green-700">
              <strong>Longitude:</strong> {location.longitude.toFixed(6)}
            </p>
            <p className="text-sm text-green-700">
              <strong>Accuracy:</strong> {location.accuracy} meters
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Map View</h3>
        <MapComponent location={location} />
        {!location && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg">
            <p className="text-gray-600 text-center">
              Click "Get My Location" to see your position on the map
            </p>
          </div>
        )}
      </div>
    </div>
  );
}