import matplotlib
matplotlib.use('Agg')  # Set the backend to Agg before importing pyplot
import matplotlib.pyplot as plt
import pandas as pd
import joblib
import os
import sys
import json
import io
import base64
import numpy as np
from pathlib import Path
from flask import Flask, jsonify, request, send_file
from flask_restx import Api, Resource, fields
from flask_cors import CORS


# Add src directory to Python path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src'))
from data_preprocessing import preprocess_features
from rtree_search import RTree

app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],  # Your React app's URL
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

api = Api(app, version='1.0', title='Bicycle Theft Prediction API',
          description='An API for predicting bicycle theft outcomes',
          doc='/docs')
# Initialize R-tree search
rtree = RTree()
#declare processed data for global use
#read 2 store data
try:
    processed_data = pd.read_csv('../data/processed_features.csv')
except Exception as e:
    processed_data = None
    print(f"Failed to load data: {e}")



# Define the models for request/response
prediction_input = api.model('PredictionInput', {
    'BIKE_MAKE': fields.String(required=False, description='Make of the bicycle', example='TREK'),
    'BIKE_MODEL': fields.String(required=False, description='Model of the bicycle', example='FX3'),
    'BIKE_TYPE': fields.String(required=True, description='Type of bicycle (REGULAR, MOUNTAIN, or RACING)', example='REGULAR'),
    'BIKE_SPEED': fields.Integer(required=False, description='Number of speeds', example=21),
    'BIKE_COLOUR': fields.String(required=False, description='Color of the bicycle (e.g., BLK, WHI, BLU)', example='BLK'),
    'BIKE_COST': fields.Float(required=False, description='Cost of the bicycle', example=800.0),
    'PREMISES_TYPE': fields.String(required=True, description='Type of premises (e.g., House, Commercial, Apartment)', example='House'),
    'LOCATION_TYPE': fields.String(required=True, description='Detailed location type (e.g., Single Home, Apartment, Commercial)', example='Apartment (Rooming House, Condo)'),
    'OCC_DATE': fields.String(required=True, description='Date of occurrence (YYYY-MM-DD)', example='2023-01-01'),
    'OCC_DOW': fields.String(required=True, description='Day of week', example='Sunday'),
    'OCC_HOUR': fields.Integer(required=True, description='Hour of occurrence (0-23)', example=14),
    'OCC_DOY': fields.Integer(required=True, description='Day of year (1-366)', example=1),
    'REPORT_DATE': fields.String(required=True, description='Date reported (YYYY-MM-DD)', example='2023-01-02'),
    'HOOD_140': fields.String(required=True, description='Neighborhood code (e.g., 080)', example='080'),
    'NEIGHBOURHOOD_140': fields.String(required=True, description='Full neighborhood name with code', example='Palmerston-Little Italy (80)')
})

prediction_output = api.model('PredictionOutput', {
    'status': fields.String(description='Predicted status (RECOVERED or STOLEN)'),
    'probability_recovered': fields.Float(description='Probability of recovery'),
    'probability_stolen': fields.Float(description='Probability of remaining stolen')
})

neighbourhood_input = api.model('NeighbourhoodInput', {
    'latitude': fields.Float(required=True, description='Latitude of the location', example=43.693449),
    'longitude': fields.Float(required=True, description='Longitude of the location', example=-79.433288)
})

neighbourhood_output = api.model('NeighbourhoodOutput', {
    'HOOD_140': fields.String(description='Neighborhood code'),
    'NEIGHBOURHOOD_140': fields.String(description='Neighborhood name')
})

error_output = api.model('ErrorOutput', {
    'error': fields.String(description='Error message')
})

# Load unique values
unique_values_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'unique_values.json')
with open(unique_values_path, 'r') as f:
    unique_values = json.load(f)

# Load model and feature order
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(base_dir, 'models', 'best_model.pkl')
feature_order_path = os.path.join(base_dir, 'models', 'feature_order.pkl')

# Ensure models directory exists
models_dir = os.path.dirname(model_path)
if not os.path.exists(models_dir):
    os.makedirs(models_dir)

# Load model and feature order if they exist
if os.path.exists(model_path) and os.path.exists(feature_order_path):
    model = joblib.load(model_path)
    feature_order = joblib.load(feature_order_path)
else:
    print("Warning: Model files not found. Please train the model first.")
    model = None
    feature_order = None

# Define namespaces
ns = api.namespace('', description='Prediction operations')

@ns.route('/health')
class Health(Resource):
    @api.doc(responses={200: 'API is healthy'})
    def get(self):
        """Check API health status"""
        return {'status': 'healthy'}


@ns.route('/predict')
class PredictTheft(Resource):
    @api.expect(prediction_input)
    @api.response(200, 'Success', prediction_output)
    @api.response(400, 'Validation Error', error_output)
    @api.response(503, 'Model Not Available', error_output)
    def post(self):
        """Predict bicycle theft outcome

        Returns the probability of a bicycle being recovered or remaining stolen based on the input features.
        """
        if model is None or feature_order is None:
            return {'error': "Model not loaded. Please train the model first."}, 503

        try:
            data = api.payload
            df = pd.DataFrame([data])
            X = preprocess_features(df)
            X = X[feature_order]

            prediction = model.predict(X)[0]
            probability = model.predict_proba(X)[0]

            status = 'RECOVERED' if prediction == 1 else 'STOLEN'
            prob_recovered = float(probability[1])

            return {
                'status': status,
                'probability_recovered': round(prob_recovered, 2),
                'probability_stolen': round(float(probability[0]), 2)
            }
        except Exception as e:
            return {'error': str(e)}, 400

@ns.route('/neighbourhood')
class Neighbourhood(Resource):
    @api.expect(neighbourhood_input)
    @api.response(200, 'Success', neighbourhood_output)
    @api.response(400, 'Validation Error', error_output)
    def post(self):
        """Get the neighborhood code and name for a given latitude and longitude"""
        try:
            lat = api.payload['latitude']
            lon = api.payload['longitude']

            # Call the R-tree search function here
            h140, n140 = rtree.search(lat, lon)

            return {
                'HOOD_140': h140,
                'NEIGHBOURHOOD_140': n140
            }
        except Exception as e:
            return {'error': str(e)}, 400

@ns.route('/options')
class Options(Resource):
    @api.doc(responses={200: 'Success', 500: 'Internal Server Error'})
    def get(self):
        """Get all available options for each field in the prediction input"""
        try:
            return unique_values
        except Exception as e:
            return {'error': str(e)}, 500

@app.route('/test', methods=['GET'])
def test_endpoint():
    return jsonify({
        "status": "success",
        "message": "Backend is connected successfully!"
    })

@app.route('/api/thefts-over-time', methods=['GET'])
def thefts_over_time():
    try:
        # Load  data
        df = processed_data
        df = df[df['OCC_YEAR'] >= 2014]
        
        # Calculate metrics
        theft_counts = df['OCC_YEAR'].value_counts().sort_index()
        
        # Calculate total thefts
        total_thefts = len(df)
        
        # Calculate growth rate from 2014 to latest year
        latest_year = theft_counts.index[-1]
        latest_year_thefts = theft_counts[latest_year]
        first_year_thefts = theft_counts[2014]  # Base year 2014
        growth_rate = ((latest_year_thefts - first_year_thefts) / first_year_thefts) * 100
        
        # Create the plot with improved styling
    #    plt.style.use('seaborn-v0_8-dark')
     #   plt.figure(figsize=(12, 6))
      #  plt.xticks(fontsize=18)
    #    plt.yticks(fontsize=18)
        
        # Create the plot
    #    ax = theft_counts.plot(kind='bar', color='#3498db')
        
        # Customize the plot
    #    plt.title('Number of Bicycle Thefts by Year', fontsize=38, pad=20)
    #    plt.xlabel('Year', fontsize=32)
    #    plt.ylabel('Number of Thefts', fontsize=32)
        
        # Add value labels on top of each bar
    #    for i, v in enumerate(theft_counts):
    #        ax.text(i, v, str(v), ha='center', va='bottom')
        
        # Adjust layout to prevent label cutoff
     #   plt.tight_layout()
        
        # Save plot to bytes buffer
    #    buffer = io.BytesIO()
     #   plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    #    buffer.seek(0)
    #    plt.close()
        
        # Encode the image
     #   image_base64 = base64.b64encode(buffer.getvalue()).decode()

        df = df.to_json()
        return jsonify({
            # 'image': image_base64,
            'metrics': {
                'total_thefts': total_thefts,
                'growth_rate': round(growth_rate, 1),
                'latest_year': int(latest_year)
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/return-rate', methods=['GET'])
def return_rate():
    try:
        #The Proccessed data file removed status column showing if bikes were recovered.
        #so og one for now,
        df = pd.read_csv('../data/Bicycle_Thefts_Data.csv')
        df = df[df['OCC_YEAR'] >= 2014]

        # Calculate metrics
        total_bikes = len(df)
        recovered_bikes = len(df[df['STATUS'] == 'RECOVERED'])
        return_rate = (recovered_bikes / total_bikes) * 100 if total_bikes > 0 else 0
        
        # Calculate return rate by year
        yearly_stats = df.groupby('OCC_YEAR').agg({
            'STATUS': lambda x: (x == 'RECOVERED').mean() * 100 if len(x) > 0 else 0
        }).round(1)

        # Create the plot
    #    plt.style.use('seaborn-v0_8-dark')
    #    plt.figure(figsize=(12, 6))
    #    plt.xticks(fontsize=18)
    #    plt.yticks(fontsize=18)
        
        # Create the plot
     #   ax = yearly_stats.plot(kind='bar', color='#2ecc71', legend=False)
        
        # Customize the plot
    #    plt.title('Bicycle Return Rate by Year', fontsize=36, pad=20)
    #    plt.xlabel('Year', fontsize=24)
     #   plt.ylabel('Return Rate (%)', fontsize=24)
        
        # Add value labels on top of each bar
    #    for i, v in enumerate(yearly_stats['STATUS']):
    #        ax.text(i, v, f'{v:.1f}%', ha='center', va='bottom')
        
    #    plt.tight_layout()
        
        # Save plot to bytes buffer
    #    buffer = io.BytesIO()
    #    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    #    buffer.seek(0)
    #    plt.close()
        
        # Encode the image
      #  image_base64 = base64.b64encode(buffer.getvalue()).decode()

        return jsonify({
            # 'image': image_base64,
            'metrics': {
                'total_bikes': int(total_bikes),
                'total_recovered': int(recovered_bikes),
                'return_rate': round(return_rate, 1),
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/seasonal-analysis', methods=['GET'])
def seasonal_analysis():
    try:
        # Load data
        df = processed_data
        df = df[df['OCC_YEAR'] >= 2014]

        #map seasons to show names, on the graph  instead of, 0,1,2,3
        season_mapping = {0: 'Fall', 1: 'Spring', 2: 'Summer', 3: 'Winter'}
        df['SEASON'] = df['SEASON'].map(season_mapping)

        # Calculate seasonal statistics
        seasonal_stats = df['SEASON'].value_counts()
        total_thefts = len(df)
        seasonal_percentages = (seasonal_stats / total_thefts * 100).round(1)
        
        # Find the season with highest thefts
        peak_season = seasonal_stats.index[0]
        peak_season_percentage = seasonal_percentages[peak_season]
        
        # Create the plot
        plt.style.use('seaborn-v0_8-dark')
        plt.figure(figsize=(12, 6))
        
        # Create bar plot
    #    colors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f']
    #    ax = seasonal_stats.plot(kind='bar', color=colors)
        
        # Set y-axis limit to 20,000
   #     plt.ylim(0, 20000)
        
        # Customize the plot
     #   plt.title('Bicycle Thefts by Season', fontsize=36, pad=20)
     #   plt.xlabel('Season', fontsize=24)
     #   plt.ylabel('Number of Thefts', fontsize=24)
     #   plt.xticks(fontsize=18)
     #   plt.yticks(fontsize=18)
        
        # Add value labels on top of each bar
     #   for i, v in enumerate(seasonal_stats):
     #       percentage = seasonal_percentages[seasonal_stats.index[i]]
     #       ax.text(i, v, f'{v}\n({percentage}%)', 
     #              ha='center', va='bottom', fontsize=12)
        
      #  plt.tight_layout()
        
        # Save plot to bytes buffer
   #     buffer = io.BytesIO()
   #     plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
   #     buffer.seek(0)
   #     plt.close()
        
        # Encode the image
    #    image_base64 = base64.b64encode(buffer.getvalue()).decode()

        df = df.to_json()
        return jsonify({
            # 'image': image_base64,
            'metrics': {
                'peak_season': str(peak_season),
                'peak_percentage': float(peak_season_percentage),
                'seasonal_distribution': {
                    season: float(percentage) 
                    for season, percentage in seasonal_percentages.items()
                }
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
##notfinished
@app.route('/api/time-analysis', methods=['GET'])
def time_analysis():
    try:
        # Load  data
        df = processed_data
        df = df[df['OCC_YEAR'] >= 2014]
        
        # Group hours into periods
        time_periods = {
            'Morning (6AM-12PM)': (6, 12),
            'Afternoon (12PM-6PM)': (12, 18),
            'Evening (6PM-12AM)': (18, 24),
            'Night (12AM-6AM)': (0, 6)
        }
        
        # Create time period column
        def get_time_period(hour):
            for period, (start, end) in time_periods.items():
                if start <= hour < end:
                    return period
            return 'Night (12AM-6AM)'
        
        df['TimePeriod'] = df['OCC_HOUR'].apply(get_time_period)
        
        # Calculate statistics
        time_stats = df['TimePeriod'].value_counts()
        total_thefts = len(df)
        time_percentages = (time_stats / total_thefts * 100).round(1)
        
        # Find peak time period
        peak_period = time_stats.index[0]
        peak_percentage = time_percentages[peak_period]
        
        # Create the plot
   #     plt.style.use('seaborn-v0_8-dark')
    #    plt.figure(figsize=(12, 6))
        
        # Create bar plot with custom colors
      #  colors = ['#f39c12', '#e74c3c', '#9b59b6', '#2c3e50']
     #   ax = time_stats.plot(kind='bar', color=colors, legend=False)
        
        # Customize the plot
     #   plt.title('Bicycle Thefts by Time of Day', fontsize=36, pad=20)
     #   plt.xlabel('Time Period', fontsize=24)
     #   plt.ylabel('Number of Thefts', fontsize=24)
     #   plt.xticks(fontsize=18, rotation=45)
     #   plt.yticks(fontsize=18)
        
        # Add value labels on top of each bar
     #   for i, v in enumerate(time_stats):
     #       percentage = time_percentages[time_stats.index[i]]
      #      ax.text(i, v, f'{v}\n({percentage}%)', 
      #             ha='center', va='bottom', fontsize=12)
        
        plt.tight_layout()
        
        # Save plot to bytes buffer
     #   buffer = io.BytesIO()
    #    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
     #   buffer.seek(0)
     #   plt.close()
        
        # Encode the image
    #    image_base64 = base64.b64encode(buffer.getvalue()).decode()
        df = df.to_json()
        return jsonify({
            # 'image': image_base64,
            'metrics': {
                'peak_period': peak_period,
                'peak_percentage': float(peak_percentage),
                'safest_period': time_stats.index[-1],
                'safest_percentage': float(time_percentages[time_stats.index[-1]])
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
##notfinished
@app.route('/api/value-analysis', methods=['GET'])
def value_analysis():
    try:
        # Load  data
        df = processed_data
        df = df[df['OCC_YEAR'] >= 2014]
        
        # Remove any null values and outliers
        df = df[df['BIKE_COST'].notna()]
        df = df[df['BIKE_COST'] > 0]
        
        # Create cost ranges
        bins = [0, 500, 1000, 2000, float('inf')]
        labels = ['$0-500', '$501-1000', '$1001-2000', '$2000+']
        df['Cost_Range'] = pd.cut(df['BIKE_COST'], bins=bins, labels=labels)
        
        # Calculate statistics
        value_stats = df['Cost_Range'].value_counts()
        total_bikes = len(df)
        value_percentages = (value_stats / total_bikes * 100).round(1)
        
        # Calculate average cost and most common range
        avg_cost = df['BIKE_COST'].mean()
        most_common_range = value_stats.index[0]
        most_common_percentage = value_percentages[most_common_range]
        
        # Create the plot
  #      plt.style.use('seaborn-v0_8-dark')
  #      plt.figure(figsize=(12, 6))
        
        # Create bar plot with custom colors
   #     colors = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f']
   #     ax = value_stats.plot(kind='bar', color=colors, legend=False)
        
        # Customize the plot
    #    plt.title('Bicycle Thefts by Value Range', fontsize=36, pad=20)
   #     plt.xlabel('Value Range', fontsize=24)
    #    plt.ylabel('Number of Thefts', fontsize=24)
   #     plt.xticks(fontsize=18, rotation=45)
   #     plt.yticks(fontsize=18)
        
        # Add value labels on top of each bar
    #    for i, v in enumerate(value_stats):
    #        percentage = value_percentages[value_stats.index[i]]
    #        ax.text(i, v, f'{v}\n({percentage}%)', 
    #               ha='center', va='bottom', fontsize=12)
        
    #    plt.tight_layout()
        
        # Save plot to bytes buffer
    #    buffer = io.BytesIO()
    #    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    #    buffer.seek(0)
    #    plt.close()
        
        # Encode the image
        #image_base64 = base64.b64encode(buffer.getvalue()).decode()
        df = df.to_json()
        return jsonify({
            # 'image': image_base64,
            'metrics': {
                'average_cost': round(avg_cost, 2),
                'most_common_range': most_common_range,
                'most_common_percentage': float(most_common_percentage)
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/api/model-metrics", methods=["GET"])
def model_metrics():
    model_name = "random_forest"
    try:
        metrics_path = "../models/" + model_name + "_metrics.json"
        if not os.path.exists(metrics_path):
            return jsonify({"error": "Model metrics not found"}), 404

        with open(metrics_path, "r") as f:
            metrics = json.load(f)

        return jsonify(metrics)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)