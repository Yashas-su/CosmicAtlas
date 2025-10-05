import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CustomMap = ({ center, zoom, markers, onZoomChange }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false
    });

    // Add base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add NASA data layer (demo mode)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'NASA Data Exploration Platform - Demo Mode',
      opacity: 0.7
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    // Add zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Handle zoom changes
    map.on('zoomend', () => {
      if (onZoomChange) {
        onZoomChange(map.getZoom());
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapInstanceRef.current && isMapReady) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom, isMapReady]);

  // Add/update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add new markers
    markers.forEach((marker, index) => {
      const leafletMarker = L.marker([marker.coordinates.lat, marker.coordinates.lon])
        .addTo(mapInstanceRef.current);

      if (marker.popup) {
        leafletMarker.bindPopup(`
          <div>
            <h4>${marker.name}</h4>
            <p>${marker.description}</p>
            ${marker.confidence ? `<small>Confidence: ${(marker.confidence * 100).toFixed(1)}%</small>` : ''}
            ${marker.timestamp ? `<small>${new Date(marker.timestamp).toLocaleString()}</small>` : ''}
          </div>
        `);
      }
    });
  }, [markers, isMapReady]);

  return (
    <div 
      ref={mapRef} 
      style={{ height: '100%', width: '100%' }}
      className="custom-map"
    />
  );
};

export default CustomMap;
