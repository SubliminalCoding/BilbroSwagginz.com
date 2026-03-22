export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  status: "Live" | "In Progress";
  category: string;
  cta: string;
  href?: string;
  features: { title: string; description: string }[];
  useCases: string[];
  stack: string[];
}

export const products: Product[] = [
  {
    slug: "actuallyship",
    name: "ActuallyShip",
    tagline: "A context-aware planning engine for builders.",
    description:
      "Helps founders and AI-assisted builders scope their ideas and produce build-ready briefs before they open a coding agent.",
    longDescription:
      "ActuallyShip is for the gap before your first line of code. You feed it context about what you want to build, who it's for, and what constraints you're working with. It flags ambiguity, identifies scope traps, and produces a structured brief a coding agent or a human can work from directly. Most builders lose hours to false starts and rework because they skip the planning step. ActuallyShip makes planning fast enough that you stop skipping it.",
    status: "Live",
    category: "AI Product / Builder Workflow",
    cta: "View ActuallyShip",
    features: [
      {
        title: "Context ingestion",
        description:
          "Paste in notes, voice memos, screenshots, or scattered docs. ActuallyShip pulls out what matters and organizes it.",
      },
      {
        title: "Scope detection",
        description:
          "Flags ideas that are under-specified or carry hidden dependencies.",
      },
      {
        title: "Build-ready briefs",
        description:
          "Outputs a structured document with goals, constraints, user stories, and technical notes ready for a coding agent.",
      },
      {
        title: "Decision prompts",
        description:
          "Pulls out the 3-5 decisions you need to make before building, so you hit them upfront instead of mid-sprint.",
      },
    ],
    useCases: [
      "Solo founders scoping a new feature before opening Claude Code",
      "Teams aligning on what to build before a sprint",
      "Indie hackers turning shower thoughts into build plans they can start on immediately",
      "Coding agents that perform better with a clear brief",
    ],
    stack: ["Next.js", "TypeScript", "Claude API", "Vercel"],
  },
  {
    slug: "socialforge",
    name: "SocialForge",
    tagline: "A draft-first social content workflow for builders.",
    description:
      "Turns ideas, updates, and build logs into social drafts so you don't have to context-switch into content mode.",
    longDescription:
      "Most builders know they should post about their work, but switching from code to content breaks flow. SocialForge works from the artifacts you already produce. Feed it a commit message, a build log entry, a quick voice note, or a screenshot, and it produces platform-specific drafts you can review and post in under a minute. The point is to make posting a byproduct of building, not a line item on your to-do list.",
    status: "In Progress",
    category: "Content Ops / Automation",
    cta: "View SocialForge",
    features: [
      {
        title: "Multi-format input",
        description:
          "Accepts build logs, commit messages, voice notes, and screenshots as raw material for drafts.",
      },
      {
        title: "Platform-aware output",
        description:
          "Generates drafts sized and styled for Twitter/X, LinkedIn, and Threads.",
      },
      {
        title: "Tone calibration",
        description:
          "Learns your voice so drafts match how you actually write.",
      },
      {
        title: "Batch drafting",
        description:
          "Turn a week of build activity into 5-7 posts in one session.",
      },
    ],
    useCases: [
      "Builders who want to post consistently without losing coding momentum",
      "Indie hackers documenting their build-in-public process",
      "Teams posting progress updates to multiple platforms",
      "Anyone who has ideas for posts but never gets around to writing them",
    ],
    stack: ["Next.js", "TypeScript", "Claude API", "Vercel"],
  },
  {
    slug: "mecoach",
    name: "MeCoach",
    tagline: "AI-driven leadership coaching, built for reflection.",
    href: "https://www.MeCoach.app",
    description:
      "A structured way to reflect on decisions and figure out what to do next.",
    longDescription:
      "MeCoach is a structured reflection tool modeled on how good executive coaches work. Instead of open-ended chat, it walks through four stages: prompt, reflect, reframe, commit. Each session exposes patterns in how you think, pushes back on your assumptions, and ends with a specific commitment. Built for people who are good at getting things done but rarely ask whether they're working on the right things.",
    status: "Live",
    category: "AI Coaching",
    cta: "Visit MeCoach.app",
    features: [
      {
        title: "Four-stage reflection loop",
        description:
          "Prompt, reflect, reframe, commit. Adapted from how professional coaches actually run sessions.",
      },
      {
        title: "Pattern recognition",
        description:
          "Tracks themes across sessions and flags blind spots or repeated decision habits.",
      },
      {
        title: "Challenge mode",
        description:
          "Pushes back on surface-level answers and asks the follow-up questions a good coach would ask.",
      },
      {
        title: "Session summaries",
        description:
          "Each session produces a one-page summary with insights, commitments, and patterns to watch.",
      },
    ],
    useCases: [
      "Founders who need a thinking partner but can't afford a coach",
      "Team leads making decisions that affect other people",
      "Anyone who keeps putting out fires without stepping back to think",
      "People preparing for difficult conversations or major decisions",
    ],
    stack: ["Next.js", "TypeScript", "Claude API", "Vercel"],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
