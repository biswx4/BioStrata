import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
import sqlite3
import uuid
from datetime import datetime
from typing import Optional, List

app = FastAPI(title="ML Model Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Global variable to store the model
model = None
DB_PATH = "reports.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            analysis_id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            risk_score REAL NOT NULL,
            risk_category TEXT NOT NULL,
            explanation TEXT,
            mode TEXT,
            patient_id TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Custom exception handler to return 400 instead of 422
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = ".".join(str(x) for x in error['loc'] if x != 'body')
        msg = error['msg']
        errors.append(f"{field}: {msg}")
    
    return JSONResponse(
        status_code=400,
        content={"detail": "Validation Error", "errors": errors}
    )

@app.on_event("startup")
def load_model():
    global model
    model_path = "luad_tme_pipeline.pkl"
    
    # Initialize DB
    init_db()
    
    if not os.path.exists(model_path):
        print(f"CRITICAL: Model file '{model_path}' not found in {os.getcwd()}")
        return

    try:
        model = joblib.load(model_path)
        print(f"Model loaded successfully from {model_path}")
    except Exception as e:
        print(f"Error loading model: {e}")

class GeneExpression(BaseModel):
    patient_id: Optional[str] = Field(None, description="Optional Patient ID")
    mode: Optional[str] = Field("detailed", description="Response mode: 'simple' or 'detailed'")
    
    HIF1A: float = Field(..., ge=0, description="HIF1A expression level (must be non-negative)")
    CA9: float = Field(..., ge=0, description="CA9 expression level (must be non-negative)")
    VEGFA: float = Field(..., ge=0, description="VEGFA expression level (must be non-negative)")
    SLC2A1: float = Field(..., ge=0, description="SLC2A1 expression level (must be non-negative)")
    LDHA: float = Field(..., ge=0, description="LDHA expression level (must be non-negative)")
    HK2: float = Field(..., ge=0, description="HK2 expression level (must be non-negative)")
    PFKP: float = Field(..., ge=0, description="PFKP expression level (must be non-negative)")
    PDK1: float = Field(..., ge=0, description="PDK1 expression level (must be non-negative)")
    CD274: float = Field(..., ge=0, description="CD274 expression level (must be non-negative)")
    CTLA4: float = Field(..., ge=0, description="CTLA4 expression level (must be non-negative)")
    TGFB1: float = Field(..., ge=0, description="TGFB1 expression level (must be non-negative)")

def calculate_features(data: GeneExpression) -> pd.DataFrame:
    # 1. Create initial dataframe from input
    input_dict = data.dict(exclude={'patient_id', 'mode'})
    df = pd.DataFrame([input_dict])
    
    # 2. Define gene groups for scores (Assumed logic - PLEASE VERIFY)
    hypoxia_genes = ['HIF1A', 'CA9', 'VEGFA', 'SLC2A1', 'LDHA', 'HK2', 'PFKP', 'PDK1']
    immune_genes = ['CD274', 'CTLA4', 'TGFB1']
    glycolysis_genes = ['SLC2A1', 'HK2', 'PFKP', 'PDK1', 'LDHA']
    
    # 3. Calculate Scores (Mean expression)
    df['Hypoxia_score'] = df[hypoxia_genes].mean(axis=1)
    df['Immune_score'] = df[immune_genes].mean(axis=1)
    df['Glycolysis_score'] = df[glycolysis_genes].mean(axis=1)
    
    # 4. Calculate Interactions
    df['Hypoxia_Glycolysis'] = df['Hypoxia_score'] * df['Glycolysis_score']
    df['Hypoxia_Immune'] = df['Hypoxia_score'] * df['Immune_score']
    df['Glycolysis_Immune'] = df['Glycolysis_score'] * df['Immune_score']
    
    # 5. Reorder columns to match model expectation exactly
    expected_features = [
        'CTLA4', 'VEGFA', 'PFKP', 'Hypoxia_score', 'PDK1', 'HK2', 'HIF1A', 'SLC2A1', 
        'Immune_score', 'TGFB1', 'CA9', 'LDHA', 'CD274', 'Glycolysis_score', 
        'Hypoxia_Glycolysis', 'Hypoxia_Immune', 'Glycolysis_Immune'
    ]
    
    return df[expected_features]

class PredictionResponse(BaseModel):
    analysis_id: str
    timestamp: str
    patient_id: Optional[str]
    risk_score: Optional[float]
    risk_category: str
    explanation: Optional[str]
    disclaimer: str

class ReportSummary(BaseModel):
    analysis_id: str
    timestamp: str
    patient_id: Optional[str]
    risk_score: float
    risk_category: str

def generate_explanation(df: pd.DataFrame, scaler) -> str:
    paragraphs = []
    
    # Map feature names to indices
    feature_names = [
        'CTLA4', 'VEGFA', 'PFKP', 'Hypoxia_score', 'PDK1', 'HK2', 'HIF1A', 'SLC2A1', 
        'Immune_score', 'TGFB1', 'CA9', 'LDHA', 'CD274', 'Glycolysis_score', 
        'Hypoxia_Glycolysis', 'Hypoxia_Immune', 'Glycolysis_Immune'
    ]
    
    # Calculate Z-scores for key processes
    z_scores = {}
    for i, name in enumerate(feature_names):
        val = df.iloc[0][name]
        mean = scaler.mean_[i]
        std = scaler.scale_[i]
        z_scores[name] = (val - mean) / std
        
    # --- Hypoxia Logic ---
    hypoxia_z = z_scores['Hypoxia_score']
    if hypoxia_z > 1.0:
        paragraphs.append(
            "The molecular profile suggests a prominent hypoxic tumor microenvironment. "
            "Elevated expression of hypoxia-related genes (HIF1A, CA9, VEGFA) is associated with "
            "aggressive tumor behavior and resistance to conventional therapies."
        )
    elif hypoxia_z < -1.0:
        paragraphs.append(
            "Hypoxia-related markers are below the population average, suggesting a relatively "
            "normoxic tumor environment, which is generally associated with better therapeutic sensitivity."
        )
    else:
        paragraphs.append(
            "Hypoxia markers are within the moderate range, consistent with typical tumor microenvironment patterns."
        )
        
    # --- Glycolysis Logic ---
    metabolism_z = z_scores['Glycolysis_score']
    if metabolism_z > 1.0:
        paragraphs.append(
            "Metabolic analysis indicates upregulated glycolysis. This pattern resembles the Warburg effect, "
            "suggesting the tumor is utilizing glycolytic pathways to support rapid proliferation."
        )
    elif metabolism_z < -1.0:
        paragraphs.append(
            "Glycolytic gene expression is lower than the cohort average, suggesting less reliance on "
            "glycolysis for energy metabolism."
        )
        
    # --- Immune Logic ---
    immune_z = z_scores['Immune_score']
    if immune_z < -1.0:
        paragraphs.append(
            "The immune score is notably low. This resembles an 'immune-cold' phenotype, "
            "which is often associated with immune evasion and a lack of T-cell infiltration."
        )
    elif immune_z > 1.0:
        paragraphs.append(
            "Immune markers are elevated, suggesting an active immune response or infiltration within the tumor microenvironment."
        )
        
    return " ".join(paragraphs)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "ML Model Backend is running"}

@app.get("/health")
def health_check():
    global model
    if model is None:
         raise HTTPException(status_code=503, detail="Service unhealthy: Model not loaded.")
    return {"status": "ok", "model_loaded": True}

@app.post("/predict", response_model=PredictionResponse, response_model_exclude_none=True)
def predict(expression: GeneExpression):
    global model
    if model is None:
        if not os.path.exists("luad_tme_pipeline.pkl"):
             raise HTTPException(status_code=503, detail="Model file 'luad_tme_pipeline.pkl' not found.")
        raise HTTPException(status_code=503, detail="Model failed to load. Check server logs.")
    
    try:
        # Prepare features
        features_df = calculate_features(expression)
        
        # Predict probability
        probabilities = model.predict_proba(features_df)
        high_risk_prob = float(probabilities[0][1])
        
        # Determine Category
        if high_risk_prob < 0.33:
            category = "Low"
        elif high_risk_prob < 0.66:
            category = "Moderate"
        else:
            category = "High"
            
        # Generate Explanation (Always generate for storage)
        explanation = ""
        if hasattr(model, 'steps'):
            scaler = model.steps[0][1] # StandardScaler
            explanation = generate_explanation(features_df, scaler)
        
        # Save Report (Full detail always saved)
        analysis_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO reports (analysis_id, timestamp, risk_score, risk_category, explanation, mode, patient_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (analysis_id, timestamp, high_risk_prob, category, explanation, expression.mode, expression.patient_id))
        conn.commit()
        conn.close()
        
        # Prepare Response based on Mode
        if expression.mode == "simple":
            return {
                "analysis_id": analysis_id,
                "timestamp": timestamp,
                "patient_id": expression.patient_id,
                "risk_score": None, # Excluded by response_model_exclude_none=True
                "risk_category": category,
                "explanation": None, # Excluded
                "disclaimer": "This output is intended for research and clinical decision support only and should not be used as a standalone diagnostic or treatment decision tool."
            }
        else:
            return {
                "analysis_id": analysis_id,
                "timestamp": timestamp,
                "patient_id": expression.patient_id,
                "risk_score": high_risk_prob,
                "risk_category": category,
                "explanation": explanation,
                "disclaimer": "This output is intended for research and clinical decision support only and should not be used as a standalone diagnostic or treatment decision tool."
            }

    except Exception as e:
        # Check if database related
        if "sqlite3" in str(e):
             raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/reports", response_model=List[ReportSummary])
def get_reports():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT analysis_id, timestamp, patient_id, risk_score, risk_category FROM reports ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/reports/{analysis_id}", response_model=PredictionResponse)
def get_report_detail(analysis_id: str):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reports WHERE analysis_id = ?", (analysis_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row is None:
            raise HTTPException(status_code=404, detail="Report not found")
            
        response_dict = dict(row)
        response_dict["disclaimer"] = "This output is intended for research and clinical decision support only and should not be used as a standalone diagnostic or treatment decision tool."
        return response_dict
    except Exception as e:
         if isinstance(e, HTTPException):
             raise e
         raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
