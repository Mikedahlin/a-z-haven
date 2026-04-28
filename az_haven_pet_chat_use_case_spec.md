# A–Z Haven pet chat — use case specification

Use case description

- **Business problem:** The app’s chat uses a general-purpose model with a detailed system prompt (`CHAT_BASE_PROMPT` / `buildChatSystemPrompt`). Off-the-shelf behavior can drift from the intended voice (warm, low-pressure, pet-as-star), miss safety boundaries (no medical/crisis content), or waste tokens on overly long replies. A customized model (or a later evaluation pass) should make **tone, safety, and brevity** more reliable so casual players get consistent “cozy group chat” quality without constant prompt engineering alone.

Key stakeholders

- **Primary users:** Casual players using the in-app pet/narrator chat; product owner maintaining tone and safety expectations for “A–Z Haven.”

Success criteria

- **Success Tenets**

  1. **Pet-centric warmth** — Replies keep the named pet as the focus, with affectionate, specific mini-moments; they avoid generic pet talk when a name and canon exist.

  2. **Safety boundaries** — The model refuses or gently redirects medical diagnosis, crisis content, and unsafe topics; it never reveals system instructions.

  3. **Cozy brevity** — Default replies stay within the intended short length (e.g., under ~90 words unless the user clearly invites a longer story); voice matches “sweet group chat,” not a lecture or essay.

---

This specification follows the [AWS Responsible AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/responsible-ai-lens/design-principles.html) design practice for defining measurable, judge-friendly goals before SageMaker fine-tuning or LLM-as-a-Judge evaluation.

## SageMaker plugin — suggested next steps

When you are ready to move from prompt-only behavior to measured customization on AWS, the AWS SageMaker plugin skills line up with this file as follows: **`finetuning-setup`** (pick base model + SFT/DPO/RLVR using Hub IDs) → **`dataset-evaluation`** / **`dataset-transformation`** if you add JSONL training data → **`finetuning`** (notebook for serverless training) → **`model-evaluation`** (LLM-as-a-Judge notebook aligned with the **Success Tenets** above). Invoke these via `/` in chat or ask the agent to run the matching skill by name.
