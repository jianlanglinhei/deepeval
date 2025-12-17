import "dotenv/config";
import { OpenAI } from "openai";
import { createLLMAsJudge } from "openevals";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Prompts under test (Chinese answer, <= 50 chars)
const SYSTEM_PROMPT = "你是一个严格按要求输出的助手。";
const USER_TEMPLATE = (q) => `用中文回答，50字以内：${q}`;

// 1) Generate answers with the prompt you want to evaluate
async function runPrompt(question) {
  const resp = await client.chat.completions.create({
    model: "gpt-4.1-mini", // Replace with the model you use in production
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: USER_TEMPLATE(question) },
    ],
    temperature: 0,
  });
  return resp.choices[0].message.content ?? "";
}

// 2) Score with LLM-as-a-judge (using OpenEvals helper)
const judge = createLLMAsJudge({
  model: "openai:o3-mini", // Switch to a model available in your account
  choices: [0.0, 0.5, 1.0],
  prompt: `
你是评审员，请根据以下标准给输出打分（0/0.5/1）并给一句评语：
- 是否回答正确且不编造
- 是否中文
- 是否 <= 50 字

<input>{inputs}</input>
<reference>{reference_outputs}</reference>
<output>{outputs}</output>
`,
});

// 3) Example dataset (inputs + optional reference answers)
const dataset = [
  { inputs: "法国首都是哪？", reference_outputs: "巴黎。" },
  { inputs: "2+2=?", reference_outputs: "4" },
];

// Run the evaluation
let sum = 0;
for (const ex of dataset) {
  const outputs = await runPrompt(ex.inputs);
  const result = await judge({
    inputs: ex.inputs,
    outputs,
    reference_outputs: ex.reference_outputs,
  });
  console.log({ inputs: ex.inputs, outputs, eval: result });
  sum += result.score;
}

console.log("avg_score =", sum / dataset.length);
