import React, { useState } from 'react';
import { browserToPdfCoordinates, pdfToBrowserCoordinates } from '../utils/coordinateTransform';
import './CoordinateTester.css';

/**
 * Visual component to test and verify coordinate transformations
 * Use this during development to ensure math is correct
 */
const CoordinateTester = ({ pdfDimensions, pageNumber }) => {
  const [browserCoords, setBrowserCoords] = useState({
    x: 100,
    y: 200,
    width: 150,
    height: 40,
  });

  const [renderedDims, setRenderedDims] = useState({
    width: 800,
    height: 1131,
  });

  const pageDims = pdfDimensions[pageNumber] || { width: 595, height: 842 };

  // Calculate transformations
  const pdfCoords = browserToPdfCoordinates(browserCoords, pageDims, renderedDims);
  const backToBrowser = pdfToBrowserCoordinates(pdfCoords, pageDims, renderedDims);

  // Calculate scale factors
  const scaleX = pageDims.width / renderedDims.width;
  const scaleY = pageDims.height / renderedDims.height;

  return (
    <div className="coordinate-tester">
      <h3>🧮 Coordinate Transformation Tester</h3>
      
      <div className="tester-grid">
        {/* Input: Browser Coordinates */}
        <div className="tester-section">
          <h4>Browser Coordinates (Input)</h4>
          <div className="input-group">
            <label>
              X (pixels):
              <input
                type="number"
                value={browserCoords.x}
                onChange={(e) => setBrowserCoords({...browserCoords, x: Number(e.target.value)})}
              />
            </label>
            <label>
              Y (pixels):
              <input
                type="number"
                value={browserCoords.y}
                onChange={(e) => setBrowserCoords({...browserCoords, y: Number(e.target.value)})}
              />
            </label>
            <label>
              Width (pixels):
              <input
                type="number"
                value={browserCoords.width}
                onChange={(e) => setBrowserCoords({...browserCoords, width: Number(e.target.value)})}
              />
            </label>
            <label>
              Height (pixels):
              <input
                type="number"
                value={browserCoords.height}
                onChange={(e) => setBrowserCoords({...browserCoords, height: Number(e.target.value)})}
              />
            </label>
          </div>
        </div>

        {/* Dimensions */}
        <div className="tester-section">
          <h4>PDF Dimensions</h4>
          <div className="info-display">
            <p><strong>Actual PDF:</strong> {pageDims.width.toFixed(2)} × {pageDims.height.toFixed(2)} pts</p>
            <p><strong>Rendered:</strong> {renderedDims.width} × {renderedDims.height} px</p>
          </div>
          
          <h4>Rendered Dimensions</h4>
          <div className="input-group">
            <label>
              Width (pixels):
              <input
                type="number"
                value={renderedDims.width}
                onChange={(e) => setRenderedDims({...renderedDims, width: Number(e.target.value)})}
              />
            </label>
            <label>
              Height (pixels):
              <input
                type="number"
                value={renderedDims.height}
                onChange={(e) => setRenderedDims({...renderedDims, height: Number(e.target.value)})}
              />
            </label>
          </div>
        </div>

        {/* Calculations */}
        <div className="tester-section">
          <h4>Scale Factors</h4>
          <div className="info-display">
            <p><strong>Scale X:</strong> {scaleX.toFixed(6)}</p>
            <p><strong>Scale Y:</strong> {scaleY.toFixed(6)}</p>
            <p className="formula">scaleX = PDF_Width / Rendered_Width</p>
            <p className="formula">scaleY = PDF_Height / Rendered_Height</p>
          </div>
        </div>

        {/* Output: PDF Coordinates */}
        <div className="tester-section highlight">
          <h4>PDF Coordinates (Output)</h4>
          <div className="info-display">
            <p><strong>X:</strong> {pdfCoords.x.toFixed(2)} pts</p>
            <p><strong>Y:</strong> {pdfCoords.y.toFixed(2)} pts</p>
            <p><strong>Width:</strong> {pdfCoords.width.toFixed(2)} pts</p>
            <p><strong>Height:</strong> {pdfCoords.height.toFixed(2)} pts</p>
          </div>
          <div className="formula-box">
            <p><strong>Y Calculation:</strong></p>
            <p className="formula">
              PDF_Y = {pageDims.height} - (({browserCoords.y} + {browserCoords.height}) × {scaleY.toFixed(4)})
            </p>
            <p className="formula">
              PDF_Y = {pageDims.height} - ({(browserCoords.y + browserCoords.height).toFixed(2)} × {scaleY.toFixed(4)})
            </p>
            <p className="formula">
              PDF_Y = {pageDims.height} - {((browserCoords.y + browserCoords.height) * scaleY).toFixed(2)}
            </p>
            <p className="formula result">
              PDF_Y = {pdfCoords.y.toFixed(2)} pts
            </p>
          </div>
        </div>

        {/* Verification */}
        <div className="tester-section">
          <h4>Verification (Round Trip)</h4>
          <div className="info-display">
            <p><strong>Back to Browser X:</strong> {backToBrowser.x.toFixed(2)} px</p>
            <p><strong>Back to Browser Y:</strong> {backToBrowser.y.toFixed(2)} px</p>
            <p><strong>Difference X:</strong> {Math.abs(browserCoords.x - backToBrowser.x).toFixed(4)} px</p>
            <p><strong>Difference Y:</strong> {Math.abs(browserCoords.y - backToBrowser.y).toFixed(4)} px</p>
            {Math.abs(browserCoords.x - backToBrowser.x) < 0.01 && 
             Math.abs(browserCoords.y - backToBrowser.y) < 0.01 ? (
              <p className="success">✅ Transformation is accurate!</p>
            ) : (
              <p className="warning">⚠️ Check transformation logic</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinateTester;