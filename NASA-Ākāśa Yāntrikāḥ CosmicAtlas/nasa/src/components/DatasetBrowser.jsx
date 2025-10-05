import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const DatasetBrowser = ({ dataset, onImageSelect, onBack }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredImages, setFilteredImages] = useState([]);
  const [sortBy, setSortBy] = useState('title');

  // Sample NASA images data
  const sampleImages = {
    earth: [
      {
        id: 1,
        title: 'Blue Marble - Earth from Space',
        description: 'High-resolution view of Earth showing continents and oceans',
        url: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg',
        resolution: '5400×2700',
        source: 'NASA Earth Observatory',
        date: '2004-12-01',
        tags: ['earth', 'blue marble', 'global', 'continents']
      },
      {
        id: 2,
        title: 'Hurricane Katrina from Space',
        description: 'Satellite view of Hurricane Katrina over the Gulf of Mexico',
        url: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/7000/7372/katrina_amo_2005237_lrg.jpg',
        resolution: '2048×2048',
        source: 'MODIS',
        date: '2005-08-28',
        tags: ['hurricane', 'weather', 'storm', 'gulf of mexico']
      },
      {
        id: 3,
        title: 'Aurora Borealis from ISS',
        description: 'Northern lights captured from the International Space Station',
        url: 'https://www.nasa.gov/sites/default/files/thumbnails/image/iss062e123456.jpg',
        resolution: '1920×1080',
        source: 'International Space Station',
        date: '2020-03-15',
        tags: ['aurora', 'northern lights', 'iss', 'atmosphere']
      }
    ],
    mars: [
      {
        id: 4,
        title: 'Mars Surface - Curiosity Rover',
        description: 'Panoramic view from Mars Curiosity rover showing the Martian landscape',
        url: 'https://mars.nasa.gov/system/resources/detail_files/25049_PIA23623-1280.jpg',
        resolution: '1280×720',
        source: 'Mars Curiosity Rover',
        date: '2021-08-15',
        tags: ['mars', 'curiosity', 'rover', 'surface', 'landscape']
      },
      {
        id: 5,
        title: 'Mars Dust Storm',
        description: 'Global dust storm on Mars captured by Mars Reconnaissance Orbiter',
        url: 'https://mars.nasa.gov/system/resources/detail_files/25050_PIA23624-1280.jpg',
        resolution: '1280×720',
        source: 'Mars Reconnaissance Orbiter',
        date: '2018-06-20',
        tags: ['mars', 'dust storm', 'weather', 'global']
      }
    ],
    moon: [
      {
        id: 6,
        title: 'Lunar Surface - LROC',
        description: 'High-resolution image of lunar surface from Lunar Reconnaissance Orbiter',
        url: 'https://www.nasa.gov/sites/default/files/thumbnails/image/lroc_nac_m102443166le_crop.jpg',
        resolution: '2048×2048',
        source: 'Lunar Reconnaissance Orbiter',
        date: '2019-07-20',
        tags: ['moon', 'lunar', 'surface', 'craters']
      },
      {
        id: 7,
        title: 'Earthrise from Moon',
        description: 'Iconic view of Earth rising over the lunar horizon',
        url: 'https://www.nasa.gov/sites/default/files/thumbnails/image/earthrise_apollo8.jpg',
        resolution: '2560×1920',
        source: 'Apollo 8',
        date: '1968-12-24',
        tags: ['earthrise', 'apollo', 'moon', 'earth', 'historic']
      }
    ]
  };

  useEffect(() => {
    loadImages();
  }, [dataset]);

  useEffect(() => {
    filterImages();
  }, [images, searchTerm, sortBy]);

  const loadImages = async () => {
    setLoading(true);
    try {
      // Try to load from API first
      const response = await axios.get(`/api/datasets/${dataset}`);
      setImages(response.data);
      toast.success(`Loaded ${response.data.length} images from API`);
    } catch (error) {
      // Fallback to sample data
      console.log('API not available, using sample data');
      setImages(sampleImages[dataset] || []);
      toast.success(`Loaded ${sampleImages[dataset]?.length || 0} sample images`);
    }
    setLoading(false);
  };

  const filterImages = () => {
    let filtered = [...images];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(image => 
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Sort images
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'resolution':
          return b.resolution.localeCompare(a.resolution);
        default:
          return 0;
      }
    });
    
    setFilteredImages(filtered);
  };

  const handleImageSelect = (image) => {
    onImageSelect(image);
    toast.success(`Loading ${image.title}`);
  };

  const handleRefresh = () => {
    loadImages();
  };

  if (loading) {
    return (
      <div className="dataset-browser">
        <div className="browser-header">
          <h2>📚 {dataset.charAt(0).toUpperCase() + dataset.slice(1)} Image Collection</h2>
          <button onClick={onBack} className="back-btn">← Back to Home</button>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading NASA images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dataset-browser">
      {/* Browser Header */}
      <div className="browser-header">
        <div className="header-info">
          <h2>📚 {dataset.charAt(0).toUpperCase() + dataset.slice(1)} Image Collection</h2>
          <p>Select an image to explore with deep zoom capabilities</p>
        </div>
        <div className="header-controls">
          <button onClick={handleRefresh} className="refresh-btn">🔄 Refresh</button>
          <button onClick={onBack} className="back-btn">← Back to Home</button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="browser-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search images by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-section">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="title">Title</option>
            <option value="date">Date</option>
            <option value="resolution">Resolution</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>Showing {filteredImages.length} of {images.length} images</p>
      </div>

      {/* Images Grid */}
      <div className="images-grid">
        {filteredImages.length === 0 ? (
          <div className="no-results">
            <h3>No images found</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        ) : (
          filteredImages.map((image) => (
            <div key={image.id} className="image-card" onClick={() => handleImageSelect(image)}>
              <div className="image-thumbnail">
                <img src={image.url} alt={image.title} />
                <div className="image-overlay">
                  <button className="view-btn">👁️ View Image</button>
                </div>
                <div className="image-badge">
                  {image.resolution}
                </div>
              </div>
              <div className="image-info">
                <h4>{image.title}</h4>
                <p>{image.description}</p>
                <div className="image-meta">
                  <span>📏 {image.resolution}</span>
                  <span>🏢 {image.source}</span>
                  <span>📅 {image.date}</span>
                </div>
                {image.tags && (
                  <div className="image-tags">
                    {image.tags.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DatasetBrowser;