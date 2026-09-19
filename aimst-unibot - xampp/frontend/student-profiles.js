// AIMST University Student Profiles & Academic Structure Database
// Author: Kavyasre Kobinathan (FYP 2026)

const AIMST_FACULTIES_AND_COURSES = {
  "Faculty of Business & Management": {
    "Degree": [
      "Bachelor of Science (Hons) Management Information Systems",
      "Bachelor in Information Systems (Data Analytics) (Honours)",
      "Bachelor of Accountancy (Honours)",
      "Bachelor (Honours) in Finance and Management",
      "Bachelor (Honours) in Business and Marketing",
      "Bachelor of Science (Honours) Accounting and Finance"
    ],
    "Diploma": [
      "Diploma in Business Management",
      "Diploma in Finance"
    ],
    "Certificate": [
      "Certificate in Business Studies",
      "Certificate in Administrative Management"
    ],
    "Master": [
      "Master of Business Administration (MBA)",
      "Master of Science in Management"
    ],
    "PhD": [
      "Doctor of Philosophy (PhD) in Management"
    ]
  },
  "Faculty of Allied Health Professions": {
    "Degree": [
      "Bachelor in Nursing Science (Honours)",
      "Bachelor in Physiotherapy (Honours)",
      "Bachelor in Nursing Science (Honours) (ODL)"
    ],
    "Diploma": [
      "Diploma in Nursing",
      "Diploma in Physiotherapy",
      "Diploma in Medical and Health Science (Medical Assistant)",
      "Diploma in Occupational Safety and Health"
    ],
    "Certificate": [
      "Health Care Assistant",
      "Post Basic Perioperative Nursing",
      "Post Basic Renal Nursing",
      "Post Basic in Critical Care Nursing"
    ],
    "Master": [
      "Master of Nursing Science",
      "Master of Physiotherapy (Musculoskeletal)"
    ],
    "PhD": [
      "Doctor of Philosophy (PhD) in Allied Health Sciences"
    ]
  },
  "Faculty of Applied Sciences": {
    "Degree": [
      "Bachelor of Science (Honours) Biotechnology",
      "Bachelor of Science (Honours) Biotechnology with Entrepreneurship",
      "Bachelor of Science (Hons) Bioinformatics"
    ],
    "Diploma": [
      "Diploma in Biotechnology"
    ],
    "Certificate": [
      "Certificate in Laboratory Technology"
    ],
    "Master": [
      "MSc Biotechnology"
    ],
    "PhD": [
      "Doctor of Philosophy (Biotechnology)"
    ]
  },
  "Faculty of Dentistry": {
    "Degree": [
      "Bachelor of Dental Surgery",
      "Bachelor of Dental Technology (Honours)"
    ],
    "Diploma": [
      "Diploma in Dental Technology"
    ],
    "Certificate": [
      "Certificate in Dental Surgery Assisting"
    ],
    "Master": [
      "Master of Science (Dentistry)"
    ],
    "PhD": [
      "Doctor of Philosophy (PhD) in Dental Sciences"
    ]
  },
  "Faculty of Engineering & Computer Technology": {
    "Degree": [
      "Bachelor of Computer Science",
      "Bachelor in Software Engineering (Honours)",
      "Bachelor In Multimedia Technology (Honours)"
    ],
    "Diploma": [
      "Diploma in Electronic & Computer Engineering",
      "Diploma in Information Technology"
    ],
    "Certificate": [
      "Certificate in Information Technology & Computing"
    ],
    "Master": [
      "Master of Science in Information Technology"
    ],
    "PhD": [
      "Doctor of Philosophy (Engineering & Computing)"
    ]
  },
  "Faculty of Medicine": {
    "Degree": [
      "Bachelor of Medicine and Bachelor of Surgery (MBBS)",
      "Bachelor of Science (Hons) Biomedical Science"
    ],
    "Diploma": [
      "Diploma in Health Sciences"
    ],
    "Certificate": [
      "Certificate in Medical Sciences"
    ],
    "Master": [
      "Master in Science (Medical Biochemistry)",
      "Master in Science (Medical Physiology)",
      "Master in Science (Human Anatomy)",
      "Master of Science (Medical Microbiology)"
    ],
    "PhD": [
      "Doctor of Philosophy (Medical Microbiology)",
      "Doctor of Philosophy in Medical Physiology",
      "Doctor of Philosophy in Medical Biochemistry"
    ]
  },
  "Faculty of Pharmacy": {
    "Degree": [
      "Bachelor of Pharmacy with Honours"
    ],
    "Diploma": [
      "Diploma in Pharmacy"
    ],
    "Certificate": [
      "Certificate in Pharmacy Practice"
    ],
    "Master": [
      "Master of Pharmacy (Clinical Pharmacy)",
      "Master of Science (Pharmacy)"
    ],
    "PhD": [
      "Doctor of Philosophy (Pharmacy)"
    ]
  },
  "School of General & Foundation Studies": {
    "Foundation": [
      "Foundation in Science",
      "Foundation in Business"
    ],
    "Degree": [
      "Bachelor of General Studies (Honours)"
    ],
    "Diploma": [
      "Diploma in General Studies"
    ],
    "Certificate": [
      "Certificate in English for Academic Purposes",
      "Certificate in General Studies"
    ],
    "Master": [
      "Master of Arts in General Education"
    ],
    "PhD": [
      "Doctor of Philosophy (General Studies)"
    ]
  }
};

const INITIAL_STUDENT_PROFILES = [
  {
    id: "B25030023",
    name: "Kavyasre Kobinathan",
    email: "kavyasre@student.aimst.edu.my",
    faculty: "Faculty of Business & Management",
    level: "Degree",
    course: "Bachelor of Science (Hons) Management Information Systems",
    isHosteller: true,
    hostelBlock: "Block A",
    staircase: "Staircase 1",
    roomNo: "Room 305 (Single Room)",
    outstandingFee: 0.00,
    examTimetable: "May 12 – May 20, 2026 (Exam Hall 1, Block C)",
    examSlipStatus: "Available",
    examSlipReason: "All fees cleared. Slip ready for instant download."
  },
  {
    id: "B25030002",
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@student.aimst.edu.my",
    faculty: "Faculty of Allied Health Professions",
    level: "Degree",
    course: "Bachelor in Nursing Science (Honours)",
    isHosteller: false,
    hostelBlock: "",
    staircase: "",
    roomNo: "",
    outstandingFee: 0.00,
    examTimetable: "May 5 – May 10, 2026 (Nursing Clinical Lab 3, Block E)",
    examSlipStatus: "Available",
    examSlipReason: "All fees cleared. Slip ready for instant download."
  },
  {
    id: "B25030001",
    name: "Ahmad Firdaus",
    email: "ahmad.firdaus@student.aimst.edu.my",
    faculty: "Faculty of Business & Management",
    level: "Degree",
    course: "Bachelor of Science (Hons) Management Information Systems",
    isHosteller: true,
    hostelBlock: "Block B",
    staircase: "Staircase 2",
    roomNo: "Room 204 (Twin Sharing)",
    outstandingFee: 0.00,
    examTimetable: "May 12 – May 20, 2026 (Exam Hall 1, Block C)",
    examSlipStatus: "Available",
    examSlipReason: "All fees cleared. Slip ready for instant download."
  },
  {
    id: "B25030004",
    name: "Drishya Menon",
    email: "drishya.m@student.aimst.edu.my",
    faculty: "Faculty of Medicine",
    level: "Degree",
    course: "Bachelor of Medicine and Bachelor of Surgery (MBBS)",
    isHosteller: true,
    hostelBlock: "Block M",
    staircase: "Staircase 1",
    roomNo: "Room 104 (Single Room)",
    outstandingFee: 0.00,
    examTimetable: "June 1 – June 10, 2026 (Medical Hall 2)",
    examSlipStatus: "Available",
    examSlipReason: "All fees cleared. Slip ready for instant download."
  },
  {
    id: "B25030005",
    name: "Jason Lee Wei Lun",
    email: "jason.lee@student.aimst.edu.my",
    faculty: "Faculty of Pharmacy",
    level: "Degree",
    course: "Bachelor of Pharmacy with Honours",
    isHosteller: false,
    hostelBlock: "",
    staircase: "",
    roomNo: "",
    outstandingFee: 0.00,
    examTimetable: "June 5 – June 12, 2026 (Pharma Lab 1)",
    examSlipStatus: "Available",
    examSlipReason: "All fees cleared. Slip ready for instant download."
  },
  {
    id: "B25030006",
    name: "Priya Darshini",
    email: "priya.d@student.aimst.edu.my",
    faculty: "Faculty of Dentistry",
    level: "Degree",
    course: "Bachelor of Dental Surgery",
    isHosteller: true,
    hostelBlock: "Block D",
    staircase: "Staircase 3",
    roomNo: "Room 202 (Twin Sharing)",
    outstandingFee: 2500.00,
    examTimetable: "June 2 – June 8, 2026 (Dental Clinic Hall)",
    examSlipStatus: "Blocked",
    examSlipReason: "Outstanding tuition fee balance of RM 2,500.00 pending payment."
  },
  {
    id: "B25030007",
    name: "Muhammad Ammar",
    email: "ammar.m@student.aimst.edu.my",
    faculty: "Faculty of Engineering & Computer Technology",
    level: "Degree",
    course: "Bachelor of Computer Science",
    isHosteller: false,
    hostelBlock: "",
    staircase: "",
    roomNo: "",
    outstandingFee: 0.00,
    examTimetable: "May 25 – June 2, 2026 (Computer Lab 4)",
    examSlipStatus: "Available",
    examSlipReason: "All fees cleared. Slip ready for instant download."
  },
  {
    id: "B25030008",
    name: "Ananya Sharma",
    email: "ananya.s@student.aimst.edu.my",
    faculty: "Faculty of Applied Sciences",
    level: "Degree",
    course: "Bachelor of Science (Honours) Biotechnology",
    isHosteller: true,
    hostelBlock: "Block C",
    staircase: "Staircase 2",
    roomNo: "Room 108 (Single Room)",
    outstandingFee: 0.00,
    examTimetable: "May 28 – June 4, 2026 (Science Lab 2)",
    examSlipStatus: "Available",
    examSlipReason: "All fees cleared. Slip ready for instant download."
  },
  {
    id: "B25030009",
    name: "Tan Chee Keong",
    email: "tan.ck@student.aimst.edu.my",
    faculty: "School of General & Foundation Studies",
    level: "Foundation",
    course: "Foundation in Science",
    isHosteller: true,
    hostelBlock: "Block F",
    staircase: "Staircase 1",
    roomNo: "Room 102",
    outstandingFee: 0.00,
    examTimetable: "May 15 – May 22, 2026 (Foundation Hall A)",
    examSlipStatus: "Available",
    examSlipReason: "All fees cleared. Slip ready for instant download."
  }
];

