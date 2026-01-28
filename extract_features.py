import joblib
import pandas as pd
import numpy as np

try:
    print("Loading model...")
    pipeline = joblib.load("luad_tme_pipeline.pkl")
    print("Model loaded successfully.")
    
    features = None
    
    # Try getting features from the pipeline object
    if hasattr(pipeline, "feature_names_in_"):
        features = pipeline.feature_names_in_
        print(f"\nFound {len(features)} features in pipeline.feature_names_in_:")
    
    # Try getting features from the first step (StandardScaler)
    elif hasattr(pipeline, "steps"):
        print("\nChecking pipeline steps...")
        for name, step in pipeline.steps:
            print(f"- Step: {name} ({type(step).__name__})")
            if hasattr(step, "feature_names_in_"):
                features = step.feature_names_in_
                print(f"  Found {len(features)} features in step '{name}'")
                break
                
    if features is not None:
        print("\nFeature List:")
        for i, f in enumerate(features):
            print(f"{i+1}. {f}")
            
    else:
        print("\nCould not find 'feature_names_in_' attribute.")

except Exception as e:
    print(f"\nError: {e}")
