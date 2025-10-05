import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Info, ExternalLink } from 'lucide-react';

const DemoPanel = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      title: "Welcome to NASA Data Exploration",
      content: "This platform allows you to explore massive NASA image datasets with advanced zoom, labeling, and discovery tools.",
      action: "Let's start exploring!"
    },
    {
      title: "Dataset Selection",
      content: "Choose from Earth observations, Mars surface data, or Lunar imagery. Each dataset contains high-resolution imagery from NASA missions.",
      action: "Select a dataset to begin"
    },
    {
      title: "Interactive Navigation",
      content: "Use mouse to pan and zoom. The platform uses advanced tiling to handle gigapixel images smoothly.",
      action: "Try zooming into the map"
    },
    {
      title: "Search Capabilities",
      content: "Search by coordinates, feature names, or use AI-powered text descriptions to find interesting phenomena.",
      action: "Try searching for 'dust storm' or 'crater'"
    },
    {
      title: "Feature Labeling",
      content: "Add custom labels to discovered features. Perfect for research and educational purposes.",
      action: "Click 'Add Label' to create your first annotation"
    },
    {
      title: "Layer Management",
      content: "Switch between different data layers and overlays to compare different datasets and time periods.",
      action: "Try switching between different layers"
    },
    {
      title: "Real-time Data",
      content: "The platform integrates with live NASA APIs to provide the most current data available.",
      action: "Explore the latest NASA imagery"
    }
  ];

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= demoSteps.length - 1) {
            clearInterval(interval);
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const currentDemo = demoSteps[currentStep];

  return (
    <div className="demo-panel">
      <div className="demo-header">
        <h3>Interactive Demo</h3>
        <div className="demo-controls">
          <button onClick={handleReset} title="Reset">
            <RotateCcw size={16} />
          </button>
          <button onClick={handlePlay} title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={onClose} title="Close">
            ×
          </button>
        </div>
      </div>

      <div className="demo-content">
        <div className="demo-step">
          <h4>{currentDemo.title}</h4>
          <p>{currentDemo.content}</p>
          <div className="demo-action">
            <strong>{currentDemo.action}</strong>
          </div>
        </div>

        <div className="demo-navigation">
          <button 
            onClick={handlePrevious} 
            disabled={currentStep === 0}
            className="nav-button"
          >
            Previous
          </button>
          
          <div className="step-indicator">
            {demoSteps.map((_, index) => (
              <div 
                key={index}
                className={`step-dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={currentStep === demoSteps.length - 1}
            className="nav-button"
          >
            Next
          </button>
        </div>
      </div>

      <div className="demo-features">
        <h4>Key Features</h4>
        <ul>
          <li>🔍 Advanced search capabilities</li>
          <li>🏷️ Feature labeling system</li>
          <li>🗺️ Interactive map navigation</li>
          <li>📊 Multi-layer data comparison</li>
          <li>🌍 Real-time NASA data integration</li>
          <li>📱 Responsive design</li>
        </ul>
      </div>

      <div className="demo-links">
        <a 
          href="https://api.nasa.gov/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="demo-link"
        >
          <ExternalLink size={16} />
          NASA API Documentation
        </a>
        <a 
          href="https://earthdata.nasa.gov/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="demo-link"
        >
          <ExternalLink size={16} />
          NASA EarthData
        </a>
      </div>
    </div>
  );
};

export default DemoPanel;
