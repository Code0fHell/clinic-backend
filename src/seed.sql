CREATE DATABASE IF NOT EXISTS clinic_management;
USE clinic_management;

-- 1. USER
CREATE TABLE IF NOT EXISTS `user` (
  `id` CHAR(36) PRIMARY KEY,
  `username` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `full_name` VARCHAR(255),
  `date_of_birth` DATE,
  `gender` ENUM('NAM','NU','KHAC'),
  `avatar` VARCHAR(255),
  `address` TEXT,
  `phone` VARCHAR(20),
  `user_role` ENUM(
    'PATIENT','DOCTOR',
    'PHARMACIST','RECEPTIONIST','OWNER','ADMIN'
  ) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. STAFF (composition -> user)
CREATE TABLE IF NOT EXISTS `staff` (
  `id` CHAR(36) PRIMARY KEY,
  `user_id` CHAR(36) NOT NULL UNIQUE,
  `department` VARCHAR(255),
  `position` VARCHAR(255),
  `license_number` VARCHAR(100),
  `doctor_type` ENUM('CLINICAL','DIAGNOSTIC','LAB') NULL,
  `is_available` BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. PATIENT (composition -> user)
CREATE TABLE IF NOT EXISTS `patient` (
  `id` CHAR(36) PRIMARY KEY,
  `user_id` CHAR(36) UNIQUE NULL,
  `patient_full_name` VARCHAR(255),
  `patient_phone` VARCHAR(255),
  `patient_address` VARCHAR(255),
  `patient_dob` DATE,
  `patient_gender` ENUM('NAM','NU','KHAC'),
  `father_name` VARCHAR(255),
  `mother_name` VARCHAR(255),
  `father_phone` VARCHAR(20),
  `mother_phone` VARCHAR(20),
  `height` FLOAT,
  `weight` FLOAT,
  `blood_type` VARCHAR(10),
  `respiratory_rate` VARCHAR(50),
  `medical_history` TEXT,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. MEDICAL_RECORD (mới, liên kết patient + doctor)
CREATE TABLE IF NOT EXISTS `medical_record` (
  `id` CHAR(36) PRIMARY KEY,
  `patient_id` CHAR(36) NOT NULL,
  `doctor_id` CHAR(36) NULL,
  `history` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. WORK_SCHEDULE
CREATE TABLE IF NOT EXISTS `work_schedule` (
  `id` CHAR(36) PRIMARY KEY,
  `staff_id` CHAR(36) NOT NULL,
  `work_date` DATE NOT NULL,
  `start_time` DATETIME,
  `end_time` DATETIME,
  `details` TEXT,
  FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`)
) ENGINE=InnoDB;

-- 6. WORK_SCHEDULE_DETAIL (khoảng slot; không đặt FK circular với appointment)
CREATE TABLE IF NOT EXISTS `work_schedule_detail` (
  `id` CHAR(36) PRIMARY KEY,
  `schedule_id` CHAR(36),
  `slot_start` DATETIME NOT NULL,
  `slot_end` DATETIME NOT NULL,
  `is_booked` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`schedule_id`) REFERENCES `work_schedule`(`id`)
) ENGINE=InnoDB;

-- 7. APPOINTMENT (tham chiếu schedule_detail)
CREATE TABLE IF NOT EXISTS `appointment` (
  `id` CHAR(36) PRIMARY KEY,
  `doctor_id` CHAR(36),
  `patient_id` CHAR(36),
  `schedule_detail_id` CHAR(36) NULL,
  `appointment_date` DATETIME,
  `session` ENUM('MORNING','AFTERNOON'),
  `status` ENUM('CANCELLED','CHECKED_IN','COMPLETED'),
  FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`),
  FOREIGN KEY (`schedule_detail_id`) REFERENCES `work_schedule_detail`(`id`)
) ENGINE=InnoDB;

-- 8. VISIT (tham chiếu medical_record)
CREATE TABLE IF NOT EXISTS `visit` (
  `id` CHAR(36) PRIMARY KEY,
  `patient_id` CHAR(36),
  `doctor_id` CHAR(36),
  `appointment_id` CHAR(36),
  `medical_record_id` CHAR(36) NULL,
  `visit_type` ENUM('WALK_IN','APPOINTMENT'),
  `queue_number` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `checked_in_at` DATETIME,
  `completed_at` DATETIME,
  `visit_status` ENUM('CHECKED_IN','COMPLETED','CANCELLED'),
  FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointment`(`id`),
  FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. MEDICAL_TICKET
CREATE TABLE IF NOT EXISTS `medical_ticket` (
  `id` CHAR(36) PRIMARY KEY,
  `visit_id` CHAR(36),
  `barcode` VARCHAR(100) UNIQUE,
  `assigned_doctor_id` CHAR(36),
  `issued_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`visit_id`) REFERENCES `visit`(`id`),
  FOREIGN KEY (`assigned_doctor_id`) REFERENCES `staff`(`id`)
) ENGINE=InnoDB;

-- 10. INDICATION_TICKET
CREATE TABLE IF NOT EXISTS `indication_ticket` (
  `id` CHAR(36) PRIMARY KEY,
  `medical_ticket_id` CHAR(36),
  `doctor_id` CHAR(36),
  `patient_id` CHAR(36),
  `diagnosis` TEXT,
  `total_fee` DECIMAL(12,2) DEFAULT 0,
  `indication_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `barcode` VARCHAR(100) UNIQUE,
  FOREIGN KEY (`medical_ticket_id`) REFERENCES `medical_ticket`(`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`)
) ENGINE=InnoDB;

-- 11. ROOM
CREATE TABLE IF NOT EXISTS `room` (
  `id` CHAR(36) PRIMARY KEY,
  `room_name` VARCHAR(255),
  `room_type` ENUM('LAB','DIAGNOSTIC','CLINICAL'),
  `floor` INT
) ENGINE=InnoDB;

-- 12. MEDICAL_SERVICE
CREATE TABLE IF NOT EXISTS `medical_service` (
  `id` CHAR(36) PRIMARY KEY,
  `service_name` VARCHAR(255) NOT NULL,
  `service_type` ENUM('EXAMINATION','TEST','IMAGING','OTHER') DEFAULT 'EXAMINATION',
  `service_price` DECIMAL(12,2),
  `room_id` CHAR(36),
  FOREIGN KEY (`room_id`) REFERENCES `room`(`id`)
) ENGINE=InnoDB;

-- 13. SERVICE_INDICATION
CREATE TABLE IF NOT EXISTS `service_indication` (
  `id` CHAR(36) PRIMARY KEY,
  `indication_id` CHAR(36),
  `medical_service_id` CHAR(36),
  `quantity` INT DEFAULT 1,
  `queue_number` INT,
  FOREIGN KEY (`indication_id`) REFERENCES `indication_ticket`(`id`),
  FOREIGN KEY (`medical_service_id`) REFERENCES `medical_service`(`id`)
) ENGINE=InnoDB;

-- 14. IMAGE_RESULT
CREATE TABLE IF NOT EXISTS `image_result` (
  `id` CHAR(36) PRIMARY KEY,
  `indication_id` CHAR(36),
  `image_url` VARCHAR(255),
  `barcode` VARCHAR(100) UNIQUE,
  `doctor_id` CHAR(36),
  `patient_id` CHAR(36),
  `result` TEXT,
  `conclusion` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`indication_id`) REFERENCES `indication_ticket`(`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`)
) ENGINE=InnoDB;

-- 15. LAB_TEST_RESULT
CREATE TABLE IF NOT EXISTS `lab_test_result` (
  `id` CHAR(36) PRIMARY KEY,
  `indication_id` CHAR(36),
  `barcode` VARCHAR(100) UNIQUE,
  `doctor_id` CHAR(36),
  `patient_id` CHAR(36),
  `result` TEXT,
  `conclusion` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`indication_id`) REFERENCES `indication_ticket`(`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`)
) ENGINE=InnoDB;

-- 16. MEDICINE
CREATE TABLE IF NOT EXISTS `medicine` (
  `id` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(255),
  `description` TEXT,
  `price` DECIMAL(12,2),
  `category` VARCHAR(255),
  `unit` VARCHAR(50),
  `stock` INT DEFAULT 0,
  `manufacturer` VARCHAR(255),
  `expiry_date` DATE
) ENGINE=InnoDB;

-- 17. PRESCRIPTION (cập nhật: thêm medical_record_id optional)
CREATE TABLE IF NOT EXISTS `prescription` (
  `id` CHAR(36) PRIMARY KEY,
  `patient_id` CHAR(36),
  `doctor_id` CHAR(36),
  `medical_record_id` CHAR(36) NULL,
  `conclusion` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`),
  FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 18. PRESCRIPTION_DETAIL
CREATE TABLE IF NOT EXISTS `prescription_detail` (
  `id` CHAR(36) PRIMARY KEY,
  `prescription_id` CHAR(36),
  `medicine_id` CHAR(36),
  `quantity` INT,
  `dosage` VARCHAR(255),
  FOREIGN KEY (`prescription_id`) REFERENCES `prescription`(`id`),
  FOREIGN KEY (`medicine_id`) REFERENCES `medicine`(`id`)
) ENGINE=InnoDB;

-- 19. BILL
CREATE TABLE IF NOT EXISTS `bill` (
  `id` CHAR(36) PRIMARY KEY,
  `total` DECIMAL(12,2),
  `bill_type` ENUM('SERVICE','CLINICAL','MEDICINE'),
  `patient_id` CHAR(36),
  `doctor_id` CHAR(36),
  `prescription_id` CHAR(36),
  `medical_ticket_id` CHAR(36),
  `indication_ticket_id` CHAR (36),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `staff`(`id`),
  FOREIGN KEY (`prescription_id`) REFERENCES `prescription`(`id`),
  FOREIGN KEY (`medical_ticket_id`) REFERENCES `medical_ticket`(`id`),
  FOREIGN KEY (`indication_ticket_id`) REFERENCES `indication_ticket_id`(`id`)
) ENGINE=InnoDB;

-- 20. PAYMENT
CREATE TABLE IF NOT EXISTS `payment` (
  `id` CHAR(36) PRIMARY KEY,
  `bill_id` CHAR(36),
  `amount` DECIMAL(12,2),
  `payment_method` ENUM('CASH','BANK_TRANSFER', 'VIETQR'),
  `payment_status` ENUM('PENDING','SUCCESS', 'FAILED') DEFAULT 'PENDING',
  `paid_by_user_id` CHAR(36),
  `paid_by_patient_id` CHAR(36),
  `paid_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`bill_id`) REFERENCES `bill`(`id`),
  FOREIGN KEY (`paid_by_user_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`paid_by_patient_id`) REFERENCES `patient`(`id`)
) ENGINE=InnoDB;
