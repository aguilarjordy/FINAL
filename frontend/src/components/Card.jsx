import React from "react";
import { Link } from "react-router-dom";

const Card = ({ title, text, link }) => {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to={link} className="card-btn">Ir</Link>
    </div>
  );
};

export default Card;
