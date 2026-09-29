// ============================================================
// 1. IMPORT ZOD
// ============================================================

// Import everything from Zod under the name "z".
import * as z from "zod";


// ============================================================
// 2. DEFINE OUR ZOD SCHEMA
// ============================================================

// We are defining the shape of a Resume object.
//
// This is NOT the actual data.
// This is a set of rules describing what valid Resume data
// should look like.
const ResumeSchema = z.object({

  // "name" must exist and its value must be a string.
  name: z.string(),

  // "experienceYears" must exist and must be a number.
  //
  // int() means it must be an integer.
  //
  // min(0) means negative experience is not accepted.
  experienceYears: z
    .number()
    .int()
    .min(0),

  // "skills" must be an array.
  //
  // Every item inside that array must be a string.
  //
  // Example:
  // ["JavaScript", "React", "Node.js"] ✅
  //
  // Example:
  // ["JavaScript", 123] ❌
  skills: z.array(z.string()),

  // "seniority" must be exactly one of these values.
  //
  // This is an enum.
  seniority: z.enum([
    "intern",
    "junior",
    "mid",
    "senior",
  ]),

  // "bio" must exist,
  // but its value can be either a string OR null.
  //
  // "nullable" does NOT mean optional.
  bio: z.string().nullable(),
});


// ============================================================
// 3. GENERATE A TYPESCRIPT TYPE FROM THE ZOD SCHEMA
// ============================================================

// Instead of writing the TypeScript type manually:
//
// type Resume = {
//   name: string;
//   experienceYears: number;
//   skills: string[];
//   seniority: "intern" | "junior" | "mid" | "senior";
//   bio: string | null;
// };
//
// We can let Zod generate it for us.
//
// This is z.infer<>.
type Resume = z.infer<typeof ResumeSchema>;


// ============================================================
// 4. IMAGINE THIS DATA CAME FROM AN HTTP REQUEST OR AN LLM
// ============================================================

// We deliberately use "unknown".
//
// Why?
//
// Because data coming from outside our application cannot
// automatically be trusted.
//
// It could come from:
// - React frontend
// - REST API
// - another server
// - LLM
// - uploaded JSON
//
// We don't know whether it actually matches ResumeSchema.
const incomingData: unknown = {
  name: "Amey",
  experienceYears: 2,
  skills: [
    "JavaScript",
    "React",
    "Node.js",
  ],
  seniority: "junior",
  bio: null,
};


// ============================================================
// 5. VALIDATE USING parse()
// ============================================================

// parse() checks the data against ResumeSchema.
//
// If the data is valid:
//     it returns the parsed data.
//
// If the data is invalid:
//     it throws a ZodError.
const resume = ResumeSchema.parse(incomingData);


// At this point, "resume" is validated according to
// ResumeSchema.
//
// TypeScript knows that resume has this shape:
//
// {
//   name: string;
//   experienceYears: number;
//   skills: string[];
//   seniority: "intern" | "junior" | "mid" | "senior";
//   bio: string | null;
// }

console.log("VALID RESUME:");
console.log(resume);


// ============================================================
// 6. DEMONSTRATE safeParse()
// ============================================================

// Now let's imagine the incoming data is bad.

const badData: unknown = {
  name: 123,                         // ❌ should be string
  experienceYears: "two",            // ❌ should be number
  skills: ["JavaScript", 123],       // ❌ 123 should be string
  seniority: "expert",               // ❌ not one of our enum values
  bio: null,                         // ✅ null is allowed
};


// safeParse() does NOT throw an exception when validation fails.
//
// Instead it returns an object.
//
// Either:
//
// {
//   success: true,
//   data: ...
// }
//
// OR:
//
// {
//   success: false,
//   error: ...
// }

const result = ResumeSchema.safeParse(badData);


// Check whether validation succeeded.
if (!result.success) {

  // Because success is false,
  // result.error contains the validation details.
  console.log("\nVALIDATION FAILED:");

  console.log(result.error);

} else {

  // If success is true,
  // result.data contains the validated data.
  console.log("\nVALIDATION SUCCESSFUL:");

  console.log(result.data);
}


// ============================================================
// 7. CREATE JSON SCHEMA FROM THE ZOD SCHEMA
// ============================================================

// Zod 4 provides z.toJSONSchema().
//
// It converts our Zod schema into JSON Schema.
//
// This is useful when another system needs a
// standardized JSON Schema representation.
//
// One important GenAI use case is structured outputs.
const jsonSchema = z.toJSONSchema(ResumeSchema);


// Print the generated JSON Schema.
console.log("\nGENERATED JSON SCHEMA:");

console.log(
  JSON.stringify(jsonSchema, null, 2)
);


// ============================================================
// 8. MANUALLY WRITE THE SAME IDEA AS JSON SCHEMA
// ============================================================

// To really understand JSON Schema,
// let's manually write the same contract.
//
// Notice:
//
// Zod:
//     z.object()
//     z.string()
//     z.array()
//     z.enum()
//     .nullable()
//
// JSON Schema:
//     type
//     properties
//     required
//     items
//     enum
//     additionalProperties

const ResumeJSONSchema = {

  // The entire value must be an object.
  type: "object",

  // Define rules for each known property.
  properties: {

    // name must be a string.
    name: {
      type: "string",
    },

    // experienceYears must be a number.
    experienceYears: {
      type: "number",
    },

    // skills must be an array.
    skills: {

      // The property itself must be an array.
      type: "array",

      // Every item in the array must be a string.
      items: {
        type: "string",
      },
    },

    // seniority must be one of these exact strings.
    seniority: {

      type: "string",

      enum: [
        "intern",
        "junior",
        "mid",
        "senior",
      ],
    },

    // bio can be string OR null.
    bio: {

      type: ["string", "null"],
    },
  },

  // IMPORTANT:
  //
  // properties does NOT make fields required.
  //
  // required explicitly says which fields must be present.
  required: [
    "name",
    "experienceYears",
    "skills",
    "seniority",
    "bio",
  ],

  // Without this, additional properties are allowed
  // by JSON Schema by default.
  //
  // false means:
  // "Do not allow properties that aren't defined above."
  additionalProperties: false,
};


// Print our manually written JSON Schema.
console.log("\nMANUAL JSON SCHEMA:");

console.log(
  JSON.stringify(ResumeJSONSchema, null, 2)
);


// ============================================================
// 9. VALID DATA
// ============================================================

const validResume: Resume = {
  name: "Amey",
  experienceYears: 2,
  skills: [
    "JavaScript",
    "React",
    "Node.js",
  ],
  seniority: "junior",
  bio: null,
};


// This assignment is useful because TypeScript checks
// whether the object matches the inferred Resume type.
console.log("\nVALID TYPESCRIPT RESUME:");

console.log(validResume);


// ============================================================
// 10. IMPORTANT: NULLABLE VS OPTIONAL
// ============================================================

// This would be valid because bio exists and is null.
//
// {
//   ...
//   bio: null
// }
//
// But:
//
// const invalidResume: Resume = {
//   name: "Amey",
//   experienceYears: 2,
//   skills: ["JavaScript"],
//   seniority: "junior"
// };
//
// would be invalid because "bio" is required.
//
// Why?
//
// Because:
//
// z.string().nullable()
//
// means:
//
// string OR null
//
// It does NOT mean:
//
// string OR null OR missing.
//
// To make it optional, we'd use:
//
// bio: z.string().nullable().optional()
//
// That would allow:
//
// "bio": "I build web apps"
// "bio": null
// or no "bio" field at all.


// ============================================================
// 11. IMPORTANT: EXTRA PROPERTIES
// ============================================================

const extraPropertyData = {
  name: "Amey",
  experienceYears: 2,
  skills: ["JavaScript"],
  seniority: "junior",
  bio: null,

  // This property is NOT in our schema.
  githubFollowers: 5000,
};


// Parse it with our normal Zod object schema.
const parsedExtraProperty = ResumeSchema.parse(
  extraPropertyData
);


// Zod's default object behavior strips unknown keys
// from the parsed result.
//
// So the result corresponds to the defined schema shape.
console.log("\nPARSED DATA WITH EXTRA PROPERTY:");

console.log(parsedExtraProperty);


// ============================================================
// 12. STRICT JSON SCHEMA IDEA
// ============================================================

// Our manual JSON Schema has:
//
// additionalProperties: false
//
// Therefore:
//
// {
//   "name": "Amey",
//   "experienceYears": 2,
//   "skills": ["JavaScript"],
//   "seniority": "junior",
//   "bio": null,
//   "githubFollowers": 5000
// }
//
// would FAIL that JSON Schema.
//
// Because githubFollowers was not defined in "properties".


// ============================================================
// 13. FINAL MENTAL MODEL
// ============================================================
//
// ZOD
//
// ResumeSchema
//     ↓
// Runtime validation
//     ↓
// validated data
//
//
// z.infer
//     ↓
// TypeScript type
//
//
// z.toJSONSchema()
//     ↓
// JSON Schema
//
//
//
// JSON SCHEMA
//
// type
// properties
// required
// items
// enum
// additionalProperties
//
//
// The whole system:
//
// External Data / LLM
//        ↓
//      unknown
//        ↓
//    Zod validation
//        ↓
//  validated application data
//        ↓
//     business logic
//        ↓
//     database / API