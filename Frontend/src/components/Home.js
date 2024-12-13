import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import "./Home.css";

const Home = () => {
  const [graphData, setGraphData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [returnData, setReturnData] = useState(null);
  const [returnMetrics, setReturnMetrics] = useState(null);
  const [seasonalData, setSeasonalData] = useState(null);
  const [seasonalMetrics, setSeasonalMetrics] = useState(null);
  const [timeData, setTimeData] = useState(null);
  const [timeMetrics, setTimeMetrics] = useState(null);
  const [valueData, setValueData] = useState(null);
  const [valueMetrics, setValueMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          theftData,
          returnRateData,
          seasonalAnalysisData,
          timeAnalysisData,
          valueAnalysisData,
        ] = await Promise.all([
          api.getTheftsOverTime(),
          api.getReturnRate(),
          api.getSeasonalAnalysis(),
          api.getTimeAnalysis(),
          api.getValueAnalysis(),
        ]);
        //Gets super buggy after 3+ graphs load.
        //Gets super buggy after 3+ graphs load.
        //setGraphData(theftData.image);
        setMetrics(theftData.metrics);
        //setReturnData(returnRateData.image);
        setReturnMetrics(returnRateData.metrics);
        //setSeasonalData(seasonalAnalysisData.image);
        setSeasonalMetrics(seasonalAnalysisData.metrics);
        //setTimeData(timeAnalysisData.image);
        setTimeMetrics(timeAnalysisData.metrics);
        // setValueData(valueAnalysisData.image);
        setValueMetrics(valueAnalysisData.metrics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home">
      <div className="home-header">
        <h1>Data Insights</h1>
        <p className="subtitle">Visualizing and Analyzing Data Trends</p>
        <div className="divider"></div>
      </div>

      <div className="dashboard-container">
        {/* Card 1 | Overall Bicycle Thefts From 2014-2018 */}
        <div className="first-card">
          <div className="card-header">
            <h3 className="card-title">
              Overall Bicycle Thefts From 2014-2018
            </h3>
            <p className="card-subtitle">
              Tracking thefts and growth metrics over time
            </p>
          </div>
          {/* GRAPH */}
          <div className="dashboard-card">
            <div className="graph-section">
              <img
                src="/images/thefts_by_year.png"
                alt="Bicycle Thefts Over Time"
                className="graph-image"
              />
            </div>

            <div className="description-section">
              <h2>Theft Analysis</h2>
              {/* DESCRIPTION */}
              <p className="description-text">
                Analysis of theft trends from 2014 to 2018, identifying patterns
                and growth metrics over time.
                <br></br>
                <br></br>By analyzing data over time, we can identify the
                factors contributing to increasing theft rates.
              </p>

              <div className="key-metrics">
                <div className="metric">
                  <span className="metric-value">
                    {metrics ? `${metrics.growth_rate}%` : "..."}
                  </span>
                  <span className="metric-label">
                    Growth from 2014 to {metrics ? metrics.latest_year : "..."}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-value">
                    {metrics
                      ? `${(metrics.total_thefts / 1000).toFixed(1)}K`
                      : "..."}
                  </span>
                  <span className="metric-label">Total Thefts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 | Bike Return Rate */}
        <div className="card-section">
          <div className="card-header" style={{ marginTop: "60px" }}>
            <h3 className="card-title">Bike Return Rate</h3>
            <p className="card-subtitle">
              The percentage of bikes returned to the owner after theft
            </p>
          </div>
          <div className="dashboard-card reversed">
            <div className="description-section">
              <h2>Return Analytics</h2>
              <p className="description-text">
                Analysis of bicycle recovery rates over time, showing the
                percentage of stolen bikes that were successfully returned to
                their owners.
              </p>
              <div className="key-metrics">
                <div className="metric">
                  <span className="metric-value">
                    {returnMetrics ? `${returnMetrics.return_rate}%` : "..."}
                  </span>
                  <span className="metric-label">Return Rate</span>
                </div>
                <div className="metric">
                  <span className="metric-value">
                    {returnMetrics
                      ? `${(returnMetrics.total_recovered / 1000).toFixed(1)}K`
                      : "..."}
                  </span>
                  <span className="metric-label">Total Bikes Returned</span>
                </div>
              </div>
            </div>
            <div className="graph-section">
              <img
                src="/images/bicycleyear.png"
                alt="Bicycle Thefts Over Time"
                className="graph-image"
              />
            </div>
          </div>
        </div>

        {/* Card 3 | Seasons and Bike Thefts */}
        <div className="card-section">
          <div className="card-header" style={{ marginTop: "60px" }}>
            <h3 className="card-title">Seasons and Bike Thefts</h3>
            <p className="card-subtitle">
              Corelation between seasons and thefts
            </p>
          </div>
          <div className="dashboard-card">
            <div className="graph-section">
              <img
                src="/images/thefts_by_season.png"
                alt="Bicycle Thefts Over Time"
                className="graph-image"
              />
            </div>

            <div className="description-section">
              <h2>Seasonal Patterns</h2>
              <p className="description-text">
                Analysis of bicycle theft patterns across different seasons,
                highlighting peak theft periods and seasonal variations.
              </p>
              <div className="key-metrics">
                <div className="metric">
                  <span className="metric-value">
                    {seasonalMetrics
                      ? `${seasonalMetrics.peak_percentage}%`
                      : "..."}
                  </span>

                  <span className="metric-label">
                    Peak Season (
                    {seasonalMetrics ? seasonalMetrics.peak_season : "..."})
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-value">
                    {seasonalMetrics
                      ? `${seasonalMetrics.seasonal_distribution.Winter}%`
                      : "..."}
                  </span>
                  <span className="metric-label">Winter Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4 | Time of Day Analysis */}
        <div className="card-section">
          <div className="card-header" style={{ marginTop: "60px" }}>
            <h3 className="card-title">Time of Day Analysis</h3>
            <p className="card-subtitle">
              Analysis of theft frequency across different times of day
            </p>
          </div>
          <div className="dashboard-card reversed">
            <div className="description-section">
              <h2>Time of Day Analysis</h2>
              <p className="description-text">
                Analysis of bicycle theft patterns throughout different times of
                day, identifying high-risk and safer periods for bicycle
                parking.
              </p>
              <div className="key-metrics">
                <div className="metric">
                  <span className="metric-value">
                    {timeMetrics ? `${timeMetrics.peak_percentage}%` : "..."}
                  </span>
                  <span className="metric-label">
                    Peak Time ({timeMetrics ? timeMetrics.peak_period : "..."})
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-value">
                    {timeMetrics ? `${timeMetrics.safest_percentage}%` : "..."}
                  </span>
                  <span className="metric-label">
                    Safest Time (
                    {timeMetrics ? timeMetrics.safest_period : "..."})
                  </span>
                </div>
              </div>
            </div>
            <div className="graph-section">
              <img
                src="/images/thefts_by_time.png"
                alt="Bicycle Thefts Over Time"
                className="graph-image"
              />
            </div>
          </div>
        </div>

        {/* Card 5 | Bike Value Analysis */}
        <div className="card-section">
          <div className="card-header" style={{ marginTop: "60px" }}>
            <h3 className="card-title">Bike Value Analysis</h3>
            <p className="card-subtitle">
              Distribution of stolen bikes by estimated value
            </p>
          </div>
          <div className="dashboard-card">
            <div className="graph-section">
              <img
                src="/images/thefts_by_value.png"
                alt="Bicycle Thefts Over Time"
                className="graph-image"
              />
            </div>
            <div className="description-section">
              <h2>Value Distribution</h2>
              <p className="description-text">
                Analysis of stolen bicycle values, showing the distribution
                across different price ranges and identifying common theft
                targets.
              </p>
              <div className="key-metrics">
                <div className="metric">
                  <span className="metric-value">
                    $
                    {valueMetrics
                      ? valueMetrics.average_cost.toLocaleString()
                      : "..."}
                  </span>
                  <span className="metric-label">Average Value</span>
                </div>
                <div className="metric">
                  <span className="metric-value">
                    {valueMetrics
                      ? `${valueMetrics.most_common_percentage}%`
                      : "..."}
                  </span>
                  <span className="metric-label">
                    Most Common (
                    {valueMetrics ? valueMetrics.most_common_range : "..."})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
