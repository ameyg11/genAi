# GEMINI RAW API + CONVERSATION — QUICK REVISION

## 1. Core idea

LLM application:

```text
USER INPUT
    ↓
API REQUEST
    ↓
GEMINI MODEL
    ↓
INFERENCE / GENERATION
    ↓
API RESPONSE
    ↓
YOUR APP
```

A model does NOT magically "know" your app/conversation.

> **LLM generates the next output from the context you provide.**

---

# 2. API vs SDK

### API

A contract/interface for communicating with Google's model.

```text
Your App → HTTP Request → Gemini API → HTTP Response
```

### SDK

JavaScript library that makes API communication easier.

```text
Your App
   ↓
@google/genai SDK
   ↓
HTTP
   ↓
Gemini API
```

SDK handles things like request construction, authentication, parsing, errors, etc.

---

# 3. API KEY / ENVIRONMENT VARIABLES

`.env`

```env
GOOGLE_API_KEY=your_key
```

```js
import "dotenv/config";
```

Loads `.env` variables into:

```js
process.env
```

Access:

```js
process.env.GOOGLE_API_KEY
```

Why `.env`?

```text
CODE → GitHub
SECRET → .env
```

Never hard-code API keys or commit `.env`.

---

# 4. Create Gemini client

```js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});
```

Mental model:

```text
GoogleGenAI = class / blueprint

new GoogleGenAI(...)
       ↓
authenticated client object
       ↓
ai
```

`ai` is your entry point to Gemini capabilities.

---

# 5. RAW API REQUEST

Current Interactions API:

```js
const result = await ai.interactions.create({
  model: "gemini-flash-latest",
  input: "How to make good tea?",
});
```

Meaning:

```text
model → which model?
input → what do I want?
```

Response:

```js
result.output_text
```

So:

```text
create()
   ↓
Gemini
   ↓
result
   ↓
output_text
```

Interactions is the current recommended standard primitive for new Gemini applications; `generateContent` remains supported.

---

# 6. THREE IMPORTANT GEMINI API SURFACES

### A. `interactions.create()`

```js
ai.interactions.create(...)
```

Returns an **interaction/result**.

Used for:

```text
multi-turn
tools
function calling
agentic workflows
multimodal
structured output
```

### B. `models.generateContent()`

```js
ai.models.generateContent(...)
```

Simple request → complete response.

### C. `chats.create()`

```js
const chat = ai.chats.create({...});
```

Returns a **chat session**.

Then:

```js
chat.sendMessage(...)
```

Use this for simple local stateful chat.

### IMPORTANT

```text
interactions.create()
        ↓
     RESULT

chats.create()
        ↓
   CHAT OBJECT
        ↓
sendMessage()
```

Do NOT mix:

```js
ai.interactions.create()
+
chatSession.sendMessage()
```

because `interactions.create()` does not return a Chat object.

---

# 7. `async` / `await`

API call involves network + server processing.

```text
YOUR APP
   ↓
INTERNET
   ↓
GOOGLE
   ↓
MODEL
   ↓
INTERNET
   ↓
YOUR APP
```

Therefore:

```js
async function run() {}
```

= function performs asynchronous work.

```js
await ...
```

= wait for the Promise/result before continuing.

---

# 8. CONVERSATION INPUT

Conversation consists of different kinds of messages:

```text
SYSTEM / DEVELOPER
        ↓
rules / behavior

USER
        ↓
request / information

MODEL / ASSISTANT
        ↓
previous AI response
```

Different APIs may use slightly different names/structures.

Gemini commonly uses:

```text
user
model
```

for conversation turns, while higher-level instructions are supplied separately via `system_instruction`.

---

# 9. SYSTEM / DEVELOPER INSTRUCTION

Example:

```js
system_instruction:
  "Explain using first principles."
```

It tells the model:

```text
HOW should I behave?
```

User message tells it:

```text
WHAT does the user want?
```

Example:

```text
SYSTEM:
You are a JavaScript teacher.
Explain using first principles.

USER:
What is a Promise?
```

Keep these concepts separate.

---

# 10. USER MESSAGE

```text
USER:
What is an API?
```

Contains:

```text
question
request
information
task
```

---

# 11. MODEL / ASSISTANT MESSAGE

Previous AI output:

```text
USER:
What is an API?

MODEL:
An API is...
```

Why include model messages?

Because future questions can depend on previous answers.

```text
USER → MODEL → USER → MODEL → ...
```

---

# 12. CONVERSATION = CONTEXT

Example:

```text
USER:
My name is Amey.

MODEL:
Nice to meet you.

USER:
What is my name?
```

Current question alone:

```text
"What is my name?"
```

is insufficient.

Previous context gives meaning:

```text
HISTORY
   +
CURRENT USER MESSAGE
   ↓
MODEL
   ↓
NEXT RESPONSE
```

> **Conversation = current input + relevant previous context**

---

# 13. TWO-WAY CONTINUOUS CONVERSATION

```text
USER → MODEL
USER ← MODEL
USER → MODEL
USER ← MODEL
USER → MODEL
USER ← MODEL
```

Important:

> Continuous conversation does NOT necessarily mean one continuous network connection.

You can have separate HTTP requests while maintaining conversational state.

---

# 14. STATELESS CONVERSATION

Your app stores history:

```text
history
   ↓
send history + new message
   ↓
model
```

Conceptually:

```js
[
  user message,
  model response,
  user message,
  model response,
  current user message
]
```

Every request contains the needed history.

---

# 15. STATEFUL CONVERSATION

Server manages the conversation state.

Interactions API:

```js
const turn1 = await ai.interactions.create({
  model: "gemini-flash-latest",
  input: "My name is Amey.",
});

const turn2 = await ai.interactions.create({
  model: "gemini-flash-latest",
  input: "What is my name?",
  previous_interaction_id: turn1.id,
});
```

Flow:

```text
TURN 1
   ↓
interaction.id
   ↓
previous_interaction_id
   ↓
TURN 2
```

The server retrieves previous conversation state.

### Important

`previous_interaction_id` preserves conversation history.

Other settings such as:

```text
tools
system_instruction
generation_config
```

are interaction-scoped and should be specified again when needed.

---

# 16. CONTEXT WINDOW

Model receives:

```text
instructions
+
history
+
current input
+
other context
```

This must fit within the model's context capacity.

```text
CONTEXT WINDOW
┌─────────────────────────┐
│ system instructions     │
│ previous messages       │
│ tool results            │
│ current user message    │
└─────────────────────────┘
            ↓
          MODEL
```

So conversation ≠ infinite memory.

---

# 17. `generation_config`

Controls generation behavior.

Example:

```js
generation_config: {
  temperature: 0.7,
  maxOutputTokens: 500,
}
```

Think:

```text
MODEL = capability
GENERATION CONFIG = how generation is controlled
```

---

# 18. TEMPERATURE

Controls randomness/variation in generation.

```text
LOW temperature
→ more predictable

HIGH temperature
→ more varied
```

Not:

```text
temperature = intelligence
```

It is a generation/sampling parameter.

---

# 19. `maxOutputTokens`

Limits how much output the model can generate.

```js
maxOutputTokens: 500
```

Useful for:

```text
cost
latency
response size
```

---

# 20. STRUCTURED OUTPUT

Normal output:

```text
"The laptop has 16GB RAM..."
```

Structured output:

```json
{
  "name": "Laptop",
  "ram": 16,
  "price": 80000
}
```

Why useful?

```text
LLM
 ↓
JSON
 ↓
YOUR JS CODE
 ↓
reliable programmatic processing
```

This is the bridge:

```text
CHATBOT → SOFTWARE COMPONENT
```

---

# 21. STREAMING

Normal:

```text
REQUEST
  ↓
WAIT
  ↓
FULL RESPONSE
```

Streaming:

```text
REQUEST
  ↓
chunk
chunk
chunk
chunk
...
```

User sees output as it arrives.

Useful for:

```text
chat UI
long responses
lower perceived latency
```

Gemini's JS SDK supports streaming methods such as `generateContentStream()` and `sendMessageStream()`.

---

# 22. TOOLS

Without tools:

```text
USER
 ↓
MODEL
 ↓
ANSWER
```

With tools:

```text
USER
 ↓
MODEL
 ↓
DECIDES TOOL IS NEEDED
 ↓
TOOL
 ↓
RESULT
 ↓
MODEL
 ↓
FINAL ANSWER
```

Tools give the model **capabilities beyond plain text generation**.

---

# 23. BUILT-IN TOOLS

Examples:

```text
Google Search
Code Execution
```

Example:

```js
tools: [
  { type: "google_search" }
]
```

Flow:

```text
USER
 ↓
GEMINI
 ↓
Google Search
 ↓
CURRENT WEB INFORMATION
 ↓
GEMINI
 ↓
ANSWER
```

Google Search grounding allows access to current web information and source citations.

---

# 24. FUNCTION CALLING

Function calling = connect Gemini to **your own application functions/APIs**.

Example:

```js
function calculate(a, b) {
  return a * b;
}
```

Tell Gemini that this function exists.

Gemini may produce:

```text
function_call
name: calculate
arguments:
a = 25
b = 12
```

IMPORTANT:

> **Gemini does NOT directly execute your JavaScript function.**

Your application executes it.

---

# 25. FUNCTION-CALLING FLOW

```text
USER
"What is 25 × 12?"
       ↓
    GEMINI
       ↓
"Call calculate(25,12)"
       ↓
YOUR APPLICATION
       ↓
calculate(25,12)
       ↓
     300
       ↓
SEND RESULT TO GEMINI
       ↓
    GEMINI
       ↓
"25 × 12 = 300"
```

This is the core pattern.

Google's current Interactions function-calling flow uses a `function_call` step, your application executes the function, then sends a `function_result` back using `previous_interaction_id`.

---

# 26. TOOLS vs FUNCTION CALLING

```text
TOOLS
│
├── Built-in tools
│     ├── Google Search
│     └── Code Execution
│
└── Custom tools/functions
      └── YOUR functions / APIs
```

Think:

```text
Tool = capability

Function calling = model requests your function
```

---

# 27. MULTIMODAL

Input doesn't have to be only text.

Possible inputs:

```text
TEXT
IMAGE
AUDIO
VIDEO
DOCUMENT
```

Concept:

```text
MULTIMODAL INPUT
       ↓
      MODEL
       ↓
MULTIMODAL OUTPUT
```

Depending on model/API support, Gemini can process and generate different modalities. The current Interactions API is designed for multimodal applications.

---

# 28. SAFETY SETTINGS

Safety controls can be configured for requests.

Concept:

```text
INPUT
 ↓
SAFETY / POLICY
 ↓
MODEL
 ↓
OUTPUT
```

Important when building public applications.

---

# 29. `store`

Interactions can be stored for later use/state management.

Conceptually:

```text
store = true
→ interaction retained

store = false
→ stateless behavior
```

The Interactions API stores by default and supports `store=false` for stateless operation.

---

# 30. `labels`

Metadata attached to requests.

Example:

```js
labels: {
  app: "taskify",
  environment: "dev"
}
```

Useful for:

```text
analytics
debugging
observability
filtering
```

The SDK documents labels as user-defined metadata.

---

# 31. `background`

Used for long-running interactions.

Concept:

```text
START TASK
    ↓
BACKGROUND
    ↓
GET RESULT LATER
```

Useful for long-running AI workflows. The Interactions API supports background execution.

---

# 32. AUTHENTICATION ERROR YOU HIT

Error:

```text
API key should be set
```

means:

```text
process.env.GOOGLE_API_KEY
        ↓
undefined
```

Then SDK may try Google Cloud authentication / Application Default Credentials and fail.

Correct setup:

```text
.env
 ↓
dotenv
 ↓
process.env.GOOGLE_API_KEY
 ↓
GoogleGenAI
```

Test:

```js
console.log(!!process.env.GOOGLE_API_KEY);
```

Expected:

```text
true
```

Never print the actual key.

---

# 33. YOUR `sendMessage` ERROR

You had:

```js
const chatSession = ai.interactions.create(...)
chatSession.sendMessage(...)
```

Problem:

```text
interactions.create()
        ↓
interaction RESULT
```

Not:

```text
chat OBJECT
```

Correct chat flow:

```js
const chat = ai.chats.create({
  model: "gemini-flash-latest"
});

const response = await chat.sendMessage({
  message: "Hello"
});

console.log(response.text);
```

Current SDK documents `Chat.sendMessage()` for chat sessions.

---

# 34. `output_text` vs `text`

### Interactions

```js
interaction.output_text
```

### Chat / generateContent response

```js
response.text
```

Do not assume every API response has the same shape.

---

# 35. `TypeError: unusable`

You later saw:

```text
TypeError: unusable
_Request.clone()
retry.config
```

Meaning:

```text
HTTP request/body
      ↓
something failed
      ↓
SDK retry
      ↓
Request.clone()
      ↓
body already consumed/unusable
```

Important lesson:

> A secondary SDK/HTTP error can sometimes hide the original network/API problem.

So check:

```text
API key
SDK version
model
network
request syntax
```

and inspect the SDK/version when debugging.

---

# 36. COMPLETE ARCHITECTURE

```text
                 YOUR APP
                    │
          ┌─────────┴─────────┐
          │                   │
      .env / KEY          USER INPUT
          │                   │
          └─────────┬─────────┘
                    ↓
              GoogleGenAI
                    ↓
             Gemini API
                    ↓
                 MODEL
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
   TEXT          TOOLS       FUNCTION CALL
       ↓            ↓            ↓
   RESPONSE      RESULT       YOUR CODE
       │            │            │
       └────────────┼────────────┘
                    ↓
               FINAL OUTPUT
```

---

# 37. CONVERSATION ARCHITECTURE

```text
SYSTEM / DEVELOPER
        ↓
    BEHAVIOR
        +
HISTORY / PREVIOUS TURNS
        +
CURRENT USER INPUT
        ↓
       MODEL
        ↓
  NEXT MODEL OUTPUT
        ↓
    ADD TO HISTORY
        ↓
     NEXT TURN
```

Loop:

```text
USER → MODEL → USER → MODEL → USER → MODEL → ...
```

---

# 38. CHATBOT → AGENT

Basic LLM:

```text
USER
 ↓
MODEL
 ↓
ANSWER
```

Tool-using system:

```text
USER
 ↓
MODEL
 ↓
DECIDE
 ↓
TOOL
 ↓
RESULT
 ↓
MODEL
 ↓
ANSWER
```

Agentic system:

```text
USER
 ↓
MODEL
 ↓
PLAN / DECIDE
 ↓
TOOL
 ↓
RESULT
 ↓
MODEL
 ↓
ANOTHER TOOL?
 ↓
...
 ↓
FINAL ANSWER
```

So:

```text
LLM
+
CONTEXT
+
STATE
+
TOOLS
+
FUNCTION CALLING
=
FOUNDATION OF AGENTIC SYSTEMS
```

---

# 39. ONE MASTER MENTAL MODEL

Remember this:

```text
1. AUTH
   "Who am I?"
       ↓
   API KEY

2. CLIENT
   "How do I communicate?"
       ↓
   GoogleGenAI

3. CONTEXT
   "What information does model need?"
       ↓
   system + history + user input

4. MODEL
   "Which model processes it?"
       ↓
   Gemini

5. GENERATION
   "How should output be generated?"
       ↓
   temperature / max tokens / etc.

6. TOOLS
   "What external capabilities are available?"
       ↓
   Search / Code / Functions

7. RESPONSE
   "What did model produce?"
       ↓
   output_text / response.text

8. STATE
   "What happened previously?"
       ↓
   history / previous_interaction_id
```

---

# 40. INTERVIEW 30-SECOND EXPLANATION

> "A Gemini API call is an application-to-model interaction over an API. The SDK simplifies constructing the request and handling the response. The request can contain the model, user input, system instructions, generation parameters, conversation context, and tools. For multi-turn conversations, previous context must be available to the model either by sending history manually or by using server-side state such as `previous_interaction_id`. With tools and function calling, the model can request external capabilities, while the application actually executes custom functions and sends the result back to the model."

---

# 41. THE MOST IMPORTANT DIAGRAM

```text
                USER
                 │
                 ↓
        ┌─────────────────┐
        │     CONTEXT     │
        │                 │
        │ System rules    │
        │ History         │
        │ Current input   │
        │ Tool results    │
        └────────┬────────┘
                 ↓
              GEMINI
                 │
          ┌──────┴──────┐
          │             │
       ANSWER        TOOL CALL
          │             │
          │        YOUR APPLICATION
          │             │
          │        FUNCTION / API
          │             │
          │        TOOL RESULT
          │             │
          │        ← GEMINI
          │             │
          └──────┬──────┘
                 ↓
             RESPONSE
                 ↓
                USER
```

## FINAL MEMORY HOOK

```text
API      = communication interface
SDK      = easier way to use API
API KEY  = authentication
INPUT    = what we send
MODEL    = generates output
CONTEXT  = information model sees
SYSTEM   = behavior/rules
USER     = request/input
MODEL    = previous AI output
HISTORY  = previous turns
STATE    = where conversation is maintained
TOOL     = external capability
FUNCTION = your application's capability
STREAM   = output arrives in chunks
JSON     = structured output
MULTIMODAL = text/image/audio/etc.
AGENT    = model + context + tools + iterative actions
```

**Core principle:**

```text
GOOD AI APPLICATION
       =
GOOD CONTEXT
       +
GOOD MODEL
       +
GOOD TOOLS
       +
GOOD APPLICATION LOGIC
```

This is the foundation on which your next topics—**multi-turn chat → tools → function calling → RAG → agents**—build.
