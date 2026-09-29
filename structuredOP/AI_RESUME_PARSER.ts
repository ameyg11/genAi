// ============================================================
// AI RESUME PARSER
// Structured Outputs + Validation + Retry + Fallback + Logging
// ============================================================


// ------------------------------------------------------------
// 1. IMPORT DEPENDENCIES
// ------------------------------------------------------------

// OpenAI SDK.
import OpenAI from "openai";

// Helper that converts a Zod schema into the structured-output
// format expected by the OpenAI API.
import { zodTextFormat } from "openai/helpers/zod";

// Zod itself.
import { z } from "zod";


// ------------------------------------------------------------
// 2. CREATE OPENAI CLIENT
// ------------------------------------------------------------

// The OpenAI SDK reads OPENAI_API_KEY from the environment.
//
// Example:
//
// OPENAI_API_KEY=sk-...
//
const openai = new OpenAI();


// ------------------------------------------------------------
// 3. DEFINE THE STRUCTURED OUTPUT SCHEMA
// ------------------------------------------------------------

// This describes exactly what our application wants from
// the LLM.
//
// The model should return:
//
// {
//   name: string,
//   email: string,
//   skills: string[],
//   experienceYears: number,
//   seniority: one of four values,
//   summary: string | null
// }

const ResumeSchema = z.object({

  // Candidate's name.
  name: z.string(),

  // Candidate's email.
  //
  // email() checks the string against Zod's email validation.
  email: z.string().email(),

  // Array containing zero or more strings.
  skills: z.array(z.string()),

  // Experience must be an integer and cannot be negative.
  experienceYears: z
    .number()
    .int()
    .min(0),

  // Only these values are allowed.
  seniority: z.enum([
    "intern",
    "junior",
    "mid",
    "senior",
  ]),

  // The field must exist,
  // but its value can be a string or null.
  summary: z.string().nullable(),
});


// ------------------------------------------------------------
// 4. CREATE THE TYPESCRIPT TYPE
// ------------------------------------------------------------

// z.infer takes the Zod schema and creates a TypeScript type.
//
// So instead of manually writing:
//
// type Resume = {
//   name: string;
//   email: string;
//   ...
// }
//
// TypeScript derives it from ResumeSchema.
//
// This gives us one source of truth.
type Resume = z.infer<typeof ResumeSchema>;


// ------------------------------------------------------------
// 5. SEMANTIC / BUSINESS VALIDATION
// ------------------------------------------------------------

// Important:
//
// The LLM may produce data that has the correct TYPE
// but still doesn't make sense for our application.
//
// Example:
//
// experienceYears = 50
//
// That is a number.
//
// So the schema is structurally satisfied.
//
// But for our application it might be unreasonable.
//
// This function performs BUSINESS validation separately.

function validateResumeSemantics(
  resume: Resume
): string[] {

  const errors: string[] = [];


  // ----------------------------------------------------------
  // Rule 1
  // ----------------------------------------------------------
  //
  // A person's total experience cannot logically exceed
  // a reasonable application-defined limit.

  if (resume.experienceYears > 50) {

    errors.push(
      "experienceYears cannot exceed 50"
    );
  }


  // ----------------------------------------------------------
  // Rule 2
  // ----------------------------------------------------------
  //
  // If someone is an intern, maybe our business rule says
  // they should not have more than 2 years of experience.

  if (
    resume.seniority === "intern" &&
    resume.experienceYears > 2
  ) {

    errors.push(
      "intern cannot have more than 2 years of experience"
    );
  }


  // ----------------------------------------------------------
  // Rule 3
  // ----------------------------------------------------------
  //
  // Email has already passed the Zod email format check.
  //
  // This could be extended with application-specific rules.

  
  // ----------------------------------------------------------
  // Rule 4
  // ----------------------------------------------------------
  //
  // Maybe our system requires at least one skill.

  if (resume.skills.length === 0) {

    errors.push(
      "resume must contain at least one skill"
    );
  }


  // Return all semantic errors.
  return errors;
}


// ------------------------------------------------------------
// 6. LOGGING HELPER
// ------------------------------------------------------------

// In production you would usually use a logging library.
//
// For learning purposes, console.log is enough.
//
// Notice that we're logging metadata, not the full resume.
// This is safer because resumes may contain personal data.

function logEvent(
  event: string,
  metadata: Record<string, unknown> = {}
) {

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      ...metadata,
    })
  );
}


// ------------------------------------------------------------
// 7. SMALL DELAY HELPER
// ------------------------------------------------------------

// We use this for retry backoff.
//
// Example:
//
// attempt 1 → wait 500ms
// attempt 2 → wait 1000ms
// attempt 3 → wait 2000ms
//
// In production we'd also add jitter.

function sleep(ms: number): Promise<void> {

  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}


// ------------------------------------------------------------
// 8. EXPONENTIAL BACKOFF
// ------------------------------------------------------------

function getBackoffDelay(
  attempt: number
): number {

  // Base delay.
  const base = 500;

  // 2^attempt gives:
  //
  // attempt 0 → 1
  // attempt 1 → 2
  // attempt 2 → 4
  //
  const exponentialDelay =
    base * Math.pow(2, attempt);


  // Add random jitter between 0 and 250ms.
  //
  // This prevents many clients from retrying at exactly
  // the same time.
  const jitter =
    Math.floor(Math.random() * 250);


  return exponentialDelay + jitter;
}


// ------------------------------------------------------------
// 9. DECIDE WHETHER AN ERROR IS RETRYABLE
// ------------------------------------------------------------

function isRetryableError(
  error: unknown
): boolean {

  // OpenAI SDK errors contain an HTTP status in common
  // API error situations.
  //
  // We inspect it when available.

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  ) {

    const status =
      (error as { status?: number }).status;


    // 429 = temporary rate limiting.
    //
    // 500 = server error.
    //
    // 503 = temporary overload/unavailable.
    //
    // These are commonly retryable conditions.

    if (
      status === 429 ||
      status === 500 ||
      status === 503
    ) {

      return true;
    }
  }


  // Network errors can also be temporary.
  //
  // For a real system, inspect the exact SDK error class
  // and your own timeout/connection handling.
  
  return false;
}


// ------------------------------------------------------------
// 10. ONE LLM REQUEST
// ------------------------------------------------------------

async function callModel(
  model: string,
  resumeText: string
): Promise<Resume> {


  logEvent("llm.request.started", {
    model,
  });


  // ----------------------------------------------------------
  // Send request to the Responses API.
  // ----------------------------------------------------------

  const response = await openai.responses.parse({

    // Model name is supplied through configuration.
    //
    // Use a model available to your project that supports
    // structured outputs.
    model,

    // The model receives instructions plus the resume text.
    input: [

      {
        role: "system",

        content:
          "Extract candidate information from the resume. " +
          "Do not invent information. " +
          "Use null when the summary cannot be determined."
      },

      {
        role: "user",

        content: resumeText,
      },
    ],

    // This is the important part.
    //
    // zodTextFormat converts ResumeSchema into the
    // structured-output schema expected by OpenAI.
    //
    // "resume" is the name of the structured output.
    text: {

      format: zodTextFormat(
        ResumeSchema,
        "resume"
      ),
    },
  });


  // ----------------------------------------------------------
  // 11. HANDLE INCOMPLETE RESPONSE
  // ----------------------------------------------------------

  // The model may stop before producing a complete response.
  //
  // The current Responses API exposes:
  //
  // response.status === "incomplete"
  //
  // and provides incomplete_details.reason.
  //
  // One documented reason is max_output_tokens.

  if (response.status === "incomplete") {

    logEvent(
      "llm.response.incomplete",
      {
        model,
        reason:
          response.incomplete_details?.reason,
      }
    );


    throw new Error(
      `Incomplete LLM response: ${
        response.incomplete_details?.reason
      }`
    );
  }


  // ----------------------------------------------------------
  // 12. FIND THE MODEL MESSAGE
  // ----------------------------------------------------------

  // Responses can contain different output item types.
  //
  // We are interested in the message containing our
  // structured output.

  for (const output of response.output) {

    // Ignore non-message output items.
    if (output.type !== "message") {
      continue;
    }


    // A message can contain multiple content items.
    for (const item of output.content) {


      // ------------------------------------------------------
      // 13. HANDLE REFUSAL
      // ------------------------------------------------------

      // A model can refuse for safety reasons.
      //
      // A refusal isn't expected to match our ResumeSchema.
      //
      // Therefore, it must be handled separately.

      if (item.type === "refusal") {

        logEvent(
          "llm.response.refusal",
          {
            model,
          }
        );


        throw new Error(
          `Model refused request: ${item.refusal}`
        );
      }


      // ------------------------------------------------------
      // 14. HANDLE STRUCTURED OUTPUT
      // ------------------------------------------------------

      if (item.type === "output_text") {


        // zodTextFormat + responses.parse gives us parsed
        // structured data on the output item.
        //
        // We still check that it exists.
        if (!item.parsed) {

          throw new Error(
            "Structured response could not be parsed."
          );
        }


        // item.parsed is our structured result.
        //
        // Example:
        //
        // {
        //   name: "Amey",
        //   email: "amey@gmail.com",
        //   skills: ["React", "Node.js"],
        //   experienceYears: 2,
        //   seniority: "junior",
        //   summary: null
        // }

        const resume =
          item.parsed as Resume;


        logEvent(
          "llm.response.structured",
          {
            model,
          }
        );


        return resume;
      }
    }
  }


  // ----------------------------------------------------------
  // 15. NO USABLE OUTPUT
  // ----------------------------------------------------------

  throw new Error(
    "LLM response did not contain usable structured output."
  );
}


// ------------------------------------------------------------
// 16. RELIABLE LLM CALL
// ------------------------------------------------------------

async function extractResume(
  resumeText: string
): Promise<Resume> {


  // Primary model comes from environment.
  //
  // Example:
  //
  // OPENAI_PRIMARY_MODEL=...
  //
  const primaryModel =
    process.env.OPENAI_PRIMARY_MODEL;

  if (!primaryModel) {

    throw new Error(
      "OPENAI_PRIMARY_MODEL is not configured."
    );
  }


  // Optional fallback model.
  const fallbackModel =
    process.env.OPENAI_FALLBACK_MODEL;


  // ----------------------------------------------------------
  // 17. RETRY PRIMARY MODEL
  // ----------------------------------------------------------

  const maxAttempts = 3;


  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {

    try {

      logEvent(
        "llm.attempt",
        {
          provider: "openai",
          model: primaryModel,
          attempt: attempt + 1,
        }
      );


      // Call the primary model.
      const resume =
        await callModel(
          primaryModel,
          resumeText
        );


      // ------------------------------------------------------
      // 18. SEMANTIC VALIDATION
      // ------------------------------------------------------

      const semanticErrors =
        validateResumeSemantics(resume);


      // No semantic errors.
      if (semanticErrors.length === 0) {

        logEvent(
          "resume.validation.success",
          {
            validation: "semantic",
          }
        );


        return resume;
      }


      // ------------------------------------------------------
      // 19. SEMANTIC VALIDATION FAILED
      // ------------------------------------------------------

      logEvent(
        "resume.validation.failed",
        {
          validation: "semantic",
          errors: semanticErrors,
        }
      );


      // Important:
      //
      // This is NOT automatically a network/API failure.
      //
      // Blindly retrying the exact same request could produce
      // the same semantic mistake.
      //
      // We stop here for this example.
      throw new Error(
        `Semantic validation failed: ${
          semanticErrors.join("; ")
        }`
      );


    } catch (error) {


      // ------------------------------------------------------
      // 20. CHECK WHETHER WE SHOULD RETRY
      // ------------------------------------------------------

      const retryable =
        isRetryableError(error);


      logEvent(
        "llm.attempt.failed",
        {
          attempt: attempt + 1,
          retryable,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        }
      );


      // Don't retry non-retryable errors.
      if (!retryable) {
        break;
      }


      // Don't retry after the final attempt.
      if (attempt === maxAttempts - 1) {
        break;
      }


      // Calculate exponential backoff delay.
      const delay =
        getBackoffDelay(attempt);


      logEvent(
        "llm.retry.scheduled",
        {
          attempt: attempt + 1,
          delayMs: delay,
        }
      );


      // Wait before retrying.
      await sleep(delay);
    }
  }


  // ----------------------------------------------------------
  // 21. FALLBACK MODEL
  // ----------------------------------------------------------

  // If all primary attempts fail,
  // and a fallback model is configured,
  // try the fallback.

  if (fallbackModel) {

    try {

      logEvent(
        "llm.fallback.started",
        {
          model: fallbackModel,
        }
      );


      const resume =
        await callModel(
          fallbackModel,
          resumeText
        );


      // Run semantic validation on fallback output too.
      const semanticErrors =
        validateResumeSemantics(resume);


      if (semanticErrors.length > 0) {

        logEvent(
          "llm.fallback.semantic_failure",
          {
            errors: semanticErrors,
          }
        );


        throw new Error(
          `Fallback semantic validation failed: ${
            semanticErrors.join("; ")
          }`
        );
      }


      logEvent(
        "llm.fallback.success",
        {
          model: fallbackModel,
        }
      );


      return resume;


    } catch (error) {

      logEvent(
        "llm.fallback.failed",
        {
          model: fallbackModel,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        }
      );
    }
  }


  // ----------------------------------------------------------
  // 22. COMPLETE FAILURE
  // ----------------------------------------------------------

  throw new Error(
    "Resume extraction failed after retries and fallback."
  );
}


// ------------------------------------------------------------
// 23. USE OUR AI FUNCTION
// ------------------------------------------------------------

async function main() {


  const resumeText = `
    Amey Gawade is a software developer.

    Email: amey@example.com

    Experience:
    2 years working with JavaScript and Node.js.

    Skills:
    JavaScript, TypeScript, React, Node.js, MongoDB
  `;


  try {

    const resume =
      await extractResume(resumeText);


    console.log(
      "\nFINAL VALIDATED RESULT:"
    );

    console.log(
      JSON.stringify(
        resume,
        null,
        2
      )
    );


  } catch (error) {


    console.error(
      "\nAPPLICATION ERROR:"
    );


    console.error(
      error instanceof Error
        ? error.message
        : String(error)
    );
  }
}


// Run application.
main();