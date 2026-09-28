> what a prompt actually is
LLM receives
    ↓
instructions
+
input
+
additional context
    ↓
predicts next tokens
    ↓
response


> Learn to separate these:

ROLE / BEHAVIOR
        +
TASK
        +
CONTEXT
        +
CONSTRAINTS
        +
OUTPUT FORMAT

Example:

# Role
You are a JavaScript interviewer.

# Task
Evaluate the candidate's answer.

# Context
[Candidate answer]

# Constraints
Focus on correctness and clarity.

# Output
Return:
- Score
- Mistakes
- Improvement


> sources => https://ai.google.dev/gemini-api/docs/prompting-strategies 
>         => https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses
