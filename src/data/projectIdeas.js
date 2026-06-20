export const projectIdeas = [
  {
    id: "graphrag-enterprise",
    name: "GraphRAG-Enterprise",
    pitch: "Enterprise knowledge graph + vector retrieval system for highly contextual multi-hop Q&A.",
    selected: true,
    relevantCompanies: ["Neo4j", "Mad Street Den", "Uniphore", "Glean", "Fractal Analytics"],
    whyFits: "Directly leverages my Neo4j background while building advanced retrieval methods highly sought after by top AI product companies.",
    scores: {
      llmDepth: 8,
      backendDepth: 9,
      dataEngDepth: 9,
      mlopsDepth: 7,
      difficulty: 8,
      resumeImpact: 10
    },
    aiConcepts: ["Graph RAG", "Vector Fusion", "Knowledge Graphs", "Eval Pipelines"],
    techStack: ["Python", "FastAPI", "Neo4j", "LangChain", "OpenAI API", "Docker"],
    buildTime: "3-4 Weeks",
    features: {
      mvp: "Basic pipeline to ingest PDFs, extract entities, store in Neo4j, and run simple hybrid search queries.",
      production: "Robust FastAPI wrapper, streaming responses, error handling, and a basic evaluation suite against a ground-truth dataset.",
      impressive: "Automated schema generation, dynamic graph fusion during retrieval, and a beautiful UI to visualize the reasoning sub-graph."
    },
    resumeBullets: [
      "Architected a GraphRAG system utilizing Neo4j and vector embeddings to resolve multi-hop queries over unstructured enterprise documents.",
      "Engineered a dynamic retrieval pipeline in FastAPI reducing hallucinations by grounding LLM responses in explicitly constructed knowledge graphs.",
      "Implemented a comprehensive evaluation suite using RAGAS to continuously monitor and improve retrieval precision and recall metrics."
    ]
  },
  {
    id: "agentmesh",
    name: "AgentMesh",
    pitch: "A resilient multi-agent orchestration engine with inter-agent memory and guardrails.",
    selected: true,
    relevantCompanies: ["Composio", "CrewAI", "Letta", "Botpress", "Ema"],
    whyFits: "Multi-agent systems are the most heavily recruited skillset right now. Showcasing custom agent coordination stands out.",
    scores: {
      llmDepth: 10,
      backendDepth: 8,
      dataEngDepth: 6,
      mlopsDepth: 8,
      difficulty: 9,
      resumeImpact: 10
    },
    aiConcepts: ["Agentic AI", "Tool Calling", "Memory Systems", "Guardrails", "Multi-Agent Routing"],
    techStack: ["Python", "LangGraph", "PostgreSQL", "Pydantic", "Redis"],
    buildTime: "4 Weeks",
    features: {
      mvp: "A dual-agent setup (Researcher & Writer) communicating via a shared scratchpad to complete a simple goal.",
      production: "Dynamic task router, persistent inter-agent memory stored in PostgreSQL, and semantic tool calling.",
      impressive: "Monitoring dashboard, strict output guardrails using structured JSON generation, and human-in-the-loop approval workflows."
    },
    resumeBullets: [
      "Built AgentMesh, a scalable multi-agent engine using LangGraph capable of autonomous task routing and inter-agent collaboration.",
      "Designed a persistent memory layer utilizing PostgreSQL and Redis, allowing agents to resume interrupted complex workflows flawlessly.",
      "Integrated a robust guardrail system to validate AI outputs against strict schemas, ensuring enterprise-grade reliability and safety."
    ]
  },
  // Placeholders
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `placeholder-${i + 3}`,
    name: `Placeholder Project Idea ${i + 3}`,
    pitch: "This is a placeholder pitch for an upcoming project concept. Content will be added here soon.",
    selected: false,
    relevantCompanies: ["Placeholder Co 1", "Placeholder Co 2"],
    whyFits: "Placeholder reasoning for why this project is a good fit for my background and target companies.",
    scores: {
      llmDepth: 7,
      backendDepth: 7,
      dataEngDepth: 7,
      mlopsDepth: 7,
      difficulty: 7,
      resumeImpact: 7
    },
    aiConcepts: ["Concept 1", "Concept 2", "Concept 3"],
    techStack: ["Tech 1", "Tech 2", "Tech 3"],
    buildTime: "2 Weeks",
    features: {
      mvp: "Placeholder MVP feature description detailing the core functionality.",
      production: "Placeholder Production feature description showing how to make it robust.",
      impressive: "Placeholder Impressive feature showing advanced edge cases handled."
    },
    resumeBullets: [
      "Placeholder resume bullet demonstrating impact and technologies.",
      "Placeholder resume bullet demonstrating impact and technologies.",
      "Placeholder resume bullet demonstrating impact and technologies."
    ]
  }))
];
