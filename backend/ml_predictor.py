# backend/ml_predictor.py
from flask import Flask, request, jsonify
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import threading

# Load dataset
CSV_PATH = "synthetic_cat_operator_data_with_task_type.csv"  # Place your CSV here

df = pd.read_csv(CSV_PATH)

# Encode categorical features
le_weather = LabelEncoder()
le_task = LabelEncoder()
df['Weather'] = le_weather.fit_transform(df['Weather'])
df['Task Type'] = le_task.fit_transform(df['Task Type'])

# Select features and target
X = df[['Weather', 'Task Type']]
y = df['Load Cycle Time (min)']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Flask app
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    input_weather = data.get('weather')
    input_task = data.get('task_type')
    # Validate inputs
    if input_weather not in le_weather.classes_ or input_task not in le_task.classes_:
        return jsonify({'error': 'Invalid input'}), 400
    # Encode input
    weather_encoded = le_weather.transform([input_weather])[0]
    task_encoded = le_task.transform([input_task])[0]
    # Predict
    input_data = pd.DataFrame([[weather_encoded, task_encoded]], columns=['Weather', 'Task Type'])
    predicted_time = model.predict(input_data)[0]
    return jsonify({'predicted_time': float(predicted_time)})

if __name__ == '__main__':
    # Run Flask in a thread-safe way for development
    app.run(host='0.0.0.0', port=5000)
