import { useEffect, useState } from "react";

function AdminDashboard({ onLogout }) {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/appointments"
      );

      if (!response.ok) {
        throw new Error("Failed to load appointments");
      }

      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load appointment records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment?"
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
        throw new Error("Failed to delete appointment");
      }

      setAppointments((previous) =>
        previous.filter((appointment) => appointment.id !== id)
      );

      alert("Appointment deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete appointment.");
    }
  };

  const filteredAppointments = appointments.filter(
    (appointment) => {
      const text = search.toLowerCase();

      return (
        appointment.patientName
          ?.toLowerCase()
          .includes(text) ||
        appointment.phone?.includes(text) ||
        appointment.doctorName
          ?.toLowerCase()
          .includes(text)
      );
    }
  );

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const todayAppointments = appointments.filter(
    (appointment) => appointment.date === today
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-label">
            HOSPITAL MANAGEMENT
          </span>

          <h1>Admin Dashboard</h1>

          <p>
            Manage hospital appointments and patient
            records.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            className="refresh-btn"
            onClick={loadAppointments}
          >
            ↻ Refresh
          </button>

          <button
            className="logout-btn"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>

          <div>
            <span>Total Appointments</span>
            <strong>{appointments.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>

          <div>
            <span>Today's Appointments</span>
            <strong>
              {todayAppointments.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>

          <div>
            <span>Doctors</span>
            <strong>Available</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏥</div>

          <div>
            <span>Hospital Status</span>
            <strong className="active-status">
              Active
            </strong>
          </div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h2>Appointment Records</h2>

            <p>
              View and manage appointments stored in
              the hospital database.
            </p>
          </div>

          <a
            href="http://localhost:5000/api/export/excel"
            className="excel-btn"
          >
            ↓ Export Excel
          </a>
        </div>

        <div className="search-box">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search patient, phone or doctor..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {loading ? (
          <div className="dashboard-empty">
            <div>⏳</div>

            <h3>Loading Records...</h3>

            <p>
              Please wait while appointments are
              loading.
            </p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="dashboard-empty">
            <div>📋</div>

            <h3>No Appointments Found</h3>

            <p>
              There are no records matching your
              search.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>PDF</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map(
                  (appointment) => (
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
                        {appointment.phone}
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
                          className="admin-pdf-btn"
                          target="_blank"
                          rel="noreferrer"
                        >
                          PDF
                        </a>
                      </td>

                      <td>
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(
                              appointment.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;