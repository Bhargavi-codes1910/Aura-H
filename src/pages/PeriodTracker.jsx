import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

function PeriodTracker() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("");
  const [periodLength, setPeriodLength] = useState("");

  const [nextPeriod, setNextPeriod] = useState("--");
  const [ovulation, setOvulation] = useState("--");
  const [fertileWindow, setFertileWindow] = useState("--");

  useEffect(() => {
    loadPeriodData();
  }, []);

  const loadPeriodData = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const docSnap = await getDoc(
        doc(db, "Users", user.uid, "PeriodTracker", "Data")
      );

      if (docSnap.exists()) {
        const data = docSnap.data();

        setLastPeriod(data.lastPeriod || "");
        setCycleLength(String(data.cycleLength || 28));
        setPeriodLength(String(data.periodLength || 5));
        setNextPeriod(data.nextPeriod || "--");
        setOvulation(data.ovulation || "--");
        setFertileWindow(data.fertileWindow || "--");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const calculatePeriod = async () => {
    if (!lastPeriod || !cycleLength || !periodLength) {
      alert("Please fill all fields");
      return;
    }

    const cycle = parseInt(cycleLength);
    const period = parseInt(periodLength);

    if (isNaN(cycle) || isNaN(period)) {
      alert("Cycle Length and Period Length must be numbers");
      return;
    }

    const date = new Date(lastPeriod);

    if (isNaN(date.getTime())) {
      alert("Please select a valid date");
      return;
    }

    const next = new Date(date);
    next.setDate(next.getDate() + cycle);

    const ovu = new Date(next);
    ovu.setDate(ovu.getDate() - 14);

    const fertile = new Date(ovu);
    fertile.setDate(fertile.getDate() - 5);

    const nextDate = next.toLocaleDateString();
    const ovulationDate = ovu.toLocaleDateString();
    const fertileWindowText =
      `${fertile.toLocaleDateString()} to ${ovu.toLocaleDateString()}`;

    setNextPeriod(nextDate);
    setOvulation(ovulationDate);
    setFertileWindow(fertileWindowText);

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please Login First");
        return;
      }

      await setDoc(
        doc(db, "Users", user.uid, "PeriodTracker", "Data"),
        {
          lastPeriod,
          cycleLength: cycle,
          periodLength: period,
          nextPeriod: nextDate,
          ovulation: ovulationDate,
          fertileWindow: fertileWindowText,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      alert("Period Data Saved Successfully ❤️");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-pink-100 p-6">

      <h1 className="text-4xl font-bold text-pink-600 mb-8">
        📅 Period Tracker
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <label className="font-semibold">Last Period Date</label>

        <input
          type="date"
          value={lastPeriod}
          onChange={(e) => setLastPeriod(e.target.value)}
          className="w-full border rounded-lg p-3 mt-2 mb-4"
        />

        <label className="font-semibold">Cycle Length (Days)</label>

        <input
          type="number"
          value={cycleLength}
          onChange={(e) => setCycleLength(e.target.value)}
          className="w-full border rounded-lg p-3 mt-2 mb-4"
        />

        <label className="font-semibold">Period Length (Days)</label>

        <input
          type="number"
          value={periodLength}
          onChange={(e) => setPeriodLength(e.target.value)}
          className="w-full border rounded-lg p-3 mt-2 mb-6"
        />

        <button
          onClick={calculatePeriod}
          className="w-full bg-pink-600 text-white py-3 rounded-xl hover:bg-pink-700"
        >
          💾 Save & Calculate
        </button>

      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">

        <h2 className="text-2xl font-bold text-pink-600 mb-5">
          Prediction
        </h2>

        <p className="mb-4">
          🌸 <strong>Next Period:</strong> {nextPeriod}
        </p>

        <p className="mb-4">
          🥚 <strong>Ovulation:</strong> {ovulation}
        </p>

        <p>
          💖 <strong>Fertile Window:</strong> {fertileWindow}
        </p>

      </div>

    </div>
  );
}

export default PeriodTracker;