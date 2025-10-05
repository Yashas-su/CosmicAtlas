import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ImageViewer = ({ image, onBack, onAddAnnotation }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [annotations, setAnnotations] = useState([]);
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({ x: 0, y: 0, label: '', description: '' });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Reset view when image changes
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setAnnotations([]);
  }, [image]);

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

  const handleImageClick = (e) => {
    if (e.target === imageRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left - pan.x) / zoom);
      const y = ((e.clientY - rect.top - pan.y) / zoom);
      
      setNewAnnotation({ x, y, label: '', description: '' });
      setShowAnnotationForm(true);
    }
  };

  const handleAddAnnotation = () => {
    if (newAnnotation.label.trim()) {
      const annotation = {
        id: Date.now(),
        ...newAnnotation,
        timestamp: new Date().toISOString()
      };
      setAnnotations(prev => [...prev, annotation]);
      setShowAnnotationForm(false);
      setNewAnnotation({ x: 0, y: 0, label: '', description: '' });
      toast.success('Annotation added!');
    }
  };

  const handleDeleteAnnotation = (id) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    toast.success('Annotation deleted!');
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

  if (!image) {
    return (
      <div className="image-viewer-error">
        <h3>No image selected</h3>
        <button onClick={onBack} className="back-btn">← Back to Browser</button>
      </div>
    );
  }

  return (
    <div className="image-viewer">
      {/* Viewer Header */}
      <div className="viewer-header">
        <div className="viewer-title">
          <h2>🖼️ {image.title}</h2>
          <p>{image.description}</p>
        </div>
        <div className="viewer-controls">
          <button onClick={() => handleZoom(-0.2)} className="control-btn">🔍-</button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={() => handleZoom(0.2)} className="control-btn">🔍+</button>
          <button onClick={fitToScreen} className="control-btn">📐 Fit</button>
          <button onClick={resetView} className="control-btn">🔄 Reset</button>
          <button onClick={onBack} className="control-btn back">← Back</button>
        </div>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className="image-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleImageClick}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <img
          ref={imageRef}
          src={image.url}
          alt={image.title}
          className="main-image"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
          draggable={false}
        />

        {/* Annotations */}
        {annotations.map(annotation => (
          <div
            key={annotation.id}
            className="annotation-marker"
            style={{
              left: annotation.x * zoom + pan.x,
              top: annotation.y * zoom + pan.y,
              transform: `scale(${1/zoom})`
            }}
            title={`${annotation.label}: ${annotation.description}`}
          >
            <div className="annotation-pin">📍</div>
            <div className="annotation-label">{annotation.label}</div>
            <button 
              className="annotation-delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAnnotation(annotation.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Annotation Form Modal */}
      {showAnnotationForm && (
        <div className="annotation-modal">
          <div className="annotation-form">
            <h3>Add Annotation</h3>
            <div className="form-group">
              <label>Label:</label>
              <input
                type="text"
                value={newAnnotation.label}
                onChange={(e) => setNewAnnotation(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Enter feature label"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={newAnnotation.description}
                onChange={(e) => setNewAnnotation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button onClick={handleAddAnnotation} className="btn-primary">Add Annotation</button>
              <button onClick={() => setShowAnnotationForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Info Panel */}
      <div className="image-info-panel">
        <div className="info-section">
          <h3>Image Information</h3>
          <p><strong>Resolution:</strong> {image.resolution}</p>
          <p><strong>Source:</strong> {image.source}</p>
          <p><strong>Description:</strong> {image.description}</p>
        </div>
        
        <div className="annotations-section">
          <h3>Annotations ({annotations.length})</h3>
          {annotations.length === 0 ? (
            <p>Click on the image to add annotations</p>
          ) : (
            <div className="annotations-list">
              {annotations.map(annotation => (
                <div key={annotation.id} className="annotation-item">
                  <div className="annotation-info">
                    <strong>{annotation.label}</strong>
                    <p>{annotation.description}</p>
                    <small>{new Date(annotation.timestamp).toLocaleString()}</small>
                  </div>
                  <button 
                    onClick={() => handleDeleteAnnotation(annotation.id)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;