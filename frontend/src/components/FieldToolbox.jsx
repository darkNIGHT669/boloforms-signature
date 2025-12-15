import React from 'react';
import './FieldToolbox.css';

const FieldToolbox = () => {
  const fieldTypes = [
    {
      id: 'text',
      label: 'Text Box',
      icon: '📝',
      color: '#3498db',
    },
    {
      id: 'signature',
      label: 'Signature',
      icon: '✍️',
      color: '#e74c3c',
    },
    {
      id: 'image',
      label: 'Image',
      icon: '🖼️',
      color: '#9b59b6',
    },
    {
      id: 'date',
      label: 'Date',
      icon: '📅',
      color: '#2ecc71',
    },
    {
      id: 'radio',
      label: 'Radio Button',
      icon: '🔘',
      color: '#f39c12',
    },
  ];

  const handleDragStart = (e, fieldType) => {
    // Store field type in dataTransfer
    e.dataTransfer.setData('fieldType', fieldType.id);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  return (
    <div className="field-toolbox">
      <h3 className="toolbox-title">Field Types</h3>
      <div className="toolbox-fields">
        {fieldTypes.map((field) => (
          <div
            key={field.id}
            className="field-type-item"
            draggable
            onDragStart={(e) => handleDragStart(e, field)}
            onDragEnd={handleDragEnd}
            style={{ borderLeftColor: field.color }}
          >
            <span className="field-icon">{field.icon}</span>
            <span className="field-label">{field.label}</span>
          </div>
        ))}
      </div>
      <div className="toolbox-instructions">
        <p>💡 Drag and drop fields onto the PDF</p>
      </div>
    </div>
  );
};

export default FieldToolbox;