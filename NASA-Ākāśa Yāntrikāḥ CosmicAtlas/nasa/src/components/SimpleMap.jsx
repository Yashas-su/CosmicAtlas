import React from 'react';

const SimpleMap = ({ center, zoom, onZoomChange }) => {
  return (
    <div className="simple-map">
      <div className="map-placeholder">
        <div className="map-content">
          <h2>🌍 NASA Data Exploration Platform</h2>
          <p>Interactive Map Loading...</p>
          <div className="map-info">
            <p><strong>Current Dataset:</strong> Earth Observations</p>
            <p><strong>Center:</strong> {center[0].toFixed(2)}, {center[1].toFixed(2)}</p>
            <p><strong>Zoom Level:</strong> {zoom}</p>
          </div>
          <div className="map-controls-simple">
            <button onClick={() => onZoomChange(zoom + 1)}>Zoom In</button>
            <button onClick={() => onZoomChange(zoom - 1)}>Zoom Out</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;
