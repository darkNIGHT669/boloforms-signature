import { useState, useRef } from 'react';
import { pdfjs } from 'react-pdf';
import FieldToolbox from './components/FieldToolbox';
import PDFContainer from './components/PDFContainer';
import SignatureModal from './components/SignatureModal';
import { prepareFieldsForBackend, downloadPdf } from './utils/pdfHelpers';
import { signPdf } from './services/apiService';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './App.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function App() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileObject, setPdfFileObject] = useState(null); // Store actual file object
  const [scale, setScale] = useState(1.0);
  const [fields, setFields] = useState([]);
  const [pdfDimensions, setPdfDimensions] = useState({});
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const containerRef = useRef(null);

  // Handle PDF load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    console.log('✅ PDF loaded successfully with', numPages, 'pages');
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfFileObject(file); // Store file object for later use
      setFields([]);
      setPageNumber(1);
      setPdfDimensions({});
      console.log('📄 PDF file selected:', file.name);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  // Clear all fields
  const handleClearFields = () => {
    if (window.confirm('Are you sure you want to clear all fields?')) {
      setFields([]);
    }
  };

  // Export field data (for testing)
  const handleExportFields = () => {
    console.log('📊 === FIELD DATA EXPORT ===');
    console.log('Total fields:', fields.length);
    console.log('PDF Pages:', numPages);
    console.log('PDF Dimensions:', pdfDimensions);
    
    fields.forEach((field, index) => {
      console.log(`\nField ${index + 1}:`, {
        id: field.id,
        type: field.type,
        pageNumber: field.pageNumber,
        browserCoordinates: {
          x: field.x,
          y: field.y,
          width: field.width,
          height: field.height,
        }
      });
    });
    
    console.log('\n📊 === END EXPORT ===');
    alert(`Total fields: ${fields.length}\nPDF Pages: ${numPages}\n\nCheck console for detailed coordinates`);
  };

  // Open signature modal
  const handleSignDocument = () => {
    // Check if there are any signature fields
    const signatureFields = fields.filter(f => f.type === 'signature');
    
    if (signatureFields.length === 0) {
      alert('Please add at least one signature field to the document');
      return;
    }

    setIsSignatureModalOpen(true);
  };

  // Handle signature confirmation
  const handleSignatureConfirm = async (signatureDataUrl) => {
    setIsSignatureModalOpen(false);
    setIsSigning(true);

    try {
      console.log('🔄 Starting PDF signing process...');

      // Convert PDF file to base64
      const pdfBase64 = await fileToBase64(pdfFileObject);
      
      // Get PDF container element
      const pdfContainerElement = containerRef.current;
      if (!pdfContainerElement) {
        throw new Error('PDF container not found');
      }

      // Prepare fields with PDF coordinates
      const preparedFields = prepareFieldsForBackend(fields, pdfDimensions, pdfContainerElement);
      
      console.log('📤 Prepared fields for backend:', preparedFields);

      // Extract base64 from data URL
      const signatureBase64 = signatureDataUrl.split(',')[1];

      // Call backend API
      const response = await signPdf(pdfBase64, signatureBase64, preparedFields);

      console.log('✅ PDF signed successfully!');
      console.log('Document ID:', response.data.documentId);

      // Convert base64 back to blob and download
      const signedPdfBlob = base64ToBlob(response.data.signedPdfBase64, 'application/pdf');
      downloadPdf(signedPdfBlob, 'signed-document.pdf');

      alert('✅ Document signed successfully!\nDownloading now...');
    } catch (error) {
      console.error('❌ Error signing document:', error);
      alert(`Failed to sign document: ${error.message}`);
    } finally {
      setIsSigning(false);
    }
  };

  // Helper: Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper: Convert base64 to blob
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }

    return new Blob([new Uint8Array(byteArrays)], { type: mimeType });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>BoloForms Signature Tool</h1>
        <div className="controls">
          {/* File Upload */}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="file-input"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="file-label">
            Choose PDF
          </label>
          
          {/* Controls when PDF is loaded */}
          {pdfFile && (
            <>
              <div className="zoom-controls">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                  Zoom Out
                </button>
                <span>{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))}>
                  Zoom In
                </button>
              </div>
              
              <button onClick={handleClearFields} className="clear-button">
                Clear Fields
              </button>
              
              <button onClick={handleExportFields} className="export-button">
                View Fields ({fields.length})
              </button>

              <button 
                onClick={handleSignDocument} 
                className="sign-button"
                disabled={isSigning}
              >
                {isSigning ? '⏳ Signing...' : '✍️ Sign Document'}
              </button>
            </>
          )}
        </div>
      </header>

      <main className="main-content">
        {!pdfFile ? (
          <div className="upload-prompt">
            <h2>Upload a PDF to get started</h2>
            <p>Click the "Choose PDF" button above to upload your document</p>
          </div>
        ) : (
          <div className="workspace" ref={containerRef}>
            {/* Field Toolbox */}
            <aside className="sidebar">
              <FieldToolbox />
              
              <div className="field-stats">
                <h4>Current Page: {pageNumber}</h4>
                <p>Fields on this page: {fields.filter(f => f.pageNumber === pageNumber).length}</p>
                <p>Total fields: {fields.length}</p>
                <p className="signature-count">
                  Signature fields: {fields.filter(f => f.type === 'signature').length}
                </p>
              </div>
            </aside>

            {/* PDF Viewer with Fields */}
            <div className="pdf-viewer-wrapper">
              <PDFContainer
                pdfFile={pdfFile}
                scale={scale}
                pageNumber={pageNumber}
                onLoadSuccess={onDocumentLoadSuccess}
                fields={fields}
                setFields={setFields}
                pdfDimensions={pdfDimensions}
                setPdfDimensions={setPdfDimensions}
              />

              {/* Page Navigation */}
              {numPages && numPages > 1 && (
                <div className="page-controls">
                  <button
                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                  >
                    ← Previous
                  </button>
                  <span>
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                    disabled={pageNumber >= numPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onConfirm={handleSignatureConfirm}
      />
    </div>
  );
}

export default App;