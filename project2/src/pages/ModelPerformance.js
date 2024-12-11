import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import "./ModelPerformance.css";

const ModelPerformance = () => {
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModelMetrics = async () => {
      try {
        const response = await api.getModelMetrics();
        setModelMetrics(response);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchModelMetrics();
  }, []);

  if (loading) {
    return (
      <div className="model-performance loading-container">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="model-performance error-container">
        <h2>Error loading model metrics</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="model-performance">
      <div className="model-header">
        <h1>Model Performance Dashboard</h1>
        <p className="subtitle">Real-time metrics and evaluation insights</p>
        <div className="divider"></div>
      </div>

      <div className="metrics-grid">
        {/* Accuracy Card */}
        <div className="metric-card">
          <div className="metric-icon">
            <span className="material-icons">check_circle</span>
          </div>
          <div className="metric-content">
            <h3>Model Accuracy</h3>
            <div className="metric-value">
              {(modelMetrics?.accuracy * 100).toFixed(2)}%
            </div>
            <p className="metric-description">Overall prediction accuracy</p>
          </div>
        </div>

        {/* Precision Card */}
        <div className="metric-card">
          <div className="metric-icon">
            <span className="material-icons">precision_manufacturing</span>
          </div>
          <div className="metric-content">
            <h3>Precision</h3>
            <div className="metric-value">
              {(modelMetrics?.precision * 100).toFixed(2)}%
            </div>
            <p className="metric-description">
              Accuracy of positive predictions
            </p>
          </div>
        </div>

        {/* Recall Card */}
        <div className="metric-card">
          <div className="metric-icon">
            <span className="material-icons">replay</span>
          </div>
          <div className="metric-content">
            <h3>Recall</h3>
            <div className="metric-value">
              {(modelMetrics?.recall * 100).toFixed(2)}%
            </div>
            <p className="metric-description">Recovery rate detection</p>
          </div>
        </div>

        {/* F1 Score Card */}
        <div className="metric-card">
          <div className="metric-icon">
            <span className="material-icons">analytics</span>
          </div>
          <div className="metric-content">
            <h3>F1 Score</h3>
            <div className="metric-value">
              {(modelMetrics?.f1_score * 100).toFixed(2)}%
            </div>
            <p className="metric-description">
              Balance of precision and recall
            </p>
          </div>
        </div>
      </div>

      <div className="detailed-metrics">
        <div className="confusion-matrix">
          <h2>Confusion Matrix</h2>
          <div className="matrix-grid">
            <div className="matrix-cell header">Predicted ↓ / Actual →</div>
            <div className="matrix-cell header">Not Recovered</div>
            <div className="matrix-cell header">Recovered</div>
            <div className="matrix-cell label">Not Recovered</div>
            <div className="matrix-cell">
              {modelMetrics?.confusion_matrix[0][0]}
            </div>
            <div className="matrix-cell">
              {modelMetrics?.confusion_matrix[0][1]}
            </div>
            <div className="matrix-cell label">Recovered</div>
            <div className="matrix-cell">
              {modelMetrics?.confusion_matrix[1][0]}
            </div>
            <div className="matrix-cell">
              {modelMetrics?.confusion_matrix[1][1]}
            </div>
          </div>
        </div>

        <div className="additional-metrics">
          <h2>Additional Metrics</h2>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-label">ROC AUC Score:</span>
              <span className="metric-value">
                {(modelMetrics?.roc_auc * 100).toFixed(2)}%
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Training Time:</span>
              <span className="metric-value">
                {modelMetrics?.training_time.toFixed(2)}s
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Model Version:</span>
              <span className="metric-value">
                {modelMetrics?.model_version}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance;
