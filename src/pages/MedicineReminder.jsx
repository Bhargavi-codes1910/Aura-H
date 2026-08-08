import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

function MedicineReminder() {
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  const [medicineList, setMedicineList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    const user = auth.currentUser;

    if (!user) return;

    const snapshot = await getDocs(
      collection(db, "Users", user.uid, "MedicineReminder")
    );

    const medicines = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setMedicineList(medicines);
  };

  const saveMedicine = async () => {
    if (!medicineName || !dosage || !reminderTime) {
      alert("Please fill all fields");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert("Please Login");
      return;
    }

    try {
      if (editingId) {
        await updateDoc(
  doc(db, "Users", user.uid, "MedicineReminder", editingId),
  {
    medicineName,
    dosage,
    reminderTime,
    updatedAt: new Date().toISOString(),
  }
);

        alert("Medicine Updated Successfully");
      } else {
        await addDoc(
  collection(db, "Users", user.uid, "MedicineReminder"),
  {
    medicineName,
    dosage,
    reminderTime,
    status: "Pending",
    createdAt: new Date().toISOString(),
  }
);
        alert("Medicine Saved Successfully");
      }

      setMedicineName("");
      setDosage("");
      setReminderTime("");
      setEditingId(null);

      loadMedicines();

    } catch (error) {
      alert(error.message);
    }
  };

  const editMedicine = (medicine) => {
    setMedicineName(medicine.medicineName);
    setDosage(medicine.dosage);
    setReminderTime(medicine.reminderTime);
    setEditingId(medicine.id);
  };

  const deleteMedicine = async (id) => {
    const user = auth.currentUser;

    if (!user) return;

    await deleteDoc(
      doc(db, "Users", user.uid, "MedicineReminder", id)
    );

    alert("Medicine Deleted");

    loadMedicines();
  };

  return (
    <div className="min-h-screen bg-pink-100 p-6">

      <h1 className="text-4xl font-bold text-pink-600 mb-8">
        💊 Medicine Reminder
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <input
          type="text"
          placeholder="Medicine Name"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
        />

        <input
          type="text"
          placeholder="Dosage"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
        />

        <input
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="w-full border rounded-lg p-3 mb-6"
        />

        <button
          onClick={saveMedicine}
          className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700"
        >
          {editingId ? "Update Reminder" : "Save Reminder"}
        </button>

      </div>

      <div className="mt-8">

        <h2 className="text-2xl font-bold text-pink-600 mb-4">
          Saved Medicines
        </h2>

        {medicineList.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow">
            No medicines added.
          </div>
        ) : (
          medicineList.map((medicine) => (
            <div
              key={medicine.id}
              className="bg-white rounded-xl shadow p-5 mb-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg">
                  {medicine.medicineName}
                </h3>

                <p>Dosage: {medicine.dosage}</p>

               <p>Reminder: {medicine.reminderTime}</p>

<p>
  Created:
  {medicine.createdAt
    ? new Date(medicine.createdAt).toLocaleDateString()
    : "-"}
</p>
              </div>

              <div className="flex gap-3">

                <button
                  onClick={() => editMedicine(medicine)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
  onClick={async () => {
    const user = auth.currentUser;

    await updateDoc(
      doc(db, "Users", user.uid, "MedicineReminder", medicine.id),
      {
  status: "Taken",
  takenAt: new Date().toISOString(),
}
    );
await loadMedicines();

alert("Medicine Marked as Taken ❤️");
  }}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Taken
</button>

                <button
                  onClick={() => deleteMedicine(medicine.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default MedicineReminder;