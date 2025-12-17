# deepeval

Minimal example showing how to score a prompt with `createLLMAsJudge` from [OpenEvals](https://github.com/confident-ai/OpenEvals).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and add your OpenAI key:
   ```bash
   cp .env.example .env
   ```
3. Run the evaluation script (uses `gpt-4.1-mini` for generation and `openai:o3-mini` as the judge by default):
   ```bash
   npm run eval
   ```

`eval.js` demonstrates:
- building a prompt that requires Chinese answers under 50 characters,
- generating outputs with the target prompt,
- scoring them with `createLLMAsJudge` using a custom rubric and fixed score choices.
