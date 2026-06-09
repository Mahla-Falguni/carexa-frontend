import React from "react";

const Cards = ({ title, description, Icon, buttons = [] }) => {
  return (
    <div
      className="bg-blue-200 p-8 rounded-2xl shadow-lg text-center
      transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    >
      
      {/* Icon */}
      {Icon && (
        <div className="text-5xl text-blue-900 mb-4 flex justify-center">
          <Icon />
        </div>
      )}

      {/* Title */}
      <h2 className="text-2xl font-bold mb-2 text-gray-800">
        {title}
      </h2>

      {/* Description */}
      <p className="mb-6 text-gray-700">
        {description}
      </p>

      {/* Buttons */}
      {buttons.length > 0 && (
        <div className="flex flex-col gap-3">
          {buttons.map((btn, index) => (
            <button
              key={index}
              onClick={btn.onClick}
              className="bg-white text-gray-800 py-2 px-4 rounded-lg
              hover:bg-gray-100 transition duration-300 shadow"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
      
    </div>
  );
};

export default Cards;