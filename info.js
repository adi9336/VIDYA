const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const accentColor = "1A73E8";
const lightBlue = "E8F0FE";
const lightGreen = "E6F4EA";
const lightYellow = "FEF9E7";
const lightGray = "F5F5F5";
const darkText = "1C1C1C";

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accentColor, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 32, color: accentColor, font: "Arial" })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, color: "2C2C2C", font: "Arial" })]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, color: "444444", font: "Arial" })]
  });
}

function body(text, options = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: darkText, ...options })]
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial", bold, color: darkText })]
  });
}

function space(size = 120) {
  return new Paragraph({ spacing: { before: size, after: 0 }, children: [new TextRun("")] });
}

function colorBox(text, fillColor, labelText = null) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: fillColor, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            children: [
              ...(labelText ? [new Paragraph({
                children: [new TextRun({ text: labelText, bold: true, size: 20, color: "666666", font: "Arial" })]
              })] : []),
              new Paragraph({
                children: [new TextRun({ text, size: 22, font: "Arial", color: darkText, italics: !labelText })]
              })
            ]
          })
        ]
      })
    ]
  });
}

function twoColTable(col1Header, col2Header, rows, col1Color, col2Color) {
  const headerRow = new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 4680, type: WidthType.DXA },
        shading: { fill: accentColor, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: col1Header, bold: true, size: 22, color: "FFFFFF", font: "Arial" })] })]
      }),
      new TableCell({
        borders, width: { size: 4680, type: WidthType.DXA },
        shading: { fill: accentColor, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: col2Header, bold: true, size: 22, color: "FFFFFF", font: "Arial" })] })]
      })
    ]
  });

  const dataRows = rows.map(([c1, c2], i) => new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 4680, type: WidthType.DXA },
        shading: { fill: i % 2 === 0 ? col1Color : "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: c1, size: 21, font: "Arial", color: darkText })] })]
      }),
      new TableCell({
        borders, width: { size: 4680, type: WidthType.DXA },
        shading: { fill: i % 2 === 0 ? col2Color : "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: c2, size: 21, font: "Arial", color: darkText })] })]
      })
    ]
  }));

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [headerRow, ...dataRows]
  });
}

function threeColTable(headers, rows) {
  const colW = [2000, 3680, 3680];
  const headerRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      borders, width: { size: colW[i], type: WidthType.DXA },
      shading: { fill: accentColor, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 21, color: "FFFFFF", font: "Arial" })] })]
    }))
  });
  const dataRows = rows.map(([c1, c2, c3], i) => new TableRow({
    children: [
      new TableCell({ borders, width: { size: colW[0], type: WidthType.DXA }, shading: { fill: i%2===0?lightBlue:"FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: c1, size: 21, font: "Arial", bold: true, color: darkText })] })] }),
      new TableCell({ borders, width: { size: colW[1], type: WidthType.DXA }, shading: { fill: i%2===0?lightGray:"FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: c2, size: 21, font: "Arial", color: darkText })] })] }),
      new TableCell({ borders, width: { size: colW[2], type: WidthType.DXA }, shading: { fill: i%2===0?lightGreen:"FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: c3, size: 21, font: "Arial", color: darkText })] })] }),
    ]
  }));
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: colW, rows: [headerRow, ...dataRows] });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial" }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial" }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, font: "Arial" }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [

      // ── COVER ──────────────────────────────────────────────────────────────
      space(400),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "VIDYA AI", bold: true, size: 64, color: accentColor, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [new TextRun({ text: "An AI-Powered Conversational Tutor for Class 9–12 Students", size: 28, color: "555555", font: "Arial", italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 40 },
        children: [new TextRun({ text: "MVP Blueprint & Product Vision Document", size: 24, color: "888888", font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 0 },
        children: [new TextRun({ text: "Author: Aditya Gupta  |  April 2025", size: 22, color: "AAAAAA", font: "Arial" })]
      }),
      space(200),
      new Paragraph({ children: [new PageBreak()] }),

      // ── 1. VISION ─────────────────────────────────────────────────────────
      heading1("1. The Vision"),
      body("Most AI tools available today are built for developers, researchers, or adults who already understand technology. There is a massive untapped gap — Class 9 to 12 students in India who are curious about the world, smart, and eager, but have no guided, age-appropriate AI companion to learn with."),
      space(),
      body("Vidya AI is built to fill that gap. It is not another explainer tool. It is a thinking partner — one that meets the student in their world, speaks in their language (Hinglish), and teaches through real-world analogies and Socratic conversation."),
      space(),
      colorBox(
        "Core Principle: NCERT for accuracy. Our design for experience.",
        lightBlue, "PRODUCT NORTH STAR"
      ),
      space(),

      // ── 2. THE PROBLEM ────────────────────────────────────────────────────
      heading1("2. The Problem We Are Solving"),
      heading2("2.1 What Students Face Today"),
      body("A Class 9 student who wants to understand Physics faces this reality:"),
      space(60),
      bullet("YouTube tutorials — too scattered, no structure, no feedback"),
      bullet("ChatGPT — gives answers but doesn't build understanding"),
      bullet("Byju's / Khan Academy — explains, but never thinks WITH the student"),
      bullet("Textbooks — correct but dry, no conversation, no curiosity"),
      space(),
      body("The result: Students use AI as a copy-paste machine, not a learning tool. They get answers but no mental models."),
      space(),
      heading2("2.2 The Deeper Problem — Wrong Mental Model"),
      body("Before even teaching Physics, the bigger challenge is that these students have a broken mental model of what science even is. They think:"),
      space(60),
      bullet("Science = formulas to memorize for exams"),
      bullet("Physics = something only IITians understand"),
      bullet("AI = ChatGPT magic, not something they can understand or build"),
      space(),
      body("Vidya AI fixes the perception before fixing the knowledge."),
      space(),

      // ── 3. THE INSIGHT ────────────────────────────────────────────────────
      heading1("3. The Core Teaching Insight"),
      body("The breakthrough insight behind Vidya AI came from a simple observation: the best teachers never start with definitions. They start with something the student already knows."),
      space(),
      colorBox(
        "Student: \"Ye pani evaporate kyo hota he?\"\n\nAI: \"Tumne kabhi kisi cheez ko tootte hue dekha hai?\"\n\nStudent: \"Ha\"\n\nAI: \"To koi cheez kyo tooti?\"\n\nStudent: \"Vo gir gayi... ya kisi ne hatoda mara\"\n\nAI: \"Dekh — jab kisi cheez ne us cheez par zor lagaya, to vo jo chote-chote hisson se judkar bani thi, vo alag ho gaye. Jaise tu 5 dosto ke saath ek bada circle banaye, aur koi aake tumhare haath alag kare — to group toot jayega.\n\nAisi hi kaam garmi karti hai pani ke molecules ke saath...\"\n\nStudent: \"Ohh!\"",
        lightYellow, "THE 'OHH MOMENT' — REAL EXAMPLE CONVERSATION"
      ),
      space(),
      body("This is Socratic + Analogical teaching. The AI never told the student what evaporation is. It walked them to the answer through their own world. That 'Ohh!' moment is the product."),
      space(),

      // ── 4. TARGET ─────────────────────────────────────────────────────────
      heading1("4. Target Users"),
      twoColTable(
        "Student Segment", "Their Mindset & Need",
        [
          ["Class 9–10", "In 'mugging up' mode. AI feels like sci-fi. Need concepts explained like stories through things they already experience daily."],
          ["Class 11–12", "Starting analytical thinking. Want to understand HOW things work. Intimidated but genuinely curious. Ready for slightly deeper dives."],
          ["Both segments", "They don't wake up wanting to 'learn Physics'. They wake up wanting to feel smart, impress friends, and understand the world around them."],
        ],
        lightBlue, lightGreen
      ),
      space(),

      // ── 5. MVP SCOPE ──────────────────────────────────────────────────────
      heading1("5. MVP Scope"),
      heading2("5.1 Why We Start Small"),
      body("The temptation is to build everything — all subjects, all chapters, all grades. That is the wrong approach for MVP. One perfect analogy conversation is worth more than 50 average ones. The MVP must prove the core magic works before expanding."),
      space(),
      colorBox(
        "MVP Focus: Class 9 Physics — Chapter: Motion\nConcepts: Distance vs Displacement, Speed vs Velocity, Acceleration",
        lightGreen, "MVP SCOPE"
      ),
      space(),
      heading2("5.2 Why Motion First"),
      body("Motion is the ideal MVP chapter because every student has already lived it:"),
      space(60),
      bullet("Felt a bus brake suddenly (inertia / Newton's Laws preview)"),
      bullet("Ran fast and slow (speed vs velocity)"),
      bullet("Watched a ball roll and stop (acceleration, friction)"),
      bullet("Walked in a circle and returned home (distance vs displacement)"),
      space(),
      body("The analogies are already in their life. We just need to surface them through conversation."),
      space(),
      heading2("5.3 MVP Roadmap — Phase by Phase"),
      threeColTable(
        ["Phase", "What We Build", "What We Learn"],
        [
          ["MVP (Now)", "Motion chapter only — 3 core concepts with full analogy conversation flows, voice support, base illustrations", "Does the Socratic style work? Do students stay engaged? Does the 'Ohh' moment happen?"],
          ["Phase 2", "Full Physics syllabus — all 5 chapters with complete illustration library", "Which concepts need most support? What analogy styles resonate most?"],
          ["Phase 3", "Chemistry + Biology added. Hinglish fully optimized. Student progress tracking.", "Cross-subject patterns. Retention and return rate."],
          ["Phase 4", "Own fine-tuned model trained on real student conversation data collected in Phase 1-3", "Our model becomes the moat. Nobody can replicate our teaching style."],
        ]
      ),
      space(),

      // ── 6. TECH STACK ─────────────────────────────────────────────────────
      heading1("6. Technical Architecture"),
      heading2("6.1 MVP Tech Stack"),
      twoColTable(
        "Component", "Technology & Rationale",
        [
          ["Conversation AI", "GPT-4o / Claude via API — most powerful conversational models available. No need to train our own at MVP stage."],
          ["Prompt Engineering", "This is where 80% of MVP work goes. The prompt IS the product. It defines personality, teaching style, language, and Socratic flow."],
          ["Speech-to-Text", "OpenAI Whisper — multilingual, handles Hinglish naturally, open source, battle-tested. Student speaks, system understands."],
          ["Text-to-Speech", "Conversational audio output — friendly senior voice, not robotic. Supports Hinglish pronunciation."],
          ["Base Illustrations", "Custom-designed SVG illustrations — pre-built, accurate, consistent. NCERT used as accuracy reference, not as direct source."],
          ["Dynamic Visual Layer", "GPT Image 2 — ONLY for conversation-specific modifications to base illustrations. Not for generating core diagrams."],
          ["Frontend", "Simple React chat UI — clean, student-friendly, mobile-first (most students use phones)"],
          ["Backend", "FastAPI — lightweight, fast, fits existing stack"],
        ],
        lightBlue, lightGray
      ),
      space(),
      heading2("6.2 The Visual Architecture — Two Layers"),
      body("This is the most unique technical decision in Vidya AI. Visuals work in two distinct layers:"),
      space(60),
      bullet("Layer 1 — Base Illustrations: Pre-built custom SVG for every core concept. Always accurate. Always consistent. Built with modification in mind from day one. NCERT diagrams used as accuracy reference only.", true),
      bullet("Layer 2 — Dynamic Modifications: When conversation goes in a specific direction, GPT Image 2 generates a small contextual variation on top of the base. Example: base shows a ball on flat road. Student asks about incline. Illustration tilts the surface.", true),
      space(),
      colorBox(
        "Why this matters: A wrong diagram for a Class 9 student is worse than no diagram. Base layer guarantees accuracy. Dynamic layer adds conversational intelligence. Both principles — accuracy AND adaptability — are preserved.",
        lightYellow, "DESIGN RATIONALE"
      ),
      space(),
      heading2("6.3 The Prompt — The Real Product"),
      body("The system prompt is what makes Vidya AI different from just using ChatGPT. It must encode:"),
      space(60),
      bullet("Student profile — Class 9, age ~14, Hinglish speaker, Indian school context"),
      bullet("Teaching philosophy — analogy first, never definition first"),
      bullet("Conversation style — Socratic, ask before telling, let student connect dots"),
      bullet("Personality — friendly senior student, not a teacher or bot"),
      bullet("Language rules — Hinglish default, switch to pure Hindi if student struggles"),
      bullet("Pacing rules — slow down when student says 'samajh nahi aaya', celebrate 'Ohh' moments"),
      bullet("Visual triggers — when to surface which illustration, when to modify it"),
      space(),

      // ── 7. EXPERIENCE ─────────────────────────────────────────────────────
      heading1("7. The Student Experience"),
      heading2("7.1 What a Session Looks Like"),
      body("A student opens Vidya AI. They see a clean, friendly chat interface. A voice greets them in Hinglish. They can type or speak. The journey begins:"),
      space(60),
      bullet("System asks: 'Aaj kya samajhna hai?' (What do you want to understand today?)"),
      bullet("Student picks or types a concept — 'velocity kya hoti hai'"),
      bullet("System does NOT define velocity. It asks: 'Kabhi kisi race mein daudha hai?'"),
      bullet("Conversation flows through analogy. Base illustration appears alongside."),
      bullet("Student reaches the 'Ohh' moment organically."),
      bullet("System confirms understanding with a simple question, not a test."),
      bullet("Illustration adapts if conversation goes in a new direction."),
      space(),
      heading2("7.2 What Makes This Different from ChatGPT"),
      twoColTable(
        "ChatGPT / Existing Tools", "Vidya AI",
        [
          ["Gives answer immediately", "Asks a question first"],
          ["Uses technical language", "Uses student's own world as the entry point"],
          ["Same response for everyone", "Adapts to what THIS student already knows"],
          ["Static text output", "Voice + adaptive visuals + conversation"],
          ["No memory of confusion", "Recognizes when student is lost and changes approach"],
          ["English default", "Hinglish default, Hindi fallback"],
        ],
        "FFE0E0", lightGreen
      ),
      space(),

      // ── 8. VALIDATION ─────────────────────────────────────────────────────
      heading1("8. How We Validate the MVP"),
      heading2("8.1 The Test"),
      body("Put the MVP in front of 5 real Class 9 students. No pitching. Just observe."),
      space(),
      heading2("8.2 What We Are Watching For"),
      bullet("Do students engage or drop off within 2 minutes?"),
      bullet("Does the analogy style land or confuse them?"),
      bullet("Do they produce an 'Ohh' moment — that visible click of understanding?"),
      bullet("How long do they stay in the conversation naturally?"),
      bullet("Do they ask follow-up questions on their own? (sign of genuine curiosity activated)"),
      bullet("Do they want to share it with a friend? (sign of emotional resonance)"),
      space(),
      heading2("8.3 Success Criteria for MVP"),
      colorBox(
        "3 out of 5 students reach an 'Ohh' moment in their first session.\nAt least 2 students voluntarily continue beyond the first concept.\nZero students say 'ye toh same as ChatGPT hai'.",
        lightGreen, "MVP SUCCESS METRICS"
      ),
      space(),

      // ── 9. FUTURE ─────────────────────────────────────────────────────────
      heading1("9. The Bigger Vision"),
      body("Motion is the starting point. But Vidya AI is not a Physics tutor. It is a new way of learning — one that works for any subject, any concept, any student."),
      space(),
      bullet("Short term: All of Class 9 Physics, then Chemistry, then Biology"),
      bullet("Medium term: Class 10, 11, 12 — full curriculum coverage"),
      bullet("Long term: Our own fine-tuned model trained on thousands of real student conversations. This becomes the moat — nobody can replicate the teaching style we've built from real data."),
      bullet("Ultimate vision: The friendly senior every Indian school student deserves but rarely gets"),
      space(),
      colorBox(
        "The goal is not to replace teachers. The goal is to give every student — whether in Delhi or a small town in UP — access to the kind of patient, curious, analogy-driven explanation that only the luckiest students get from a great teacher or older sibling.",
        lightBlue, "MISSION"
      ),
      space(200),

      // ── FOOTER NOTE ───────────────────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 8 } },
        children: [new TextRun({ text: "Vidya AI — MVP Blueprint  |  Confidential  |  Aditya Gupta, 2025", size: 18, color: "AAAAAA", font: "Arial", italics: true })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/claude/VidyaAI_MVP_Blueprint.docx", buf);
  console.log("Done");
});