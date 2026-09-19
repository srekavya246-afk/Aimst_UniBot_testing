-- ==========================================================================
-- AIMST UNIVERSITY UNIBOT DATABASE SCHEMA (Normalized 3NF MySQL Database)
-- Author: Kavyasre Kobinathan (FYP 2026)
-- Target Database: MySQL / MariaDB (InnoDB Engine, UTF-8)
-- ==========================================================================

CREATE DATABASE IF NOT EXISTS `aimst_unibot_db`;
USE `aimst_unibot_db`;

-- Disable Foreign Key Checks for Clean Table Re-creation
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Feedback`;
DROP TABLE IF EXISTS `Chat_History`;
DROP TABLE IF EXISTS `Knowledge_Base`;
DROP TABLE IF EXISTS `Student`;
DROP TABLE IF EXISTS `Course`;
DROP TABLE IF EXISTS `Admin`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------------
-- Table 1: Course Table (Academic Programmes)
-- --------------------------------------------------------------------------
CREATE TABLE `Course` (
  `course_id` VARCHAR(50) NOT NULL,
  `course_name` VARCHAR(150) NOT NULL,
  `faculty` VARCHAR(150) NOT NULL,
  `level` VARCHAR(50) DEFAULT 'Undergraduate',
  `duration` VARCHAR(50) DEFAULT '3-4 Years',
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------------
-- Table 2: Student Table (Student Records & Hostel Allocation)
-- --------------------------------------------------------------------------
CREATE TABLE `Student` (
  `student_id` VARCHAR(50) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `faculty` VARCHAR(150) NOT NULL,
  `level` VARCHAR(50) DEFAULT 'Undergraduate',
  `course_id` VARCHAR(50) DEFAULT NULL,
  `course` VARCHAR(150) NOT NULL,
  `is_hosteller` TINYINT(1) DEFAULT 1,
  `hostel_block` VARCHAR(50) DEFAULT '',
  `staircase` VARCHAR(50) DEFAULT '',
  `room_no` VARCHAR(50) DEFAULT '',
  `outstanding_fee` DECIMAL(10,2) DEFAULT 0.00,
  `exam_timetable` VARCHAR(255) DEFAULT '',
  `exam_slip_status` VARCHAR(50) DEFAULT 'Available',
  `exam_slip_reason` TEXT DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `idx_student_email` (`email`),
  CONSTRAINT `fk_student_course` FOREIGN KEY (`course_id`) REFERENCES `Course` (`course_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------------
-- Table 3: Knowledge_Base Table (FAQ Queries & NLP Keyword Matching)
-- --------------------------------------------------------------------------
CREATE TABLE `Knowledge_Base` (
  `knowledge_id` VARCHAR(50) NOT NULL,
  `question` VARCHAR(255) NOT NULL,
  `keywords` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `response` TEXT NOT NULL,
  PRIMARY KEY (`knowledge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------------
-- Table 4: Chat_History Table (Student Chat Logs & Conversation Turns)
-- --------------------------------------------------------------------------
CREATE TABLE `Chat_History` (
  `chat_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `question` TEXT NOT NULL,
  `response` TEXT NOT NULL,
  `date_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `turns` INT DEFAULT 1,
  PRIMARY KEY (`chat_id`),
  CONSTRAINT `fk_chathistory_student` FOREIGN KEY (`student_id`) REFERENCES `Student` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------------
-- Table 5: Admin Table (Administrator Credentials)
-- --------------------------------------------------------------------------
CREATE TABLE `Admin` (
  `admin_id` VARCHAR(50) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `idx_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------------
-- Table 6: Feedback Table (Student Response Ratings & Feedback)
-- --------------------------------------------------------------------------
CREATE TABLE `Feedback` (
  `feedback_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `comment` TEXT DEFAULT NULL,
  `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `date_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedback_id`),
  CONSTRAINT `fk_feedback_student` FOREIGN KEY (`student_id`) REFERENCES `Student` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================================
-- INITIAL MYSQL SEED DATA INSERTION (ALL 8 AIMST FACULTIES)
-- ==========================================================================

-- 1. Insert Courses
INSERT INTO `Course` (`course_id`, `course_name`, `faculty`, `level`, `duration`) VALUES
('CRS-FND-SCI', 'Foundation in Science', 'School of General & Foundation Studies', 'Foundation', '1 Year'),
('CRS-FND-BUS', 'Foundation in Business', 'School of General & Foundation Studies', 'Foundation', '1 Year'),
('CRS-AHP-HCA', 'Health Care Assistant', 'Faculty of Allied Health Professions', 'Short Courses (Certificate)', '6 Months'),
('CRS-AHP-DMA', 'Diploma in Medical and Health Science (Medical Assistant)', 'Faculty of Allied Health Professions', 'Diploma', '3 Years'),
('CRS-AHP-DOSH', 'Diploma in Occupational Safety and Health', 'Faculty of Allied Health Professions', 'Diploma', '3 Years'),
('CRS-AHP-DNUR', 'Diploma in Nursing', 'Faculty of Allied Health Professions', 'Diploma', '3 Years'),
('CRS-AHP-DPHY', 'Diploma in Physiotherapy', 'Faculty of Allied Health Professions', 'Diploma', '3 Years'),
('CRS-AHP-BNUR', 'Bachelor in Nursing Science (Honours)', 'Faculty of Allied Health Professions', 'Undergraduate', '4 Years'),
('CRS-AHP-BPHY', 'Bachelor in Physiotherapy (Honours)', 'Faculty of Allied Health Professions', 'Undergraduate', '4 Years'),
('CRS-APS-DBIO', 'Diploma in Biotechnology', 'Faculty of Applied Sciences', 'Diploma', '2.5 Years'),
('CRS-APS-BBIO', 'Bachelor of Science (Honours) Biotechnology', 'Faculty of Applied Sciences', 'Undergraduate', '3 Years'),
('CRS-APS-BINF', 'Bachelor of Science (Hons) Bioinformatics', 'Faculty of Applied Sciences', 'Undergraduate', '3 Years'),
('CRS-BUS-DBM', 'Diploma in Business Management', 'Faculty of Business & Management', 'Diploma', '2 Years'),
('CRS-BUS-MIS', 'Bachelor of Science (Hons) Management Information Systems', 'Faculty of Business & Management', 'Undergraduate', '3 Years'),
('CRS-BUS-ACC', 'Bachelor of Accountancy (Honours)', 'Faculty of Business & Management', 'Undergraduate', '4 Years'),
('CRS-DEN-BDS', 'Bachelor of Dental Surgery', 'Faculty of Dentistry', 'Undergraduate', '5 Years'),
('CRS-ENG-DCS', 'Diploma in Electronic & Computer Engineering', 'Faculty of Engineering & Computer Technology', 'Diploma', '2.5 Years'),
('CRS-ENG-BCS', 'Bachelor of Computer Science', 'Faculty of Engineering & Computer Technology', 'Undergraduate', '3 Years'),
('CRS-ENG-SWE', 'Bachelor in Software Engineering (Honours)', 'Faculty of Engineering & Computer Technology', 'Undergraduate', '3.5 Years'),
('CRS-MED-MBBS', 'Bachelor of Medicine and Bachelor of Surgery (MBBS)', 'Faculty of Medicine', 'Undergraduate', '5 Years'),
('CRS-MED-BMS', 'Bachelor of Science (Hons) Biomedical Science', 'Faculty of Medicine', 'Undergraduate', '4 Years'),
('CRS-PHAR-BPH', 'Bachelor of Pharmacy with Honours', 'Faculty of Pharmacy', 'Undergraduate', '4 Years');

-- 2. Insert Admin Credentials
INSERT INTO `Admin` (`admin_id`, `username`, `password`) VALUES
('ADM-001', 'admin', 'admin123');

-- 3. Insert Initial Students (Non-Destructive UPSERT Pattern)
INSERT INTO `Student` (`student_id`, `student_name`, `email`, `faculty`, `level`, `course_id`, `course`, `is_hosteller`, `hostel_block`, `staircase`, `room_no`, `outstanding_fee`, `exam_timetable`, `exam_slip_status`, `exam_slip_reason`) VALUES
('B25030023', 'Kavyasre Kobinathan', 'kavyasre@student.aimst.edu.my', 'Faculty of Business & Management', 'Undergraduate', 'CRS-BUS-MIS', 'Bachelor of Science (Hons) Management Information Systems', 1, 'Block A', 'Staircase 1', 'Room 305 (Single Room)', 0.00, 'May 12 – May 20, 2026 (Exam Hall 1, Block C)', 'Available', 'All fees cleared. Slip ready for instant download.'),
('B25030002', 'Siti Nurhaliza', 'siti.nurhaliza@student.aimst.edu.my', 'Faculty of Allied Health Professions', 'Undergraduate', 'CRS-AHP-BNUR', 'Bachelor in Nursing Science (Honours)', 0, '', '', '', 0.00, 'May 5 – May 10, 2026 (Nursing Clinical Lab 3, Block E)', 'Available', 'All fees cleared. Slip ready for instant download.'),
('B25030001', 'Ahmad Firdaus', 'ahmad.firdaus@student.aimst.edu.my', 'Faculty of Business & Management', 'Undergraduate', 'CRS-BUS-MIS', 'Bachelor of Science (Hons) Management Information Systems', 1, 'Block B', 'Staircase 2', 'Room 204 (Twin Sharing)', 0.00, 'May 12 – May 20, 2026 (Exam Hall 1, Block C)', 'Available', 'All fees cleared. Slip ready for instant download.'),
('B25030004', 'Drishya Menon', 'drishya.m@student.aimst.edu.my', 'Faculty of Medicine', 'Undergraduate', 'CRS-MED-MBBS', 'Bachelor of Medicine and Bachelor of Surgery (MBBS)', 1, 'Block M', 'Staircase 1', 'Room 104 (Single Room)', 0.00, 'June 1 – June 10, 2026 (Medical Hall 2)', 'Available', 'All fees cleared. Slip ready for instant download.')
ON DUPLICATE KEY UPDATE 
  `student_name` = VALUES(`student_name`),
  `email` = VALUES(`email`),
  `faculty` = VALUES(`faculty`),
  `level` = VALUES(`level`),
  `course` = VALUES(`course`),
  `outstanding_fee` = VALUES(`outstanding_fee`),
  `exam_slip_status` = VALUES(`exam_slip_status`),
  `exam_slip_reason` = VALUES(`exam_slip_reason`);

-- 4. Insert Knowledge Base FAQs
INSERT INTO `Knowledge_Base` (`knowledge_id`, `question`, `keywords`, `category`, `response`) VALUES
('kb-101', 'When is the exam timetable released?', 'exam, timetable, schedule, release, date, examination', 'Examination', 'The examination timetable is published on the university portal under the Examination section, typically two (2) weeks before the exam period commences.'),
('kb-102', 'How can I view or download my exam slip?', 'exam, slip, download, view, release, hall, docket', 'Examination', 'If there is no outstanding tuition fee, you can view and download your exam slip on the Student Portal. If your slip is unavailable, the Exam Division may still be updating your record.'),
('kb-103', 'When will semester exam results be announced?', 'result, grade, gpa, cgpa, marks, transcript', 'Examination', 'Exam results are released within 4 to 6 weeks after the examination period concludes. You can check your academic transcript directly on the Student Portal.'),
('kb-104', 'How do I pay my tuition fees?', 'tuition, fee, pay, payment, banking, finance, money', 'Finance', 'Tuition fees can be paid via online banking transfer, credit/debit card through the online portal, or physically at the Finance Office (Block C, Level 2). Deadlines are announced each semester.'),
('kb-105', 'What happens if tuition fee payment is delayed?', 'late, overdue, deadline, penalty, due, unpaid', 'Finance', 'Delayed payments may incur a late payment penalty fee and prevent exam slip generation. Please contact the Finance Office if you require an installment plan.'),
('kb-106', 'How do I apply for hostel accommodation?', 'hostel, apply, accommodation, room, stay, dormitory', 'Hostel', 'Hostel applications for the new academic year open in March on the Student Portal. Rooms are allocated on a first-come basis. For enquiries, contact hostel@aimst.edu.my.'),
('kb-107', 'What are the hostel fees and payment details?', 'hostel, fee, rent, cost, price, accommodation', 'Hostel', 'Hostel fees vary by room type (single or twin sharing). Hostel fees must be paid through the Finance Office or online banking prior to key collection.'),
('kb-108', 'How do I apply for an AIMST Car or Motorcycle sticker?', 'vehicle, car, motorcycle, sticker, parking, pass', 'Student Services', 'Vehicle stickers can be requested at the Student Affairs Department (SAD) counter in cafeteria block level 1 left wing, after submitting copies of your MyKad Identity Number (ic), valid driving license, and student ID.'),
('kb-109', 'Where do I apply for PTPTN loan or scholarships?', 'scholarship, ptptn, loan, financial, aid, funding', 'Student Services', 'PTPTN loan processing and university scholarship applications are handled by the Student Affairs Department (SAD) located in Block A.'),
('kb-110', 'What are the Central Library operating hours?', 'library, hours, timing, open, close, weekend', 'Student Services', 'Library hours: Mon–Fri 8:00 AM – 10:00 PM, Sat 9:00 AM – 6:00 PM. 24-hour study areas are open during examination weeks.')
('kb-111', 'Non-Hostellers can apply for hostel ?', 'hostel, non-hosteller, hosteller, hostel application','Students should contact the SAD Department for information regarding hostel matters. After speaking with the SAD Department, students should visit the Hostel Warden.' ); 
