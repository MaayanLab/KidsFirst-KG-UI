// Shared by the API route, the server component and the client form (kept free of neo4j imports)
export const ENRICHMENT_NODE_TYPES = ["Kinase", "TranscriptionFactor", "Pathway"] as const
export type EnrichmentNodeType = typeof ENRICHMENT_NODE_TYPES[number]
export const DEFAULT_ENRICHMENT_NODE_TYPE: EnrichmentNodeType = "Kinase"

export const is_enrichment_node_type = (value?: string | null): value is EnrichmentNodeType => (
	(ENRICHMENT_NODE_TYPES as ReadonlyArray<string>).indexOf(value) > -1
)

// Minimum number of distinct omic layers a Gene needs to count as a signal gene.
// 11 layers in total: 7 direct edge types (gene/protein expression, mutation, methylation) + 4 PTM site types.
export const OMIC_SIGNAL_THRESHOLDS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const
export type OmicSignalThreshold = typeof OMIC_SIGNAL_THRESHOLDS[number]
export const DEFAULT_OMIC_SIGNAL_THRESHOLD: OmicSignalThreshold = 3

export const is_omic_signal_threshold = (value?: number | null): value is OmicSignalThreshold => (
	(OMIC_SIGNAL_THRESHOLDS as ReadonlyArray<number>).indexOf(value) > -1
)
