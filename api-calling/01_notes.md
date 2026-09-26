RAW LLM APIs
│
├── REQUEST / RESPONSE
│       ↓
│   How communication works
│
├── PROVIDER APIs
│       ↓
│   How OpenAI/Gemini expose models
│
├── CONVERSATION
│       ↓
│   How context is maintained
│
├── STREAMING
│       ↓
│   How output is delivered progressively
│
├── RELIABILITY
│       ↓
│   What happens when things go wrong
│
├── USAGE
│       ↓
│   What was consumed
│
├── COST
│       ↓
│   What it costs
│
├── MODEL SELECTION
│       ↓
│   Which model fits the task
│
└── PROVIDER ABSTRACTION
        ↓
    How to support multiple providers




                         USER
                           ↓
                    YOUR APPLICATION
                           ↓
                  ┌────────┴────────┐
                  ↓                 ↓
             MODEL CHOICE      PROVIDER
                  ↓             ABSTRACTION
                  ↓                 ↓
                  └────────┬────────┘
                           ↓
                       LLM API
                           ↓
                    ┌──────┴──────┐
                    ↓             ↓
                RESPONSE       FAILURE
                    ↓             ↓
                STREAMING      RETRY / TIMEOUT
                    ↓
                  USAGE
                    ↓
                  COST





Model Selection
→ Which model?

Provider Abstraction
→ Which provider / how do I hide provider differences?

Reliability
→ What if the provider doesn't respond correctly?

Usage
→ What did the request consume?

Cost
→ What did that usage cost?