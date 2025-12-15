import React, { useState, useRef, useEffect } from 'react';
import './DraggableField.css';

const DraggableField = ({ field, onUpdate, onDelete, isSelected, onSelect }) => {
  const fieldRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Field type configurations
  const fieldConfig = {
    text: { icon: '📝', color: '#3498db', label: 'Text' },
    signature: { icon: '✍️', color: '#e74c3c', label: 'Signature' },
    image: { icon: '🖼️', color: '#9b59b6', label: 'Image' },
    date: { icon: '📅', color: '#2ecc71', label: 'Date' },
    radio: { icon: '🔘', color: '#f39c12', label: 'Radio' },
  };

  const config = fieldConfig[field.type] || fieldConfig.text;

  // Handle field dragging (moving)
  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) return;
    
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - field.x,
      y: e.clientY - field.y,
    });
    onSelect(field.id);
  };

  // Handle resize
  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      width: field.width,
      height: field.height,
    });
    onSelect(field.id);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        onUpdate(field.id, {
          x: Math.max(0, newX),
          y: Math.max(0, newY),
        });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        const newWidth = Math.max(50, dragStart.width + deltaX);
        const newHeight = Math.max(30, dragStart.height + deltaY);
        
        onUpdate(field.id, {
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, field.id, onUpdate]);

  return (
    <div
      ref={fieldRef}
      className={`draggable-field ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${field.x}px`,
        top: `${field.y}px`,
        width: `${field.width}px`,
        height: `${field.height}px`,
        borderColor: config.color,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="field-content">
        <span className="field-icon-small">{config.icon}</span>
        <span className="field-type-label">{config.label}</span>
      </div>
      
      {isSelected && (
        <>
          {/* Resize handle */}
          <div
            className="resize-handle"
            onMouseDown={handleResizeMouseDown}
            style={{ backgroundColor: config.color }}
          />
          
          {/* Delete button */}
          <button
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
};

export default DraggableField;