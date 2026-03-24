const mysql = require("mysql2/promise");
const { MongoClient } = require("mongodb");
const { MYSQL_CFG, MONGO_URI, MONGO_DB } = require("./config");
const crypto = require("crypto");

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const uuid = () => crypto.randomUUID();


const FIRSTS = [

    "Ali", "Zahra", "Reza", "Fatemeh", "Hassan", "Hossein", "Mehdi", "Sara", "Narges", "Maryam", "Saeed", "Negar", "Amir", "Sina", "Mina", "Shirin", "Farhad", "Roya", "Kaveh", "Arash", "Babak", "Anahita", "Bijan", "Donya", "Ehsan", "Fereydoon", "Gilda", "Hasti", "Iraj", "Jaleh",

    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra",

    "Hans", "Ingrid", "Luca", "Giulia", "Jean", "Mathilde", "Carlos", "Elena", "Sven", "Astrid", "Piotr", "Natalia", "Dimitri", "Olga", "Jordi", "Montserrat", "Klaus", "Heidi", "Marco", "Francesca",

    "Wei", "Li", "Hiroshi", "Yuki", "Arjun", "Priya", "Ji-hoon", "Seo-yeon", "Chen", "Mei", "Satoshi", "Akiko", "Rohan", "Anjali", "Min-ho", "Ji-won", "Thanh", "Linh", "Somchai", "Malee"
];
const LASTS = [

    "Ahmadi", "Rezaei", "Karimi", "Mousavi", "Hosseini", "Najafi", "Ghasemi", "Moradi", "Nazari", "Hashemi", "Soltani", "Fathi", "Pahlavi", "Zandi", "Afshar", "Qajar", "Safavi", "Sassani", "Madani", "Tehrani", "Shirazi", "Isfahani", "Tabrizi", "Khorasani", "Yazdi", "Hamadani", "Rashti", "Mazandarani", "Gilani", "Loristani",

    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",

    "Wang", "Zhang", "Sato", "Suzuki", "Kumar", "Singh", "Kim", "Park", "Nguyen", "Tran", "Tan", "Lim", "Gupta", "Sharma", "YAMAMOTO", "Nakamura", "Li", "Liu", "Chen", "Yang"
];
const SPECS = ["Cardiologist", "Neurologist", "Pediatrician", "Surgeon", "GP", "Radiologist", "Oncologist", "Dermatologist", "Psychiatrist", "Orthopedist"];

async function run() {
    console.log(">>> FINAL GLOBALIZED UNIQUE RESET <<<");
    let sql;
    try {
        sql = await mysql.createConnection({ ...MYSQL_CFG, database: "" });
        await sql.query(`DROP DATABASE IF EXISTS ${MYSQL_CFG.database}`);
        await sql.query(`CREATE DATABASE ${MYSQL_CFG.database} CHARACTER SET utf8mb4`);
        await sql.changeUser({ database: MYSQL_CFG.database });

        await sql.query("CREATE TABLE departments (dept_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100))");
        await sql.query("CREATE TABLE doctors (doctor_id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(100), specialization VARCHAR(100), dept_id INT, FOREIGN KEY (dept_id) REFERENCES departments(dept_id))");
        await sql.query("CREATE TABLE patients (patient_id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(100), date_of_birth DATE, gender VARCHAR(20), blood_type VARCHAR(5), email VARCHAR(100) UNIQUE, phone VARCHAR(50))");
        await sql.query("CREATE TABLE appointments (appointment_id INT AUTO_INCREMENT PRIMARY KEY, patient_id INT, doctor_id INT, scheduled_at DATETIME, status VARCHAR(20), FOREIGN KEY (patient_id) REFERENCES patients(patient_id), FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id))");
        await sql.query("CREATE TABLE prescriptions (prescription_id INT AUTO_INCREMENT PRIMARY KEY, appointment_id INT, medication_name VARCHAR(100), dosage VARCHAR(100), frequency VARCHAR(100), duration_days INT, notes TEXT, FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE)");
        await sql.query("CREATE TABLE sql_audit_logs (log_id INT AUTO_INCREMENT PRIMARY KEY, appt_id INT, old_status VARCHAR(20), new_status VARCHAR(20), changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");


        const d_ids = [];
        for (let i = 0; i < 160; i++) {
            const [r] = await sql.query("INSERT INTO departments (name) VALUES (?)", [`Medical Center Section ${i + 1}`]);
            d_ids.push(r.insertId);
        }


        const doc_ids = [];
        const uniqueDocs = new Set();
        while (uniqueDocs.size < 185) {
            uniqueDocs.add("Dr. " + pick(FIRSTS) + " " + pick(LASTS));
        }
        for (const name of uniqueDocs) {
            const [r] = await sql.query("INSERT INTO doctors (full_name, specialization, dept_id) VALUES (?, ?, ?)", [name, pick(SPECS), pick(d_ids)]);
            doc_ids.push(r.insertId);
        }


        const pat_ids = [];
        const uniquePats = new Set();
        while (uniquePats.size < 255) {
            uniquePats.add(pick(FIRSTS) + " " + pick(LASTS));
        }
        let pIdx = 0;
        for (const name of uniquePats) {
            const email = `pat_${pIdx}_${uuid().substr(0, 4)}@health.com`;
            const blood = pick(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']);
            const [r] = await sql.query("INSERT INTO patients (full_name, date_of_birth, gender, blood_type, email) VALUES (?, '1990-01-01', ?, ?, ?)", [name, pIdx % 2 ? 'male' : 'female', blood, email]);
            pat_ids.push(r.insertId);
            pIdx++;
        }


        const a_ids = [];
        for (let i = 0; i < 285; i++) {
            const [r] = await sql.query("INSERT INTO appointments (patient_id, doctor_id, scheduled_at, status) VALUES (?, ?, NOW(), 'scheduled')", [pick(pat_ids), pick(doc_ids)]);
            a_ids.push(r.insertId);
        }


        for (let i = 0; i < 210; i++) {
            await sql.query("INSERT INTO prescriptions (appointment_id, medication_name, dosage, frequency, duration_days, notes) VALUES (?, ?, '10mg', 'Daily', 30, 'Standard')", [pick(a_ids), "Med-" + rand(1, 500)]);
        }


        for (let i = 0; i < 175; i++) {
            await sql.query("INSERT INTO sql_audit_logs (appt_id, old_status, new_status) VALUES (?, 'scheduled', 'completed')", [pick(a_ids)]);
        }

        const m = new MongoClient(MONGO_URI);
        await m.connect();
        const db = m.db(MONGO_DB);
        const cols = ["clinical_history", "test_reports", "system_audit"];
        for (const c of cols) {
            await db.collection(c).drop().catch(() => { });
        }

        const clinicalData = Array.from({ length: rand(180, 220) }).map(() => ({
            patient_id: pick(pat_ids),
            doctor_id: pick(doc_ids),
            visit_date: new Date(Date.now() - rand(0, 10000000000)),
            chief_complaint: pick(["Headache", "Fever", "Cough", "Back Pain", "Fatigue", "Nausea"]),
            diagnosis: [pick(["Migraine", "Flu", "Bronchitis", "Muscle Strain", "Anemia", "Gastritis"])],
            vitals: {
                blood_pressure: `${rand(110, 140)}/${rand(70, 90)}`,
                heart_rate: rand(60, 100),
                weight_kg: rand(50, 100)
            }
        }));
        await db.collection("clinical_history").insertMany(clinicalData);

        const labData = Array.from({ length: rand(180, 220) }).map(() => ({
            patient_id: pick(pat_ids),
            doctor_id: pick(doc_ids),
            test_name: pick(["Complete Blood Count", "Lipid Panel", "Metabolic Panel", "Liver Function"]),
            status: pick(["final", "pending", "completed"]),
            ordered_at: new Date(Date.now() - rand(1000000, 10000000000)),
            resulted_at: new Date(),
            results: {
                "WBC": (rand(40, 110)/10).toString() + " K/uL",
                "RBC": (rand(40, 60)/10).toString() + " M/uL",
                "Hemoglobin": rand(12, 18).toString() + " g/dL"
            }
        }));
        await db.collection("test_reports").insertMany(labData);

        const auditData = Array.from({ length: rand(180, 220) }).map(() => ({
            actor_id: pick(doc_ids),
            actor_role: pick(["Admin", "Nurse", "Doctor"]),
            timestamp: new Date(),
            action: pick(["Check-in", "Vitals Update", "History Review", "Lab Upload"]),
            target_type: "System",
            info: "Seeded"
        }));
        await db.collection("system_audit").insertMany(auditData);
        // Create Indexes for Performance (as claimed in the report)
        console.log("Creating NoSQL Indexes...");
        await db.collection("clinical_history").createIndex({ patient_id: 1 });
        await db.collection("test_reports").createIndex({ patient_id: 1 });
        await db.collection("system_audit").createIndex({ actor_id: 1, timestamp: -1 });

        await m.close();
        console.log("SUCCESS: 100% UNIQUE GLOBALIZED DATA READY.");

    } catch (e) { console.error("FAILED:", e); process.exit(1); }
    finally { if (sql) await sql.end(); process.exit(0); }
}
run();
