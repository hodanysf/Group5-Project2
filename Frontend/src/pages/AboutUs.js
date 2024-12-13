import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  const cards = [
    {
      id: "301253927",
      name: "Dimitrios Avgerakis",
      image: "/images/headshot_dimitri.jpg",
    },
    {
      id: "301293488",
      name: "Gabriel Normand ",
      image: "/images/gabriel.jpg",
    },
    {
      id: "ID-003",
      name: "Chris",
      image: "https://via.placeholder.com/200x200",
    },
    {
      id: "301226634",
      name: "Hodan A. Yusuf",
      image: "/images/headshot.JPEG",
    },
    {
      id: "301321662",
      name: "Nabanita Saha",
      image: "/images/Nabanita.jpg",
    },
  ];

  return (
    // <div className="about-us">
    //   <div className="about-us-header">
    //     <h1>Our Team</h1>
    //   </div>

    //   <div className="team-intro">
    //     <p
    //       style={{
    //         marginTop: "-40px",
    //       }}
    //     >
    //       We are a dedicated team of professionals committed to making a
    //       difference in the world through technology and innovation.
    //     </p>
    //   </div>

    <div className="about-us">
      <div className="about-us-header">
        <h1>About Us</h1>
        <p className="subtitle">Meet the team behind the project</p>
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
