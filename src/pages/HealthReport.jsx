
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";

import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import jsPDF from "jspdf";

function HealthReport() {
  const [report, setReport] = useState({
    name: "Loading...",
    auraScore: null,
    lastPeriod: "Not Available",
    cycleLength: null,
    mood: "Not Available",
    medicines: 0,
  });

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {
      // USER PROFILE
      const userSnap = await getDoc(
        doc(db, "Users", user.uid)
      );

      let name = "User";
      let profileData = {};

      if (userSnap.exists()) {
        profileData = userSnap.data();
        name = profileData.name || "User";
      }

      // PERIOD TRACKER
      const periodSnap = await getDoc(
        doc(
          db,
          "Users",
          user.uid,
          "PeriodTracker",
          "Data"
        )
      );

      let lastPeriod = "Not Available";
      let cycleLength = null;

      if (periodSnap.exists()) {
        const data = periodSnap.data();

        lastPeriod =
          data.lastPeriod || "Not Available";

        cycleLength = data.cycleLength
          ? Number(data.cycleLength)
          : null;
      }

      // MOOD TRACKER
      const moodSnap = await getDoc(
        doc(
          db,
          "Users",
          user.uid,
          "MoodTracker",
          "Today"
        )
      );

      let mood = "Not Available";

      if (moodSnap.exists()) {
        mood =
          moodSnap.data().mood ||
          "Not Available";
      }

      // MEDICINES
      const medicineSnap = await getDocs(
        collection(
          db,
          "Users",
          user.uid,
          "MedicineReminder"
        )
      );

      const medicineCount = medicineSnap.size;

      let takenCount = 0;

      medicineSnap.forEach((medicine) => {
        if (medicine.data().status === "Taken") {
          takenCount++;
        }
      });

      // CHECK INPUTS
      const hasMood =
        mood !== "Not Available";

      const hasCycle =
        cycleLength !== null;

      const hasProfile =
        profileData.age &&
        profileData.weight &&
        profileData.height &&
        profileData.bloodGroup &&
        profileData.stressLevel &&
        profileData.sleepHours &&
        profileData.waterIntake &&
        profileData.city;

      // AURA SCORE
      let auraScore = null;

      if (hasMood && hasCycle && hasProfile) {
        let score = 0;

        // MOOD - 30
        if (mood.includes("Happy")) {
          score += 30;
        } else if (mood.includes("Excited")) {
          score += 28;
        } else if (mood.includes("Calm")) {
          score += 25;
        } else if (mood.includes("Tired")) {
          score += 18;
        } else if (mood.includes("Sad")) {
          score += 12;
        } else if (mood.includes("Angry")) {
          score += 8;
        } else {
          score += 5;
        }

        // CYCLE - 30
        if (
          cycleLength >= 26 &&
          cycleLength <= 32
        ) {
          score += 30;
        } else if (
          (cycleLength >= 24 &&
            cycleLength <= 25) ||
          (cycleLength >= 33 &&
            cycleLength <= 35)
        ) {
          score += 25;
        } else {
          score += 15;
        }

        // MEDICINES - 20
        if (medicineCount === 0) {
          score += 20;
        } else {
          score += Math.round(
            (takenCount / medicineCount) * 20
          );
        }

        // PROFILE - 20
        let profileScore = 0;

        if (profileData.age) {
          profileScore += 2;
        }

        if (profileData.weight) {
          profileScore += 2;
        }

        if (profileData.height) {
          profileScore += 2;
        }

        if (profileData.bloodGroup) {
          profileScore += 2;
        }

        if (profileData.stressLevel) {
          profileScore += 3;
        }

        if (profileData.sleepHours) {
          profileScore += 3;
        }

        if (profileData.waterIntake) {
          profileScore += 3;
        }

        if (profileData.city) {
          profileScore += 3;
        }

        score += profileScore;

        if (score > 100) {
          score = 100;
        }

        auraScore = score;
      }

      setReport({
        name,
        auraScore,
        lastPeriod,
        cycleLength,
        mood,
        medicines: medicineCount,
      });

    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  // DOWNLOAD PDF
  const downloadReport = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(22);
    pdf.text("Aura-H Health Report", 20, 20);

    pdf.setFontSize(12);

    pdf.text(
      `Name: ${report.name}`,
      20,
      40
    );

    pdf.text(
      `Aura Score: ${
        report.auraScore === null
          ? "Not Calculated"
          : `${report.auraScore} / 100`
      }`,
      20,
      50
    );

    pdf.text(
      `Last Period: ${report.lastPeriod}`,
      20,
      60
    );

    pdf.text(
      `Cycle Length: ${
        report.cycleLength === null
          ? "Not Available"
          : `${report.cycleLength} Days`
      }`,
      20,
      70
    );

    pdf.text(
      `Today's Mood: ${report.mood}`,
      20,
      80
    );

    pdf.text(
      `Medicines: ${report.medicines}`,
      20,
      90
    );

    pdf.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      20,
      110
    );

    pdf.text(
      "Aura-H - Women's Wellness Companion",
      20,
      130
    );

    pdf.save("Aura-H-Health-Report.pdf");
  };

  return (
    <div className="min-h-screen bg-pink-100 p-6">

      <h1 className="text-4xl font-bold text-pink-600 mb-8">
        📋 Health Report
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <div className="space-y-5 text-lg">

          <p>
            <strong>👩 Name:</strong>{" "}
            {report.name}
          </p>

          <p>
            <strong>💖 Aura Score:</strong>{" "}
            {report.auraScore === null
              ? "Not Calculated"
              : `${report.auraScore} / 100`}
          </p>

          <p>
            <strong>📅 Last Period:</strong>{" "}
            {report.lastPeriod}
          </p>

          <p>
            <strong>🔄 Cycle Length:</strong>{" "}
            {report.cycleLength === null
              ? "Not Available"
              : `${report.cycleLength} Days`}
          </p>

          <p>
            <strong>😊 Mood:</strong>{" "}
            {report.mood}
          </p>

          <p>
            <strong>💊 Medicines:</strong>{" "}
            {report.medicines}
          </p>

        </div>

      </div>

      <button
        onClick={downloadReport}
        className="w-full mt-8 bg-pink-600 text-white py-3 rounded-xl hover:bg-pink-700 transition"
      >
        📄 Download Health Report
      </button>

    </div>
  );
}

export default HealthReport;

