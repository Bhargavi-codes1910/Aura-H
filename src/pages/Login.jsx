import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login Successful");

      navigate("/dashboard");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md">

        <h1 className="text-4xl font-bold text-pink-600 text-center">
          🌸 Aura-H
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Welcome Back
        </p>

        <div className="mt-8 space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="w-full text-pink-600 font-semibold"
          >
            Don't have an account? Sign Up
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;