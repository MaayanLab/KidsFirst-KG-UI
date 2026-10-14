import neo4j from "neo4j-driver"
import { neo4jDriver } from "@/utils/neo4j"
import { resolve_results } from "../knowledge_graph/resolver"
import { initialize } from "../initialize/helper"
import { NetworkSchema } from "../knowledge_graph/route"
import { EnrichmentNodeType, OmicSignalThreshold } from "./constants"

// Multi-omic signal genes for a patient (Genes with >= $omic_signal_threshold distinct omic layers)
// plus the enriched Kinases, TFs or Pathways ($enrichment_node_type) linked to them.
// Omic layers: each direct edge type (expression at gene/protein level, mutation, methylation) and each PTM type,
// where a PTM reaches its Gene through Patient -modified-> *_site <-site- Gene. A PTM type counts once however many sites it hits.
// Kinases and TFs are Gene nodes; the enriched edge's `type` property says which.
// The final RETURN adds n and r, the columns resolve_results reads.
export const patient_signal_query = `
MATCH (p:Patient {id: $patient_id})
CALL {
  WITH p
  MATCH (p)-[r:upregulated_gene|downregulated_gene|upregulated_protein|downregulated_protein|mutated|hypermethylated|hypomethylated]->(g:Gene)
  RETURN g, type(r) AS layer
  UNION
  WITH p
  MATCH (p)-[:modified]->(s:phosphorylated_site|acetylated_site|glycosylated_site|ubiquitinated_site)<-[:site]-(g:Gene)
  RETURN g, labels(s)[0] AS layer
}
WITH p, g, count(DISTINCT layer) AS n_layers
WHERE n_layers >= $omic_signal_threshold
WITH p, collect(g) AS signal_genes

CALL {
  // 1. Direct omic edges (Patient → Gene)
  WITH p, signal_genes
  MATCH path = (p)-[:upregulated_gene|downregulated_gene|upregulated_protein|downregulated_protein|mutated|hypermethylated|hypomethylated]->(g:Gene)
  WHERE g IN signal_genes
  RETURN path

  UNION

  // 2. PTM edges, through the modified site to its parent Gene (Patient → site ← Gene)
  WITH p, signal_genes
  MATCH path = (p)-[:modified]->(:phosphorylated_site|acetylated_site|glycosylated_site|ubiquitinated_site)<-[:site]-(g:Gene)
  WHERE g IN signal_genes
  RETURN path

  UNION

  // 3a. Enriched Kinases/TFs that regulate any signal gene
  WITH p, signal_genes
  MATCH path = (p)-[e:enriched]->(:Gene)-[:regulates]->(g:Gene)
  WHERE e.type = $enrichment_node_type AND g IN signal_genes
  RETURN path

  UNION

  // 3b. Enriched Pathways that contain any signal gene
  WITH p, signal_genes
  MATCH path = (p)-[:enriched]->(:Pathway)-[:contains]->(g:Gene)
  WHERE $enrichment_node_type = 'Pathway' AND g IN signal_genes
  RETURN path
}
RETURN path, nodes(path) AS n, relationships(path) AS r
`

export const resolve_patient_signal = async ({ patient_id, enrichment_node_type, omic_signal_threshold }: { patient_id: string, enrichment_node_type: EnrichmentNodeType, omic_signal_threshold: OmicSignalThreshold }): Promise<NetworkSchema> => {
	const { aggr_scores, colors, arrow_shape } = await initialize()
	return resolve_results({
		query: patient_signal_query,
		query_params: { patient_id, enrichment_node_type, omic_signal_threshold },
		terms: [patient_id],
		fields: ["id"],
		aggr_scores,
		colors,
		arrow_shape,
		distinct_edges: true,
	})
}

// relation is carried in the URL as a comma-separated list
export const parse_relation = (relation?: string | null): Array<string> => (
	(relation || '').split(',').map(i => i.trim()).filter(i => i)
)

// Edge types present in a result, used as the relation filter options
export const get_edge_types = (elements: NetworkSchema): Array<string> => (
	Array.from(new Set(elements.edges.map(e => e.data.label))).sort()
)

// Post-query view filter: keeps edges whose type is selected, the nodes they touch, and the patient.
// Runs after the query so the omic_signal_threshold layer threshold is still computed over all omic edges.
export const filter_by_relation = (elements: NetworkSchema, relation: Array<string>): NetworkSchema => {
	if (relation.length === 0) return elements
	const edges = elements.edges.filter(e => relation.indexOf(e.data.label) > -1)
	const kept = new Set<string>()
	for (const e of edges) {
		kept.add(e.data.source)
		kept.add(e.data.target)
	}
	const nodes = elements.nodes.filter(n => n.data.kind === "Patient" || kept.has(n.data.id))
	return { nodes, edges }
}

// Distinguishes "unknown patient" from "no gene passes the >= 3 layer filter" when the result is empty
export const patient_exists = async ({ patient_id }: { patient_id: string }): Promise<boolean> => {
	const session = neo4jDriver.session({
		defaultAccessMode: neo4j.session.READ
	})
	try {
		const results = await session.readTransaction(txc => txc.run(
			`MATCH (p:Patient {id: $patient_id}) RETURN count(p) > 0 AS found`, { patient_id }
		))
		return results.records[0].get('found')
	} finally {
		session.close()
	}
}
