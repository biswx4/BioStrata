import joblib
import pandas as pd
import numpy as np

try:
    print("Loading model...")
    pipeline = joblib.load("luad_tme_pipeline.pkl")
    
    # Access the scaler (assuming it's the first step)
    if hasattr(pipeline, "steps"):
        scaler_step = pipeline.steps[0][1]
        print(f"Scaler type: {type(scaler_step).__name__}")
        
        if hasattr(scaler_step, "mean_") and hasattr(scaler_step, "scale_"):
            print("Scaler has mean and scale statistics.")
            print(f"Mean shape: {scaler_step.mean_.shape}")
            
            # Map features to means if possible
            if hasattr(pipeline, "feature_names_in_"):
                features = pipeline.feature_names_in_
                print("\nFeature Means:")
                for f, m, s in zip(features, scaler_step.mean_, scaler_step.scale_):
                    print(f"{f}: mean={m:.2f}, std={s:.2f}")
            else:
                print("Pipeline doesn't have feature_names_in_, cannot map means to names easily.")
        else:
            print("Scaler does not have mean/scale attributes (maybe not fitted?).")
            
except Exception as e:
    print(f"Error: {e}")
