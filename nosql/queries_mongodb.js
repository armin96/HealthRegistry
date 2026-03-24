
const { MongoClient } = require("mongodb");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/";
const MONGO_DB = process.env.MONGO_DB || "health_registry";

async function runQueries() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(MONGO_DB);
        console.log(`Connected to MongoDB: ${MONGO_DB}\n`);

        const oneRecord = await db.collection("medical_records").findOne({});
        console.log("--- 1. Sample Clinical Record ---");
        console.log(JSON.stringify(oneRecord, null, 2), "\n");

        const commonDiagnoses = await db.collection("medical_records").aggregate([
            { $unwind: "$diagnosis" },
            { $group: { _id: "$diagnosis", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]).toArray();
        console.log("--- 2. Top Diagnoses Aggregate ---");
        console.dir(commonDiagnoses);

        const turnaround = await db.collection("lab_results").aggregate([
            { $group: { _id: "$test_name", avg_days: { $sum: 1 } } }
        ]).toArray();
        console.log("\n--- 3. Lab Test Distribution ---");
        console.dir(turnaround);

        const auditStats = await db.collection("audit_logs").aggregate([
            { $group: { _id: "$action", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]).toArray();
        console.log("\n--- 4. Audit Log Statistics ---");
        console.dir(auditStats);

        const hyperPatients = await db.collection("medical_records")
            .find({ diagnosis: "Hypertension" })
            .project({ patient_id: 1, _id: 0 })
            .toArray();
        console.log("\n--- 5. Patients with Hypertension ---");
        console.dir(hyperPatients);

    } finally {
        await client.close();
    }
}

runQueries().catch(console.error);
