> Function calling (also known as tool calling) provides a powerful and flexible way for OpenAI models to interface with external systems and access data outside their training data.

# If your application has many functions or large schemas, you can pair function calling with tool search to defer rarely used tools and load them only when the model needs them

> https://developers.openai.com/api/docs/guides/function-calling?utm_source=chatgpt.com&api-mode=responses
> https://ai.google.dev/gemini-api/docs/function-calling


# How it works
Tools - functionality we give the model
Tool calls - requests from the model to use tools
Tool call outputs - output we generate for the model
Functions versus tools


> The tool calling flow (image.png)

Tool calling is a multi-step conversation between your application and a model via the OpenAI API. The tool calling flow has five high level steps:

Make a request to the model with tools it could call
Receive a tool call from the model
Execute code on the application side with input from the tool call
Make a second request to the model with the tool output
Receive a final response from the model (or more tool calls)


Defining functions

Functions are usually declared in the tools parameter of each API request. With tool search, your application can also load deferred functions later in the interaction. Either way, each callable function uses the same schema shape. A function definition has the following properties:

Field	Description
type	This should always be function
name	The function’s name (for example, get_weather)
description	Details on when and how to use the function
parameters	JSON schema defining the function’s input arguments
strict	Whether to enforce strict mode for the function call



> Best practices for defining functions
    - Write clear and detailed function names, parameter descriptions, and instructions.
    - Apply software engineering best practices.
    - Offload the burden from the model and use code where possible.
    - Keep the number of initially available functions small for higher accuracy.
    - Leverage OpenAI resources.