USE health_registry;


CREATE TABLE IF NOT EXISTS sql_audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    appt_id INT,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DELIMITER //
CREATE TRIGGER After_Prescription_Insert
AFTER INSERT ON prescriptions
FOR EACH ROW
BEGIN
    UPDATE appointments 
    SET status = 'completed' 
    WHERE appointment_id = NEW.appointment_id;
END //
DELIMITER ;


DELIMITER //
CREATE TRIGGER After_Appointment_Update
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO sql_audit_logs (appt_id, old_status, new_status)
        VALUES (OLD.appointment_id, OLD.status, NEW.status);
    END IF;
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE GetPatientHistory(IN p_id INT)
BEGIN
    SELECT 
        a.appointment_id, 
        a.scheduled_at, 
        d.full_name AS doctor_name, 
        pr.medication_name,
        pr.dosage
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.doctor_id
    LEFT JOIN prescriptions pr ON a.appointment_id = pr.appointment_id
    WHERE a.patient_id = p_id
    ORDER BY a.scheduled_at DESC;
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE GetDoctorStats(IN doc_id INT)
BEGIN
    SELECT 
        d.full_name,
        COUNT(DISTINCT a.appointment_id) AS total_appointments,
        COUNT(DISTINCT pr.prescription_id) AS total_prescriptions
    FROM doctors d
    LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
    LEFT JOIN prescriptions pr ON a.appointment_id = pr.appointment_id
    WHERE d.doctor_id = doc_id
    GROUP BY d.doctor_id;
END //
DELIMITER ;
