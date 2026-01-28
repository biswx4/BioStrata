import pickle
import sys

try:
    with open('luad_tme_pipeline.pkl', 'rb') as f:
        pipeline = pickle.load(f)
    
    print(f"Type: {type(pipeline)}")
    print(f"Steps: {pipeline.named_steps.keys() if hasattr(pipeline, 'named_steps') else 'N/A'}")
    
    # Try to find input features
    if hasattr(pipeline, 'feature_names_in_'):
        print(f"Feature names: {pipeline.feature_names_in_}")
    elif hasattr(pipeline, 'n_features_in_'):
        print(f"Number of features: {pipeline.n_features_in_}")
        
    # Check the first step (scaler)
    if hasattr(pipeline, 'steps'):
        first_step = pipeline.steps[0][1]
        print(f"First step: {first_step}")
        if hasattr(first_step, 'n_features_in_'):
            print(f"First step n_features: {first_step.n_features_in_}")
            
except Exception as e:
    print(f"Error loading model: {e}")
