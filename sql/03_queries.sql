
USE health_registry;


INSERT INTO patients (full_name, date_of_birth, gender, blood_type, email, phone, address)
VALUES ('Alice Carter', '1990-04-15', 'female', 'A+', 'alice.carter@example.com', '+49-176-11223344', 'Hauptstrasse 12, 10115 Berlin');

INSERT INTO doctors (full_name, specialization, dept_id, phone, email, hired_at)
VALUES ('Dr. Marcus Webb', 'Dermatology', 1, '+49-30-55667788', 'marcus.webb@healthdb.de', '2022-09-01');


INSERT INTO appointments (patient_id, doctor_id, scheduled_at, status, notes)
VALUES (1, 1, '2026-04-10 09:00:00', 'scheduled', 'Routine annual check-up');

INSERT INTO prescriptions (appointment_id, medication_name, dosage, frequency, duration_days, notes)
VALUES (LAST_INSERT_ID(), 'Amoxicillin', '500 mg', 'Three times daily', 7, 'Take with food. Complete the full course.');


SELECT d.doctor_id, d.full_name, d.specialization, COUNT(a.appointment_id) AS total_appts
FROM doctors d LEFT JOIN appointments a ON d.doctor_id = a.doctor_id AND MONTH(a.scheduled_at) = MONTH(CURDATE())
GROUP BY d.doctor_id ORDER BY total_appts DESC;


SELECT dep.name, COUNT(a.appointment_id) AS total_appts
FROM departments dep JOIN doctors d ON dep.dept_id = d.dept_id LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
GROUP BY dep.name ORDER BY total_appts DESC;

SELECT p.full_name, COUNT(a.appointment_id) AS visits
FROM patients p JOIN appointments a ON p.patient_id = a.patient_id WHERE a.status = 'completed'
GROUP BY p.full_name HAVING visits > 3 ORDER BY visits DESC;
