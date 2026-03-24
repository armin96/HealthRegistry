
CREATE DATABASE IF NOT EXISTS health_registry
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE health_registry;


CREATE TABLE IF NOT EXISTS departments (
    dept_id    INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)    NOT NULL,
    location   VARCHAR(150)    NOT NULL,
    phone      VARCHAR(20),
    created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  COMMENT='Hospital departments';



CREATE TABLE IF NOT EXISTS doctors (
    doctor_id      INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(150)  NOT NULL,
    specialization VARCHAR(100)  NOT NULL,
    dept_id        INT UNSIGNED  NOT NULL,
    phone          VARCHAR(20),
    email          VARCHAR(150)  NOT NULL,
    hired_at       DATE          NOT NULL,

    CONSTRAINT uq_doctors_email UNIQUE (email),
    CONSTRAINT fk_doctors_dept  FOREIGN KEY (dept_id)
        REFERENCES departments(dept_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Hospital medical staff';



CREATE TABLE IF NOT EXISTS patients (
    patient_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    date_of_birth DATE         NOT NULL,
    gender        ENUM('male','female','other') NOT NULL,
    blood_type    ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
    email         VARCHAR(150) NOT NULL,
    phone         VARCHAR(20),
    address       VARCHAR(255),
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_patients_email UNIQUE (email)
) ENGINE=InnoDB
  COMMENT='Registered patients';



CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    patient_id     INT UNSIGNED  NOT NULL,
    doctor_id      INT UNSIGNED  NOT NULL,
    scheduled_at   DATETIME      NOT NULL,
    status         ENUM('scheduled','completed','cancelled')
                                 NOT NULL DEFAULT 'scheduled',
    notes          TEXT,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id)
        REFERENCES doctors(doctor_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Patient-doctor appointment schedule';



CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    appointment_id  INT UNSIGNED  NOT NULL,
    medication_name VARCHAR(150)  NOT NULL,
    dosage          VARCHAR(100)  NOT NULL,
    frequency       VARCHAR(100)  NOT NULL,
    duration_days   SMALLINT UNSIGNED NOT NULL,
    notes           TEXT,
    issued_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_pres_duration CHECK (duration_days > 0),

    CONSTRAINT fk_pres_appt FOREIGN KEY (appointment_id)
        REFERENCES appointments(appointment_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Medications prescribed after an appointment';




CREATE INDEX idx_appt_scheduled  ON appointments(scheduled_at);
CREATE INDEX idx_appt_status     ON appointments(status);


CREATE INDEX idx_pres_medication ON prescriptions(medication_name);


CREATE INDEX idx_patients_dob    ON patients(date_of_birth);
