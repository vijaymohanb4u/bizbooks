'use client';

import { useState } from 'react';
import { BuildingOfficeIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import LocationFormModal from './LocationFormModal';

interface Location {
  id: number;
  name: string;
  type: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  isDefault: boolean;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const handleAddLocation = (location: Omit<Location, 'id'>) => {
    const newLocation = {
      ...location,
      id: locations.length + 1,
    };
    setLocations([...locations, newLocation]);
    setIsAddingLocation(false);
  };

  const handleEditLocation = (location: Location) => {
    setLocations(locations.map(loc => loc.id === location.id ? location : loc));
    setEditingLocation(null);
  };

  const handleDeleteLocation = (id: number) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const handleSetDefault = (id: number) => {
    setLocations(locations.map(loc => ({
      ...loc,
      isDefault: loc.id === id
    })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BuildingOfficeIcon className="h-8 w-8 text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        </div>
        <button
          onClick={() => setIsAddingLocation(true)}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <PlusIcon className="h-5 w-5" />
          Add Location
        </button>
      </div>

      {/* Locations List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <div
            key={location.id}
            className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingLocation(location)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Edit</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteLocation(location.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <span className="sr-only">Delete</span>
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <p>{location.addressLine1}</p>
              {location.addressLine2 && <p>{location.addressLine2}</p>}
              <p>{`${location.city}, ${location.state} ${location.postalCode}`}</p>
              <p>{location.country}</p>
              {location.phone && <p>Phone: {location.phone}</p>}
              {location.email && <p>Email: {location.email}</p>}
            </div>
            {location.isDefault ? (
              <span className="mt-4 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                Default Location
              </span>
            ) : (
              <button
                onClick={() => handleSetDefault(location.id)}
                className="mt-4 text-sm text-blue-600 hover:text-blue-500"
              >
                Set as Default
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Location Form Modal */}
      {(isAddingLocation || editingLocation) && (
        <LocationFormModal
          location={editingLocation}
          onSave={editingLocation ? handleEditLocation : handleAddLocation}
          onCancel={() => {
            setIsAddingLocation(false);
            setEditingLocation(null);
          }}
        />
      )}
    </div>
  );
}
