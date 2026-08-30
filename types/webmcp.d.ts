interface ModelContextToolResult {
  content: Array<{ type: "text"; text: string }>;
}

interface ModelContextToolDefinition {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (args: Record<string, unknown>) => ModelContextToolResult | Promise<ModelContextToolResult>;
}

interface ModelContext {
  registerTool(tool: ModelContextToolDefinition, options?: { signal?: AbortSignal }): Promise<void>;
}

interface Document {
  modelContext?: ModelContext;
}
