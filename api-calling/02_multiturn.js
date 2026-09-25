/**
 5. Multi-turn conversation

Right now:

run("How to make good tea?");

is basically a one-off interaction.

Suppose you say:

User: My name is Amey.
AI: Nice to meet you.

User: What's my name?
AI: Amey.

The second request needs context.

With the Interactions API, you can use:

previous_interaction_id

to continue a conversation. Google's current docs describe this as the recommended stateful approach for multi-turn interactions.

Conceptually:

Interaction 1
     ↓
ID = abc123

Interaction 2
previous_interaction_id = abc123
     ↓
Gemini knows the previous interaction

This is extremely important to understand before learning agents.
 */


