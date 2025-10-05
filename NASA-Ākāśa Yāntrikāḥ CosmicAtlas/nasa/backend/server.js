import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import sharp from 'sharp';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// NASA API endpoints
const NASA_API_KEY = process.env.NASA_API_KEY || 'jC6sQpzzRFdccuMBbE8FDEw62aIvxpFq4GfcyZsT';
const NASA_BASE_URL = 'https://api.nasa.gov';

// Sample NASA datasets for demonstration
const sampleDatasets = {
  'earth': {
    name: 'Earth Observations',
    description: 'High-resolution satellite imagery of Earth',
    baseUrl: 'https://api.nasa.gov/planetary/earth/assets',
    layers: [
      { id: 'landsat', name: 'Landsat 8', description: 'Natural color imagery' },
      { id: 'modis', name: 'MODIS', description: 'Daily global imagery' }
    ]
  },
  'mars': {
    name: 'Mars Surface',
    description: 'Mars Reconnaissance Orbiter imagery',
    baseUrl: 'https://api.nasa.gov/mars-photos/api/v1/rovers',
    layers: [
      { id: 'curiosity', name: 'Curiosity Rover', description: 'Surface exploration' },
      { id: 'perseverance', name: 'Perseverance Rover', description: 'Latest Mars exploration' }
    ]
  },
  'moon': {
    name: 'Lunar Surface',
    description: 'Lunar Reconnaissance Orbiter imagery',
    baseUrl: 'https://api.nasa.gov/planetary/earth/assets',
    layers: [
      { id: 'lroc', name: 'LROC', description: 'Lunar surface details' },
      { id: 'topography', name: 'Topography', description: 'Elevation data' }
    ]
  }
};

// Image tiling system for handling large images
const createImageTiles = async (imagePath, outputDir, maxZoom = 10) => {
  try {
    await fs.ensureDir(outputDir);
    
    // Get image metadata
    const metadata = await sharp(imagePath).metadata();
    const { width, height } = metadata;
    
    // Create tiles for each zoom level
    for (let zoom = 0; zoom <= maxZoom; zoom++) {
      const tileSize = 256;
      const scale = Math.pow(2, zoom);
      const scaledWidth = Math.ceil(width / scale);
      const scaledHeight = Math.ceil(height / scale);
      
      const zoomDir = path.join(outputDir, zoom.toString());
      await fs.ensureDir(zoomDir);
      
      // Calculate number of tiles needed
      const tilesX = Math.ceil(scaledWidth / tileSize);
      const tilesY = Math.ceil(scaledHeight / tileSize);
      
      for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
          const left = x * tileSize;
          const top = y * tileSize;
          const right = Math.min(left + tileSize, scaledWidth);
          const bottom = Math.min(top + tileSize, scaledHeight);
          
          const tilePath = path.join(zoomDir, `${x}_${y}.jpg`);
          
          await sharp(imagePath)
            .resize(scaledWidth, scaledHeight)
            .extract({ left, top, width: right - left, height: bottom - top })
            .jpeg({ quality: 85 })
            .toFile(tilePath);
        }
      }
    }
    
    return { success: true, tiles: { maxZoom, tilesX, tilesY } };
  } catch (error) {
    console.error('Error creating tiles:', error);
    return { success: false, error: error.message };
  }
};

// API Routes

// Get available datasets
app.get('/api/datasets', (req, res) => {
  res.json(sampleDatasets);
});

// Get dataset details
app.get('/api/datasets/:dataset', (req, res) => {
  const { dataset } = req.params;
  if (sampleDatasets[dataset]) {
    res.json(sampleDatasets[dataset]);
  } else {
    res.status(404).json({ error: 'Dataset not found' });
  }
});

// Get tile for specific coordinates and zoom level
app.get('/api/tiles/:dataset/:layer/:z/:x/:y', async (req, res) => {
  const { dataset, layer, z, x, y } = req.params;
  const tilePath = path.join(__dirname, 'public', 'tiles', dataset, layer, z, `${x}_${y}.jpg`);
  
  try {
    if (await fs.pathExists(tilePath)) {
      res.sendFile(tilePath);
    } else {
      // Generate placeholder tile or return 404
      res.status(404).json({ error: 'Tile not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error loading tile' });
  }
});

// Search functionality
app.get('/api/search', async (req, res) => {
  const { query, dataset, coordinates } = req.query;
  
  try {
    let results = [];
    
    if (coordinates) {
      const [lat, lon] = coordinates.split(',').map(Number);
      // Search for features near coordinates
      results = [
        {
          id: 'feature_1',
          name: 'Sample Feature',
          coordinates: { lat, lon },
          description: 'A discovered feature at the specified coordinates',
          confidence: 0.85
        }
      ];
    } else if (query) {
      // AI-powered text search simulation
      results = [
        {
          id: 'search_1',
          name: `Results for "${query}"`,
          coordinates: { lat: 0, lon: 0 },
          description: `AI-powered search results for: ${query}`,
          confidence: 0.9
        }
      ];
    }
    
    res.json({ results, query, total: results.length });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Label management
app.post('/api/labels', (req, res) => {
  const { dataset, layer, coordinates, label, description } = req.body;
  
  // In a real implementation, this would save to a database
  const labelData = {
    id: Date.now().toString(),
    dataset,
    layer,
    coordinates,
    label,
    description,
    timestamp: new Date().toISOString()
  };
  
  res.json({ success: true, label: labelData });
});

app.get('/api/labels/:dataset/:layer', (req, res) => {
  const { dataset, layer } = req.params;
  
  // Return saved labels for the dataset/layer
  const labels = [
    {
      id: '1',
      dataset,
      layer,
      coordinates: { lat: 0, lon: 0 },
      label: 'Sample Feature',
      description: 'A labeled feature for demonstration',
      timestamp: new Date().toISOString()
    }
  ];
  
  res.json(labels);
});

// NASA API integration
app.get('/api/nasa/earth', async (req, res) => {
  try {
    const { lat, lon, date, dim } = req.query;
    const response = await axios.get(`${NASA_BASE_URL}/planetary/earth/assets`, {
      params: {
        lat: lat || 0,
        lon: lon || 0,
        date: date || new Date().toISOString().split('T')[0],
        dim: dim || 0.1,
        api_key: NASA_API_KEY
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch NASA data' });
  }
});

app.get('/api/nasa/mars', async (req, res) => {
  try {
    const { sol, camera } = req.query;
    const response = await axios.get(`${NASA_BASE_URL}/mars-photos/api/v1/rovers/curiosity/photos`, {
      params: {
        sol: sol || 1000,
        camera: camera || 'FHAZ',
        api_key: NASA_API_KEY
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Mars data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dataset endpoints
app.get('/api/datasets/:dataset', async (req, res) => {
  const { dataset } = req.params;
  
  try {
    // Sample images for each dataset
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
        }
      ],
      mars: [
        {
          id: 3,
          title: 'Mars Surface - Curiosity Rover',
          description: 'Panoramic view from Mars Curiosity rover showing the Martian landscape',
          url: 'https://mars.nasa.gov/system/resources/detail_files/25049_PIA23623-1280.jpg',
          resolution: '1280×720',
          source: 'Mars Curiosity Rover',
          date: '2021-08-15',
          tags: ['mars', 'curiosity', 'rover', 'surface', 'landscape']
        }
      ],
      moon: [
        {
          id: 4,
          title: 'Lunar Surface - LROC',
          description: 'High-resolution image of lunar surface from Lunar Reconnaissance Orbiter',
          url: 'https://www.nasa.gov/sites/default/files/thumbnails/image/lroc_nac_m102443166le_crop.jpg',
          resolution: '2048×2048',
          source: 'Lunar Reconnaissance Orbiter',
          date: '2019-07-20',
          tags: ['moon', 'lunar', 'surface', 'craters']
        }
      ]
    };

    const images = sampleImages[dataset] || [];
    res.json(images);
  } catch (error) {
    console.error('Error fetching dataset:', error);
    res.status(500).json({ error: 'Failed to fetch dataset images' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'NASA Data Exploration Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      datasets: '/api/datasets',
      search: '/api/search',
      labels: '/api/labels',
      nasa: {
        earth: '/api/nasa/earth',
        mars: '/api/nasa/mars'
      }
    }
  });
});

// Handle Chrome DevTools request
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({});
});

// Handle any other missing routes
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Start server
app.listen(PORT, () => {
  console.log(`NASA Data Exploration Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
