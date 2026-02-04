from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

# 1. Load the trained artifacts
print("Loading AI Model...")
model = joblib.load('credibility_model.pkl')
scaler = joblib.load('scaler.pkl')

# Define the features exactly as they were in your training script
EXPECTED_FEATURES = [
    'durationMinutes',
    'interactionCount',
    'completionPercentage',
    'rating',
    'rating_deviation',
    'interaction_density',
    'comment_length',
    'teacherCredibleRatio',
    'studentConsistency'
]

@app.route('/predict-bonus', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # 2. Extract Raw Data
        # We assume TypeScript sends raw session data, so we must 
        # calculate the derived features (Feature Engineering) here.
        
        duration = data.get('durationMinutes', 0)
        interactions = data.get('interactionCount', 0)
        rating = data.get('rating', 0)
        teacher_avg = data.get('teacherRatingAvg', 0)
        
        # --- Perform Feature Engineering (The "Math") ---
        rating_deviation = abs(rating - teacher_avg)
        interaction_density = interactions / (duration if duration > 0 else 1)
        rushed_completion = data.get('completionPercentage', 0) / (duration if duration > 0 else 1)
        comment_length = len(data.get('comment', ""))
        
        # 3. Create DataFrame for the Model
        # MUST match the order and names of your training columns exactly
        input_data = {
            'durationMinutes': duration,
            'interactionCount': interactions,
            'completionPercentage': data.get('completionPercentage', 0),
            'rating': rating,
            'rating_deviation': rating_deviation,
            'interaction_density': interaction_density,
            'comment_length': comment_length,
            'teacherCredibleRatio': data.get('teacherCredibleRatio', 0.9), # Default fallback
            'studentConsistency': data.get('studentConsistency', 0.5)      # Default fallback
        }
        
        df = pd.DataFrame([input_data])
        
        # 4. Scale & Predict
        scaled_data = scaler.transform(df[EXPECTED_FEATURES])
        credibility_prob = model.predict_proba(scaled_data)[0][1] # Probability of "True"
        
        # 5. Calculate Bonus Logic
        bonus_percent = 0.0
        status = "Standard Pay"
        
        if credibility_prob > 0.85 and rating >= 4:
            bonus_percent = 0.10
            status = "QUALITY BONUS"
            if credibility_prob > 0.95 and rating == 5:
                bonus_percent = 0.15
                status = "PLATINUM BONUS"

        return jsonify({
            "credibility_score": float(credibility_prob),
            "bonus_percentage": float(bonus_percent),
            "status": status
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Runs on http://localhost:5000
    app.run(port=5001, debug=True)