// Edit this file to customize your portfolio. No build step needed.
window.PORTFOLIO_CONFIG = {
  githubUsername: "bxnkuoch",

  name: "Benjamin Kuoch",
  role: "CS @ Drexel University",
  headline: "I build AI-powered tools and ship them fast, usually with a team and a deadline.",
  about:
    "Computer Science student at Drexel University focused on machine learning. " +
    "I like hackathons, multi-agent systems, and turning messy real-world data into something useful.",

  // Short status pill above the headline. Set to "" to hide.
  currently: "Building an adaptive AI music system",

  links: {
    github: "https://github.com/bxnkuoch",
    linkedin: "", // e.g. "https://www.linkedin.com/in/your-handle"
    email: "",    // e.g. "you@example.com"
    resume: "",   // e.g. "assets/resume.pdf"
  },

  // Curated projects, shown in this order. `featured: true` makes a wide card.
  //   repo:       "owner/name" on GitHub (used for the Code link)
  //   type:       "solo" or "team"
  //   event:      hackathon / org name (optional)
  //   date:       free text, e.g. "Oct 2026"
  //   role:       what YOU did — most important line for collaborations
  //   highlights: short bullets (featured cards only)
  //   demo:       live URL (optional)
  //   image:      e.g. "assets/ruconnect.png" (optional)
  projects: [
    {
      title: "Adaptive AI Music",
      repo: "bxnkuoch/music_gen",
      type: "solo",
      date: "Sep 2026",
      featured: true,
      description:
        "A music system that learns one listener's taste from \"A or B?\" feedback, then uses it to steer " +
        "generation and rank new songs. Open-source models generate and embed the audio; the preference " +
        "learning, exploration and evaluation are built from scratch.",
      highlights: [
        "Bayesian Bradley-Terry model learns taste from pairwise preferences instead of star ratings",
        "Thompson-sampling exploration with diversity-aware slates over a 540-song generated library",
        "Generates 8 candidates per prompt with ACE-Step, ranks them by the learned model, and blind A/B tests the personalization",
      ],
      tags: ["Python", "PyTorch", "ACE-Step", "CLAP", "FastAPI", "pgvector", "Next.js"],
    },
    {
      title: "RUConnect",
      repo: "mlhv/RUConnect",
      type: "team",
      event: "HackRU 2026",
      date: "Oct 2026",
      featured: true,
      description:
        "A 3D map of every event on Rutgers College Ave. An agent swarm turns flyers, Instagram posts " +
        "and event-board pages into structured events; buildings glow when something is happening, and " +
        "a voice assistant picks events and flies the camera to them.",
      role: "Built the event ingestion pipeline",
      highlights: [
        "Designed a multi-agent swarm (Scout, Reader, Critic, Deduper) for scraping and extraction",
        "Shipped flyer upload with Reader/Verifier agents and a live streaming view of the swarm",
        "Hardened the pipeline for flaky venue Wi-Fi with caching and synthetic test flyers",
      ],
      tags: ["TypeScript", "Multi-agent", "LLMs", "Mapbox"],
    },
    {
      title: "Pic-A-Recipe",
      repo: "ywcharles/sasehacks-2024",
      type: "team",
      event: "SASEHacks 2024",
      date: "Nov 2024",
      description:
        "Snap a photo of your fridge, get recipes. Recognizes ingredients with FoodVisor, lets you edit the list, " +
        "then generates recipes with Gemini.",
      tags: ["React Native", "Expo", "Gemini", "Computer Vision"],
    },
    {
      title: "Reddit Medic",
      repo: "bxnkuoch/Reddit-Medic",
      type: "solo",
      date: "Jun 2025",
      description:
        "An AI agent that pulls posts and top comments from healthcare subreddits like r/AskDocs and summarizes " +
        "the key concerns and discussion themes with GPT.",
      tags: ["Python", "OpenAI", "PRAW"],
    },
    {
      title: "AdapTeam",
      repo: "kxllydo/codefest24-25",
      type: "team",
      event: "CodeFest",
      date: "Jun 2024",
      description:
        "Matches prospective adoptive parents with children awaiting adoption. A neural-network classifier scores " +
        "parent and child profiles (age, location, siblings, disability and more) to suggest compatible matches.",
      role: "Wrote the scripts that send input data to AWS SageMaker and retrieve predictions",
      tags: ["Python", "Flask", "scikit-learn", "AWS SageMaker"],
    },
    {
      title: "Schwab Account Dashboard",
      repo: "bxnkuoch/Charles_Schwab_API",
      type: "solo",
      date: "Sep 2024",
      description: "Local web app that authenticates with the Charles Schwab API via OAuth and displays account data.",
      tags: ["Python", "OAuth", "REST APIs"],
    },
  ],

  // Grouped skill chips for the Skills section.
  skills: {
    Languages: ["Python", "TypeScript", "JavaScript", "C", "HTML/CSS"],
    "AI / ML": ["PyTorch", "scikit-learn", "Multi-agent LLM systems", "OpenAI API", "Gemini", "AWS SageMaker", "CLAP embeddings"],
    "Web & Mobile": ["Next.js", "React Native", "Expo", "FastAPI", "Mapbox"],
    "Data & Tools": ["PostgreSQL + pgvector", "Docker", "Git"],
  },

  // Any other public repo of yours not listed above appears under "Archive",
  // pulled live from GitHub. Hide repos here:
  exclude: ["bxnkuoch.github.io", "codefest24-25", "sasehacks-2024"],
  showArchive: true,
};
