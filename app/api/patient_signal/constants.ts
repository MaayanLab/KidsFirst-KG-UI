// Shared by the API route, the server component and the client form (kept free of neo4j imports)
export const ENRICHMENT_NODE_TYPES = ["Kinase", "TranscriptionFactor", "Pathway"] as const
export type EnrichmentNodeType = typeof ENRICHMENT_NODE_TYPES[number]
export const DEFAULT_ENRICHMENT_NODE_TYPE: EnrichmentNodeType = "Kinase"

export const is_enrichment_node_type = (value?: string | null): value is EnrichmentNodeType => (
	(ENRICHMENT_NODE_TYPES as ReadonlyArray<string>).indexOf(value) > -1
)
