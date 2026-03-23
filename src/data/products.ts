export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  status: "Live" | "Early Access" | "In Progress" | "Experiment";
  category: string;
  tier: "featured" | "tool";
  cta: string;
  href?: string;
  trialUrl?: string;
  trialCta?: string;
  features: { title: string; description: string }[];
  useCases: string[];
  stack: string[];
}

export const products: Product[] = [
  // --- Featured Products ---
  {
    slug: "actuallyship",
    name: "ActuallyShip",
    tagline: "The thinking layer before your coding agent.",
    description:
      "ActuallyShip helps builders turn messy ideas into clearer decisions, tighter scope, and build-ready briefs before they start building.",
    longDescription:
      "ActuallyShip is for the gap before your first line of code. You feed it context about what you want to build, who it's for, and what constraints you're working with. It flags ambiguity, identifies scope traps, and produces a structured brief a coding agent or a human can work from directly. Most builders lose hours to false starts and rework because they skip the planning step. ActuallyShip makes planning fast enough that you stop skipping it.",
    status: "Early Access",
    category: "Builder Workflow / AI Product",
    tier: "featured",
    cta: "View ActuallyShip",
    trialUrl: "https://www.actuallyship.app",
    trialCta: "Try one free clarity session",
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
    slug: "mecoach",
    name: "MeCoach",
    tagline: "AI coaching that helps you think clearly and move forward.",
    href: "https://www.MeCoach.app",
    description:
      "Structured coaching sessions that help you reflect, reframe, and figure out what to do next.",
    longDescription:
      "MeCoach is a structured reflection tool modeled on how good executive coaches work. Instead of open-ended chat, it walks through four stages: prompt, reflect, reframe, commit. Each session exposes patterns in how you think, pushes back on your assumptions, and ends with a specific commitment. Built for people who are good at getting things done but rarely ask whether they're working on the right things.",
    status: "In Progress",
    category: "Coaching / AI Product",
    tier: "featured",
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
  // --- Builder & Creator Tools ---
  {
    slug: "agentreplay",
    name: "AgentReplay",
    tagline: "Turn live AI coding sessions into interactive replays.",
    description:
      "AgentReplay captures AI coding sessions and turns them into replayable, explorable artifacts with chapters, key moments, transcripts, and session data.",
    longDescription:
      "AgentReplay sits between your coding agent and your audience. It captures what happens during a session, provides a live streaming dashboard with OBS overlays and voice narration, and exports everything as a structured replay. Each export has chapters, key moments, a transcript, lessons, and session analytics. If you stream AI coding, teach with it, or just want to review how a build went, this is how you do it.",
    status: "In Progress",
    category: "Creator Tools / AI Coding / Replay",
    tier: "tool",
    cta: "View AgentReplay",
    features: [
      {
        title: "Live dashboard",
        description:
          "Real-time event feed that captures agent file edits, tool calls, and decisions as they happen.",
      },
      {
        title: "Stream overlays and narration",
        description:
          "OBS-ready browser overlays and optional AI voice narration for live coding streams.",
      },
      {
        title: "Replay artifacts",
        description:
          "Every session exports as a structured replay with chapters, key moments, and session stats.",
      },
      {
        title: "Transcripts and lessons",
        description:
          "Full conversation transcripts and extracted lessons with takeaways for each chapter.",
      },
    ],
    useCases: [
      "Streamers showing AI coding sessions live",
      "Educators teaching how coding agents work",
      "Builders who want a reviewable record of every session",
      "Teams monitoring multiple agents in parallel",
    ],
    stack: ["Next.js", "TypeScript", "WebSocket", "ElevenLabs"],
  },
  {
    slug: "socialforge",
    name: "SocialForge",
    tagline: "A draft-first social content workflow for builders.",
    description:
      "Turns build logs, ideas, and progress updates into social drafts so you can post without context-switching out of your work.",
    longDescription:
      "Most builders know they should post about their work, but switching from code to content breaks flow. SocialForge works from the artifacts you already produce. Feed it a commit message, a build log entry, a quick voice note, or a screenshot, and it produces platform-specific drafts you can review and post in under a minute. The point is to make posting a byproduct of building, not a line item on your to-do list.",
    status: "In Progress",
    category: "Content Ops / Automation",
    tier: "tool",
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
    slug: "actuallyship-ide",
    name: "ActuallyShip IDE",
    tagline: "An execution environment for shipping with AI.",
    description:
      "A builder-focused environment for turning plans, prompts, and product context into real execution.",
    longDescription:
      "ActuallyShip IDE takes the briefs and plans from ActuallyShip and gives you a workspace to execute on them. It combines prompt management, file context, and agent orchestration into one interface so you can go from plan to shipped code without juggling five different tools. Still experimental, but the goal is to close the gap between deciding what to build and actually building it.",
    status: "In Progress",
    category: "Builder Tools / IDE",
    tier: "tool",
    cta: "View ActuallyShip IDE",
    features: [
      {
        title: "Brief-to-execution bridge",
        description:
          "Import plans from ActuallyShip and execute against them directly.",
      },
      {
        title: "Prompt workspace",
        description:
          "Manage, test, and iterate on prompts alongside your code.",
      },
      {
        title: "Agent orchestration",
        description:
          "Run and monitor coding agents from within the IDE.",
      },
      {
        title: "Context management",
        description:
          "Keep product context, technical constraints, and agent history in one place.",
      },
    ],
    useCases: [
      "Builders using ActuallyShip who want a tighter execution loop",
      "Teams managing multiple coding agents on a project",
      "Anyone who wants plan-to-code in a single workspace",
    ],
    stack: ["TypeScript", "Electron", "Claude API"],
  },
  {
    slug: "voiceforge",
    name: "VoiceForge",
    tagline: "Fast capture for spoken ideas, notes, and workflow input.",
    description:
      "Speak an idea, get clean text back. Pipe it into ActuallyShip, SocialForge, or wherever you need it.",
    longDescription:
      "Sometimes the fastest way to capture an idea is to say it out loud. VoiceForge records voice input and transcribes it into clean text you can feed into other tools. Built as the input layer for the rest of the product studio, so you can speak a product idea and pipe it into ActuallyShip, dictate a build log entry for SocialForge, or capture meeting notes on the fly.",
    status: "In Progress",
    category: "Input / Capture / Voice",
    tier: "tool",
    cta: "View VoiceForge",
    features: [
      {
        title: "Fast transcription",
        description:
          "Speak and get clean text back in seconds.",
      },
      {
        title: "Workflow integration",
        description:
          "Pipe transcribed text into ActuallyShip, SocialForge, or any input field.",
      },
      {
        title: "Voice notes",
        description:
          "Save and organize spoken notes by project or context.",
      },
      {
        title: "Hands-free capture",
        description:
          "Record ideas while walking, driving, or away from the keyboard.",
      },
    ],
    useCases: [
      "Capturing product ideas while away from the keyboard",
      "Dictating build log entries instead of typing them",
      "Voice-first input for other tools in the studio",
      "Quick meeting note capture",
    ],
    stack: ["Next.js", "TypeScript", "Whisper API", "Vercel"],
  },
];

export const featuredProducts = products.filter((p) => p.tier === "featured");
export const toolProducts = products.filter((p) => p.tier === "tool");

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
