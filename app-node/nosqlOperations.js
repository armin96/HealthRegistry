

const { MongoClient, ObjectId } = require("mongodb");
const { MONGO_URI, MONGO_DB } = require("./config");
const { v4: uuidv4 } = require("crypto").webcrypto
  ? { v4: () => crypto.randomUUID() }  // Node 19+
  : require("crypto");


function newId() {
  return require("crypto").randomUUID
    ? require("crypto").randomUUID()
    : require("crypto").randomBytes(16).toString("hex");
}

async function getDb() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  return { client, db: client.db(MONGO_DB) };
}



async function createMedicalRecord({ patientId, doctorId, chiefComplaint, diagnosis, vitals, treatmentPlan, attachments = [] }) {
  const { client, db } = await getDb();
  const doc = {
    record_id: newId(),
    patient_id: patientId,
    doctor_id: doctorId,
    visit_date: new Date(),
    chief_complaint: chiefComplaint,
    diagnosis,
    vitals,
    treatment_plan: treatmentPlan,
    attachments,
  };
  await db.collection("clinical_history").insertOne(doc);
  await client.close();
  return doc.record_id;
}

async function getPatientRecords(patientId) {
  const { client, db } = await getDb();
  const records = await db.collection("clinical_history")
    .find({ patient_id: patientId }, { projection: { _id: 0 } })
    .sort({ visit_date: -1 })
    .toArray();
  await client.close();
  return records;
}

async function createLabResult({ patientId, doctorId, testName, results, status = "final", notes = null }) {
  const { client, db } = await getDb();
  const doc = {
    lab_id: newId(),
    patient_id: patientId,
    ordered_by_doctor_id: doctorId,
    test_name: testName,
    ordered_at: new Date(),
    resulted_at: new Date(),
    results,
    status,
    notes,
  };
  await db.collection("test_reports").insertOne(doc);
  await client.close();
  return doc.lab_id;
}

async function getPatientLabs(patientId) {
  const { client, db } = await getDb();
  const labs = await db.collection("test_reports")
    .find({ patient_id: patientId }, { projection: { _id: 0 } })
    .sort({ resulted_at: -1 })
    .toArray();
  await client.close();
  return labs;
}

async function logAction({ actorId, actorRole, action, targetType, targetId, metadata = {} }) {
  const { client, db } = await getDb();
  await db.collection("system_audit").insertOne({
    actor_id: actorId,
    actor_role: actorRole,
    action,
    target_type: targetType,
    target_id: String(targetId),
    timestamp: new Date(),
    metadata,
  });
  await client.close();
}

async function getAuditTrail(actorId, limit = 10) {
  const { client, db } = await getDb();
  const logs = await db.collection("system_audit")
    .find({ actor_id: actorId }, { projection: { _id: 0 } })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  await client.close();
  return logs;
}


async function topDiagnoses(limit = 5) {
  const { client, db } = await getDb();
  const result = await db.collection("clinical_history").aggregate([
    { $unwind: "$diagnosis" },
    { $group: { _id: "$diagnosis", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]).toArray();
  await client.close();
  return result;
}

async function avgLabTurnaround() {
  const { client, db } = await getDb();
  const result = await db.collection("test_reports").aggregate([
    { $match: { status: "final" } },
    {
      $project: {
        test_name: 1,
        turnaround_hours: {
          $divide: [{ $subtract: ["$resulted_at", "$ordered_at"] }, 3_600_000]
        }
      }
    },
    {
      $group: {
        _id: "$test_name",
        avg_hours: { $avg: "$turnaround_hours" },
        total_tests: { $sum: 1 },
      }
    },
    { $sort: { avg_hours: 1 } },
  ]).toArray();
  await client.close();
  return result;
}


async function getAuditLogs(limit = 10) {
  const { client, db } = await getDb();
  const logs = await db.collection("system_audit")
    .find({}, { projection: { _id: 0 } })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  await client.close();
  return logs;
}

async function getMedicalRecordsByPatient(patientId) {
  return getPatientRecords(patientId);
}

async function getLabResultsByPatient(patientId) {
  return getPatientLabs(patientId);
}


module.exports = {
  createMedicalRecord, getPatientRecords,
  createLabResult, getPatientLabs,
  logAction, getAuditTrail,
  topDiagnoses, avgLabTurnaround,
  getAuditLogs, getMedicalRecordsByPatient, getLabResultsByPatient
};
