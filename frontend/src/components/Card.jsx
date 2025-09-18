import React from "react";

const Card = ({ title, description, children }) => {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
};

export default Card;
