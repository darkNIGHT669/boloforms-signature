/**
 * Signature Modal - Draw or Upload Signature
 * Location: frontend/src/components/SignatureModal.jsx
 */

import React, { useRef, useState, useEffect } from 'react';
import './SignatureModal.css';

const SignatureModal = ({ isOpen, onClose, onConfirm }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState('draw'); // 'draw' or 'upload'
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    if (isOpen && signatureType === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isOpen, signatureType]);

  // Handle drawing
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a PNG or JPEG image');
    }
  };

  // Clear canvas
  const handleClear = () => {
    if (signatureType === 'draw') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      setUploadedImage(null);
    }
  };

  // Confirm signature
  const handleConfirm = () => {
    if (signatureType === 'draw') {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      onConfirm(dataUrl);
    } else if (uploadedImage) {
      onConfirm(uploadedImage);
    } else {
      alert('Please draw or upload a signature');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Your Signature</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="signature-tabs">
          <button
            className={`tab-button ${signatureType === 'draw' ? 'active' : ''}`}
            onClick={() => setSignatureType('draw')}
          >
            ✍️ Draw
          </button>
          <button
            className={`tab-button ${signatureType === 'upload' ? 'active' : ''}`}
            onClick={() => setSignatureType('upload')}
          >
            📤 Upload
          </button>
        </div>

        <div className="signature-area">
          {signatureType === 'draw' ? (
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="signature-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          ) : (
            <div className="upload-area">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded signature" className="uploaded-signature" />
              ) : (
                <div className="upload-placeholder">
                  <p>📁 Upload your signature image</p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleFileUpload}
                    className="file-input-hidden"
                    id="signature-upload"
                  />
                  <label htmlFor="signature-upload" className="upload-label">
                    Choose File
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={handleClear}>
            Clear
          </button>
          <button className="primary-button" onClick={handleConfirm}>
            Confirm Signature
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;