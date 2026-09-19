// AIMST University Intelligent Chatbot NLP Engine
// Supports Student Context Personalization & Intent-Based NLP

class ChatbotEngine {
  constructor(knowledgeBase = []) {
    this.knowledgeBase = knowledgeBase;
    this.stopWords = new Set([
      "is", "the", "a", "an", "and", "or", "to", "in", "at", "for", "of", "on", 
      "with", "by", "from", "when", "where", "how", "what", "which", "who", "why",
      "can", "could", "would", "should", "do", "does", "did", "please", "tell",
      "me", "my", "i", "you", "your", "we", "us", "about", "get", "view", "find",
      "are", "am", "there", "their", "it", "they"
    ]);
    
    // Maintain simple session context
    this.currentSession = {
      lastIntent: null,
      lastEntities: {},
      lastCategory: null
    };
    
    this.greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "greetings"];
    this.helpRequests = ["what can you do", "how can you help me", "what can i ask you", "help me", "help"];
  }

  updateKnowledgeBase(newKb) {
    this.knowledgeBase = newKb;
  }

  normalizeText(text) {
    let normalized = text.toLowerCase()
      .replace(/[^\w\s]/gi, ' ') // replace punctuation with space
      .replace(/\s+/g, ' ')      // remove extra spaces
      .trim();
      
    // Common student abbreviations/typos
    const replacements = {
      "tution": "tuition",
      "tution fee": "tuition fee",
      "uni": "university",
      "shedule": "schedule",
      "libary": "library",
      "ptptn loan": "ptptn",
      "hostel apply": "hostel application",
      "fee pay": "fee payment"
    };
    
    for (const [key, val] of Object.entries(replacements)) {
      if (normalized.includes(key)) {
        normalized = normalized.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
      }
    }
    
    return normalized;
  }

  tokenize(text) {
    if (!text) return [];
    return text.split(' ').filter(word => word.length > 1 && !this.stopWords.has(word));
  }

  extractEntities(normalizedText) {
    const extracted = {};
    const text = normalizedText;
    
    if (text.includes("my") || text.includes("me") || text.includes("i ")) {
      extracted.scope = "personal";
    }
    
    if (text.includes("how much") || text.includes("cost") || text.includes("price") || text.includes("balance") || text.includes("owe")) {
      extracted.property = "cost_or_balance";
    }
    
    if (text.includes("where") || text.includes("location") || text.includes("room")) {
      extracted.property = "location";
    }
    
    if (text.includes("when") || text.includes("time") || text.includes("hours") || text.includes("schedule") || text.includes("date")) {
      extracted.property = "time";
    }
    
    if (text.includes("apply") || text.includes("register") || text.includes("enroll")) {
      extracted.action = "apply_register";
    }
    
    if (text.includes("pay") || text.includes("settle") || text.includes("payment")) {
      extracted.action = "pay";
    }
    
    if (text.includes("download") || text.includes("view") || text.includes("see") || text.includes("check")) {
      extracted.action = "view_download";
    }
    
    return extracted;
  }

  processQuery(userQuery, studentProfile = null) {
    if (!userQuery || !userQuery.trim()) {
      return {
        matched: false,
        response: "Please type a question regarding AIMST University student services.",
        confidence: 0,
        suggested: this.getSuggestions()
      };
    }

    const cleanInput = this.normalizeText(userQuery);
    const tokens = this.tokenize(cleanInput);
    
    // --- 1. GREETING SUPPORT ---
    if (this.greetings.includes(cleanInput) || (tokens.length === 1 && this.greetings.includes(tokens[0]))) {
      const name = studentProfile && studentProfile.name ? studentProfile.name : "there";
      return {
        matched: true,
        category: "General",
        response: `Hello ${name}! 👋 How can I help you with AIMST student services today?`,
        confidence: 100
      };
    }
    
    // --- 2. GENERAL HELP ---
    if (this.helpRequests.some(hr => cleanInput.includes(hr))) {
      return {
        matched: true,
        category: "General",
        response: `I can help you with many AIMST topics, including:<br/>
        • Exam timetable, slips, and results<br/>
        • Tuition fees and payments<br/>
        • Hostel applications and rooms<br/>
        • Vehicle stickers<br/>
        • PTPTN and Scholarships<br/>
        • Library and Study Area hours<br/>
        • Course registration<br/>
        • Contacting Student Affairs (SAD)<br/><br/>
        What would you like to know?`,
        confidence: 100
      };
    }

    // --- 3. INTENT CLASSIFICATION ---
    const entities = this.extractEntities(cleanInput);
    
    // Check if it's a short follow-up using session context
    let isFollowUp = false;
    if (tokens.length <= 3 && this.currentSession.lastIntent) {
       isFollowUp = true;
    }

    let bestMatch = null;
    let highestScore = 0;
    const scores = [];

    for (const item of this.knowledgeBase) {
      let score = 0;
      let conflictPenalty = 0;

      // Match intent examples
      if (item.examples) {
        for (const ex of item.examples) {
          const normEx = this.normalizeText(ex);
          if (cleanInput === normEx) {
            score += 50; // Exact match is very strong
          } else if (cleanInput.includes(normEx) || normEx.includes(cleanInput)) {
            score += 20;
          }
        }
      } else {
        // Fallback for admin added kb items without examples
        const itemQuestionLower = this.normalizeText(item.question);
        if (cleanInput.includes(itemQuestionLower) || itemQuestionLower.includes(cleanInput)) {
          score += 30;
        }
      }

      // Negative keywords penalty
      if (item.negativeKeywords) {
        for (const nk of item.negativeKeywords) {
          if (cleanInput.includes(this.normalizeText(nk))) {
            conflictPenalty += 50; // Heavy penalty
          }
        }
      }

      // Entity matching bonus
      if (item.entities) {
        let matchedEntities = 0;
        for (const [key, values] of Object.entries(item.entities)) {
          for (const val of values) {
            if (cleanInput.includes(this.normalizeText(val))) {
              matchedEntities++;
              score += 15;
              break;
            }
          }
        }
        if (matchedEntities > 0) score += matchedEntities * 5;
      }
      
      // Keyword matching (legacy/fallback)
      const keywords = item.keywords || [];
      let kwMatches = 0;
      for (const token of tokens) {
        for (const kw of keywords) {
          const kwLower = kw.toLowerCase();
          if (token === kwLower) {
            kwMatches++;
            score += 5;
          } else if (token.includes(kwLower) || kwLower.includes(token)) {
            kwMatches += 0.5;
            score += 2;
          }
        }
      }
      if (kwMatches > 0) score += 5;

      // Context bonus for follow-ups
      if (isFollowUp && this.currentSession.lastIntent === item.intent) {
        score += 25;
      } else if (isFollowUp && this.currentSession.lastCategory === item.category) {
        score += 10;
      }

      const finalScore = score - conflictPenalty;
      
      if (finalScore > 0) {
        scores.push({ item, score: finalScore });
      }

      if (finalScore > highestScore) {
        highestScore = finalScore;
        bestMatch = item;
      }
    }
    
    // Sort scores descending
    scores.sort((a, b) => b.score - a.score);

    // --- 4. CONFIDENCE EVALUATION ---
    if (scores.length === 0 || highestScore < 10) {
      return {
        matched: false,
        isError: true,
        response: "I'm sorry, that information is not available in the current AIMST knowledge base. You can try rephrasing your question or contacting the Student Affairs Department.",
        confidence: 0,
        suggested: this.getSuggestions()
      };
    }

    const topScore = scores[0].score;
    const secondScore = scores.length > 1 ? scores[1].score : 0;
    
    // Clarification needed if top two are close and score isn't super high
    if (scores.length > 1 && (topScore - secondScore < 10) && topScore < 40) {
      return {
        matched: false,
        isClarification: true,
        response: `I can help with that. Do you mean "${scores[0].item.question}" or "${scores[1].item.question}"?`,
        confidence: 45
      };
    }

    // --- 5. PERSONALIZED STUDENT RESPONSES ---
    // If we confidently matched an intent, check if it has a personalized override
    const intent = bestMatch.intent || "UNKNOWN";
    
    // Update session context
    this.currentSession.lastIntent = intent;
    this.currentSession.lastCategory = bestMatch.category;
    this.currentSession.lastEntities = entities;

    if (studentProfile) {
      if (intent === "TUITION_FEE_BALANCE") {
        const fee = parseFloat(studentProfile.outstandingFee || 0);
        if (fee > 0) {
          return {
            matched: true,
            category: bestMatch.category,
            confidence: 95,
            response: `Hello <strong>${studentProfile.name}</strong>! According to AIMST records for <em>${studentProfile.faculty}</em>, your current outstanding tuition balance is <strong style="color:var(--danger)">RM ${fee.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong>. Please settle your payment via online banking or at Finance Office (Block C, Level 2).`
          };
        } else {
          return {
            matched: true,
            category: bestMatch.category,
            confidence: 95,
            response: `Hi <strong>${studentProfile.name}</strong>! You have <strong style="color:var(--success)">NO outstanding tuition fees (RM 0.00)</strong>. All payments for <em>${studentProfile.faculty}</em> are fully up to date!`
          };
        }
      }

      if (intent === "EXAM_TIMETABLE") {
        return {
          matched: true,
          category: bestMatch.category,
          confidence: 95,
          response: `Hi <strong>${studentProfile.name}</strong>! Here is your official examination timetable for <strong>${studentProfile.faculty}</strong>:<br/><br/>📍 <strong>Schedule & Venue:</strong> ${studentProfile.examTimetable}`
        };
      }

      if (intent === "EXAM_SLIP") {
        if (studentProfile.examSlipStatus === 'Available') {
          return {
            matched: true,
            category: bestMatch.category,
            isSlipAction: true,
            confidence: 95,
            response: `Good news <strong>${studentProfile.name}</strong>! Your exam slip for <em>${studentProfile.course}</em> is <strong style="color:var(--success)">AVAILABLE FOR DOWNLOAD IN CMS AIMST PORTAL.</strong>`
          };
        } else {
          return {
            matched: true,
            category: bestMatch.category,
            confidence: 95,
            response: `Notice for <strong>${studentProfile.name}</strong>: Your exam slip is currently <strong style="color:var(--danger)">BLOCKED</strong>.<br/><br/>⚠️ <strong>Reason:</strong> ${studentProfile.examSlipReason || 'Pending fee clearance.'}`
          };
        }
      }

      if (intent === "HOSTEL_ROOM") {
        const isHosteller = studentProfile.isHosteller === true || studentProfile.isHosteller === 'true';
        if (isHosteller) {
          return {
            matched: true,
            category: bestMatch.category,
            confidence: 95,
            response: `Hello <strong>${studentProfile.name}</strong>! Your assigned campus accommodation details:<br/><br/>🏠 <strong>Hostel Status:</strong> <span style="color:var(--success); font-weight:700;">Hosteller</span><br/>🏢 <strong>Block:</strong> ${studentProfile.hostelBlock || 'N/A'}<br/>🪜 <strong>Staircase:</strong> ${studentProfile.staircase || 'N/A'}<br/>🚪 <strong>Room Number:</strong> ${studentProfile.roomNo || 'N/A'}`
          };
        } else {
          return {
            matched: true,
            category: bestMatch.category,
            confidence: 95,
            response: `Hello <strong>${studentProfile.name}</strong>!<br/><br/>🚗 <strong>Hostel Status:</strong> <span style="color:var(--text-muted); font-weight:700;">Non-Hosteller (Day Scholar / Off-Campus)</span><br/>You do not have campus accommodation assigned. If you wish to apply for hostel accommodation, please contact the Student Affairs Department (SAD) or email <a href="mailto:hostel@aimst.edu.my">hostel@aimst.edu.my</a>.`
          };
        }
      }
    }

    // --- 6. STANDARD RESPONSE ---
    return {
      matched: true,
      matchedItem: bestMatch,
      category: bestMatch.category,
      response: bestMatch.response,
      score: topScore,
      confidence: Math.min(100, Math.round((topScore / (topScore + 20)) * 100))
    };
  }

  getSuggestions(limit = 4) {
    if (!this.knowledgeBase || this.knowledgeBase.length === 0) return [];
    return this.knowledgeBase.slice(0, limit).map(item => ({
      id: item.id,
      question: item.question,
      category: item.category
    }));
  }
}
