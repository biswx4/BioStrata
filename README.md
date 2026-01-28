# BioStrata AI - Tumor Microenvironment Analysis Platform

![BioStrata AI](frontend/public/vite.svg) *Note: Replace with actual screenshot*

## Overview
**BioStrata AI** is a clinical decision support system designed to analyze tumor microenvironment (TME) characteristics using patient gene expression data. It utilizes machine learning models to stratify patients into risk categories (Low, Moderate, High) and provides interpretable clinical insights.

## Features
- **AI-Powered Analysis**: Predicts risk scores using a trained ML pipeline (Random Forest/Logistic Regression).
- **Interactive Dashboard**: Real-time statistics and model performance visualization.
- **Detailed Reports**: Generates comprehensive analysis reports with biological pathway scores (Hypoxia, Glycolysis, Immune).
- **PDF Export**: Download official clinical reports for patient records.
- **Secure Platform**: Role-based access (MVP) and local data processing.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Framer Motion, Recharts
- **Backend**: Python, FastAPI, SQLite, Scikit-learn, Joblib
- **Model**: Custom Ensemble Classifier (`luad_tme_pipeline.pkl`)

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+

### 1. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the API server
python3 -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
*The backend will run at http://localhost:8000*

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the UI
npm run dev
```
*The application will run at http://localhost:5173*

## Usage
1.  **Login** using demo credentials:
    *   **User**: `Merey` / **Pass**: `18082009`
    *   **User**: `Amina` / **Pass**: `aminaloh`
2.  Navigate to **Analysis**.
3.  Upload a patient JSON/CSV or enter values manually.
4.  Click **Run Analysis** and wait for the AI assessment.
5.  View results and export the **PDF Report**.

## Project Structure
```
├── app.py                 # FastAPI Backend
├── luad_tme_pipeline.pkl  # Trained ML Model
├── reports.db             # SQLite Database (History)
├── frontend/              # React Application
│   ├── src/
│   │   ├── components/    # UI Components
│   │   ├── Analysis.jsx   # Analysis Page
│   │   ├── Dashboard.jsx  # Main Dashboard
│   │   ├── Reports.jsx    # History & PDF
│   │   └── ...
└── ...
```

## Disclaimer
**For Research Use Only.** This tool is intended to assist researchers and clinicians but should not be used as the sole basis for diagnostic or treatment decisions.
