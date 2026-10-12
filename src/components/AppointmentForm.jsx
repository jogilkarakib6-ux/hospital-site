import { useState } from "react";
import { doctors } from "../Data/doctors";

function getCurrentDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

function getCurrentTime() {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
}

function AppointmentForm({ onBook }) {
  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    age: "",
    doctorId: "",
    date: getCurrentDate(),
    time: getCurrentTime(),
    problem: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(form.phone)) {
      alert("ENTER 10 DIGIT PHONE NUMBER");
      return;
    }

    const doctor = doctors.find(
      (d) => d.id === Number(form.doctorId)
    );

    if (!doctor) {
      alert("PLEASE SELECT A DOCTOR");
      return;
    }

    const now = new Date();

    const appointment = {
      ...form,
      id: Date.now(),
      doctorName: doctor.name,
      date: form.date || getCurrentDate(),
      time:
        form.time ||
        `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`,
    };

    onBook(appointment);

    setForm({
      patientName: "",
      phone: "",
      age: "",
      doctorId: "",
      date: getCurrentDate(),
      time: getCurrentTime(),
      problem: "",
    });
  };

  const today = getCurrentDate();

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <input
        name="patientName"
        placeholder="PATIENT NAME"
        value={form.patientName}
        onChange={handleChange}
        required
      />

      <input
        name="phone"
        type="tel"
        placeholder="Phone number (10 digit)"
        value={form.phone}
        onChange={handleChange}
        maxLength="10"
        required
      />

      <input
        name="age"
        type="number"
        placeholder="AGE"
        value={form.age}
        onChange={handleChange}
        required
      />

      <select
        name="doctorId"
        value={form.doctorId}
        onChange={handleChange}
        required
      >
        <option value="">SELECT DOCTOR</option>

        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} ({d.speciality})
          </option>
        ))}
      </select>

      <input
        name="date"
        type="date"
        min={today}
        value={form.date}
        onChange={handleChange}
        required
      />

      <input
        name="time"
        type="time"
        value={form.time}
        onChange={handleChange}
        required
      />

      <textarea
        name="problem"
        placeholder="PROBLEM"
        value={form.problem}
        onChange={handleChange}
      />

      <button type="submit">
        CONFIRM APPOINTMENT
      </button>
    </form>
  );
}

export default AppointmentForm;