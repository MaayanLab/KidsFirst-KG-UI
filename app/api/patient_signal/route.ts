import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { resolve_patient_signal, filter_by_relation, parse_relation } from "./helper"
import { ENRICHMENT_NODE_TYPES, DEFAULT_ENRICHMENT_NODE_TYPE, DEFAULT_OMIC_SIGNAL_THRESHOLD, is_omic_signal_threshold } from "./constants"

const input_query_schema = z.object({
	patient_id: z.string().trim().min(1),
	enrichment_node_type: z.enum(ENRICHMENT_NODE_TYPES).default(DEFAULT_ENRICHMENT_NODE_TYPE),
	omic_signal_threshold: z.coerce.number().refine(is_omic_signal_threshold, "must be an integer from 2 to 11").default(DEFAULT_OMIC_SIGNAL_THRESHOLD),
	relation: z.array(z.string()),
})

/**
 * @swagger
 * /api/patient_signal:
 *   get:
 *     description: Multi-omic signal genes (Genes altered in >= omic_signal_threshold omic layers, PTMs via their sites) for a patient, plus the enriched Kinases/TFs (enriched.type) or GO terms that regulate/contain them
 *     tags:
 *       - custom queries
 *     parameters:
 *       - name: patient_id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           default: 7316-100
 *       - name: enrichment_node_type
 *         in: query
 *         description: Enriched node type (Kinase, TranscriptionFactor or Pathway/GO term) linked to the multi-omic signal molecules
 *         schema:
 *           type: string
 *           enum: [Kinase, TranscriptionFactor, Pathway]
 *           default: Kinase
 *       - name: omic_signal_threshold
 *         in: query
 *         description: Minimum number of distinct omic layers (of 11) a Gene must be altered in to count as a signal gene
 *         schema:
 *           type: integer
 *           minimum: 2
 *           maximum: 11
 *           default: 3
 *       - name: relation
 *         in: query
 *         description: Comma-separated edge types to keep (e.g. modified,site,enriched,regulates); omit for all
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subnetwork
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nodes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 edges:
 *                   type: array
 *                   items:
 *                     type: object
 */
export async function GET(req: NextRequest) {
	// read raw strings; convert_query would coerce purely numeric ids to numbers
	const parsed = input_query_schema.safeParse({
		patient_id: req.nextUrl.searchParams.get("patient_id") ?? undefined,
		enrichment_node_type: req.nextUrl.searchParams.get("enrichment_node_type") ?? undefined,
		omic_signal_threshold: req.nextUrl.searchParams.get("omic_signal_threshold") ?? undefined,
		relation: parse_relation(req.nextUrl.searchParams.get("relation")),
	})
	if (parsed.success === false) return NextResponse.json({ error: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 400 })
	try {
		const { patient_id, enrichment_node_type, omic_signal_threshold, relation } = parsed.data
		const results = await resolve_patient_signal({ patient_id, enrichment_node_type, omic_signal_threshold })
		return NextResponse.json(filter_by_relation(results, relation), { status: 200 })
	} catch (e) {
		return NextResponse.json({ error: e.message }, { status: 400 })
	}
}
