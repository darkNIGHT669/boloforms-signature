BoloForms Signature Injection Prototype

This project is a prototype built as part of the BoloForms assignment.
The goal is to reliably place a signature on a PDF in a responsive browser-based editor and then permanently embed that signature into the final PDF on the backend.

The main challenge addressed here is the coordinate mismatch between browsers and PDFs.

🔍 Problem Overview

Browsers use CSS pixels with a top-left origin

PDFs use points (72 DPI) with a bottom-left origin

Screen sizes are responsive, PDFs are static

This prototype bridges that gap by converting browser coordinates into PDF coordinates in a consistent and reliable way.

✨ Features

Upload and preview a PDF in the browser

Drag and place a signature field on the document

Draw a signature or upload an image

Responsive placement (works across screen sizes)

Backend embeds the signature permanently into the PDF

Aspect ratio of the signature is preserved

Download the final signed PDF

🛠 Tech Stack
Frontend

React

react-pdf

HTML Canvas (for signature drawing)

Backend

Node.js

Express

pdf-lib

Database

MongoDB Atlas (used for audit-related data)

Deployment

Frontend: Vercel

Backend: Render

🧠 Core Implementation Idea

On the frontend, field positions are captured in browser pixels

These positions are converted into normalized PDF coordinates

The backend receives coordinates already mapped to PDF space

The signature image is drawn directly onto the PDF using pdf-lib

Y-axis inversion and scaling ensure accurate placement

This approach keeps the backend logic simple and predictable while supporting responsive layouts on the frontend.

🔗 Live Links

Frontend (Vercel):(https://boloforms-signature.vercel.app/)

Backend (Render):(https://boloforms-signature.onrender.com)

Note: The backend is hosted on Render’s free tier and may take a few seconds to wake up on the first request.

📌 Notes

This prototype focuses on the signature field as the core use case.
The same coordinate logic can be extended to text fields, images, or other form elements if needed.
