import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebase/firebase";

import { signOut } from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

function Profile() {

  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    weight: "",
    height: "",
    bloodGroup: "",
    stressLevel: "",
    sleepHours: "",
    waterIntake: "",
    city: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {

    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    try {

      const docRef = doc(db, "Users", user.uid);

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {

        setProfile({
          ...profile,
          ...docSnap.data(),
        });

      }

    } catch (error) {
      console.log(error);
    }

  };

  const handleChange = (e) => {

    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });

  };

  const saveProfile = async () => {

    try {

      const user = auth.currentUser;

      await setDoc(
        doc(db, "Users", user.uid),
        profile,
        { merge: true }
      );

      alert("Profile Updated Successfully ❤️");

    } catch (error) {
      alert(error.message);
    }

  };

  const logout = async () => {

    await signOut(auth);

    navigate("/login");

  };
    return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-purple-100 p-6">

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8">

        <div className="flex flex-col items-center">

          <div className="w-32 h-32 rounded-full bg-pink-500 flex items-center justify-center text-6xl shadow-lg">
            👩
          </div>

          <h1 className="text-3xl font-bold text-pink-600 mt-5">
            {profile.name || "Aura-H User"}
          </h1>

          <p className="text-gray-500">
            Women's Wellness Companion 💖
          </p>

        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-10">

          <div>
            <label className="font-semibold">👩 Full Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            />
          </div>

          <div>
            <label className="font-semibold">📧 Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              readOnly
              className="w-full border rounded-xl p-3 mt-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold">🎂 Age</label>
            <input
              type="number"
              name="age"
              value={profile.age}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            />
          </div>

          <div>
            <label className="font-semibold">⚖ Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={profile.weight}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            />
          </div>

          <div>
            <label className="font-semibold">📏 Height (cm)</label>
            <input
              type="number"
              name="height"
              value={profile.height}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            />
          </div>

          <div>
            <label className="font-semibold">🩸 Blood Group</label>
            <select
              name="bloodGroup"
              value={profile.bloodGroup}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            >
              <option value="">Select</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">😰 Stress Level</label>
            <select
              name="stressLevel"
              value={profile.stressLevel}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            >
              <option value="">Select</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">😴 Sleep Hours</label>
            <input
              type="number"
              name="sleepHours"
              value={profile.sleepHours}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            />
          </div>

          <div>
            <label className="font-semibold">💧 Water Intake (L)</label>
            <input
              type="number"
              name="waterIntake"
              value={profile.waterIntake}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            />
          </div>

          <div>
            <label className="font-semibold">🏙 City</label>
            <input
              type="text"
              name="city"
              value={profile.city}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 mt-2"
            />
          </div>

        </div>

        <button
          onClick={saveProfile}
          className="w-full mt-8 bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700 transition"
        >
          💾 Save Profile
        </button>

        <button
          onClick={logout}
          className="w-full mt-4 bg-red-500 text-white py-4 rounded-xl hover:bg-red-600 transition"
        >
          🚪 Logout
        </button>

      </div>

    </div>
  );
}

export default Profile;