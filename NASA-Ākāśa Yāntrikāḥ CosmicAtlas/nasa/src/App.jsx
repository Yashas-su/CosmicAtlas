import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import './App.css';

// Image Viewer Component with Zoom and Pan
const ImageViewerComponent = ({ image, onBack }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleZoom = (delta) => {
    setZoom(prevZoom => Math.max(0.1, Math.min(5, prevZoom + delta)));
  };

  const handleMouseDown = (e) => {
    if (e.target === imageRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const fitToScreen = () => {
    if (imageRef.current && containerRef.current) {
      const container = containerRef.current;
      const img = imageRef.current;
      const scaleX = container.clientWidth / img.naturalWidth;
      const scaleY = container.clientHeight / img.naturalHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
      setZoom(scale);
      setPan({ x: 0, y: 0 });
    }
  };

  return (
    <main className="main-content">
      <div className="viewer-screen">
        <div className="viewer-header">
          <h2>{image.title}</h2>
          <div className="viewer-controls">
            <button onClick={() => handleZoom(-0.5)} className="control-btn">🔍-</button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button onClick={() => handleZoom(0.5)} className="control-btn">🔍+</button>
            <button onClick={fitToScreen} className="control-btn">📐 Fit</button>
            <button onClick={resetView} className="control-btn">🔄 Reset</button>
            <button onClick={onBack} className="control-btn back">← Back</button>
          </div>
        </div>
        
        <div 
          ref={containerRef}
          className="image-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <img
            ref={imageRef}
            src={image.url}
            alt={image.title}
            className="main-image"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              maxWidth: 'none',
              maxHeight: 'none'
            }}
            draggable={false}
          />
        </div>
        
        <div className="image-info-panel">
          <h3>Image Information</h3>
          <p><strong>Resolution:</strong> {image.resolution}</p>
          <p><strong>Source:</strong> {image.source}</p>
          <p><strong>Description:</strong> {image.description}</p>
          <div style={{marginTop: '10px', padding: '10px', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '5px'}}>
            <p style={{color: '#00d4ff', fontSize: '14px', margin: '0'}}>
              <strong> Controls:</strong> Mouse wheel to zoom • Click and drag to pan • Use buttons for precise control
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('welcome');
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      toast.success('NASA Data Exploration Platform loaded!');
    }, 1000);
  }, []);

  const handleDatasetSelect = (dataset) => {
    console.log('Dataset selected:', dataset);
    setSelectedDataset(dataset);
    setCurrentView('browser');
    toast.success(`Loading ${dataset} images...`);
  };

  const handleImageSelect = (image) => {
    console.log('Image selected:', image);
    setCurrentImage(image);
    setCurrentView('viewer');
    toast.success(`Loading ${image.title}`);
  };

  const handleBackToBrowser = () => {
    setCurrentView('browser');
    setCurrentImage(null);
  };

  const handleBackToHome = () => {
    setCurrentView('welcome');
    setSelectedDataset(null);
    setCurrentImage(null);
  };

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <h2>Loading NASA Data Exploration Platform...</h2>
          <p>Preparing massive image datasets for exploration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>NASA Data Exploration Platform</h1>
          <p>Explore massive NASA image datasets with zoom, labeling, and discovery tools</p>
        </div>
        <div className="header-controls">
          {currentView !== 'welcome' && (
            <button onClick={handleBackToHome} className="back-btn">
              ← Back to Home
            </button>
          )}
        </div>
      </header>

      <div className="app-body">
        {/* Welcome Screen */}
        {currentView === 'welcome' && (
          <main className="main-content">
            <div className="welcome-screen">
              <h2>Welcome to NASA Data Exploration</h2>
              <p>This platform allows you to explore NASA's massive image datasets with advanced zoom capabilities.</p>
              
              <div className="feature-grid">
                <div className="feature-card">
                  <h3>Deep Zoom Viewer</h3>
                  <p>Explore gigapixel NASA images with smooth zoom and pan controls</p>
                </div>
                <div className="feature-card">
                  <h3>Image Browser</h3>
                  <p>Browse collections of Earth, Mars, and Lunar imagery</p>
                </div>
                <div className="feature-card">
                  <h3>Annotations</h3>
                  <p>Add custom labels and notes to discovered features</p>
                </div>
                <div className="feature-card">
                  <h3>Advanced Search</h3>
                  <p>Search through NASA image metadata and descriptions</p>
                </div>
              </div>

              <div className="demo-section">
                <h3>Getting Started</h3>
                <p>Click the buttons below to explore different NASA datasets:</p>
                <div className="demo-buttons">
                  <button 
                    onClick={() => handleDatasetSelect('earth')}
                    style={{
                      background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                      color: 'white',
                      border: 'none',
                      padding: '20px 40px',
                      borderRadius: '10px',
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      margin: '15px',
                      minWidth: '250px',
                      boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0, 212, 255, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)';
                    }}
                  >
                    🌍 Earth Observations
                  </button>
                  <button 
                    onClick={() => handleDatasetSelect('mars')}
                    style={{
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                      color: 'white',
                      border: 'none',
                      padding: '20px 40px',
                      borderRadius: '10px',
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      margin: '15px',
                      minWidth: '250px',
                      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
                    }}
                  >
                    🔴 Mars Surface
                  </button>
                  <button 
                    onClick={() => handleDatasetSelect('moon')}
                    style={{
                      background: 'linear-gradient(135deg, #a0a0a0, #666666)',
                      color: 'white',
                      border: 'none',
                      padding: '20px 40px',
                      borderRadius: '10px',
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      margin: '15px',
                      minWidth: '250px',
                      boxShadow: '0 4px 15px rgba(160, 160, 160, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(160, 160, 160, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(160, 160, 160, 0.3)';
                    }}
                  >
                    🌙 Lunar Data
                  </button>
                </div>
                
                <div style={{
                  marginTop: '30px',
                  padding: '20px',
                  background: 'rgba(0, 212, 255, 0.1)',
                  borderRadius: '10px',
                  border: '2px solid rgba(0, 212, 255, 0.3)'
                }}>
                  <p style={{color: '#00d4ff', fontSize: '16px', margin: '0 0 10px 0', fontWeight: '600'}}>
                    <strong>CLICK ANY BUTTON ABOVE TO START EXPLORING!</strong>
                  </p>
                  <p style={{color: '#b0b0b0', fontSize: '14px', margin: '0'}}>
                    Current view: "{currentView}" | Selected dataset: "{selectedDataset || 'none'}"
                  </p>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Dataset Browser */}
        {currentView === 'browser' && selectedDataset && (
          <main className="main-content">
            <div className="browser-screen">
              <h2>{selectedDataset.charAt(0).toUpperCase() + selectedDataset.slice(1)} Image Collection</h2>
              <p>Select an image to explore with deep zoom capabilities</p>
              
              <div className="images-grid">
                {/* Earth Images */}
                {selectedDataset === 'earth' && (
                  <>
                    <div className="image-card" onClick={() => handleImageSelect({
                      id: 1,
                      title: 'Blue Marble - Earth from Space',
                      description: 'High-resolution view of Earth showing continents and oceans',
                      url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=2048&h=2048&fit=crop&crop=center',
                      resolution: '2048×2048',
                      source: 'NASA Earth Observatory'
                    })}>
                      <div className="image-thumbnail">
                        <img src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=300&fit=crop&crop=center" alt="Blue Marble" />
                        <div className="image-overlay">
                          <button className="view-btn">👁️ View Image</button>
                        </div>
                      </div>
                      <div className="image-info">
                        <h4>Blue Marble - Earth from Space</h4>
                        <p>High-resolution view of Earth showing continents and oceans</p>
                        <div className="image-meta">
                          <span>📏 2048×2048</span>
                          <span>🏢 NASA Earth Observatory</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="image-card" onClick={() => handleImageSelect({
                      id: 2,
                      title: 'Hurricane Katrina from Space',
                      description: 'Satellite view of Hurricane Katrina over the Gulf of Mexico',
                      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2048&h=2048&fit=crop&crop=center',
                      resolution: '2048×2048',
                      source: 'MODIS'
                    })}>
                      <div className="image-thumbnail">
                        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center" alt="Hurricane Katrina" />
                        <div className="image-overlay">
                          <button className="view-btn">👁️ View Image</button>
                        </div>
                      </div>
                      <div className="image-info">
                        <h4>Hurricane Katrina from Space</h4>
                        <p>Satellite view of Hurricane Katrina over the Gulf of Mexico</p>
                        <div className="image-meta">
                          <span>📏 2048×2048</span>
                          <span>🏢 MODIS</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Mars Images */}
                {selectedDataset === 'mars' && (
                  <>
                    <div className="image-card" onClick={() => handleImageSelect({
                      id: 3,
                      title: 'Mars Surface - Curiosity Rover',
                      description: 'Panoramic view from Mars Curiosity rover showing the Martian landscape',
                      url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1280&h=720&fit=crop&crop=center',
                      resolution: '1280×720',
                      source: 'Mars Curiosity Rover'
                    })}>
                      <div className="image-thumbnail">
                        <img src="https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop&crop=center" alt="Mars Surface" />
                        <div className="image-overlay">
                          <button className="view-btn">👁️ View Image</button>
                        </div>
                      </div>
                      <div className="image-info">
                        <h4>Mars Surface - Curiosity Rover</h4>
                        <p>Panoramic view from Mars Curiosity rover showing the Martian landscape</p>
                        <div className="image-meta">
                          <span>📏 1280×720</span>
                          <span>🏢 Mars Curiosity Rover</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="image-card" onClick={() => handleImageSelect({
                      id: 4,
                      title: 'Mars Dust Storm',
                      description: 'Global dust storm on Mars captured by Mars Reconnaissance Orbiter',
                      url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1280&h=720&fit=crop&crop=center',
                      resolution: '1280×720',
                      source: 'Mars Reconnaissance Orbiter'
                    })}>
                      <div className="image-thumbnail">
                        <img src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop&crop=center" alt="Mars Dust Storm" />
                        <div className="image-overlay">
                          <button className="view-btn">👁️ View Image</button>
                        </div>
                      </div>
                      <div className="image-info">
                        <h4>Mars Dust Storm</h4>
                        <p>Global dust storm on Mars captured by Mars Reconnaissance Orbiter</p>
                        <div className="image-meta">
                          <span>📏 1280×720</span>
                          <span>🏢 Mars Reconnaissance Orbiter</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Moon Images */}
                {selectedDataset === 'moon' && (
                  <>
                    <div className="image-card" onClick={() => handleImageSelect({
                      id: 5,
                      title: 'Lunar Surface - LROC',
                      description: 'High-resolution image of lunar surface from Lunar Reconnaissance Orbiter',
                      url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=2048&h=2048&fit=crop&crop=center',
                      resolution: '2048×2048',
                      source: 'Lunar Reconnaissance Orbiter'
                    })}>
                      <div className="image-thumbnail">
                        <img src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop&crop=center" alt="Lunar Surface" />
                        <div className="image-overlay">
                          <button className="view-btn">👁️ View Image</button>
                        </div>
                      </div>
                      <div className="image-info">
                        <h4>Lunar Surface - LROC</h4>
                        <p>High-resolution image of lunar surface from Lunar Reconnaissance Orbiter</p>
                        <div className="image-meta">
                          <span>📏 2048×2048</span>
                          <span>🏢 Lunar Reconnaissance Orbiter</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="image-card" onClick={() => handleImageSelect({
                      id: 6,
                      title: 'Earthrise from Moon',
                      description: 'Iconic view of Earth rising over the lunar horizon',
                      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2560&h=1920&fit=crop&crop=center',
                      resolution: '2560×1920',
                      source: 'Apollo 8'
                    })}>
                      <div className="image-thumbnail">
                        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center" alt="Earthrise" />
                        <div className="image-overlay">
                          <button className="view-btn">👁️ View Image</button>
                        </div>
                      </div>
                      <div className="image-info">
                        <h4>Earthrise from Moon</h4>
                        <p>Iconic view of Earth rising over the lunar horizon</p>
                        <div className="image-meta">
                          <span>📏 2560×1920</span>
                          <span>🏢 Apollo 8</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
      </div>
              
              <button onClick={handleBackToHome} className="back-btn" style={{marginTop: '20px'}}>
                ← Back to Home
        </button>
            </div>
          </main>
        )}

        {/* Image Viewer */}
        {currentView === 'viewer' && currentImage && (
          <ImageViewerComponent 
            image={currentImage} 
            onBack={handleBackToBrowser}
          />
        )}
      </div>
    </div>
  );
}

export default App;