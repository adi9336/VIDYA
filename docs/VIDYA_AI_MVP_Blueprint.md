# VIDYA AI

_An AI-powered conversational tutor for Class 9-12 students_

MVP Blueprint and Product Vision Document

Author: Aditya Gupta  
Date: April 2025

## 1. The Vision

Most AI tools available today are built for developers, researchers, or adults who already understand technology. There is a large untapped gap: Class 9 to 12 students in India who are curious about the world, smart, and eager, but do not have a guided, age-appropriate AI companion to learn with.

Vidya AI is built to fill that gap. It is not another explainer tool. It is a thinking partner that meets the student in their world, speaks in their language (Hinglish), and teaches through real-world analogies and Socratic conversation.

> **Product North Star**  
> Core principle: NCERT for accuracy. Our design for experience.

## 2. The Problem We Are Solving

### 2.1 What Students Face Today

A Class 9 student who wants to understand Physics faces this reality:

- YouTube tutorials are too scattered, with no structure and no feedback.
- ChatGPT gives answers but does not build understanding.
- Byju's and Khan Academy explain, but do not think with the student.
- Textbooks are correct but dry, with no conversation and no curiosity.

The result is that students use AI as a copy-paste machine, not a learning tool. They get answers but no mental models.

### 2.2 The Deeper Problem: Wrong Mental Model

Before even teaching Physics, the bigger challenge is that many students have a broken mental model of what science even is. They think:

- Science means formulas to memorize for exams.
- Physics is something only IITians understand.
- AI is ChatGPT magic, not something they can understand or build.

Vidya AI fixes the perception before fixing the knowledge.

## 3. The Core Teaching Insight

The breakthrough insight behind Vidya AI came from a simple observation: the best teachers never start with definitions. They start with something the student already knows.

> **The "Ohh Moment" - Example Conversation**  
> Student: "Ye pani evaporate kyo hota he?"  
> AI: "Tumne kabhi kisi cheez ko tootte hue dekha hai?"  
> Student: "Ha"  
> AI: "To koi cheez kyo tooti?"  
> Student: "Vo gir gayi... ya kisi ne hatoda mara"  
> AI: "Dekh - jab kisi cheez ne us cheez par zor lagaya, to vo jo chote-chote hisson se judkar bani thi, vo alag ho gaye. Jaise tu 5 dosto ke saath ek bada circle banaye, aur koi aake tumhare haath alag kare - to group toot jayega.  
> Aisi hi kaam garmi karti hai pani ke molecules ke saath..."  
> Student: "Ohh!"

This is Socratic and analogical teaching. The AI never tells the student what evaporation is upfront. It walks them to the answer through their own world. That "Ohh" moment is the product.

## 4. Target Users

| Student Segment | Their Mindset and Need |
|---|---|
| Class 9-10 | In "mugging up" mode. AI feels like sci-fi. They need concepts explained like stories through things they already experience daily. |
| Class 11-12 | Starting analytical thinking. They want to understand how things work. They are intimidated but genuinely curious and ready for slightly deeper dives. |
| Both segments | They do not wake up wanting to "learn Physics." They wake up wanting to feel smart, impress friends, and understand the world around them. |

## 5. MVP Scope

### 5.1 Why We Start Small

The temptation is to build everything: all subjects, all chapters, and all grades. That is the wrong approach for the MVP. One perfect analogy conversation is worth more than 50 average ones. The MVP must prove the core magic works before expanding.

> **MVP Scope**  
> Focus: Class 9 Physics, Chapter: Motion  
> Concepts: Distance vs Displacement, Speed vs Velocity, Acceleration

### 5.2 Why Motion First

Motion is the ideal MVP chapter because every student has already lived it:

- Felt a bus brake suddenly.
- Ran fast and slow.
- Watched a ball roll and stop.
- Walked in a circle and returned home.

The analogies are already in their life. The product just needs to surface them through conversation.

### 5.3 MVP Roadmap by Phase

| Phase | What We Build | What We Learn |
|---|---|---|
| MVP (Now) | Motion chapter only, with 3 core concepts, full analogy conversation flows, voice support, and base illustrations | Whether the Socratic style works, whether students stay engaged, and whether the "Ohh" moment happens |
| Phase 2 | Full Physics syllabus with all 5 chapters and complete illustration library | Which concepts need the most support and which analogy styles resonate most |
| Phase 3 | Chemistry and Biology, fully optimized Hinglish, and student progress tracking | Cross-subject patterns, retention, and return rate |
| Phase 4 | Fine-tuned model trained on real student conversation data from phases 1-3 | A proprietary teaching moat built from real interaction data |

## 6. Technical Architecture

### 6.1 MVP Tech Stack

| Component | Technology and Rationale |
|---|---|
| Conversation AI | GPT-4o or Claude via API for the strongest conversational capability during MVP |
| Prompt Engineering | The prompt is the product. It defines personality, teaching style, language, and Socratic flow |
| Speech-to-Text | OpenAI Whisper for multilingual support and Hinglish handling |
| Text-to-Speech | Conversational audio output with a friendly senior voice rather than a robotic voice |
| Base Illustrations | Custom SVG illustrations that are accurate, consistent, and built for later modification |
| Dynamic Visual Layer | GPT Image 2 only for conversation-specific modifications to base illustrations |
| Frontend | Simple React chat UI, clean and mobile-first |
| Backend | FastAPI, lightweight and fast |

### 6.2 The Visual Architecture: Two Layers

This is the most distinctive technical decision in Vidya AI. Visuals work in two separate layers:

- Layer 1: Base illustrations. Pre-built custom SVG for every core concept. Always accurate, always consistent, and designed for modification from day one. NCERT diagrams are used as an accuracy reference only.
- Layer 2: Dynamic modifications. When the conversation goes in a specific direction, GPT Image 2 generates a small contextual variation on top of the base. Example: a ball on a flat road becomes a ball on an incline.

> **Design Rationale**  
> A wrong diagram for a Class 9 student is worse than no diagram. The base layer guarantees accuracy. The dynamic layer adds conversational intelligence. This preserves both accuracy and adaptability.

### 6.3 The Prompt: The Real Product

The system prompt must encode:

- Student profile: Class 9, age about 14, Hinglish speaker, Indian school context
- Teaching philosophy: analogy first, never definition first
- Conversation style: Socratic, ask before telling, let the student connect dots
- Personality: friendly senior student, not a teacher or bot
- Language rules: Hinglish by default, switch to Hindi if the student struggles
- Pacing rules: slow down when the student says "samajh nahi aaya" and celebrate "Ohh" moments
- Visual triggers: when to surface which illustration and when to modify it

## 7. The Student Experience

### 7.1 What a Session Looks Like

A student opens Vidya AI and sees a clean, friendly chat interface. A voice greets them in Hinglish. They can type or speak. The journey begins:

- The system asks, "Aaj kya samajhna hai?"
- The student picks or types a concept like "velocity kya hoti hai."
- The system does not define velocity immediately. It asks, "Kabhi kisi race mein daudha hai?"
- The conversation flows through analogy and a base illustration appears alongside it.
- The student reaches the "Ohh" moment organically.
- The system confirms understanding with a simple question, not a test.
- The illustration adapts if the conversation goes in a new direction.

### 7.2 What Makes This Different from ChatGPT

| Existing Tools | Vidya AI |
|---|---|
| Gives answers immediately | Asks a question first |
| Uses technical language | Uses the student's world as the entry point |
| Gives the same response to everyone | Adapts to what this student already knows |
| Mostly static text output | Voice, adaptive visuals, and conversation |
| No memory of confusion | Recognizes confusion and changes approach |
| English default | Hinglish default with Hindi fallback |

## 8. How We Validate the MVP

### 8.1 The Test

Put the MVP in front of 5 real Class 9 students. Do not pitch it. Just observe.

### 8.2 What We Are Watching For

- Do students engage or drop off within 2 minutes?
- Does the analogy style land or confuse them?
- Do they show an "Ohh" moment, the visible click of understanding?
- How long do they stay in the conversation naturally?
- Do they ask follow-up questions on their own?
- Do they want to share it with a friend?

### 8.3 Success Criteria for MVP

> **MVP Success Metrics**
> - 3 out of 5 students reach an "Ohh" moment in their first session.
> - At least 2 students voluntarily continue beyond the first concept.
> - Zero students say, "ye toh same as ChatGPT hai".

## 9. The Bigger Vision

Motion is the starting point. But Vidya AI is not a Physics tutor. It is a new way of learning that can work for any subject, any concept, and any student.

- Short term: all of Class 9 Physics, then Chemistry, then Biology
- Medium term: Class 10, 11, and 12 with full curriculum coverage
- Long term: a fine-tuned model trained on thousands of real student conversations, creating a durable teaching moat
- Ultimate vision: the friendly senior every Indian school student deserves but rarely gets

> **Mission**  
> The goal is not to replace teachers. The goal is to give every student, whether in Delhi or a small town in UP, access to the kind of patient, curious, analogy-driven explanation that only the luckiest students get from a great teacher or older sibling.
