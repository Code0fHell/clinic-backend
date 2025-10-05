create database clinic_management;
use clinic_management;

-- Thiết lập
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- USERS (bao gồm Owner/Admin/Receptionist/Pharmacist/Doctor v.v.)
CREATE TABLE users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  email VARCHAR(200),
  fullName VARCHAR(200),
  date_of_birth DATE,
  gender ENUM('NAM','NU','KHAC'),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_role ENUM('PATIENT', 'DOCTOR_CLINICAL', 'DOCTOR_DIAGNOSTIC', 'DOCTOR_LAB', 'PHARMACIST', 'RECEPTIONIST', 'OWNER', 'ADMIN') NOT NULL DEFAULT 'PATIENT'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PATIENT
CREATE TABLE patient (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36),
  age INT,
  nationality VARCHAR(100),
  CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- STAFF (bao gồm Doctor, Pharmacist, Receptionist trong sơ đồ)
CREATE TABLE staff (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36),
  department VARCHAR(150),
  license_number VARCHAR(100),
  hire_date DATE,
  salary DECIMAL(12,2),
  is_available BOOLEAN DEFAULT TRUE,
  position VARCHAR(100),
  CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SCHEDULE 
CREATE TABLE work_schedule (
  id CHAR(36) PRIMARY KEY,
  staff_id CHAR(36) NOT NULL,
  room_id CHAR(36) NULL,
  work_date DATE NOT NULL,
  session ENUM('MORNING', 'AFTERNOON', 'EVENING') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('AVAILABLE','ON_LEAVE','OCCUPIED') DEFAULT 'AVAILABLE',
  note VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ws_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
  CONSTRAINT fk_ws_room FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE SET NULL
);

CREATE TABLE work_schedule_detail (
  id CHAR(36) PRIMARY KEY,
  work_schedule_id CHAR(36) NOT NULL,
  slot_start TIME NOT NULL,
  slot_end TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  appointment_id CHAR(36) NULL,
  CONSTRAINT fk_wsd_ws FOREIGN KEY (work_schedule_id) REFERENCES work_schedule(id) ON DELETE CASCADE,
  CONSTRAINT fk_wsd_app FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE SET NULL
);


-- LEAVE_REQUEST (liên quan staff)
CREATE TABLE leave_request (
  id CHAR(36) NOT NULL PRIMARY KEY,
  staff_id CHAR(36),
  start_date DATE,
  end_date DATE,
  reason TEXT,
  status VARCHAR(50),
  CONSTRAINT fk_leave_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ROOM và RoomType (enum)
CREATE TABLE room (
  id CHAR(36) NOT NULL PRIMARY KEY,
  room_type ENUM('LAB','DIAGNOSTIC','CLINICAL') DEFAULT 'CLINICAL',
  floor INT,
  room_name VARCHAR(150)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MEDICAL_SERVICE và SERVICE_INDICATION
CREATE TABLE `medical_service` (
  `id` CHAR(36) NOT NULL,
  `service_name` VARCHAR(255) NOT NULL,
  `service_type` ENUM('EXAMINATION', 'TEST', 'IMAGING', 'OTHER') NOT NULL DEFAULT 'EXAMINATION',
  `service_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `unit` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `room_id` CHAR(36) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_medical_service_type` (`service_type`),
  KEY `idx_medical_service_room` (`room_id`),
  CONSTRAINT `fk_medical_service_room`
    FOREIGN KEY (`room_id`) REFERENCES `room` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `service_indication` (
  `id` CHAR(36) NOT NULL,
  `indication_ticket_id` CHAR(36) NOT NULL,
  `service_id` CHAR(36) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `performer_id` CHAR(36) DEFAULT NULL,
  `status` VARCHAR(255) DEFAULT 'PENDING',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_service_indication_ticket` (`indication_ticket_id`),
  KEY `idx_service_indication_service` (`service_id`),
  KEY `idx_service_indication_performer` (`performer_id`),
  CONSTRAINT `fk_service_indication_ticket`
    FOREIGN KEY (`indication_ticket_id`) REFERENCES `indication_ticket` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_service_indication_service`
    FOREIGN KEY (`service_id`) REFERENCES `medical_service` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_service_indication_staff`
    FOREIGN KEY (`performer_id`) REFERENCES `staff` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- APPOINTMENT (theo sơ đồ)
CREATE TABLE appointment (
  id CHAR(36) NOT NULL PRIMARY KEY,
  doctor_id CHAR(36),
  patient_id CHAR(36),
  session ENUM('MORNING','AFTERNOON'),
  appointment_date DATETIME,
  reason TEXT,
  status ENUM('CANCELLED','CHECKED_IN','COMPLETED') DEFAULT 'CHECKED_IN',
  CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE SET NULL,
  CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- VISIT (theo sơ đồ)
CREATE TABLE visit (
  id CHAR(36) NOT NULL PRIMARY KEY,
  patient_id CHAR(36),
  appointment_id CHAR(36),
  visit_type ENUM('WALK_IN','APPOINTMENT'),
  queue_number INT,
  created_by CHAR(36), -- receptionist user id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  checked_in_at DATETIME,
  completed_at DATETIME,
  visit_status ENUM('CHECKED_IN','COMPLETED','CANCELLED') DEFAULT 'CHECKED_IN',
  CONSTRAINT fk_visit_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
  CONSTRAINT fk_visit_appointment FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE SET NULL,
  CONSTRAINT fk_visit_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MEDICAL_TICKET (phiếu khám)
CREATE TABLE medical_ticket (
  id CHAR(36) NOT NULL PRIMARY KEY,
  barcode VARCHAR(200),
  ticket_number VARCHAR(100),
  patient_id CHAR(36),
  receptionist_id CHAR(36),
  referral_clinic VARCHAR(200),
  room_id CHAR(36),
  visit_id CHAR(36),
  printed_at DATETIME,
  assigned_doctor_id CHAR(36),
  CONSTRAINT fk_medticket_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE SET NULL,
  CONSTRAINT fk_medticket_receptionist FOREIGN KEY (receptionist_id) REFERENCES staff(id) ON DELETE SET NULL,
  CONSTRAINT fk_medticket_room FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE SET NULL,
  CONSTRAINT fk_medticket_visit FOREIGN KEY (visit_id) REFERENCES visit(id) ON DELETE CASCADE,
  CONSTRAINT fk_medticket_assdoc FOREIGN KEY (assigned_doctor_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INDICATION_TICKET (phiếu chỉ định)
CREATE TABLE indication_ticket (
  id CHAR(36) NOT NULL PRIMARY KEY,
  doctor_id CHAR(36),
  patient_id CHAR(36),
  room_id CHAR(36),
  service_indication VARCHAR(500),
  diagnostic VARCHAR(500),
  quantity INT,
  total_fee DECIMAL(12,2),
  ordinal_indication_number VARCHAR(100),
  barcode VARCHAR(200),
  indication_date DATETIME,
  CONSTRAINT fk_indticket_doctor FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE SET NULL,
  CONSTRAINT fk_indticket_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
  CONSTRAINT fk_indticket_room FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- LAB_ORDER & LAB_TEST_RESULTS
CREATE TABLE lab_order (
  id CHAR(36) NOT NULL PRIMARY KEY,
  indication_ticket_id CHAR(36),
  result_id CHAR(36),
  CONSTRAINT fk_laborder_indt FOREIGN KEY (indication_ticket_id) REFERENCES indication_ticket(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lab_test_results (
  id CHAR(36) NOT NULL PRIMARY KEY,
  barcode VARCHAR(200),
  doctor_id CHAR(36),
  patient_id CHAR(36),
  result TEXT,
  conclusion TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ltr_doctor FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE SET NULL,
  CONSTRAINT fk_ltr_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- IMAGING_ORDER & IMAGE_RESULT
CREATE TABLE imaging_order (
  id CHAR(36) NOT NULL PRIMARY KEY,
  indication_ticket_id CHAR(36),
  result_id CHAR(36),
  CONSTRAINT fk_imgorder_indt FOREIGN KEY (indication_ticket_id) REFERENCES indication_ticket(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE image_result (
  id CHAR(36) NOT NULL PRIMARY KEY,
  barcode VARCHAR(200),
  image_url VARCHAR(1000),
  doctor_id CHAR(36),
  result_id CHAR(36),
  patient_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_imgres_doctor FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE SET NULL,
  CONSTRAINT fk_imgres_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MEDICAL_RECORD
CREATE TABLE medical_record (
  id CHAR(36) NOT NULL PRIMARY KEY,
  patient_id CHAR(36),
  doctor_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  history TEXT,
  CONSTRAINT fk_medrec_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
  CONSTRAINT fk_medrec_doctor FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PRESCRIPTION DETAILS (bảng riêng theo sơ đồ: Prescription_Details)
CREATE TABLE prescription_details (
  id CHAR(36) NOT NULL PRIMARY KEY,
  medicines JSON -- lưu danh sách medicine + liều dạng JSON hoặc tham chiếu
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PRESCRIPTIONS
CREATE TABLE prescriptions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  instruction TEXT,
  patient_id CHAR(36),
  doctor_id CHAR(36),
  return_date VARCHAR(100),
  details_id CHAR(36), -- FK -> prescription_details
  CONSTRAINT fk_presc_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE SET NULL,
  CONSTRAINT fk_presc_doctor FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE SET NULL,
  CONSTRAINT fk_presc_details FOREIGN KEY (details_id) REFERENCES prescription_details(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MEDICINES
CREATE TABLE medicines (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(200),
  price DECIMAL(12,2),
  category VARCHAR(100),
  pharmacist_id CHAR(36),
  cost DECIMAL(12,2),
  register_number VARCHAR(100),
  dose VARCHAR(100),
  unit VARCHAR(50),
  usage_str VARCHAR(200),
  expiry_date DATE,
  manufacturer VARCHAR(200),
  stock INT DEFAULT 0,
  CONSTRAINT fk_medicine_pharmacist FOREIGN KEY (pharmacist_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- BILL và các enum BillType
CREATE TABLE bill (
  id CHAR(36) NOT NULL PRIMARY KEY,
  total DECIMAL(12,2),
  indication_id CHAR(36),
  prescriptions_id CHAR(36),
  receptionist_id CHAR(36),
  barcode VARCHAR(200),
  patient_id CHAR(36),
  doctor_id CHAR(36),
  billType ENUM('SERVICE','CLINICAL','MEDICINE'),
  medical_ticket_id CHAR(36),
  CONSTRAINT fk_bill_indication FOREIGN KEY (indication_id) REFERENCES indication_ticket(id) ON DELETE SET NULL,
  CONSTRAINT fk_bill_prescription FOREIGN KEY (prescriptions_id) REFERENCES prescriptions(id) ON DELETE SET NULL,
  CONSTRAINT fk_bill_receptionist FOREIGN KEY (receptionist_id) REFERENCES staff(id) ON DELETE SET NULL,
  CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE SET NULL,
  CONSTRAINT fk_bill_doctor FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE SET NULL,
  CONSTRAINT fk_bill_medticket FOREIGN KEY (medical_ticket_id) REFERENCES medical_ticket(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PAYMENT và enum trạng thái/phương thức
CREATE TABLE payment (
  id CHAR(36) NOT NULL PRIMARY KEY,
  bill_id CHAR(36),
  amount DECIMAL(12,2),
  paymentMethod ENUM('BANK_TRANSFER','CASH'),
  paymentStatus ENUM('PENDING','SUCCESS'),
  paid_by CHAR(36),
  paid_at DATETIME,
  CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id) REFERENCES bill(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_user FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE form_templates (
  id CHAR(36) NOT NULL PRIMARY KEY,
  owner_id CHAR(36), -- user id (OWNER/ADMIN)
  template_name VARCHAR(200) NOT NULL,
  template_type ENUM('MEDICAL_TICKET','INDICATION_TICKET','BILL','CONSENT','OTHER') DEFAULT 'OTHER',
  template_content JSON, 
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_form_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE appointment
  ADD COLUMN work_schedule_detail_id CHAR(36) NULL,
  ADD CONSTRAINT fk_appointment_slot FOREIGN KEY (work_schedule_detail_id)
  REFERENCES work_schedule_detail(id) ON DELETE SET NULL;


-- Index cho appointments
ALTER TABLE appointment
  ADD INDEX idx_appointment_patient (patient_id),
  ADD INDEX idx_appointment_doctor (doctor_id),
  ADD INDEX idx_appointment_date (appointment_date);

-- Index cho visit
ALTER TABLE visit
  ADD INDEX idx_visit_patient (patient_id),
  ADD INDEX idx_visit_status (visit_status),
  ADD INDEX idx_visit_created_at (created_at);

-- Index cho medical_ticket
ALTER TABLE medical_ticket
  ADD INDEX idx_medticket_visit (visit_id),
  ADD INDEX idx_medticket_ticket_number (ticket_number),
  ADD INDEX idx_medticket_assigned_doctor (assigned_doctor_id);

-- Index cho indication_ticket
ALTER TABLE indication_ticket
  ADD INDEX idx_indticket_patient (patient_id),
  ADD INDEX idx_indticket_doctor (doctor_id),
  ADD INDEX idx_indticket_room (room_id);

-- Index cho lab_order & imaging_order
ALTER TABLE lab_order
  ADD INDEX idx_laborder_indticket (indication_ticket_id);

ALTER TABLE imaging_order
  ADD INDEX idx_imgorder_indticket (indication_ticket_id);

-- Index cho lab_test_results / image_result
ALTER TABLE lab_test_results
  ADD INDEX idx_ltr_patient (patient_id),
  ADD INDEX idx_ltr_doctor (doctor_id),
  ADD INDEX idx_ltr_created_at (created_at);

ALTER TABLE image_result
  ADD INDEX idx_imgres_patient (patient_id),
  ADD INDEX idx_imgres_doctor (doctor_id),
  ADD INDEX idx_imgres_created_at (created_at);

-- Index cho prescriptions
ALTER TABLE prescriptions
  ADD INDEX idx_presc_patient (patient_id),
  ADD INDEX idx_presc_doctor (doctor_id);

-- Index cho medicines
ALTER TABLE medicines
  ADD INDEX idx_medicines_name (name);

-- Index cho bill & payment
ALTER TABLE bill
  ADD INDEX idx_bill_patient (patient_id),
  ADD INDEX idx_bill_status (billType, id);

ALTER TABLE payment
  ADD INDEX idx_payment_bill (bill_id),
  ADD INDEX idx_payment_paid_at (paid_at),
  ADD INDEX idx_payment_status (paymentStatus);

-- Index cho users/staff
ALTER TABLE users
  ADD INDEX idx_users_role (user_role);

ALTER TABLE staff
  ADD INDEX idx_staff_department (department);

ALTER TABLE work_schedule
  ADD INDEX idx_ws_staff_date (staff_id, work_date),
  ADD INDEX idx_ws_room (room_id),
  ADD INDEX idx_ws_status (status);

ALTER TABLE work_schedule_detail
  ADD INDEX idx_wsd_schedule (work_schedule_id),
  ADD INDEX idx_wsd_booked (is_booked);


-- Trigger -- 
DELIMITER $$

-- Trigger tăng số thứ tự 
CREATE TRIGGER visit_before_insert_queue
BEFORE INSERT ON visit
FOR EACH ROW
BEGIN
  IF NEW.queue_number IS NULL OR NEW.queue_number = 0 THEN
    -- Lấy queue_number lớn nhất của ngày hôm nay rồi +1
    SELECT COALESCE(MAX(queue_number), 0) + 1 INTO @next_q
      FROM visit
      WHERE DATE(created_at) = DATE(NOW());
    SET NEW.queue_number = @next_q;
  END IF;
END$$

-- Trigger tăng số medical_ticket
CREATE TRIGGER medticket_before_insert_ticketnumber
BEFORE INSERT ON medical_ticket
FOR EACH ROW
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    SET NEW.ticket_number = CONCAT(
      'MT-',
      DATE_FORMAT(NOW(), '%Y%m%d'),
      '-',
      LEFT(REPLACE(UUID(),'-',''),8)
    );
  END IF;
END$$

-- Trigger cập nhật trạng thái bill
CREATE TRIGGER payment_after_insert_update_bill
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
  DECLARE paid_sum DECIMAL(12,2);
  -- tổng các payment success (hoặc tất cả, tùy business)
  SELECT COALESCE(SUM(amount),0) INTO paid_sum FROM payment
    WHERE bill_id = NEW.bill_id AND paymentStatus = 'SUCCESS';

  -- Cập nhật trạng thái bill nếu đủ tiền
  IF paid_sum >= (SELECT COALESCE(total,0) FROM bill WHERE id = NEW.bill_id) THEN
    UPDATE bill
      SET status = 'PAID',
          paid_at = NOW()
      WHERE id = NEW.bill_id;
  END IF;
END$$

DELIMITER $$

CREATE TRIGGER trg_appointment_after_insert
AFTER INSERT ON appointment
FOR EACH ROW
BEGIN
  IF NEW.work_schedule_detail_id IS NOT NULL THEN
    UPDATE work_schedule_detail
    SET is_booked = TRUE,
        appointment_id = NEW.id
    WHERE id = NEW.work_schedule_detail_id;
  END IF;
END$$

CREATE TRIGGER trg_appointment_after_delete
AFTER DELETE ON appointment
FOR EACH ROW
BEGIN
  IF OLD.work_schedule_detail_id IS NOT NULL THEN
    UPDATE work_schedule_detail
    SET is_booked = FALSE,
        appointment_id = NULL
    WHERE id = OLD.work_schedule_detail_id;
  END IF;
END$$
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
