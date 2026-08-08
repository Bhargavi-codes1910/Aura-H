import React from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pink-100 flex flex-col items-center justify-center p-6">
      
      <h1 className="text-4xl font-bold text-pink-600 text-center">
        🌸 Welcome to Aura-H
      </h1>

      <p className="text-lg mt-5 text-gray-700 text-center">
        Your Women's Wellness Companion
      </p>

      <button
        onClick={() => navigate("/signup")}
        className="mt-10 bg-pink-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-pink-700 transition"
      >
        Get Started
      </button>

    </div>
  );
}

export default Welcome;