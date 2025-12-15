import React, { useRef, useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import DraggableField from './DraggableField';
import {
  getPdfDimensions,
  getRenderedDimensions,
  browserToPdfCoordinates,
} from '../utils/coordinateTransform';
import './PDFContainer.css';

// Renders the PDF and handles field placement on top of it
const PDFContainer = ({
  pdfFile,
  scale,
  pageNumber,
  onLoadSuccess,
  fields,
  setFields,
  pdfDimensions,
  setPdfDimensions,
}) => {
  const containerRef = useRef(null);
  const pageRef = useRef(null);

  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Track rendered PDF size so coordinate math stays correct on resize
  useEffect(() => {
    if (!pageRef.current) return;

    const updateDimensions = () => {
      const pageEl = pageRef.current.querySelector('.react-pdf__Page');
      if (pageEl) {
        getRenderedDimensions(pageEl);
      }
    };

    window.addEventListener('resize', updateDimensions);
    setTimeout(updateDimensions, 100);

    return () => window.removeEventListener('resize', updateDimensions);
  }, [pageNumber, scale]);

  const handlePageLoadSuccess = (page) => {
    const dims = getPdfDimensions(page);

    setPdfDimensions((prev) => ({
      ...prev,
      [pageNumber]: dims,
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const fieldType = e.dataTransfer.getData('fieldType');
    if (!fieldType) return;

    const rect = containerRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      x: Math.max(0, x - 75),
      y: Math.max(0, y - 20),
      width: 150,
      height: 40,
      pageNumber,
    };

    const pageDims = pdfDimensions[pageNumber];
    if (pageDims) {
      const pageEl = pageRef.current?.querySelector('.react-pdf__Page');
      const renderedDims = getRenderedDimensions(pageEl);

      browserToPdfCoordinates(
        {
          x: newField.x,
          y: newField.y,
          width: newField.width,
          height: newField.height,
        },
        pageDims,
        renderedDims
      );
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

  const handleFieldUpdate = (fieldId, updates) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const handleFieldDelete = (fieldId) => {
    setFields(fields.filter((field) => field.id !== fieldId));
    setSelectedFieldId(null);
  };

  const handleContainerClick = (e) => {
    if (
      e.target === containerRef.current ||
      e.target.closest('.react-pdf__Page')
    ) {
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
            renderTextLayer
            renderAnnotationLayer
            onLoadSuccess={handlePageLoadSuccess}
          />
        </Document>
      </div>

      {fields
        .filter((field) => field.pageNumber === pageNumber)
        .map((field) => (
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
