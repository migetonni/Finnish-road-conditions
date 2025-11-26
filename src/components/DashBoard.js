import { useState } from "react";
import { Link } from "react-router-dom";


function Dashboard() {
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedRoad, setSearchedRoad] = useState("");
  const [forecastFilter, setForecastFilter] = useState("0h"); // default: current weather

  const searchRoad = async () => {
    if (!searchInput.trim()) return;

    setLoading(true);
    setSearchedRoad(searchInput);
    setResults([]);

    try {
      const res = await fetch("http://localhost:5000/get_traffic");
      const data = await res.json();

      // Map and filter road data
      const filtered = data
        .map((item) => {
          const roadNumber = item.road_number ?? item.section_id.split("_")[0];
          return { ...item, road_number: Number(roadNumber) };
        })
        .filter(
          (item) =>
            String(item.road_number).startsWith(searchInput) &&
            item.forecast_name === forecastFilter // filter by forecast
        );

      setResults(filtered);
    } catch (err) {
      console.error("Error fetching road data:", err);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchRoad();
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Road Condition Search</h1>
      

      {/* Search Input + Button */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter road number (e.g. 130)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "220px",
            padding: "10px",
            fontSize: "16px",
          }}
        />
        <button
          onClick={searchRoad}
          style={{
            padding: "10px 15px",
            fontSize: "16px",
            cursor: "pointer",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          Search
        </button>
      </div>

      {/* Forecast Filter Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setForecastFilter("0h")}
          style={{
            padding: "5px 12px",
            marginRight: "8px",
            cursor: "pointer",
            background: forecastFilter === "0h" ? "#007bff" : "#ddd",
            color: forecastFilter === "0h" ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
          }}
        >
          Current Weather
        </button>
        <button
          onClick={() => setForecastFilter("2h")}
          style={{
            padding: "5px 12px",
            cursor: "pointer",
            background: forecastFilter === "2h" ? "#007bff" : "#ddd",
            color: forecastFilter === "2h" ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
          }}
        >
          2h Forecast
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && <p style={{ marginTop: "20px" }}>Searching...</p>}

      {/* No Search Yet */}
      {!loading && results.length === 0 && searchedRoad === "" && (
        <p style={{ marginTop: "20px", color: "#666" }}>Enter a road number.</p>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && searchedRoad !== "" && (
        <p style={{ marginTop: "20px" }}>
          No results found for road {searchedRoad}.
        </p>
      )}

      {/* Results */}
      {!loading &&
        results.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginTop: "10px",
              borderRadius: "6px",
            }}
          >
            <strong>Road {item.road_number}</strong> <br />
            <strong>Forecast:</strong> {item.forecast_name ?? "N/A"} <br />
            <strong>Air Temperature:</strong> {item.air_temperature ?? "N/A"}°C{" "}
            <br />
            <strong>Road Temperature:</strong> {item.road_temperature ?? "N/A"}
            °C <br />
            <strong>Road Type:</strong> {item.road_type ?? "N/A"}
          </div>
        ))}
    </div>
  );
}

export default Dashboard;
