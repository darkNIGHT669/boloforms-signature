import React, { useRef, useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import DraggableField from './DraggableField';
import { getPdfDimensions, getRenderedDimensions, browserToPdfCoordinates } from '../utils/coordinateTransform';
import './PDFContainer.css';

const PDFContainer = ({ 
  pdfFile, 
  scale, 
  pageNumber, 
  onLoadSuccess, 
  fields, 
  setFields,
  pdfDimensions,
  setPdfDimensions 
}) => {
  const containerRef = useRef(null);
  const pageRef = useRef(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Track rendered dimensions for responsive coordinate calculation
  useEffect(() => {
    if (!pageRef.current) return;

    const updateDimensions = () => {
      const pdfPageElement = pageRef.current.querySelector('.react-pdf__Page');
      if (pdfPageElement) {
        const rendered = getRenderedDimensions(pdfPageElement);
        console.log('📐 Rendered dimensions updated:', rendered);
      }
    };

    // Update on resize
    window.addEventListener('resize', updateDimensions);
    // Initial update
    setTimeout(updateDimensions, 100);

    return () => window.removeEventListener('resize', updateDimensions);
  }, [pageNumber, scale]);

  // Handle page load to get PDF dimensions
  const handlePageLoadSuccess = (page) => {
    const dims = getPdfDimensions(page);
    setPdfDimensions(prev => ({
      ...prev,
      [pageNumber]: dims
    }));
    console.log(`📄 Page ${pageNumber} PDF dimensions:`, dims);
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const fieldType = e.dataTransfer.getData('fieldType');
    if (!fieldType) return;

    // Get container bounds
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate position relative to container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create new field with browser coordinates
    const newField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      x: Math.max(0, x - 75),
      y: Math.max(0, y - 20),
      width: 150,
      height: 40,
      pageNumber: pageNumber,
    };

    // Log browser coordinates
    console.log('🎯 Field Dropped (Browser Coordinates):', {
      type: fieldType,
      browserCoords: {
        x: newField.x,
        y: newField.y,
        width: newField.width,
        height: newField.height,
      },
      pageNumber: pageNumber,
    });

    // Calculate and log PDF coordinates
    const pageDims = pdfDimensions[pageNumber];
    if (pageDims) {
      const pdfPageElement = pageRef.current?.querySelector('.react-pdf__Page');
      const renderedDims = getRenderedDimensions(pdfPageElement);
      
      const pdfCoords = browserToPdfCoordinates(
        { x: newField.x, y: newField.y, width: newField.width, height: newField.height },
        pageDims,
        renderedDims
      );

      console.log('📍 Converted to PDF Coordinates:', {
        pdfCoords: {
          x: pdfCoords.x.toFixed(2),
          y: pdfCoords.y.toFixed(2),
          width: pdfCoords.width.toFixed(2),
          height: pdfCoords.height.toFixed(2),
        },
        scaleFactors: {
          scaleX: (pageDims.width / renderedDims.width).toFixed(4),
          scaleY: (pageDims.height / renderedDims.height).toFixed(4),
        }
      });
    }

    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Update field position/size
  const handleFieldUpdate = (fieldId, updates) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  // Delete field
  const handleFieldDelete = (fieldId) => {
    setFields(fields.filter(field => field.id !== fieldId));
    setSelectedFieldId(null);
  };

  // Deselect field when clicking on PDF
  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target.closest('.react-pdf__Page')) {
      setSelectedFieldId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`pdf-container ${isDragOver ? 'drag-over' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleContainerClick}
    >
      <div ref={pageRef}>
        <Document
          file={pdfFile}
          onLoadSuccess={onLoadSuccess}
          className="pdf-document"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            onLoadSuccess={handlePageLoadSuccess}
          />
        </Document>
      </div>

      {/* Render fields for current page */}
      {fields
        .filter(field => field.pageNumber === pageNumber)
        .map(field => (
          <DraggableField
            key={field.id}
            field={field}
            onUpdate={handleFieldUpdate}
            onDelete={handleFieldDelete}
            isSelected={selectedFieldId === field.id}
            onSelect={setSelectedFieldId}
          />
        ))}

      {isDragOver && (
        <div className="drop-overlay">
          <p>Drop field here</p>
        </div>
      )}
    </div>
  );
};

export default PDFContainer;