import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

function MoodTracker() {
  const moods = [
    "😊 Happy",
    "😍 Excited",
    "😌 Calm",
    "😔 Sad",
    "😡 Angry",
    "😴 Tired",
  ];

  const [selectedMood, setSelectedMood] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    loadMood();
  }, []);

  const loadMood = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const docSnap = await getDoc(
        doc(db, "Users", user.uid, "MoodTracker", "Today")
      );

      if (docSnap.exists()) {
        const data = docSnap.data();

        setSelectedMood(data.mood || "😊 Happy");
        setLastUpdated(data.date || "");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveMood = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first");
        return;
      }

      const today = new Date();

      await setDoc(
        doc(db, "Users", user.uid, "MoodTracker", "Today"),
        {
          mood: selectedMood,
          date: today.toLocaleDateString(),
          time: today.toLocaleTimeString(),
          timestamp: Date.now(),
        },
        { merge: true }
      );

      setLastUpdated(today.toLocaleDateString());

      alert("Mood Saved Successfully ❤️");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-pink-100 p-6">

      <h1 className="text-4xl font-bold text-pink-600 text-center">
        😊 Mood Tracker
      </h1>

      <p className="text-xl text-center mt-5">
        How are you feeling today?
      </p>

      <div className="max-w-xl mx-auto mt-8">

        {moods.map((mood) => (
          <div
            key={mood}
            onClick={() => setSelectedMood(mood)}
            className={`cursor-pointer rounded-xl p-4 mb-4 shadow-md transition ${
              selectedMood === mood
                ? "bg-pink-600 text-white"
                : "bg-white hover:bg-pink-50"
            }`}
          >
            {mood}
          </div>
        ))}

      </div>

      <div className="bg-white rounded-2xl shadow-lg max-w-xl mx-auto p-6 mt-8 text-center">

        <h2 className="text-xl font-bold mb-4">
          Selected Mood
        </h2>

        <p className="text-3xl text-pink-600 font-semibold">
          {selectedMood}
        </p>

        <p className="mt-4 text-gray-500">
          Last Updated: {lastUpdated || "Not Available"}
        </p>

        <button
          onClick={saveMood}
          className="w-full mt-8 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700"
        >
          💾 Save Mood
        </button>

      </div>

    </div>
  );
}

export default MoodTracker;