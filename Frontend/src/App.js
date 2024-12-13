import React from "react";
import "./App.css";
import Header from "./components/Header";
import Home from "./components/Home";
import AboutUs from "./pages/AboutUs";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RecoverPrediction from "./pages/RecoverPrediction";
import ModelPerformance from "./pages/ModelPerformance";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/predict" element={<RecoverPrediction />} />
            <Route path="/model-performance" element={<ModelPerformance />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
