const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const programPath = path.join(repoRoot, "research", "programs", "motion-mvp.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function slugTimestamp(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function scoreTopic(program, topic) {
  const filePath = path.join(repoRoot, topic.path);
  const content = readText(filePath);
  const normalized = normalize(content);
  const requiredSections = topic.required_sections || [];
  const missingSections = requiredSections.filter((section) => {
    return !content.includes(`## ${section}`);
  });

  const sectionScore =
    requiredSections.length === 0
      ? 1
      : (requiredSections.length - missingSections.length) / requiredSections.length;

  return {
    topic_id: topic.id,
    path: topic.path,
    score: Number(sectionScore.toFixed(3)),
    status: sectionScore >= program.scoring.pass_threshold ? "pass" : "fail",
    missing_sections: missingSections,
    normalized
  };
}

function scoreScenario(program, scenario, topicMap) {
  const topic = topicMap.get(scenario.concept);

  if (!topic) {
    return {
      scenario_id: scenario.id,
      concept: scenario.concept,
      score: 0,
      status: "fail",
      matched_phrases: [],
      missing_phrases: scenario.expected_phrases,
      triggered_forbidden_phrases: [],
      notes: [`No topic brief registered for concept ${scenario.concept}.`]
    };
  }

  const matchedPhrases = scenario.expected_phrases.filter((phrase) =>
    topic.normalized.includes(normalize(phrase))
  );
  const missingPhrases = scenario.expected_phrases.filter(
    (phrase) => !matchedPhrases.includes(phrase)
  );
  const triggeredForbiddenPhrases = scenario.forbidden_phrases.filter((phrase) =>
    topic.normalized.includes(normalize(phrase))
  );

  const weights = program.scoring.weights;
  const sectionsMet = topic.missing_sections.length === 0 ? 1 : 0;
  const expectedScore =
    scenario.expected_phrases.length === 0
      ? 1
      : matchedPhrases.length / scenario.expected_phrases.length;
  const forbiddenScore =
    scenario.forbidden_phrases.length === 0
      ? 1
      : 1 - triggeredForbiddenPhrases.length / scenario.forbidden_phrases.length;

  const score =
    sectionsMet * weights.required_sections +
    expectedScore * weights.expected_phrases +
    forbiddenScore * weights.forbidden_phrases;

  const notes = [];
  if (missingPhrases.length > 0) {
    notes.push(`Missing expected coverage: ${missingPhrases.join(", ")}`);
  }
  if (triggeredForbiddenPhrases.length > 0) {
    notes.push(`Triggered forbidden phrasing: ${triggeredForbiddenPhrases.join(", ")}`);
  }

  return {
    scenario_id: scenario.id,
    concept: scenario.concept,
    score: Number(score.toFixed(3)),
    status: score >= program.scoring.pass_threshold ? "pass" : "fail",
    matched_phrases: matchedPhrases,
    missing_phrases: missingPhrases,
    triggered_forbidden_phrases: triggeredForbiddenPhrases,
    notes
  };
}

function main() {
  const program = readJson(programPath);
  const fixtures = readJson(path.join(repoRoot, program.fixtures_path));

  const topicResults = program.topic_briefs.map((topic) => scoreTopic(program, topic));
  const topicMap = new Map(topicResults.map((result) => [result.topic_id, result]));

  const scenarioResults = fixtures.scenarios.map((scenario) =>
    scoreScenario(program, scenario, topicMap)
  );

  const topicsPassed = topicResults.filter((topic) => topic.status === "pass").length;
  const scenariosPassed = scenarioResults.filter((scenario) => scenario.status === "pass").length;
  const overallScore =
    (topicResults.reduce((sum, topic) => sum + topic.score, 0) +
      scenarioResults.reduce((sum, scenario) => sum + scenario.score, 0)) /
    (topicResults.length + scenarioResults.length);

  const timestamp = new Date();
  const runId = `motion-mvp-${slugTimestamp(timestamp)}`;
  const result = {
    run_id: runId,
    program_id: program.program_id,
    timestamp: timestamp.toISOString(),
    status: overallScore >= program.scoring.pass_threshold ? "pass" : "fail",
    summary: {
      pass_threshold: program.scoring.pass_threshold,
      overall_score: Number(overallScore.toFixed(3)),
      topics_passed: topicsPassed,
      topics_total: topicResults.length,
      scenarios_passed: scenariosPassed,
      scenarios_total: scenarioResults.length
    },
    topic_results: topicResults.map(({ normalized, ...topic }) => topic),
    scenario_results: scenarioResults
  };

  const outputDir = path.join(repoRoot, "research", "runs");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${runId}.json`);
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);

  console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
  console.log(
    `Status=${result.status} score=${result.summary.overall_score} topics=${topicsPassed}/${topicResults.length} scenarios=${scenariosPassed}/${scenarioResults.length}`
  );
}

main();
