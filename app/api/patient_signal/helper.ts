import neo4j from "neo4j-driver"
import { neo4jDriver } from "@/utils/neo4j"
import { resolve_results } from "../knowledge_graph/resolver"
import { initialize } from "../initialize/helper"
import { NetworkSchema } from "../knowledge_graph/route"
import { EnrichmentNodeType } from "./constants"

// Multi-omic signal molecules for a patient (Gene/Protein nodes hit by >= 3 omic edges)
// plus the enriched Kinases, TFs or Pathways ($enrichment_node_type) linked to them.
// Neo4j 5.19 has no dynamic labels (:$(...) needs 5.26+), so the label is checked with IN labels(...).
// The final RETURN adds n and r, the columns resolve_results reads.
export const patient_signal_query = `
MATCH (p:Patient {id: $patient_id})-[r:phosphorylated|acetylated|glycosylated|ubiquitylated|upregulated|downregulated|mutated|hypermethylated|hypomethylated]->(m:Protein|Gene)
WITH p, m, collect(r) AS rels
WHERE size(rels) >= 2
WITH p, collect(m) AS signalMols, m.label AS signalMolSym

CALL {
  // 1. Multi-omic signal edges (Patient → Gene/Protein)
  WITH p, signalMols, signalMolSym
  MATCH path = (p)-[:phosphorylated|acetylated|glycosylated|ubiquitylated|upregulated|downregulated|mutated|hypermethylated|hypomethylated]->(:Protein|Gene{label:signalMolSym})
  RETURN path

  UNION

  // 2. Enriched Kinases/TFs/Pathways that regulate (or, for Pathways, contain) any of those molecules, or enriched Pathways that contain any of those molecules
  WITH p, signalMols, signalMolSym
  MATCH path = (p)-[:enriched]->(enriched_node)-[]->(:Protein|Gene{label:signalMolSym})
  WHERE $enrichment_node_type IN labels(enriched_node)
  RETURN path
}
RETURN path, nodes(path) AS n, relationships(path) AS r
`

export const resolve_patient_signal = async ({ patient_id, enrichment_node_type }: { patient_id: string, enrichment_node_type: EnrichmentNodeType }): Promise<NetworkSchema> => {
	const { aggr_scores, colors, arrow_shape } = await initialize()
	return resolve_results({
		query: patient_signal_query,
		query_params: { patient_id, enrichment_node_type },
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
// Runs after the query so the >= 3 edge threshold is still computed over all omic edges.
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

// Distinguishes "unknown patient" from "no molecule passes the >= 3 edge filter" when the result is empty
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
