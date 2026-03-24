const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const sql = require('./sqlOperations');
const nosql = require('./nosqlOperations');

const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', async (req, res) => {
  try {
    const totalPatients = await sql.getTotalPatients();
    const totalDoctors = await sql.getTotalDoctors();
    const recentAppointments = await sql.getRecentAppointments(5);
    const recentAuditLogs = await nosql.getAuditLogs(5);
    const topDoctors = await sql.getTopDoctors(3);

    res.render('index', {
      title: 'Dashboard — Health Registry',
      stats: {
        patients: totalPatients,
        doctors: totalDoctors,
        appointments: recentAppointments.length
      },
      appointments: recentAppointments,
      auditLogs: recentAuditLogs,
      topDoctors
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard data.");
  }
});


app.get('/patients', async (req, res) => {
  try {
    const patients = await sql.getAllPatients();
    res.render('patients', {
      title: 'Patient Explorer — Health Registry',
      patients
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading patient list.");
  }
});


app.get('/patients/:id', async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const patient = await sql.getPatientById(patientId);

    if (!patient) return res.status(404).send("Patient not found.");

    // Clinical History from MongoDB
    const records = await nosql.getMedicalRecordsByPatient(patientId);
    const labs = await nosql.getLabResultsByPatient(patientId);

    res.render('patient-detail', {
      title: `Patient: ${patient.full_name}`,
      patient,
      records,
      labs
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading patient details.");
  }
});


app.get('/audit', async (req, res) => {
  try {
    const nosqlLogs = await nosql.getAuditLogs(20);
    const sqlLogs = await sql.getSqlAuditLogs(20);
    res.render('audit', {
      title: 'Audit Trail — Health Registry',
      nosqlLogs,
      sqlLogs
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading audit logs.");
  }
});


app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Health Registry Dashboard Running!`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
