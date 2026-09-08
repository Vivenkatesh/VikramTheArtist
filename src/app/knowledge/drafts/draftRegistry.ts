/**
 * Owner Interview Workflow — Draft Registry & Gap Tracker
 * Version: 2026.1.0
 * 
 * Standing Rules:
 * - Treat answers as personal design experience and perspective rather than company truth.
 * - Use "I", not "we".
 * - Never infer confidential research, internal strategy, metrics, roadmap, or customer data.
 * - Abstract sensitive project details into design problems, constraints, decisions, trade-offs, principles, or lessons.
 */

import { OwnerInterviewDraft, KnowledgeCoverageGap } from "./draftTypes";

export const INTERVIEW_DRAFTS: OwnerInterviewDraft[] = [
  // ── DRAFT 1: Microsoft Copilot & Behavioral Adoption ──
  {
    id: "draft-msft-blank-canvas",
    createdAt: "2026-09-09T00:59:00Z",
    updatedAt: "2026-09-09T01:02:00Z",
    targetProjectOrTopic: "Microsoft Copilot & Viva Engage: Behavioral Adoption",
    questionAsked: "In rolling out Copilot adoption across Viva Engage and Teams, what was an initial design assumption or feature idea that real user behavior or early customer research proved completely wrong? What specific friction did employees actually hit, and what did you personally design to turn that around?",
    originalAnswer: `One assumption I had early in the project was that giving people better access to Copilot use cases and prompts would be enough to help them adopt it.

What became more interesting to me was the gap between understanding what AI could do and actually knowing what to do with it in a real moment of work.

I started seeing the problem less as “How do I explain Copilot better?” and more as “What is stopping someone from taking the next meaningful action?”

The biggest friction I focused on was the blank-canvas moment. Someone may be interested in AI and may even understand its value, but when they arrive at an empty prompt box they still have to translate a vague possibility into a specific task, formulate the right request, and decide whether the result will actually help them. That is a surprisingly large cognitive step.

As the lead designer, my response was to move away from designing only for discovery and education and toward designing for behavioral progression. I explored contextual starting points, task-relevant scenarios, prompt starters, recommendations, examples from other people, and experiences that reduced the amount of interpretation required before someone could experience value.

The important shift in my thinking was that I stopped treating adoption as a feature-discovery problem. I began treating it as a behavioral design problem.

That eventually influenced how I think about adoption more broadly: awareness, intent, first use, proficiency, and habit formation are different design problems. If someone is stuck at one of those stages, adding more education or more features does not necessarily solve it.

My takeaway as a designer was simple: don’t design for whether people understand the capability; design for whether they can confidently take the next action.`,
    firstPersonVersion: `Early in the project, one assumption I carried was that making relevant use cases and prompts easier to discover would naturally make it easier for people to start using AI.

What I became increasingly interested in was the gap between understanding what AI could do and knowing what to do with it in a real moment of work.

I came to think of this as the 'blank-canvas moment.' When someone arrives at an open prompt field, they still have to interpret the capability, connect it to a task, decide how to phrase the request, and judge whether the effort will be worthwhile. From a design perspective, that is a meaningful amount of cognitive work before value is experienced.

That changed how I approached the problem. Instead of thinking primarily about discovery or education, I started thinking about how the experience could make the next action more obvious and easier to take.

As lead designer, I explored approaches such as contextual starting points, task-relevant scenarios, prompt starters, examples, and other forms of guidance that reduced the amount of interpretation required at the beginning of the experience.

The broader lesson I took away was that awareness, intent, first use, proficiency, and habit formation are different design problems. Someone can understand a capability and still struggle to turn that understanding into behavior.

That experience later influenced how I thought about adoption more broadly and contributed to the principles behind my ADOPT framework.

My core principle became: 'Don’t design only for whether people understand the capability. Design for whether they can confidently take the next action.'`,
    extractedFactualClaims: [
      {
        claim: "Served as Lead Designer exploring Copilot adoption experiences in Microsoft Viva Engage.",
        category: "role",
        status: "verified"
      },
      {
        claim: "Observed that discovering prompts was not sufficient to bridge the gap between understanding AI capability and knowing what to do in a live work context.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Came to see the 'blank-canvas moment' as one of the most important frictions in the experience.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Shifted personal design approach from discovery/education toward contextual starting points, task-relevant scenarios, and lower-interpretation guidance.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Used this design experience to later inform personal thinking on behavioral adoption progression and the principles behind the ADOPT framework.",
        category: "technical",
        status: "verified"
      }
    ],
    decisionAndTradeOff: {
      decision: "Shifted personal design emphasis from generic prompt catalogs and educational discovery toward contextual starting points, task-relevant scenarios, and guided entry points.",
      tradeOff: "Focused design exploration on lowering initial cognitive friction rather than attempting to comprehensively explain the full breadth of model capabilities up front.",
      alternativesRejected: [
        "Relying primarily on broad prompt libraries and feature discovery (required too much cognitive translation before value was felt)"
      ]
    },
    reflectionOrViewpoint: "Awareness, intent, first use, proficiency, and habit formation are different design problems. Someone can understand a capability and still struggle to turn that understanding into behavior. Core principle: 'Don’t design only for whether people understand the capability. Design for whether they can confidently take the next action.'",
    visitorQuestionsAnswered: [
      "What was a key friction point you observed when designing for Copilot adoption?",
      "What is the blank-canvas moment in AI design?",
      "What influenced your thinking behind the ADOPT framework?",
      "How do you approach the difference between AI feature discovery and user habit formation?"
    ],
    missingEvidenceAndSensitivities: {
      missingEvidence: [
        "Publicly shareable diagrams or conceptual sketches showing contextual prompt starters vs open text fields."
      ],
      sensitiveDetailsForReview: [
        "Verified: Contains zero confidential research findings, internal roadmap items, customer names, or proprietary telemetry. Strictly focused on personal design observation, judgment, and methodology."
      ]
    },
    status: "approved",
    publishedTargetCollection: "personal_viewpoints",
    ownerNotes: "Approved by owner for live knowledge migration."
  },

  // ── DRAFT 2: Google Cloud & Anthos: Essential Complexity vs Simplicity ──
  {
    id: "draft-google-essential-complexity",
    createdAt: "2026-09-09T01:03:00Z",
    updatedAt: "2026-09-09T01:03:00Z",
    targetProjectOrTopic: "Google Cloud (Anthos & Cloud Security): Essential Complexity",
    questionAsked: "During your work on Anthos or Cloud Security, what was a constraint or complexity that changed how you approached the design? How did you adapt your thinking while still protecting usability, and what did that experience teach you about designing technically complex enterprise products?",
    originalAnswer: `One of the biggest complexities I dealt with in Anthos and later in Cloud Security was designing for systems that were inherently technical, layered, and interconnected.

Early in my enterprise design work, I sometimes assumed that the best way to make a complex system usable was to simplify the interface as much as possible. Over time, I learned that simplification can become misleading if it hides relationships or system state that users actually need in order to make confident decisions.

That changed my approach. I stopped asking, “How do I make this look simpler?” and started asking, “What complexity is essential for the user to understand, and what complexity can the product absorb on their behalf?”

In practice, that meant spending more time on information architecture, progressive disclosure, system hierarchy, status and dependency relationships, and helping users move between overview and detail without losing context.

One trade-off I often made was resisting the temptation to collapse everything into a single simplified surface. In technically complex products, I found that experienced users sometimes need depth and precision more than visual minimalism. My role as a designer was not to remove that depth, but to structure it so the user could access the right level of complexity at the right moment.

That experience changed how I think about enterprise UX. I no longer see complexity itself as the enemy. Unstructured complexity is the problem.

My responsibility as a design leader is to create a model of the system that is understandable enough for people to reason about, while still respecting the reality of the underlying product.

That became one of my broader design principles: simplify the experience, not the truth of the system.`,
    firstPersonVersion: `One of the biggest complexities I dealt with in Anthos and later in Cloud Security was designing for systems that were inherently technical, layered, and interconnected.

Early in my enterprise design work, I sometimes assumed that the best way to make a complex system usable was to simplify the interface as much as possible. Over time, I learned that simplification can become misleading if it hides relationships or system state that users actually need in order to make confident decisions.

That changed my approach. I stopped asking, “How do I make this look simpler?” and started asking, “What complexity is essential for the user to understand, and what complexity can the product absorb on their behalf?”

In practice, that meant spending more time on information architecture, progressive disclosure, system hierarchy, status and dependency relationships, and helping users move between overview and detail without losing context.

One trade-off I often made was resisting the temptation to collapse everything into a single simplified surface. In technically complex products, I found that experienced users sometimes need depth and precision more than visual minimalism. My role as a designer was not to remove that depth, but to structure it so the user could access the right level of complexity at the right moment.

That experience changed how I think about enterprise UX. I no longer see complexity itself as the enemy. Unstructured complexity is the problem.

My responsibility as a design leader is to create a model of the system that is understandable enough for people to reason about, while still respecting the reality of the underlying product.

That became one of my broader design principles: simplify the experience, not the truth of the system.`,
    extractedFactualClaims: [
      {
        claim: "Worked on Anthos and Cloud Security design challenges at Google Cloud, dealing with inherently technical, multi-layered, interconnected systems.",
        category: "role",
        status: "verified"
      },
      {
        claim: "Challenged the assumption that visual oversimplification is the optimal path for complex enterprise infrastructure.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Framed the core design problem around distinguishing essential complexity (which users need to see to make decisions) from accidental complexity (which the system can absorb).",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Applied information architecture, progressive disclosure, and dependency mapping to allow users to navigate between high-level overviews and granular technical depth without context loss.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Formulated the foundational design principle: 'Simplify the experience, not the truth of the system.'",
        category: "technical",
        status: "verified"
      }
    ],
    decisionAndTradeOff: {
      decision: "Resisted collapsing technical depth into a single flat or visually minimal surface, choosing instead to structure depth through progressive disclosure, clear hierarchies, and explicit status/dependency relationships.",
      tradeOff: "Accepted higher interface information density and multi-layered views over superficial visual minimalism, prioritizing the precision and trust required by expert technical operators.",
      alternativesRejected: [
        "Collapsing system state into ultra-simplified consumer-style dashboards (risked hiding vital dependency states and eroding expert confidence)"
      ]
    },
    reflectionOrViewpoint: "Complexity itself is not the enemy; unstructured complexity is the problem. A design leader's responsibility is to build an understandable mental model of the system that respects the reality of the underlying product rather than obscuring it. Core principle: 'Simplify the experience, not the truth of the system.'",
    visitorQuestionsAnswered: [
      "How do you design for technically complex or developer-focused enterprise products?",
      "What is your philosophy on simplicity versus depth in enterprise UX?",
      "What was your core design takeaway from working on Anthos and Google Cloud Security?",
      "How do you prevent oversimplification from breaking technical workflows?"
    ],
    missingEvidenceAndSensitivities: {
      missingEvidence: [
        "Publicly shareable conceptual architecture sketches illustrating progressive disclosure or dependency mapping."
      ],
      sensitiveDetailsForReview: [
        "Verified: Strictly abstracted into universal systems design principles, information architecture trade-offs, and personal design lessons. Zero proprietary cloud security code, architecture blueprints, or internal Google telemetry."
      ]
    },
    status: "approved",
    publishedTargetCollection: "personal_viewpoints",
    ownerNotes: "Approved by owner for live knowledge migration."
  },

  // ── DRAFT 3: Leadership & Craft: Interrogating Strategy Through Interaction ──
  {
    id: "draft-leadership-craft-interrogate",
    createdAt: "2026-09-09T01:04:30Z",
    updatedAt: "2026-09-09T01:04:30Z",
    targetProjectOrTopic: "Design Leadership & Hands-on Craft: Interrogating Strategy",
    questionAsked: "Could you share a concrete situation where moving between high-level strategic direction and rolling up your sleeves into hands-on interaction craft made a decisive difference?",
    originalAnswer: `One situation that reinforced this for me was when the strategic direction of a product was broadly understood, but the actual experience was still not converging.

At a high level, everyone could agree on the intent. But once that intent reached the interaction layer, different interpretations started appearing. The problem was no longer lack of strategy; it was that the strategy had not yet become tangible enough to expose its trade-offs.

In moments like that, I tend to move closer to the craft myself.

I’ll work through the information hierarchy, key interaction states, flows, or a prototype—not because I need to personally own the final UI, but because a tangible design can reveal things that a strategy document cannot.

What I’ve found is that once people can react to an actual experience, the conversation becomes much more precise. Instead of discussing whether something should feel “simple,” “intelligent,” or “integrated,” we can ask much better questions: What does the user need to understand here? What should happen automatically? Where does the user need control? What is the right level of disclosure? What happens when the ideal path breaks?

That hands-on exploration often feeds back into the strategy. Sometimes an interaction exposes an assumption that sounded reasonable at the roadmap level but does not hold up when you try to make it usable. At that point, I am not just refining the UI; I am using craft to test the product thinking itself.

That is how I think about the relationship between leadership and craft. I do not see them as two ends of a spectrum where becoming more strategic means becoming less hands-on.

My role is to move between levels of resolution.

At one moment I may be shaping the product direction, aligning people around the problem, or defining principles. At another, I may go deep into a critical interaction because that is where the ambiguity actually lives.

I stay hands-on selectively, especially in the moments where the design artifact itself can create clarity, unlock a decision, or help the team see the problem differently.

The principle I have carried forward is:

“I use craft not only to execute strategy, but to interrogate it.”`,
    firstPersonVersion: `One dynamic that has consistently reinforced how I lead is when the strategic direction of a product is broadly understood, but the actual experience fails to converge.

At a high level, everyone can agree on strategic intent. But once that intent reaches the interaction layer, conflicting interpretations inevitably appear. The problem is rarely a lack of strategy; it is that abstract strategy has not yet become tangible enough to expose its trade-offs.

In moments like that, I move closer to the craft myself.

I will work through the information hierarchy, key interaction states, flows, or a prototype—not because I need to personally own the final UI, but because a tangible design artifact reveals tensions that a strategy document cannot.

Once people can react to an actual experience, the conversation becomes much more precise. Instead of debating abstract adjectives like whether something feels 'simple,' 'intelligent,' or 'integrated,' we can ask concrete questions: What does the user need to understand here? What should happen automatically? Where does the user need control? What is the right level of disclosure? What happens when the ideal path breaks?

That hands-on exploration directly feeds back into the strategy. Often, an interaction reveals an assumption that sounded reasonable at the roadmap level but falls apart when you try to make it usable. At that point, I am not just polishing UI; I am using craft to test the product thinking itself.

I do not see leadership and craft as two opposing ends of a spectrum where becoming more strategic means becoming less hands-on. My role is to move between levels of resolution.

At one moment I may be shaping product direction, aligning stakeholders, or defining principles. At another, I will go deep into a critical interaction because that is where the ambiguity actually lives. I stay hands-on selectively—specifically when a design artifact can create clarity, unlock a difficult decision, or help the team reframe the problem.

My guiding principle is: 'I use craft not only to execute strategy, but to interrogate it.'`,
    extractedFactualClaims: [
      {
        claim: "Views design leadership not as an abandonment of craft for abstract strategy, but as the ability to fluidly move between levels of resolution.",
        category: "role",
        status: "verified"
      },
      {
        claim: "Selectively engages in hands-on information hierarchy, interaction flows, and prototyping when abstract product strategy fails to converge at the interaction layer.",
        category: "role",
        status: "verified"
      },
      {
        claim: "Uses tangible design artifacts to replace subjective debates ('simple', 'intelligent') with concrete operational questions around user control, automation boundaries, and edge-case failures.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Feeds interaction learnings back into strategic direction when prototyping exposes unfeasible assumptions in roadmaps.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Holds the core leadership principle: 'I use craft not only to execute strategy, but to interrogate it.'",
        category: "technical",
        status: "verified"
      }
    ],
    decisionAndTradeOff: {
      decision: "Selectively dives into hands-on prototyping and interaction detail as a leader rather than remaining exclusively at the abstract roadmapping and delegation layer.",
      tradeOff: "Invests personal craft bandwidth on pivotal interactions and flows where ambiguity threatens strategic alignment, while intentionally delegating final UI ownership and non-blocking surfaces.",
      alternativesRejected: [
        "Remaining entirely in abstract strategy documents and high-level PRDs (allows divergent interpretations to persist unnoticed until launch)",
        "Micromanaging all UI execution across the team (erodes designer autonomy and bottlenecks progress)"
      ]
    },
    reflectionOrViewpoint: "Leadership and craft are not mutually exclusive. When strategy doesn't converge, it is usually because it hasn't become tangible enough to reveal its trade-offs. The design artifact itself is a tool for alignment and truth-testing. Core principle: 'I use craft not only to execute strategy, but to interrogate it.'",
    visitorQuestionsAnswered: [
      "How do you balance strategic design leadership with hands-on craft?",
      "What is your philosophy on staying hands-on as a design leader?",
      "How do you resolve disagreements when teams agree on strategy but diverge on execution?",
      "What do you mean by moving between levels of resolution?"
    ],
    missingEvidenceAndSensitivities: {
      missingEvidence: [
        "None required; this is a clear, universally applicable design leadership methodology and philosophy."
      ],
      sensitiveDetailsForReview: [
        "Verified: Completely clean of confidential company project names, unreleased roadmap items, or internal organizational politics."
      ]
    },
    status: "approved",
    publishedTargetCollection: "personal_viewpoints",
    ownerNotes: "Approved by owner for live knowledge migration."
  },

  // ── DRAFT 4: AI Autonomy & Trust Boundaries ──
  {
    id: "draft-ai-autonomy-trust-boundaries",
    createdAt: "2026-09-09T01:06:05Z",
    updatedAt: "2026-09-09T01:06:05Z",
    targetProjectOrTopic: "High-Stakes AI Automation & Trust Boundaries",
    questionAsked: "When designing automated or AI-assisted experiences in high-stakes environments, how do you decide where the boundary lies between what the system does autonomously and where human verification is required?",
    originalAnswer: `One principle I have developed while designing AI-assisted and automated experiences is that autonomy should increase with confidence, reversibility, and clarity of consequence.

I do not think the right question is simply, “Can the system do this automatically?” The more important question is, “What happens if it is wrong, and how easily can the user understand, correct, or recover from that mistake?”

In lower-risk situations, I am comfortable allowing the system to act more proactively. If the outcome is easy to inspect, easy to reverse, and has limited consequence, automation can remove unnecessary friction and make the experience feel genuinely intelligent.

As the consequence of an action increases, my design approach changes. I want the user to have more visibility into what the system is proposing, why it is proposing it, what will happen next, and where they still have control.

For me, human-in-the-loop design is not simply adding a confirmation dialog before every action. That often creates the appearance of safety without actually improving understanding.

The goal is to place human judgment at the point where judgment is genuinely valuable.

Sometimes that means the AI should prepare, summarize, recommend, or pre-fill an action while the person makes the final decision. In other situations, the system may act automatically but make the action highly observable and reversible. And in genuinely consequential moments, I would deliberately introduce friction because a small amount of friction can be useful when it creates a moment for reflection.

One thing I have become more conscious of over time is that too much verification can also reduce trust. If a system asks users to approve every small action, people eventually stop evaluating the decision and start mechanically clicking through.

So I think about trust as a calibration problem rather than a permission problem.

The experience should help the user understand when the system is confident, when uncertainty exists, and when their judgment is actually needed.

My broader principle is:

“Automate the reversible. Assist with the consequential. Make uncertainty visible.”

I would also add one more condition: when the cost of being wrong is high, the experience should optimize for recoverability and accountability, not just efficiency.`,
    firstPersonVersion: `One principle I have developed while designing AI-assisted and automated experiences is that autonomy should scale with confidence, reversibility, and clarity of consequence.

The critical question is not simply, 'Can the system do this automatically?' The more important question is, 'What happens if it is wrong, and how easily can the user understand, correct, or recover from that mistake?'

In lower-risk situations, I am comfortable allowing the system to act proactively. If the outcome is easy to inspect, easy to reverse, and has limited consequence, automation removes unnecessary friction and makes the experience feel genuinely intelligent.

As consequence increases, my design approach shifts. I want the user to have clear visibility into what the system is proposing, why it is proposing it, what will happen next, and where they retain control.

Human-in-the-loop design is not simply throwing a confirmation dialog in front of every action. That creates the illusion of safety without improving understanding, and asking users to approve every small step eventually causes fatigue where people mechanically click through.

The goal is to place human judgment where judgment is genuinely valuable.

Sometimes that means the AI prepares, summarizes, or pre-fills while the person makes the final decision. In other scenarios, the system may execute automatically while making the action highly observable and reversible. In genuinely consequential moments, I will deliberately introduce friction, because friction creates a necessary moment for reflection.

I treat trust as a calibration problem rather than a permission problem. The experience must help people understand when the system is confident, when uncertainty exists, and when their judgment is truly required.

My guiding principle is: 'Automate the reversible. Assist with the consequential. Make uncertainty visible.' When the cost of being wrong is high, the design must optimize for recoverability and accountability, not just efficiency.`,
    extractedFactualClaims: [
      {
        claim: "Frames AI autonomy boundaries along three axes: model confidence, action reversibility, and clarity of consequence.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Rejects ubiquitous confirmation dialogs as superficial safety that induces cognitive fatigue and mechanical clicking.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Defines trust in AI systems as a calibration problem rather than a permission problem.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Advocates for deliberate friction in high-stakes workflows to create space for human reflection.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Holds the core AI design principle: 'Automate the reversible. Assist with the consequential. Make uncertainty visible.'",
        category: "technical",
        status: "verified"
      }
    ],
    decisionAndTradeOff: {
      decision: "Calibrated system autonomy based on reversibility and consequence, reserving deliberate friction and human decision checkpoints for consequential actions while automating reversible tasks.",
      tradeOff: "Accepted deliberate interaction friction and inspectability steps in high-consequence moments rather than pursuing pure frictionless automation speed.",
      alternativesRejected: [
        "Full autonomous end-to-end execution without transparent reversibility (excessive operational risk)",
        "Prompting confirmation modals for every trivial sub-task (induces alert fatigue and mindless approvals)"
      ]
    },
    reflectionOrViewpoint: "Trust is a calibration problem, not a permission problem. Autonomy should scale with confidence, reversibility, and consequence. When the cost of an error is high, optimize for recoverability and accountability over raw throughput. Core principle: 'Automate the reversible. Assist with the consequential. Make uncertainty visible.'",
    visitorQuestionsAnswered: [
      "How do you design human-in-the-loop AI workflows?",
      "When should an AI system act autonomously versus asking for user confirmation?",
      "How do you prevent confirmation fatigue in enterprise automation?",
      "What is your philosophy on trust and error recovery in AI products?"
    ],
    missingEvidenceAndSensitivities: {
      missingEvidence: [
        "None required; universal AI interaction design and trust calibration framework."
      ],
      sensitiveDetailsForReview: [
        "Verified: Completely abstracted from proprietary ERP/financial client data or internal company models. Purely architectural and interaction design philosophy."
      ]
    },
    status: "approved",
    publishedTargetCollection: "personal_viewpoints",
    ownerNotes: "Approved by owner for live knowledge migration."
  },

  // ── DRAFT 5: Artistic Background & Coherence vs Uniformity ──
  {
    id: "draft-art-contrast-coherence",
    createdAt: "2026-09-09T01:07:30Z",
    updatedAt: "2026-09-09T01:07:30Z",
    targetProjectOrTopic: "Artistic Background ('vikramtheartist') & Coherence Over Uniformity",
    questionAsked: "How does your background in visual art and creative practice shape how you design, evaluate, or critique digital software—and what is a widely held design rule or dogma that you disagree with (or hold a major exception to) because of that artistic perspective?",
    originalAnswer: `My background in art has shaped the way I see design long before I had language for UX, systems, or product strategy.

Art trained me to pay attention to things that are difficult to quantify but immediately felt: tension, rhythm, composition, contrast, silence, imbalance, emphasis, and emotional residue.

That affects how I evaluate software. I do not only ask whether an interface is usable or whether the hierarchy is technically correct. I also ask: Where is the eye being pulled? Where does the experience breathe? What feels unresolved? What is visually louder than it deserves to be? What emotion does the product leave behind after the task is complete?

I think that artistic sensitivity is especially useful in digital products because software can become very rational very quickly. Once teams start optimizing for systems, consistency, efficiency, and scale, it is easy for an experience to become correct without becoming memorable.

One design rule I have a major exception to is the idea that consistency should always be preserved.

I believe consistency is valuable when it helps people build a mental model. But I do not think consistency should become a reason to flatten every moment into the same visual or interaction pattern.

In art, contrast gives meaning to composition. If everything has the same weight, nothing has emphasis. I think software works the same way.

There are moments in a product that deserve to break rhythm: an important decision, a transition, a moment of achievement, a warning, a reveal, or the first time someone experiences something genuinely new. If I force those moments into the same component treatment purely for consistency, I may preserve the system but weaken the experience.

So I tend to think in terms of coherence rather than uniformity.

The product should feel like it belongs to the same world, but every surface does not need to behave or look identical.

My artistic background also makes me comfortable with ambiguity during the early stages of design. I do not feel compelled to resolve every idea immediately. Sometimes I will explore a visual direction, interaction, metaphor, or strange composition before I can fully justify why it works. Then I interrogate it afterward and decide whether there is a real product idea inside it.

I see that as an important part of creative work: intuition can generate possibilities that analysis alone would never produce, but intuition still has to survive critique.

The principle I carry into product design is:

“Design systems create coherence. Contrast creates meaning.”

And a second one I use often is:

“I don’t optimize for consistency at all costs. I optimize for a coherent experience with intentional moments of difference.”`,
    firstPersonVersion: `My background in art shaped how I see design long before I had formal vocabulary for UX, systems, or product strategy.

Art trained me to pay attention to qualities that are difficult to quantify but immediately felt: tension, rhythm, composition, contrast, silence, imbalance, emphasis, and emotional residue.

That directly affects how I critique software. I do not only ask whether an interface is usable or whether its hierarchy is technically correct. I also ask: Where is the eye being pulled? Where does the experience breathe? What feels unresolved? What is visually louder than it deserves to be? What emotion does the product leave behind after the task is complete?

This artistic sensitivity is crucial because software becomes purely rational very quickly. When teams optimize exclusively for systems, consistency, efficiency, and scale, it is easy for an experience to become correct without becoming memorable.

The design dogma I hold a major exception to is the belief that consistency should always be preserved at all costs.

Consistency is valuable when it helps people build an accurate mental model. But consistency must never become a justification for flattening every moment into the exact same component pattern. In art, contrast gives meaning to composition; if everything carries the same weight, nothing has emphasis. Software functions the same way.

Moments that deserve to break rhythm include an important decision, a transition, a moment of achievement, a warning, a reveal, or a first-time experience. Forcing those moments into standard component treatments preserves the design system at the expense of the human experience.

I think in terms of coherence rather than uniformity. The product should feel like it belongs to the same world, but every surface does not need to look or behave identically.

My artistic practice also makes me comfortable with ambiguity. I do not feel compelled to resolve every idea immediately. Often, I explore an unusual composition, interaction, or metaphor before I can fully articulate why it works, and then interrogate it rigorously afterward. Intuition generates possibilities that analysis alone would never produce, but intuition still has to survive critique.

My foundational principles are:
'Design systems create coherence. Contrast creates meaning.'
and
'I don't optimize for consistency at all costs. I optimize for a coherent experience with intentional moments of difference.'`,
    extractedFactualClaims: [
      {
        claim: "Draws heavily upon a visual art background ('vikramtheartist') to evaluate software through artistic principles: tension, rhythm, composition, silence, and emotional residue.",
        category: "personal",
        status: "verified"
      },
      {
        claim: "Critiques software beyond technical usability, evaluating visual breathing room, unwarranted visual noise, and post-task emotional resonance.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Challenges the dogma of strict design system consistency at all costs, advocating for intentional contrast to create emphasis and emotional weight.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Distinguishes 'coherence' (belonging to the same design world) from 'uniformity' (identical visual/behavioral repetition).",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Holds the core design principles: 'Design systems create coherence. Contrast creates meaning.' and 'I don’t optimize for consistency at all costs. I optimize for a coherent experience with intentional moments of difference.'",
        category: "technical",
        status: "verified"
      }
    ],
    decisionAndTradeOff: {
      decision: "Intentionally breaks standard design system component rhythms for pivotal moments (key decisions, achievements, warnings, reveals) rather than adhering to rigid visual uniformity.",
      tradeOff: "Accepted occasional bespoke interaction treatments and localized pattern variations to elevate emotional resonance and clarity, trading off total component reuse homogeneity.",
      alternativesRejected: [
        "Dogmatically forcing all screens and states into identical component primitives (risked flattening the experience into correct but forgettable software)"
      ]
    },
    reflectionOrViewpoint: "Intuition generates possibilities that analysis alone cannot produce, but intuition must still survive rigorous critique. Software must not only be correct; it must be memorable. Core principles: 'Design systems create coherence. Contrast creates meaning.' and 'I don’t optimize for consistency at all costs. I optimize for a coherent experience with intentional moments of difference.'",
    visitorQuestionsAnswered: [
      "How does your background as an artist ('vikramtheartist') influence your UX and software design?",
      "What is a design rule or dogma that you disagree with?",
      "What is the difference between design consistency and design coherence?",
      "How do you know when an interface is too consistent or monotonous?"
    ],
    missingEvidenceAndSensitivities: {
      missingEvidence: [
        "None; this is personal artistic philosophy and design criticism."
      ],
      sensitiveDetailsForReview: [
        "Verified: Completely personal design philosophy and creative methodology."
      ]
    },
    status: "approved",
    publishedTargetCollection: "personal_interests",
    ownerNotes: "Approved by owner for live knowledge migration."
  },

  // ── DRAFT 6: Operating Cadence, Critique & Working With Vikram ──
  {
    id: "draft-collaboration-culture",
    createdAt: "2026-09-09T01:08:30Z",
    updatedAt: "2026-09-09T01:08:30Z",
    targetProjectOrTopic: "Operating Cadence, Design Critique & Cross-Functional Partnership",
    questionAsked: "What should engineering, product management, and design peers expect when collaborating with you—what are your non-negotiables, how do you give feedback and run design reviews, and what makes a partnership with you succeed?",
    originalAnswer: `What people should expect from me is clarity, candor, and a fairly high bar for the quality of thinking—not just the quality of the final screen.

I care a lot about getting the problem definition right before the team becomes attached to a solution. If I feel we are solving the wrong problem elegantly, I will usually pull the conversation back and challenge the framing.

I also prefer to make discussions tangible quickly. I do not like staying in abstract debate for too long. If there is ambiguity, I would rather put a rough flow, sketch, prototype, or model in front of the team and use that artifact to improve the conversation.

With product managers, I work best when we can openly separate the user problem, business intent, assumptions, and proposed solution. I do not expect PM and design to agree immediately. In fact, healthy disagreement is useful when both sides are willing to expose the reasoning behind their position.

With engineers, I prefer involving them early rather than treating engineering as the stage that begins after design is finished. Technical constraints often contain design information. A constraint can expose a better interaction model, and a design exploration can reveal where a technical assumption needs to be reconsidered. I want that loop to happen while the idea is still flexible.

With designers, I try not to give feedback as a list of visual corrections. I usually start by asking what the design is trying to achieve, what the user needs to understand, and what decision the designer is making.

In critique, I try to separate three things:

what is objectively unclear,
what is a strategic or product concern,
and what is simply my personal preference.

I think that distinction matters. A design leader can unintentionally turn taste into authority very quickly, and I try to be conscious of that.

I will push hard when I believe the underlying reasoning is weak, but I do not need the solution to look like something I would personally have designed. If the designer can articulate a strong rationale, show that it serves the user, and demonstrate that the system holds together, I am comfortable being persuaded.

My non-negotiables are relatively simple: understand the problem before polishing the answer; make important assumptions visible; do not hide complexity behind vague language; and care about the details that materially affect the experience.

I also expect ownership. I enjoy working with people who do not wait for perfect instructions, who bring a point of view, and who are willing to challenge mine.

A partnership with me works best when there is enough trust for us to disagree without making the disagreement personal.

I do not think alignment means everyone having the same opinion. I think alignment means everyone understands the decision, the reasoning behind it, and what we are committing to next.

The principle I carry into collaboration is:

“Bring me your point of view, not just your work.”

And for critique:

“I want to strengthen the thinking behind the design, not redesign it in my image.”`,
    firstPersonVersion: `What peers should expect from me is clarity, candor, and a high bar for the quality of thinking—not just the polish of the final screen.

I care deeply about getting the problem definition right before the team falls in love with a solution. If I feel we are solving the wrong problem elegantly, I will pull the conversation back and challenge the framing.

I prefer to make discussions tangible quickly rather than lingering in abstract debate. When ambiguity arises, I would rather put a rough flow, sketch, prototype, or model in front of the team and use that artifact to anchor the conversation.

With product managers, I work best when we openly separate the user problem, business intent, underlying assumptions, and the proposed solution. I welcome healthy friction when both sides are willing to expose the reasoning behind their positions.

With engineers, I involve them early. Technical constraints contain vital design information: a constraint can inspire a better interaction model, while an interaction exploration can reveal where a technical assumption needs revisiting. That feedback loop must happen while the idea is still malleable.

When reviewing design work, I never treat critique as a punch list of visual corrections. I ask what the design is trying to achieve, what the user needs to understand, and what decision the designer is making.

In critique, I strictly separate three layers:
1. What is objectively unclear,
2. What is a strategic or product concern, and
3. What is simply my personal preference.

That distinction is critical. A design leader can easily turn personal taste into organizational authority, and I work hard to prevent that. I will challenge weak underlying reasoning, but I do not need the final work to look like something I would personally have drawn. If a designer articulates a strong rationale, proves it serves the user, and demonstrates system coherence, I am completely comfortable being persuaded.

My non-negotiables: understand the problem before polishing the answer; make key assumptions visible; never disguise complexity behind vague language; and obsess over the details that materially affect the user experience.

I value real ownership—people who bring a clear point of view and who are willing to challenge mine. Alignment does not mean having identical opinions; it means everyone understands the decision, respects the reasoning, and commits to what we do next.

My collaboration principles are:
'Bring me your point of view, not just your work.'
and
'I want to strengthen the thinking behind the design, not redesign it in my image.'`,
    extractedFactualClaims: [
      {
        claim: "Emphasizes problem definition rigor, actively intervening when teams begin polishing solutions to the wrong problem.",
        category: "role",
        status: "verified"
      },
      {
        claim: "Advocates early engineering integration, viewing technical constraints as sources of design inspiration and interaction innovation.",
        category: "technical",
        status: "verified"
      },
      {
        claim: "Structures design critique by explicitly delineating objective clarity, strategic concerns, and personal aesthetic preference to prevent taste from becoming arbitrary authority.",
        category: "role",
        status: "verified"
      },
      {
        claim: "Defines cross-functional alignment as mutual comprehension of decisions, trade-offs, and next commitments rather than unanimous consensus.",
        category: "role",
        status: "verified"
      },
      {
        claim: "Holds core leadership principles: 'Bring me your point of view, not just your work.' and 'I want to strengthen the thinking behind the design, not redesign it in my image.'",
        category: "technical",
        status: "verified"
      }
    ],
    decisionAndTradeOff: {
      decision: "Explicitly separates personal aesthetic preference from strategic critique and objective clarity during reviews, allowing team members full design ownership when sound rationale is proven.",
      tradeOff: "Relinquishes personal visual control over team deliverables in exchange for empowering designer autonomy, critical thinking, and diverse creative solutions.",
      alternativesRejected: [
        "Dictating visual styling and personal stylistic tropes across all team surfaces (creates dependency and stifles design team ownership)",
        "Passive consensus-seeking without rigorous challenge (leads to unexamined solutions and poor problem definitions)"
      ]
    },
    reflectionOrViewpoint: "A design leader must never confuse personal taste with institutional authority. Critique exists to strengthen the designer's thinking and system coherence, not to replicate the leader's personal aesthetic. Core principles: 'Bring me your point of view, not just your work.' and 'I want to strengthen the thinking behind the design, not redesign it in my image.'",
    visitorQuestionsAnswered: [
      "What is it like to work with Vikram as a design leader?",
      "How do you run design critiques and give feedback?",
      "How do you partner with Product Managers and Engineering leaders?",
      "What are your non-negotiables in design culture and teamwork?"
    ],
    missingEvidenceAndSensitivities: {
      missingEvidence: [
        "None; foundational operating model and leadership philosophy."
      ],
      sensitiveDetailsForReview: [
        "Verified: Fully compliant. Reflects personal collaborative philosophy and professional ethos without references to internal personnel or confidential team situations."
      ]
    },
    status: "approved",
    publishedTargetCollection: "personal_viewpoints",
    ownerNotes: "Approved by owner for live knowledge migration."
  }
];

export const KNOWLEDGE_COVERAGE_GAPS: KnowledgeCoverageGap[] = [
  // All 6 foundational owner interview gaps have now been drafted!
];

export function registerDraft(draft: OwnerInterviewDraft): void {
  const existingIdx = INTERVIEW_DRAFTS.findIndex((d) => d.id === draft.id);
  if (existingIdx >= 0) {
    INTERVIEW_DRAFTS[existingIdx] = draft;
  } else {
    INTERVIEW_DRAFTS.push(draft);
  }
}

export function updateDraftStatus(
  draftId: string,
  status: "approved" | "discarded" | "withdrawn",
  ownerNotes?: string
): OwnerInterviewDraft | null {
  const draft = INTERVIEW_DRAFTS.find((d) => d.id === draftId);
  if (!draft) return null;
  draft.status = status;
  draft.updatedAt = new Date().toISOString();
  if (ownerNotes) draft.ownerNotes = ownerNotes;
  return draft;
}
