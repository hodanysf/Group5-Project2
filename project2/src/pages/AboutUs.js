import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  const cards = [
    {
      id: "301253927",
      name: "Dimitrios Avgerakis",
      image: "https://via.placeholder.com/200x200",
    },
    {
      id: "ID-002",
      name: "Gab ",
      image: "https://via.placeholder.com/200x200",
    },
    {
      id: "ID-003",
      name: "Chris",
      image: "https://via.placeholder.com/200x200",
    },
    {
      id: "ID-004",
      name: "Hodan",
      image: "https://via.placeholder.com/200x200",
    },
    {
      id: "ID-005",
      name: "Nabantia",
      image: "https://via.placeholder.com/200x200",
    },
  ];

  return (
    <div className="about-us">
      <div className="about-us-header">
        <h1>Our Team</h1>
        <div className="divider"></div>
      </div>

      <div className="cards-container">
        {cards.map((card) => (
          <div key={card.id} className="card">
            <div className="card-image">
              <img src={card.image} alt={card.name} />
            </div>
            <div className="card-content">
              <h3>{card.name}</h3>
              <p className="id-number">{card.id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
