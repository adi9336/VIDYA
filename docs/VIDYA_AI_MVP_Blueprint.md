# VIDYA AI

_An AI-powered senior buddy and adaptive tutor for Class 9-12 students_

MVP Blueprint and Product Vision Document

Author: Aditya Gupta  
Date: April 2025

## 1. The Vision

Most AI tools available today are built for developers, researchers, or adults who already understand technology. There is a large untapped gap: Class 9 to 12 students in India who are curious about the world, smart, and eager, but do not have a guided, age-appropriate AI companion to learn with.

Vidya AI is built to fill that gap. It is not another explainer tool and not a chapter-bound tutor. It is a senior buddy that meets the student in their world, speaks in their language (Hinglish), chats naturally, and switches into teaching only when the student asks for help.

> **Product North Star**  
> Core principle: buddy first, tutor on demand, specialist packs for accuracy.

## 2. The Problem We Are Solving

### 2.1 What Students Face Today

A student who wants help with school or life around school faces this reality:

- YouTube tutorials are too scattered, with no structure and no feedback.
- ChatGPT gives answers but does not build understanding.
- Byju's and Khan Academy explain, but do not think with the student.
- Textbooks are correct but dry, with no conversation and no curiosity.

The result is that students use AI as a copy-paste machine, not a learning tool. They get answers but no mental models.

### 2.2 The Deeper Problem: Wrong Mental Model

Before even teaching, the bigger challenge is that many students do not feel safe asking rough, half-formed questions. They think:

- Science means formulas to memorize for exams.
- Hard topics are something only toppers understand.
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
| Both segments | They do not wake up wanting a formal lesson. They wake up wanting to feel smart, impress friends, and understand the world around them. |

## 5. MVP Scope

### 5.1 Why We Start Small

The temptation is to build everything: all subjects, all chapters, and all grades. That is the wrong approach for the MVP. One believable senior-buddy conversation is worth more than 50 average explanations. The MVP must prove that Vidya feels present, useful, and adaptive before expanding.

> **MVP Scope**  
> Focus: Realtime Hinglish companion experience  
> Core modes: Buddy, Tutor, Study Coach, Clarifier, Safety, and specialist content when relevant  
> First specialist pack: Class 9 Physics Motion, used only for Motion-related questions

### 5.2 Why Senior Buddy First

Students do not always arrive with a clean academic question. They may say they are bored, stuck, confused, stressed, or just want to talk. If Vidya immediately pushes Motion, it feels fake. The default experience must be:

- Casual and warm for normal conversation.
- Useful for planning, motivation, and focus.
- Ready to teach when the student asks.
- Accurate when a specialist subject pack is triggered.

Motion remains the first specialist pack because it is easy to explain with lived experience, but it is not the product identity.

### 5.3 MVP Roadmap by Phase

| Phase | What We Build | What We Learn |
|---|---|---|
| MVP (Now) | Senior-buddy LiveKit voice/chat experience with adaptive modes and one Motion specialist pack | Whether Vidya feels natural, whether mode switching works, and whether students stay engaged |
| Phase 2 | More specialist packs for common school topics plus better coach workflows | Which student intents repeat and which specialist packs matter most |
| Phase 3 | Full curriculum expansion, optimized Hinglish, and student progress tracking | Cross-subject patterns, retention, and return rate |
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
- Default behavior: senior buddy first, not teacher first
- Teaching philosophy: tutor only when asked; analogy first unless the student asks direct
- Conversation style: casual in buddy mode, Socratic in tutor mode, practical in study coach mode
- Personality: friendly senior student, not a teacher or bot
- Language rules: Hinglish by default, switch to Hindi if the student struggles
- Pacing rules: slow down when the student says "samajh nahi aaya" and celebrate "Ohh" moments
- Specialist routing: use Motion content only when the student asks about Motion
- Visual triggers: surface specialist visuals only when they help the current learning question

## 7. The Student Experience

### 7.1 What a Session Looks Like

A student opens Vidya AI and sees a clean, friendly chat interface. A voice greets them in Hinglish. They can type or speak. The journey begins:

- The system greets like a senior buddy, not like a lesson screen.
- If the student chats casually, Vidya chats back naturally.
- If the student asks for focus help, Vidya becomes a study coach.
- If the student asks a learning question, Vidya switches into tutor mode.
- If the question is about Motion, Vidya uses the Motion specialist pack and visuals.
- The student reaches the "Ohh" moment organically when teaching is actually needed.

### 7.2 What Makes This Different from ChatGPT

| Existing Tools | Vidya AI |
|---|---|
| Gives answers immediately | Asks a question first |
| Uses technical language | Uses the student's world as the entry point |
| Gives the same response to everyone | Adapts to what this student already knows |
| Mostly static text output | Voice, adaptive visuals, and conversation |
| No memory of confusion | Recognizes confusion and changes approach |
| English default | Hinglish default with Hindi fallback |
| Forces a tutoring frame | Starts as a buddy and teaches only on demand |

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

The senior-buddy experience is the starting point. Motion is only the first specialist pack. Vidya AI is not a Physics tutor; it is a companion that can become a tutor whenever the student needs one.

- Short term: make the senior-buddy interaction feel natural, then add the most requested specialist packs
- Medium term: Class 10, 11, and 12 with full curriculum coverage
- Long term: a fine-tuned model trained on thousands of real student conversations, creating a durable teaching moat
- Ultimate vision: the friendly senior every Indian school student deserves but rarely gets

> **Mission**  
> The goal is not to replace teachers. The goal is to give every student, whether in Delhi or a small town in UP, access to the kind of patient, curious, analogy-driven explanation that only the luckiest students get from a great teacher or older sibling.
