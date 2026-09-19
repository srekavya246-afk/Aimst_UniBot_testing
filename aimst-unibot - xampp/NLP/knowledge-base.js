// AIMST University Intelligent Chatbot Knowledge Base

const INITIAL_KNOWLEDGE_BASE = [
  {
    id: "kb-101",
    intent: "EXAM_TIMETABLE",
    question: "When is the exam timetable released?",
    examples: [
      "When is my exam timetable?",
      "Where can I see my exam schedule?",
      "When is my examination schedule?",
      "How do I check my timetable?",
      "exam timetable",
      "my exam date"
    ],
    entities: { subject: ["exam", "examination"], document: ["timetable", "schedule"] },
    negativeKeywords: ["slip", "result", "docket"],
    keywords: ["exam", "timetable", "schedule", "release", "date", "examination"],
    category: "Examination",
    response: "The examination timetable is published on the CMS portal under the Examination section. If you can not view your kindly contact to Exam Division ."
  },
  {
    id: "kb-102",
    intent: "EXAM_SLIP",
    question: "How can I view or download my exam slip?",
    examples: [
      "How do I download my exam slip?",
      "Can I get my exam docket?",
      "Where is my exam slip?",
      "Is my exam slip available?"
    ],
    entities: { subject: ["exam", "examination"], document: ["slip", "docket"], action: ["download", "view"] },
    negativeKeywords: ["timetable", "schedule", "result"],
    keywords: ["exam", "slip", "download", "view", "release", "hall", "docket"],
    category: "Examination",
    response: "If there is no outstanding tuition fee, you can view and download your exam slip on the Aimst Student Portal. If your slip is unavailable, the Exam Division may still be updating your record."
  },
  {
    id: "kb-103",
    intent: "EXAM_RESULTS",
    question: "When will semester exam results be announced?",
    examples: [
      "When are exam results released?",
      "When can I see my results?",
      "How long for exam results?"
    ],
    entities: { subject: ["exam", "examination"], document: ["result", "results", "marks", "grade", "transcript"] },
    negativeKeywords: ["timetable", "slip", "schedule", "docket"],
    keywords: ["result", "grade", "gpa", "cgpa", "marks", "transcript"],
    category: "Examination",
    response: "Exam results are released within 4 to 6 weeks after the examination period concludes. You can check your academic result directly on the Student Portal."
  },
  {
    id: "kb-104",
    intent: "TUITION_FEE_PAYMENT",
    question: "How do I pay my tuition fees?",
    examples: [
      "How do I pay my tuition?",
      "Where can I pay my fees?",
      "Can I pay my university fees online?",
      "What payment methods are available?",
      "I want to pay my tuition",
      "How do I settle my university fees?"
    ],
    entities: { subject: ["fee", "tuition"], action: ["pay", "payment", "settle"] },
    negativeKeywords: ["balance", "owe", "late", "outstanding"],
    keywords: ["tuition", "fee", "pay", "payment", "banking", "finance", "money"],
    category: "Finance",
    response: "Tuition fees can be paid via online banking transfer, credit/debit card through the online portal, or physically at the Finance Cashier Counter (Admin Block , Ground Floor). Deadlines are announced each semester."
  },
  {
    id: "kb-105",
    intent: "TUITION_FEE_LATE_PAYMENT",
    question: "What happens if tuition fee payment is delayed?",
    examples: [
      "What happens if I pay my fees late?",
      "Is there a penalty for late payment?",
      "I haven't paid my fees yet."
    ],
    entities: { subject: ["fee", "tuition"], property: ["late", "delayed", "penalty"] },
    negativeKeywords: ["balance", "owe"],
    keywords: ["late", "overdue", "deadline", "penalty", "due", "unpaid"],
    category: "Finance",
    response: "Delayed payments may incur a late payment penalty fee and prevent exam slip generation. Please contact the Finance Office if you require an installment plan."
  },
  {
    id: "kb-105_balance",
    intent: "TUITION_FEE_BALANCE",
    question: "How much is my outstanding fee?",
    examples: [
      "What is my outstanding fee?",
      "How much do I owe?",
      "What's my tuition balance?",
      "How much fee do I have to pay?"
    ],
    entities: { subject: ["fee", "tuition"], property: ["balance", "outstanding", "owe", "amount", "much"] },
    negativeKeywords: ["late", "penalty"],
    keywords: ["balance", "owe", "outstanding", "much", "amount"],
    category: "Finance",
    response: "Please provide your student matric number to check your outstanding tuition fee balance."
  },
  {
    id: "kb-106",
    intent: "HOSTEL_APPLICATION",
    question: "How do I apply for hostel accommodation?",
    examples: [
      "How do I apply for hostel?",
      "I want hostel accommodation.",
      "How can I get a hostel room?"
    ],
    entities: { subject: ["hostel", "accommodation"], action: ["apply", "get", "want"] },
    negativeKeywords: ["fee", "cost", "price", "where", "my room", "non-hosteller", "day scholar"],
    keywords: ["hostel", "apply", "accommodation", "room", "stay", "dormitory"],
    category: "Hostel",
    response: "Hostel applications are open during New Intake."
  },
  {
    id: "kb-107",
    intent: "HOSTEL_FEES",
    question: "What are the hostel fees and payment details?",
    examples: [
      "How much is hostel?",
      "What are the hostel fees?",
      "How much does hostel cost?"
    ],
    entities: { subject: ["hostel", "accommodation"], property: ["fee", "cost", "price", "much"] },
    negativeKeywords: ["apply", "where", "my room"],
    keywords: ["hostel", "fee", "rent", "cost", "price", "accommodation"],
    category: "Hostel",
    response: "Hostel fees vary by room type (single or twin sharing). Hostel fees must be paid through the Finance Office or online banking prior to key collection."
  },
  {
    id: "kb-107_room",
    intent: "HOSTEL_ROOM",
    question: "Where is my hostel room?",
    examples: [
      "Where is my hostel room?",
      "What room am I staying in?",
      "Tell me my hostel block.",
      "What is my room number?"
    ],
    entities: { subject: ["hostel", "room", "block"], property: ["where", "my", "number"] },
    negativeKeywords: ["apply", "fee", "cost", "much", "non-hosteller"],
    keywords: ["room", "block", "number", "where"],
    category: "Hostel",
    response: "Please provide your student ID so I can look up your assigned hostel block, staircase, and room number."
  },
  {
    id: "kb-115",
    intent: "NON_HOSTELLER_HOSTEL_APPLICATION",
    question: "Can Non-Hostellers apply for hostel?",
    examples: [
      "I'm a day scholar, can I apply for hostel?",
      "Can non-hostellers get hostel?",
      "I am not a hosteller. Can I apply?"
    ],
    entities: { subject: ["hostel"], property: ["non-hosteller", "day scholar", "not hosteller"] },
    negativeKeywords: ["fee", "cost", "room number"],
    keywords: ["hostel", "apply", "accommodation", "room", "stay", "dorm", "non-hosteller"],
    category: "Hostel",
    response: "Student need to contact SAD Department for hostel information. After done conversation with SAD Department student need to visit Hostel Warden."
  },
  {
    id: "kb-108",
    intent: "VEHICLE_STICKER",
    question: "How do I apply for an AIMST Car or Motorcycle sticker?",
    examples: [
      "How do I get a car sticker?",
      "Where can I apply for motorcycle sticker?",
      "I need a vehicle sticker."
    ],
    entities: { subject: ["sticker", "vehicle", "car", "motorcycle"] },
    negativeKeywords: [],
    keywords: ["vehicle", "car", "motorcycle", "sticker", "parking", "pass"],
    category: "Student Services",
    response: "Vehicle stickers can be requested at the Student Affairs Department (SAD) counter in cafeteria block level 1 left wing, after submitting copies of your MyKad Identity Number (ic), valid driving license, and student ID."
  },
  {
    id: "kb-109",
    intent: "PTPTN",
    question: "Where do I apply for PTPTN loan?",
    examples: [
      "How do I apply for PTPTN?",
      "Where can I apply for a PTPTN loan?"
    ],
    entities: { subject: ["ptptn", "loan"] },
    negativeKeywords: ["scholarship"],
    keywords: ["scholarship", "ptptn", "loan", "financial", "aid", "funding"],
    category: "Student Services",
    response: "PTPTN loan processing and university scholarship applications are handled by the Student Affairs Department (SAD) located in Block A."
  },
  {
    id: "kb-113",
    intent: "SCHOLARSHIP",
    question: "How do I apply scholarships?",
    examples: [
      "How do I apply for scholarship?",
      "Where can I get scholarship information?"
    ],
    entities: { subject: ["scholarship"] },
    negativeKeywords: ["ptptn", "loan"],
    keywords: ["scholarship", "financial", "aid", "funding"],
    category: "Scholarship",
    response: "Their are a variety of scholarships available for students at AIMST University. For more information on how to apply for scholarships, please visit the AIMST University Finance Department for more information. "
  },
  {
    id: "kb-110",
    intent: "LIBRARY_HOURS",
    question: "What are the Aimst Library operating hours?",
    examples: [
      "When does the library open?",
      "What are the library hours?",
      "Is the library open Saturday?",
      "libary timing"
    ],
    entities: { subject: ["library"], property: ["hours", "open", "close", "timing", "time"] },
    negativeKeywords: ["study area"],
    keywords: ["library", "hours", "timing", "open", "close", "weekend"],
    category: "Student Services",
    response: "Library hours: Mon–Fri 8:00 AM – 10:00 PM, Sat 9:00 AM – 6:00 PM.During public holidays Library will close.  "
  },
  {
    id: "kb-111",
    intent: "COURSE_REGISTRATION",
    question: "How do I register for courses for the new semester?",
    examples: [
      "How do I register my subjects?",
      "When can I register courses?",
      "How do I enroll for next semester?"
    ],
    entities: { subject: ["course", "subject", "semester"], action: ["register", "enroll"] },
    negativeKeywords: [],
    keywords: ["course", "registration", "enroll", "register", "subject", "enrollment"],
    category: "Academic",
    response: "Course registration opens 3 weeks before the new semester on the Student Portal or assigned Whatsapp Group. Please consult your Course Coordinator prior to finalizing your registration."
  },
  {
    id: "kb-112",
    intent: "SAD_CONTACT",
    question: "How to contact information for Student Affairs Department (SAD)?",
    examples: [
      "How do I contact SAD?",
      "Where is Student Affairs?",
      "What is the SAD phone number?"
    ],
    entities: { subject: ["sad", "student affairs"], property: ["contact", "where", "phone", "number"] },
    negativeKeywords: [],
    keywords: ["contact", "sad", "student", "affair", "phone", "email", "location"],
    category: "Student Services",
    response: "Student Affairs Department (SAD): Block A, AIMST Campus, Semeling, 08100 Bedong, Kedah. Email: studentaffairs@aimst.edu.my | Tel: +60 4-429 8000."
  },
  {
    id: "kb-114",
    intent: "STUDY_AREA_HOURS",
    question: "What are the Study Area operating hours ?",
    examples: [
      "What time is the study area open?",
      "When can I use the study area?"
    ],
    entities: { subject: ["study area"], property: ["hours", "open", "timing", "time"] },
    negativeKeywords: ["library"],
    keywords: ["study area", "hours", "timing", "open", "close", "weekend", "Saturday", "Sunday"],
    category: "Student Services",
    response: " All day 7am-12am study areas are open  in AIMST University. During public holiday Study area closed."
  }
];
