import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebase/firebase";
import { signOut } from "firebase/auth";

import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
} from "firebase/firestore";

function Dashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("User");
  const [greeting, setGreeting] = useState("");

  const [auraScore, setAuraScore] = useState(null);
  const [nextPeriod, setNextPeriod] = useState("Not Calculated");
  const [todayMood, setTodayMood] = useState("Not Available");
  const [medicineCount, setMedicineCount] = useState(0);

  const [healthStatus, setHealthStatus] = useState(
    "Complete your wellness information 🌸"
  );

  const [dailyTip, setDailyTip] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    // Greeting
    const hour = new Date().getHours();

    if (hour < 12) {
      setGreeting("☀ Good Morning");
    } else if (hour < 17) {
      setGreeting("🌸 Good Afternoon");
    } else {
      setGreeting("🌙 Good Evening");
    }

    try {
      // =====================================================
      // 1. USER PROFILE
      // =====================================================

      const userSnap = await getDoc(
        doc(db, "Users", user.uid)
      );

      let profileComplete = false;
      let userData = {};

      if (userSnap.exists()) {
        userData = userSnap.data();

        setUserName(userData.name || "User");

        // Check required profile fields
        profileComplete =
          userData.age &&
          userData.weight &&
          userData.height &&
          userData.bloodGroup &&
          userData.stressLevel &&
          userData.sleepHours &&
          userData.waterIntake &&
          userData.city;
      }

      // =====================================================
      // 2. PERIOD DATA
      // =====================================================

      const periodSnap = await getDoc(
        doc(
          db,
          "Users",
          user.uid,
          "PeriodTracker",
          "Data"
        )
      );

      let periodComplete = false;
      let cycleLength = null;

      if (periodSnap.exists()) {
        const periodData = periodSnap.data();

        setNextPeriod(
          periodData.nextPeriod || "Not Calculated"
        );

        cycleLength = Number(periodData.cycleLength);

        periodComplete =
          periodData.lastPeriod &&
          periodData.cycleLength &&
          periodData.periodLength;
      }

      // =====================================================
      // 3. MOOD DATA
      // =====================================================

      const moodSnap = await getDoc(
        doc(
          db,
          "Users",
          user.uid,
          "MoodTracker",
          "Today"
        )
      );

      let mood = "";

      if (moodSnap.exists()) {
        mood = moodSnap.data().mood || "";

        setTodayMood(
          mood || "Not Available"
        );
      }

      const moodComplete = mood !== "";

      // =====================================================
      // 4. MEDICINE DATA
      // =====================================================

      const medicineSnap = await getDocs(
        collection(
          db,
          "Users",
          user.uid,
          "MedicineReminder"
        )
      );

      const totalMedicines = medicineSnap.size;

      setMedicineCount(totalMedicines);

      // =====================================================
      // 5. CHECK ALL REQUIRED DATA
      // =====================================================

      const allDataAvailable =
        profileComplete &&
        periodComplete &&
        moodComplete;

      // =====================================================
      // 6. CALCULATE ONLY WHEN REQUIRED DATA EXISTS
      // =====================================================

      if (!allDataAvailable) {
        setAuraScore(null);

        setHealthStatus(
          "Complete your profile, period and mood data 🌸"
        );

      } else {
        // ================================================
        // MOOD SCORE - 30
        // ================================================

        let moodScore = 0;

        if (mood.includes("Happy")) {
          moodScore = 30;
        } else if (mood.includes("Excited")) {
          moodScore = 28;
        } else if (mood.includes("Calm")) {
          moodScore = 25;
        } else if (mood.includes("Tired")) {
          moodScore = 18;
        } else if (mood.includes("Sad")) {
          moodScore = 12;
        } else if (mood.includes("Angry")) {
          moodScore = 8;
        } else {
          moodScore = 5;
        }

        // ================================================
        // CYCLE SCORE - 30
        // ================================================

        let cycleScore = 0;

        if (
          cycleLength >= 26 &&
          cycleLength <= 32
        ) {
          cycleScore = 30;
        } else if (
          (cycleLength >= 24 &&
            cycleLength <= 25) ||
          (cycleLength >= 33 &&
            cycleLength <= 35)
        ) {
          cycleScore = 25;
        } else {
          cycleScore = 15;
        }

        // ================================================
        // MEDICINE SCORE - 20
        // ================================================

        let medicineScore = 0;

        const takenMedicines =
          medicineSnap.docs.filter(
            (item) =>
              item.data().status === "Taken"
          ).length;

        if (totalMedicines === 0) {
          medicineScore = 20;
        } else {
          medicineScore = Math.round(
            (takenMedicines / totalMedicines) * 20
          );
        }

        // ================================================
        // PROFILE SCORE - 20
        // ================================================

        let profileScore = 0;

        if (userData.age) profileScore += 2;
        if (userData.weight) profileScore += 2;
        if (userData.height) profileScore += 2;
        if (userData.bloodGroup) profileScore += 2;
        if (userData.stressLevel) profileScore += 3;
        if (userData.sleepHours) profileScore += 3;
        if (userData.waterIntake) profileScore += 3;
        if (userData.city) profileScore += 3;

        // ================================================
        // FINAL SCORE
        // ================================================

        const finalScore =
          moodScore +
          cycleScore +
          medicineScore +
          profileScore;

        setAuraScore(finalScore);

        // ================================================
        // SAVE SCORE TO FIREBASE
        // ================================================

        await setDoc(
          doc(db, "Users", user.uid),
          {
            auraScore: finalScore,
            auraScoreUpdatedAt:
              new Date().toISOString(),
          },
          { merge: true }
        );

        // ================================================
        // HEALTH STATUS
        // ================================================

        if (finalScore >= 90) {
          setHealthStatus(
            "Excellent 🌸"
          );
        } else if (finalScore >= 75) {
          setHealthStatus(
            "Healthy 💜"
          );
        } else if (finalScore >= 60) {
          setHealthStatus(
            "Needs Care 🌼"
          );
        } else {
          setHealthStatus(
            "Take Care of Yourself ❤️"
          );
        }
      }

      // =====================================================
      // DAILY TIP
      // =====================================================

      const tips = [
        "💧 Drink enough water today",
        "🚶 Take a 30-minute walk",
        "🥗 Eat nutritious fruits and vegetables",
        "😴 Try to get 7–8 hours of sleep",
        "🧘 Take some time to relax",
        "❤️ Take care of yourself today",
      ];

      setDailyTip(
        tips[Math.floor(Math.random() * tips.length)]
      );

    } catch (error) {
      console.log("Dashboard Error:", error);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    await signOut(auth);

    alert("Logged Out Successfully");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-purple-100 p-6">

      {/* HEADER */}

      <h1 className="text-4xl font-bold text-pink-600">
        🌸 Aura-H
      </h1>

      <p className="text-xl mt-2 text-gray-700">
        {greeting},{" "}
        <span className="font-bold">
          {userName}
        </span>{" "}
        💜
      </p>

      {/* =====================================================
          AURA SCORE
      ===================================================== */}

      <div className="bg-white rounded-3xl shadow-lg p-6 mt-8">

        <h2 className="text-xl font-bold text-pink-600">
          💖 Aura Score
        </h2>

        {auraScore === null ? (
          <>
            <p className="text-3xl font-bold text-gray-500 mt-4">
              Not Calculated
            </p>

            <p className="text-gray-500 mt-3">
              Complete your Profile, Period Tracker
              and Mood Tracker to calculate your Aura Score.
            </p>
          </>
        ) : (
          <>
            <p className="text-5xl font-bold text-pink-600 mt-3">
              {auraScore}
              <span className="text-2xl">
                {" "}
                /100
              </span>
            </p>

            <div className="w-full bg-gray-200 rounded-full h-4 mt-5">

              <div
                className="bg-pink-600 h-4 rounded-full transition-all"
                style={{
                  width: `${auraScore}%`,
                }}
              ></div>

            </div>
          </>
        )}

        <p className="mt-4 text-lg font-semibold">
          {healthStatus}
        </p>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid md:grid-cols-3 gap-5 mt-8">

        {/* PERIOD */}

        <div className="bg-white rounded-2xl shadow-lg p-5">

          <h3 className="font-bold text-pink-600">
            📅 Next Period
          </h3>

          <p className="text-xl mt-3">
            {nextPeriod}
          </p>

        </div>

        {/* MOOD */}

        <div className="bg-white rounded-2xl shadow-lg p-5">

          <h3 className="font-bold text-pink-600">
            😊 Today's Mood
          </h3>

          <p className="text-xl mt-3">
            {todayMood}
          </p>

        </div>

        {/* MEDICINES */}

        <div className="bg-white rounded-2xl shadow-lg p-5">

          <h3 className="font-bold text-pink-600">
            💊 Medicines
          </h3>

          <p className="text-xl mt-3">
            {medicineCount} Active
          </p>

        </div>

      </div>

      {/* =====================================================
          DAILY TIP
      ===================================================== */}

      <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">

        <h2 className="text-xl font-bold text-pink-600">
          🔥 Daily Health Tip
        </h2>

        <p className="mt-4 text-lg">
          {dailyTip}
        </p>

      </div>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <div className="grid md:grid-cols-2 gap-4 mt-8">

        <button
          onClick={() => navigate("/period")}
          className="bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700"
        >
          📅 Period Tracker
        </button>

        <button
          onClick={() => navigate("/mood")}
          className="bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700"
        >
          😊 Mood Tracker
        </button>

        <button
          onClick={() => navigate("/medicine")}
          className="bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700"
        >
          💊 Medicine Reminder
        </button>

        <button
          onClick={() => navigate("/health-report")}
          className="bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700"
        >
          📋 Health Report
        </button>

        <button
          onClick={() => navigate("/community")}
          className="bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700"
        >
          👭 Community
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700"
        >
          👤 Profile
        </button>

      </div>

      {/* LOGOUT */}

      <button
        onClick={handleLogout}
        className="w-full mt-8 bg-red-500 text-white py-4 rounded-xl hover:bg-red-600"
      >
        🚪 Logout
      </button>

    </div>
  );
}

export default Dashboard;