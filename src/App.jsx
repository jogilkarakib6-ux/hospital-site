import { useEffect, useState } from "react";
import AppointmentForm from "./components/AppointmentForm";
import { doctors } from "./Data/doctors";
import { staffDuty } from "./data/staffDuty";
import Contact from "./components/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import "./App.css";

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const [editingAppointment, setEditingAppointment] =
    useState(null);

  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/appointments"
      );

      if (!response.ok) {
        throw new Error("Failed to load appointments");
      }

      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    }
  };

  const handleBook = async (appointment) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointment),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save appointment");
      }

      const savedAppointment = await response.json();

      setAppointments((previous) => [
        savedAppointment,
        ...previous,
      ]);

      alert(
        `Appointment confirmed successfully!\nAppointment ID: ${savedAppointment.id}`
      );
    } catch (error) {
      console.error(error);
      alert("Failed to book appointment.");
    }
  };

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      setAppointments((previous) =>
        previous.filter(
          (appointment) => appointment.id !== id
        )
      );

      alert("Appointment cancelled successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to cancel appointment.");
    }
  };

  const openReschedule = (appointment) => {
    setEditingAppointment(appointment);
    setEditDate(appointment.date);
    setEditTime(appointment.time);
  };

  const closeReschedule = () => {
    setEditingAppointment(null);
    setEditDate("");
    setEditTime("");
  };

  const handleReschedule = async (e) => {
    e.preventDefault();

    if (!editDate || !editTime) {
      alert("Please select date and time.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${editingAppointment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: editDate,
            time: editTime,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reschedule appointment");
      }

      const updatedAppointment = await response.json();

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === updatedAppointment.id
            ? updatedAppointment
            : appointment
        )
      );

      alert("Appointment rescheduled successfully.");

      closeReschedule();
    } catch (error) {
      console.error(error);
      alert("Failed to reschedule appointment.");
    }
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    setShowAdmin(false);
  };

  const today = new Date()
    .toISOString()
    .split("T")[0];

  if (showAdmin && !adminLoggedIn) {
    return (
      <AdminLogin
        onLogin={() => setAdminLoggedIn(true)}
        onBack={() => setShowAdmin(false)}
      />
    );
  }

  if (showAdmin && adminLoggedIn) {
    return (
      <AdminDashboard
        onLogout={handleAdminLogout}
      />
    );
  }

  return (
    <div className="app">
      <header className="main-header">
        <div className="header-inner">
          <div className="hospital-logo">
            <div className="logo-icon">✚</div>

            <div>
              <h2>SHRADDHA</h2>
              <span>MULTISPECIALITY HOSPITAL</span>
            </div>
          </div>

          <nav className="main-nav">
            <a href="#home">Home</a>
            <a href="#doctors">Doctors</a>
            <a href="#appointment">Appointment</a>
            <a href="#contact">Contact</a>

            <button
              className="admin-nav-btn"
              onClick={() => setShowAdmin(true)}
            >
              ADMIN
            </button>
          </nav>
        </div>
      </header>

      <section className="hero-section" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">
              PROFESSIONAL HEALTHCARE
            </span>

            <h1>
              Your Health,
              <br />
              <span>Our Priority.</span>
            </h1>

            <p>
              Quality healthcare with experienced doctors,
              modern facilities and patient-focused service.
            </p>

            <div className="hero-buttons">
              <a
                href="#appointment"
                className="primary-btn"
              >
                BOOK APPOINTMENT
              </a>

              <a
                href="#doctors"
                className="secondary-btn"
              >
                MEET OUR DOCTORS
              </a>
            </div>
          </div>

          <div className="hero-card">
            <div className="live-indicator">
              <span></span>
              HOSPITAL STATUS
            </div>

            <h3>We are here for you</h3>

            <p>
              Emergency and healthcare support available
              for our patients.
            </p>

            <div className="hero-time">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </section>

      <section className="quick-info">
        <div className="info-card">
          <div className="info-icon">🩺</div>

          <div>
            <h3>Expert Doctors</h3>
            <p>Experienced healthcare professionals</p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">🕐</div>

          <div>
            <h3>24/7 Support</h3>
            <p>Healthcare assistance when needed</p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">🏥</div>

          <div>
            <h3>Modern Facility</h3>
            <p>Comfortable and patient-friendly</p>
          </div>
        </div>
      </section>

      <section
        className="section doctors-section"
        id="doctors"
      >
        <div className="section-heading">
          <span>OUR MEDICAL TEAM</span>

          <h2>Meet Our Doctors</h2>

          <p>
            Consult experienced specialists for your
            healthcare needs.
          </p>
        </div>

        <div className="doctor-list">
          {doctors.map((doctor) => (
            <div
              className="doctor-card"
              key={doctor.id}
            >
              <div className="doctor-avatar">
                {doctor.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")}
              </div>

              <div className="doctor-status">
                <span></span>
                Available
              </div>

              <h3>{doctor.name}</h3>

              <p className="speciality">
                {doctor.speciality}
              </p>

              <div className="doctor-details">
                <span>
                  🩺 Experienced Specialist
                </span>

                <span>
                  📅 Appointment Available
                </span>
              </div>

              <a
                href="#appointment"
                className="doctor-book-btn"
              >
                BOOK APPOINTMENT
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="section duty-section">
        <div className="section-heading">
          <span>HOSPITAL INFORMATION</span>

          <h2>Staff Duty Schedule</h2>

          <p>
            Current hospital staff duty information.
          </p>
        </div>

        <div className="duty-layout">
          <div className="duty-time-card">
            <div className="duty-clock">🕐</div>

            <h3>
              {currentTime.toLocaleTimeString()}
            </h3>

            <p>
              {currentTime.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            <div className="staff-count">
              <strong>{staffDuty.length}</strong>
              <span>Staff Listed</span>
            </div>
          </div>

          <div className="duty-table-wrapper">
            <table className="duty-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Department</th>
                  <th>Duty Time</th>
                </tr>
              </thead>

              <tbody>
                {staffDuty.map((staff, index) => (
                  <tr key={index}>
                    <td>{staff.name}</td>
                    <td>{staff.department}</td>
                    <td>{staff.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        className="section appointment-section"
        id="appointment"
      >
        <div className="section-heading">
          <span>ONLINE BOOKING</span>

          <h2>Book an Appointment</h2>

          <p>
            Fill in your details and select your preferred
            doctor.
          </p>
        </div>

        <div className="appointment-layout">
          <div className="appointment-side">
            <div className="appointment-side-icon">
              📅
            </div>

            <h3>Easy Appointment Booking</h3>

            <p>
              Book your hospital appointment quickly and
              conveniently.
            </p>

            <div className="appointment-benefit">
              <span>✓</span>
              Simple online booking
            </div>

            <div className="appointment-benefit">
              <span>✓</span>
              Select your preferred doctor
            </div>

            <div className="appointment-benefit">
              <span>✓</span>
              Download appointment slip
            </div>

            <div className="appointment-benefit">
              <span>✓</span>
              Secure database storage
            </div>
          </div>

          <div className="appointment-form-wrapper">
            <AppointmentForm onBook={handleBook} />
          </div>
        </div>
      </section>

      <section className="section records-section">
        <div className="section-heading">
          <span>APPOINTMENT MANAGEMENT</span>

          <h2>Booked Appointments</h2>

          <p>
            Manage your booked appointments.
          </p>
        </div>

        <div className="records-card">
          <div className="records-header">
            <div>
              <strong>{appointments.length}</strong>
              <span>Total Appointments</span>
            </div>

            <a
              href="http://localhost:5000/api/export/excel"
              className="download-btn"
            >
              ↓ EXPORT EXCEL
            </a>
          </div>

          {appointments.length === 0 ? (
            <div className="empty-records">
              <div>📋</div>

              <h3>No Appointments Yet</h3>

              <p>
                Book an appointment to see it here.
              </p>
            </div>
          ) : (
            <div className="appointments-table-wrapper">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>PDF</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        #{appointment.id}
                      </td>

                      <td>
                        <strong>
                          {appointment.patientName}
                        </strong>
                      </td>

                      <td>
                        {appointment.doctorName}
                      </td>

                      <td>
                        {appointment.date}
                      </td>

                      <td>
                        {appointment.time}
                      </td>

                      <td>
                        <a
                          href={`http://localhost:5000/api/appointments/${appointment.id}/pdf`}
                          className="pdf-btn"
                          target="_blank"
                          rel="noreferrer"
                        >
                          PDF
                        </a>
                      </td>

                      <td>
                        <div className="appointment-actions">
                          <button
                            className="reschedule-btn"
                            onClick={() =>
                              openReschedule(
                                appointment
                              )
                            }
                          >
                            Reschedule
                          </button>

                          <button
                            className="cancel-btn"
                            onClick={() =>
                              handleCancel(
                                appointment.id
                              )
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section
        className="section contact-section"
        id="contact"
      >
        <div className="section-heading">
          <span>GET IN TOUCH</span>

          <h2>Contact & Location</h2>

          <p>
            Find us or contact the hospital for assistance.
          </p>
        </div>

        <Contact />
      </section>

      <footer className="footer">
        <div>
          <strong>
            SHRADDHA MULTISPECIALITY HOSPITAL
          </strong>

          <p>
            Quality healthcare with compassion.
          </p>
        </div>

        <p>
          © 2026 Shraddha Multispeciality Hospital
        </p>
      </footer>

      {editingAppointment && (
        <div className="modal-overlay">
          <div className="reschedule-modal">
            <button
              className="modal-close"
              onClick={closeReschedule}
            >
              ×
            </button>

            <span className="hero-badge">
              APPOINTMENT MANAGEMENT
            </span>

            <h2>Reschedule Appointment</h2>

            <p>
              Appointment #{editingAppointment.id}
            </p>

            <div className="reschedule-patient">
              <strong>
                {editingAppointment.patientName}
              </strong>

              <span>
                {editingAppointment.doctorName}
              </span>
            </div>

            <form onSubmit={handleReschedule}>
              <label>New Date</label>

              <input
                type="date"
                min={today}
                value={editDate}
                onChange={(e) =>
                  setEditDate(e.target.value)
                }
                required
              />

              <label>New Time</label>

              <input
                type="time"
                value={editTime}
                onChange={(e) =>
                  setEditTime(e.target.value)
                }
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeReschedule}
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="modal-save-btn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;