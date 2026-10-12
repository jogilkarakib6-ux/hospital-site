const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const session = require("express-session");
const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  })
);

app.use(express.json());

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing in .env");
}

app.use(
  session({
    name: "hospital.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // Local development only
      maxAge: 30 * 60 * 1000,
    },
  })
);

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin === true) {
    return next();
  }

  return res.status(401).json({
    error: "Admin login required",
  });
}

const db = new Database("hospital.db");

/* =========================
   DATABASE
========================= */

db.prepare(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientName TEXT NOT NULL,
    age INTEGER,
    phone TEXT NOT NULL,
    doctorId INTEGER,
    doctorName TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    problem TEXT
  )
`).run();

/* =========================
   SMS FUNCTION
========================= */

async function sendAppointmentSMS(
  phone,
  patientName,
  doctorName,
  date,
  time
) {
  console.log("================================");
  console.log("SMS FUNCTION STARTED");

  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    const testNumber = process.env.TEST_SMS_NUMBER;

    console.log(
      "API KEY:",
      authKey ? "FOUND" : "NOT FOUND"
    );

    console.log(
      "TEMPLATE ID:",
      templateId ? "FOUND" : "NOT FOUND"
    );

    console.log(
      "TEST NUMBER:",
      testNumber ? "FOUND" : "NOT FOUND"
    );

    if (!authKey) {
      console.log(
        "ERROR: MSG91_AUTH_KEY missing in .env"
      );
      return;
    }

    if (!templateId) {
      console.log(
        "ERROR: MSG91_TEMPLATE_ID missing in .env"
      );
      return;
    }

    if (!testNumber) {
      console.log(
        "ERROR: TEST_SMS_NUMBER missing in .env"
      );
      return;
    }

    console.log(
      "Sending SMS to test number:",
      testNumber
    );

    const response = await fetch(
      "https://control.msg91.com/api/v5/flow/",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          authkey: authKey,
        },

        body: JSON.stringify({
          template_id: templateId,

          short_url: "0",

          recipients: [
            {
              mobiles: `91${testNumber}`,

              patient_name: patientName,

              doctor_name: doctorName,

              appointment_date: date,

              appointment_time: time,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log(
      "MSG91 HTTP STATUS:",
      response.status
    );

    console.log(
      "MSG91 RESPONSE:",
      data
    );

    if (response.ok) {
      console.log(
        "SMS REQUEST SENT SUCCESSFULLY"
      );
    } else {
      console.log(
        "MSG91 REJECTED THE SMS REQUEST"
      );
    }
  } catch (error) {
    console.error(
      "SMS ERROR:",
      error
    );
  }

  console.log("SMS FUNCTION FINISHED");
  console.log("================================");
}

/* =========================
   HOME
========================= */

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      !username ||
      !password ||
      !process.env.ADMIN_USERNAME ||
      !process.env.ADMIN_PASSWORD_HASH
    ) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const usernameMatches =
      username === process.env.ADMIN_USERNAME;

    const passwordMatches = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!usernameMatches || !passwordMatches) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({
          error: "Unable to create login session",
        });
      }

      req.session.isAdmin = true;

      req.session.save((saveError) => {
        if (saveError) {
          return res.status(500).json({
            error: "Unable to save login session",
          });
        }

        res.json({ message: "Login successful" });
      });
    });
  } catch (error) {
    console.error("Admin login failed");
    res.status(500).json({
      error: "Login failed",
    });
  }
});

app.get("/api/admin/session", (req, res) => {
  res.json({
    loggedIn: req.session?.isAdmin === true,
  });
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: "Logout failed",
      });
    }

    res.clearCookie("hospital.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.json({ message: "Logged out successfully" });
  });
});
/* =========================
   GET APPOINTMENTS
========================= */

app.get(
  "/api/appointments",
  (req, res) => {
    try {
      const appointments = db
        .prepare(
          "SELECT * FROM appointments ORDER BY id DESC"
        )
        .all();

      res.json(appointments);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to load appointments",
      });
    }
  }
);

/* =========================
   BOOK APPOINTMENT
========================= */

app.post(
  "/api/appointments",
  (req, res) => {
    try {
      const {
        patientName,
        age,
        phone,
        doctorId,
        doctorName,
        date,
        time,
        problem,
      } = req.body;

      console.log(
        "NEW APPOINTMENT REQUEST:"
      );

      console.log({
        patientName,
        age,
        phone,
        doctorName,
        date,
        time,
      });

      if (
        !patientName ||
        !phone ||
        !doctorName ||
        !date ||
        !time
      ) {
        return res.status(400).json({
          error:
            "Required appointment details are missing",
        });
      }

      const result = db
        .prepare(`
          INSERT INTO appointments
          (
            patientName,
            age,
            phone,
            doctorId,
            doctorName,
            date,
            time,
            problem
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          patientName,
          age || null,
          phone,
          doctorId || null,
          doctorName,
          date,
          time,
          problem || ""
        );

      const appointment = db
        .prepare(
          "SELECT * FROM appointments WHERE id = ?"
        )
        .get(result.lastInsertRowid);

      console.log(
        "APPOINTMENT SAVED:",
        appointment
      );

      console.log(
        "SMS FUNCTION CALLED"
      );

      sendAppointmentSMS(
        appointment.phone,
        appointment.patientName,
        appointment.doctorName,
        appointment.date,
        appointment.time
      );

      res.status(201).json(
        appointment
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to save appointment",
      });
    }
  }
);

/* =========================
   DELETE / CANCEL
========================= */

app.delete(
  "/api/appointments/:id",
  (req, res) => {
    try {
      const appointment = db
        .prepare(
          "SELECT * FROM appointments WHERE id = ?"
        )
        .get(req.params.id);

      if (!appointment) {
        return res.status(404).json({
          error:
            "Appointment not found",
        });
      }

      db.prepare(
        "DELETE FROM appointments WHERE id = ?"
      ).run(req.params.id);

      res.json({
        message:
          "Appointment deleted successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to delete appointment",
      });
    }
  }
);

/* =========================
   RESCHEDULE
========================= */

app.put(
  "/api/appointments/:id",
  (req, res) => {
    try {
      const {
        date,
        time,
      } = req.body;

      if (!date || !time) {
        return res.status(400).json({
          error:
            "Date and time are required",
        });
      }

      const appointment = db
        .prepare(
          "SELECT * FROM appointments WHERE id = ?"
        )
        .get(req.params.id);

      if (!appointment) {
        return res.status(404).json({
          error:
            "Appointment not found",
        });
      }

      db.prepare(`
        UPDATE appointments
        SET date = ?, time = ?
        WHERE id = ?
      `).run(
        date,
        time,
        req.params.id
      );

      const updatedAppointment =
        db
          .prepare(
            "SELECT * FROM appointments WHERE id = ?"
          )
          .get(req.params.id);

      res.json(
        updatedAppointment
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to update appointment",
      });
    }
  }
);

/* =========================
   PDF
========================= */

app.get(
  "/api/appointments/:id/pdf",
  (req, res) => {
    try {
      const appointment = db
        .prepare(
          "SELECT * FROM appointments WHERE id = ?"
        )
        .get(req.params.id);

      if (!appointment) {
        return res.status(404).json({
          error:
            "Appointment not found",
        });
      }

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=appointment-${appointment.id}.pdf`
      );

      const doc =
        new PDFDocument({
          margin: 50,
        });

      doc.pipe(res);

      doc
        .fontSize(22)
        .text(
          "SHRADDHA MULTISPECIALITY HOSPITAL",
          {
            align: "center",
          }
        );

      doc
        .fontSize(14)
        .text(
          "Appointment Slip",
          {
            align: "center",
          }
        );

      doc.moveDown(2);

      doc.fontSize(12);

      doc.text(
        `Appointment No: ${appointment.id}`
      );

      doc.text(
        `Patient Name: ${appointment.patientName}`
      );

      doc.text(
        `Age: ${appointment.age || "-"}`
      );

      doc.text(
        `Phone: ${appointment.phone}`
      );

      doc.text(
        `Doctor: ${appointment.doctorName}`
      );

      doc.text(
        `Date: ${appointment.date}`
      );

      doc.text(
        `Time: ${appointment.time}`
      );

      doc.text(
        `Problem: ${appointment.problem || "-"}`
      );

      doc.moveDown(2);

      doc.text(
        "Please arrive 10 minutes before your appointment.",
        {
          align: "center",
        }
      );

      doc.end();
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to generate PDF",
      });
    }
  }
);

/* =========================
   EXPORT EXCEL
========================= */

app.get(
  "/api/export/excel",
  async (req, res) => {
    try {
      const appointments = db
        .prepare(
          "SELECT * FROM appointments ORDER BY id DESC"
        )
        .all();

      const workbook =
        new ExcelJS.Workbook();

      const sheet =
        workbook.addWorksheet(
          "Appointments"
        );

      sheet.columns = [
        {
          header: "ID",
          key: "id",
          width: 12,
        },
        {
          header: "Patient",
          key: "patientName",
          width: 22,
        },
        {
          header: "Age",
          key: "age",
          width: 8,
        },
        {
          header: "Phone",
          key: "phone",
          width: 15,
        },
        {
          header: "Doctor",
          key: "doctorName",
          width: 25,
        },
        {
          header: "Date",
          key: "date",
          width: 15,
        },
        {
          header: "Time",
          key: "time",
          width: 12,
        },
        {
          header: "Problem",
          key: "problem",
          width: 30,
        },
      ];

      sheet.getRow(1).font = {
        bold: true,
      };

      appointments.forEach(
        (appointment) => {
          sheet.addRow(
            appointment
          );
        }
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=appointments.xlsx"
      );

      await workbook.xlsx.write(
        res
      );

      res.end();
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to export Excel",
      });
    }
  }
);

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    "================================"
  );

  console.log(
    `Hospital server running on http://localhost:${PORT}`
  );

  console.log(
    "SMS TEST MODE ENABLED"
  );

  console.log(
    "================================"
  );
});