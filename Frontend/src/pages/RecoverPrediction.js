import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import "./RecoverPrediction.css";

const BIKE_TYPE_MAPPING = {
  'BMX': 'BM',
  'Electric': 'EL',
  'Folding': 'FO',
  'Mountain': 'MT',
  'Other': 'OT',
  'Racer': 'RC',
  'Recumbant': 'RE',
  'Regular': 'RG',
  'Scooter': 'SC',
  'Tandem': 'TA',
  'Touring': 'TO',
  'Tricycle': 'TR',
  'Unicycle': 'UN',
  'Type Unknown': 'UNKNOWN'
};

const COLOR_MAPPING = {
  'Beige': 'BGE',
  'Black': 'BLK',
  'Blue': 'BLU',
  'Dark Blue': 'DBL',
  'Light Blue': 'LBL',
  'Bronze': 'BRZ',
  'Brown': 'BRN',
  'Copper': 'CPR',
  'Gold': 'GLD',
  'Green': 'GRN',
  'Light Green': 'LGR',
  'Grey': 'GRY',
  'Maroon': 'MRN',
  'Orange': 'ONG',
  'Pink': 'PNK',
  'Purple': 'PLE',
  'Red': 'RED',
  'Silver': 'SIL',
  'Tan': 'TAN',
  'Turquoise': 'TRQ',
  'White': 'WHI',
  'Yellow': 'YEL',
  '': '' // for no color
};

const RecoverPrediction = () => {
  const [formData, setFormData] = useState({
    BIKE_MAKE: "",
    BIKE_MODEL: "",
    BIKE_TYPE: "RG",
    BIKE_SPEED: 15,
    BIKE_COLOUR: "",
    BIKE_COST: 50,
    PREMISES_TYPE: "",
    LOCATION_TYPE: "",
    OCC_DATE: "",
    OCC_DOW: "",
    OCC_DOY: 1,
    OCC_HOUR: 12,
    REPORT_DATE: "",
    HOOD_140: "",
    NEIGHBOURHOOD_140: "",
  });

  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');

  const [options, setOptions] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch options when component mounts
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(API_BASE_URL + "/options");
        if (!response.ok) {
          throw new Error("Failed to fetch options");
        }
        const data = await response.json();
        setOptions(data);
      } catch (err) {
        setError("Failed to load form options: " + err.message);
      }
    };

    fetchOptions();
  }, []);

  const extractNeighbourhoodCode = (neighbourhoodName) => {
    const match = neighbourhoodName.match(/\((\d+)\)$/);
    return match ? match[1] : "";
  };

  const combineColorCodes = (primary, secondary) => {
    if (!primary) primary = '';
    if (!secondary) return COLOR_MAPPING[primary];
    return `${COLOR_MAPPING[primary]}${COLOR_MAPPING[secondary]}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_BASE_URL + "/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'primaryColor') {
      setPrimaryColor(value);
      setFormData(prev => ({
        ...prev,
        BIKE_COLOUR: combineColorCodes(value, secondaryColor)
      }));
      return;
    }

    if (name === 'secondaryColor') {
      setSecondaryColor(value);
      setFormData(prev => ({
        ...prev,
        BIKE_COLOUR: combineColorCodes(primaryColor, value)
      }));
      return;
    }

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: name === 'BIKE_TYPE' ? BIKE_TYPE_MAPPING[value] : value,
      };

      // If neighbourhood name changes, update the code
      if (name === "NEIGHBOURHOOD_140" && value) {
        newData.HOOD_140 = extractNeighbourhoodCode(value);
      }

      // If occurrence date changes, calculate DOW and DOY
      if (name === "OCC_DATE" && value) {
        const date = new Date(value);
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        newData.OCC_DOW = days[date.getDay()];

        // Calculate day of year
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        newData.OCC_DOY = Math.floor(diff / oneDay);
      }

      return newData;
    });
  };

  // Helper function to get friendly name from code
  const getBikeTypeFriendlyName = (code) => {
    return Object.keys(BIKE_TYPE_MAPPING).find(key => BIKE_TYPE_MAPPING[key] === code) || '';
  };

  return (
    <div className="recover-prediction">
      <div className="form-section">
        <h2>Bicycle Recovery Prediction</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Bike Make:</label>
            <input
              type="text"
              name="BIKE_MAKE"
              value={formData.BIKE_MAKE}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Bike Model:</label>
            <input
              type="text"
              name="BIKE_MODEL"
              value={formData.BIKE_MODEL}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Bike Type:</label>
            <select
              name="BIKE_TYPE"
              value={getBikeTypeFriendlyName(formData.BIKE_TYPE)}
              onChange={handleChange}
            >
              {Object.keys(BIKE_TYPE_MAPPING).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Bike Speed:</label>
            <input
              type="number"
              name="BIKE_SPEED"
              value={formData.BIKE_SPEED}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Bike Colour:</label>
            <div className="color-selects">
              <select
                name="primaryColor"
                value={primaryColor}
                onChange={handleChange}
              >
                <option value="">Primary Color</option>
                {Object.keys(COLOR_MAPPING).map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
              <select
                name="secondaryColor"
                value={secondaryColor}
                onChange={handleChange}
              >
                <option value="">Secondary Color (Optional)</option>
                {Object.keys(COLOR_MAPPING).map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Bike Cost ($):</label>
            <input
              type="number"
              name="BIKE_COST"
              value={formData.BIKE_COST}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Premises Type:</label>
            <select
              name="PREMISES_TYPE"
              value={formData.PREMISES_TYPE}
              onChange={handleChange}
            >
              <option value="">Select premises type</option>
              {options?.PREMISES_TYPE?.sort().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Location Type:</label>
            <select
              name="LOCATION_TYPE"
              value={formData.LOCATION_TYPE}
              onChange={handleChange}
            >
              <option value="">Select location type</option>
              {options?.LOCATION_TYPE?.sort().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Occurrence Date:</label>
            <input
              type="date"
              name="OCC_DATE"
              value={formData.OCC_DATE}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Time of Theft (24-hour format):</label>
            <input
              type="number"
              name="OCC_HOUR"
              min="0"
              max="23"
              value={formData.OCC_HOUR}
              onChange={handleChange}
              placeholder="e.g., 14 for 2:00 PM"
            />
          </div>

          <div className="form-group">
            <label>Report Date:</label>
            <input
              type="date"
              name="REPORT_DATE"
              value={formData.REPORT_DATE}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Neighbourhood Name:</label>
            <select
              name="NEIGHBOURHOOD_140"
              value={formData.NEIGHBOURHOOD_140}
              onChange={handleChange}
            >
              <option value="">Select neighbourhood</option>
              {options?.NEIGHBOURHOOD_140?.sort().map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Predicting..." : "Predict Recovery"}
          </button>
        </form>
      </div>

      <div className="result-section">
        <h2>Prediction Result</h2>
        {error && <div className="error">{error}</div>}
        {prediction && (
          <div className="prediction-result">
            <div className="status">
              <h3>Predicted Status</h3>
              <div
                className={`status-value ${prediction.status.toLowerCase()}`}
              >
                {prediction.status}
              </div>
            </div>
            <div className="probabilities">
              <div className="probability">
                <label>Probability of Recovery:</label>
                <div className="probability-value">
                  {(prediction.probability_recovered * 100).toFixed(1)}%
                </div>
              </div>
              <div className="probability">
                <label>Probability of Remaining Stolen:</label>
                <div className="probability-value">
                  {(prediction.probability_stolen * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoverPrediction;
