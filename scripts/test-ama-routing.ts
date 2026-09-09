import { retrieveRelevantKnowledge } from "../src/app/knowledge/retrievalEngine";
import { askGemini } from "../src/app/utils/geminiClient";

interface TestCase {
  id: number;
  category: string;
  query: string;
  expectedIntent?: string;
  expectedRecordType?: string;
  isUnsupported?: boolean;
}

const PHASE_1_TEST_CASES: TestCase[] = [
  {
    id: 1,
    category: "Identity",
    query: "Who are you?",
    expectedIntent: "owner_fact",
    expectedRecordType: "canonical_owner_profile"
  },
  {
    id: 2,
    category: "Role",
    query: "What do you do?",
    expectedIntent: "owner_fact",
    expectedRecordType: "canonical_owner_profile"
  },
  {
    id: 3,
    category: "Company",
    query: "Where are you currently working?",
    expectedIntent: "owner_fact",
    expectedRecordType: "canonical_owner_profile"
  },
  {
    id: 4,
    category: "Role",
    query: "What is your current role?",
    expectedIntent: "owner_fact",
    expectedRecordType: "canonical_owner_profile"
  },
  {
    id: 5,
    category: "Location",
    query: "Where are you based?",
    expectedIntent: "owner_fact",
    expectedRecordType: "canonical_owner_profile"
  },
  {
    id: 6,
    category: "Experience",
    query: "How many years of experience do you have?",
    expectedIntent: "owner_fact",
    expectedRecordType: "canonical_owner_profile"
  },
  {
    id: 7,
    category: "Chronology",
    query: "What companies have you worked at?",
    expectedIntent: "owner_fact",
    expectedRecordType: "canonical_owner_profile"
  },
  {
    id: 8,
    category: "Project / Google",
    query: "What did you do at Google?",
    expectedIntent: "project_question",
    expectedRecordType: "project_story"
  },
  {
    id: 9,
    category: "Project / Microsoft",
    query: "What are you working on at Microsoft?",
    expectedIntent: "project_question",
    expectedRecordType: "project_story"
  },
  {
    id: 10,
    category: "Project / Oracle",
    query: "What did you do at Oracle?",
    expectedIntent: "project_question",
    expectedRecordType: "project_story"
  },
  {
    id: 11,
    category: "Project / McKinsey",
    query: "What did you do at McKinsey?",
    expectedIntent: "project_question",
    expectedRecordType: "project_story"
  },
  {
    id: 12,
    category: "Background",
    query: "What is your background?",
    expectedIntent: "owner_fact",
    expectedRecordType: "canonical_owner_profile"
  },
  {
    id: 13,
    category: "Education",
    query: "What did you study?",
    expectedIntent: "owner_fact",
    expectedRecordType: "canonical_owner_profile"
  },
  {
    id: 14,
    category: "Journey Origin",
    query: "How did you get into design?",
    expectedIntent: "owner_fact",
    expectedRecordType: "canonical_owner_profile"
  },
  {
    id: 15,
    category: "Design Identity",
    query: "What kind of designer are you?",
    expectedIntent: "synthesis",
    expectedRecordType: "personal_viewpoint"
  },
  {
    id: 16,
    category: "Leadership Philosophy",
    query: "How hands-on are you as a design leader?",
    expectedIntent: "recorded_viewpoint",
    expectedRecordType: "personal_viewpoint"
  },
  {
    id: 17,
    category: "Utility / Resume",
    query: "Can I see your resume?",
    expectedIntent: "utility_intent",
    expectedRecordType: "utility"
  },
  {
    id: 18,
    category: "Utility / LinkedIn",
    query: "What’s your LinkedIn?",
    expectedIntent: "utility_intent",
    expectedRecordType: "utility"
  },
  {
    id: 19,
    category: "Utility / Contact",
    query: "How can I contact you?",
    expectedIntent: "utility_intent",
    expectedRecordType: "utility"
  },
  {
    id: 20,
    category: "Story (Text)",
    query: "Tell me your story.",
    expectedIntent: "owner_fact",
    expectedRecordType: "canonical_owner_profile"
  },
  {
    id: 21,
    category: "Story (Audio)",
    query: "Tell me your story — audio.",
    expectedIntent: "utility_intent",
    expectedRecordType: "utility"
  },
  // Two intentionally unsupported questions to verify conservative fallback
  {
    id: 22,
    category: "Unsupported (Healthcare App)",
    query: "Have you ever designed a mobile app for healthcare?",
    isUnsupported: true
  },
  {
    id: 23,
    category: "Unsupported (Video Game)",
    query: "What is your favorite video game?",
    isUnsupported: true
  }
];

async function runPhase1Tests() {
  console.log("================================================================================");
  console.log("                ASK VIKRAM — PHASE 1 CONSERVATIVE TEST SUITE                   ");
  console.log("================================================================================\n");

  let allPassed = true;

  for (const tc of PHASE_1_TEST_CASES) {
    const retrieval = retrieveRelevantKnowledge(tc.query);
    const geminiRes = await askGemini(tc.query);

    let passed = true;
    if (tc.isUnsupported) {
      const expectedFallback = "I haven’t captured enough verified detail about that yet, and I’d rather not guess. If you’d like to go deeper, feel free to contact me directly.";
      passed = geminiRes.text === expectedFallback;
    } else {
      const intentMatch = !tc.expectedIntent || retrieval.detectedIntent === tc.expectedIntent;
      const recordTypeMatch = !tc.expectedRecordType || retrieval.selectedRecordType === tc.expectedRecordType;
      passed = intentMatch && recordTypeMatch && !!geminiRes.text;
    }

    if (!passed) {
      allPassed = false;
    }

    console.log(`[Test ${tc.id}/23] ${tc.category}: "${tc.query}"`);
    console.log(`  -> detected intent:     ${retrieval.detectedIntent || "general_knowledge"}`);
    console.log(`  -> selected record type: ${retrieval.selectedRecordType || "canonical_owner_profile"}`);
    console.log(`  -> generated final answer:\n"${geminiRes.text}"\n`);
  }

  console.log("--------------------------------------------------------------------------------");
  if (allPassed) {
    console.log("🎉 ALL 23 PHASE 1 TEST CASES PASSED SUCCESSFULLY!");
  } else {
    console.log("❌ SOME TEST CASES FAILED. CHECK LOGS ABOVE.");
    process.exit(1);
  }
}

runPhase1Tests();

