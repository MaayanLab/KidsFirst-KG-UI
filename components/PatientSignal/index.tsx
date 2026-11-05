import dynamic from "next/dynamic"
import { Grid, Typography, CircularProgress, Card, CardContent, Stack, Alert, Chip, Box } from "@mui/material"
import { SectionLabel } from "../misc/ui"
import { initialize_kg } from "../TermAndGeneSearch"
import NetworkTable from "../TermAndGeneSearch/network_table"
import PatientSignalForm from "./form"
import PatientSignalToolbar from "./toolbar"
import { resolve_patient_signal, patient_exists, filter_by_relation, get_edge_types, parse_relation } from "@/app/api/patient_signal/helper"
import { NetworkSchema } from "@/app/api/knowledge_graph/route"
import { DEFAULT_ENRICHMENT_NODE_TYPE, is_enrichment_node_type, DEFAULT_OMIC_SIGNAL_THRESHOLD, is_omic_signal_threshold } from "@/app/api/patient_signal/constants"
const Cytoscape = dynamic(() => import('../Cytoscape'),
	{
		ssr: false,
		loading: () => <CircularProgress />
	}
)

// Kinases and TFs are Gene nodes too, so signal genes and enriched nodes are told apart by edge type
const OMIC_EDGES = ["upregulated_gene", "downregulated_gene", "upregulated_protein", "downregulated_protein", "mutated", "hypermethylated", "hypomethylated"]

const statTileSx = { flex: 1, padding: 1.5, borderRadius: "12px", border: 1, borderColor: "divider", backgroundColor: "paperGray.main" }
const statValueSx = { fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }

const PatientSignal = async ({ searchParams, props }: {
	searchParams: {
		patient_id?: string,
		enrichment_node_type?: string,
		omic_signal_threshold?: string,
		relation?: string,
		fullscreen?: 'true',
		view?: string,
		[key: string]: string
	},
	props: {
		title?: string,
		description?: string,
		default_patient_id?: string,
		default_enrichment_node_type?: string,
		default_omic_signal_threshold?: number,
		examples?: Array<string>,
	}
}) => {
	const { schema, tooltip_templates_nodes, tooltip_templates_edges } = await initialize_kg()
	const patient_id = (searchParams.patient_id || props.default_patient_id || '').trim()
	// unknown values in the URL or schema props fall back to the default instead of reaching the query
	const requested_type = (searchParams.enrichment_node_type || props.default_enrichment_node_type || '').trim()
	const enrichment_node_type = is_enrichment_node_type(requested_type) ? requested_type : DEFAULT_ENRICHMENT_NODE_TYPE
	const requested_threshold = Number(searchParams.omic_signal_threshold || props.default_omic_signal_threshold)
	const omic_signal_threshold = is_omic_signal_threshold(requested_threshold) ? requested_threshold : DEFAULT_OMIC_SIGNAL_THRESHOLD
	const relation = parse_relation(searchParams.relation)
	let results: NetworkSchema | null = null
	let elements: NetworkSchema | null = null
	let error: string | null = null
	let found = true
	if (patient_id) {
		try {
			results = await resolve_patient_signal({ patient_id, enrichment_node_type, omic_signal_threshold })
			if (results.nodes.length === 0) found = await patient_exists({ patient_id })
			elements = filter_by_relation(results, relation)
		} catch (e) {
			console.error(e)
			error = e.message || 'Query failed'
		}
	}

	// summary describes the full query result; the relation filter only changes the graph
	const { nodes, edges } = results || { nodes: [], edges: [] }
	const node_label = Object.fromEntries(nodes.map(i => [i.data.id, i.data.label]))
	// signal genes: targets of direct omic edges, or parent genes of modified PTM sites (site edges run Gene → site)
	const signal_ids = new Set(edges.filter(e => OMIC_EDGES.indexOf(e.data.label) > -1).map(e => e.data.target))
	for (const e of edges) if (e.data.label === "site") signal_ids.add(e.data.source)
	const signal_symbols = Array.from(new Set(Array.from(signal_ids).map(id => node_label[id] || id))).sort()
	const enriched_count = new Set(edges.filter(e => e.data.label === "enriched").map(e => e.data.target)).size
	const header_endpoint = (schema.header.tabs.filter(i => i.component === 'KnowledgeGraph')[0] || { endpoint: '/' }).endpoint

	return (
		<Grid container spacing={3}>
			{(props.title || props.description) && <Grid item xs={12}>
				<Stack spacing={0.75}>
					{props.title && <Typography variant={"h2"}>{props.title}</Typography>}
					{props.description && <Typography variant={"subtitle1"} sx={{ color: "text.secondary", maxWidth: 820 }}>{props.description}</Typography>}
				</Stack>
			</Grid>}
			<Grid item xs={12} md={4} lg={3}>
				<Stack spacing={2}>
					<Card>
						<CardContent>
							<PatientSignalForm
								patient_id={patient_id}
								enrichment_node_type={enrichment_node_type}
								omic_signal_threshold={omic_signal_threshold}
								examples={props.examples}
								edge_types={results ? get_edge_types(results) : []}
								relation={relation}
								searchParams={searchParams}
							/>
						</CardContent>
					</Card>
					{results && results.nodes.length > 0 &&
						<Card>
							<CardContent>
								<Stack spacing={2}>
									<SectionLabel>Summary</SectionLabel>
									<Stack direction="row" spacing={1.5}>
										<Box sx={statTileSx}>
											<Typography sx={statValueSx}>{signal_symbols.length}</Typography>
											<Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.3, display: "block" }}>signal gene{signal_symbols.length === 1 ? '' : 's'} (≥ {omic_signal_threshold} omic layers)</Typography>
										</Box>
										<Box sx={statTileSx}>
											<Typography sx={statValueSx}>{enriched_count}</Typography>
											<Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.3, display: "block" }}>enriched {enrichment_node_type} node{enriched_count === 1 ? '' : 's'}</Typography>
										</Box>
									</Stack>
									<Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5}>
										{signal_symbols.map(s => <Chip key={s} label={s} size="small" component="a" href={`https://maayanlab.cloud/Harmonizome/gene/${s}`} clickable />)}
									</Stack>
								</Stack>
							</CardContent>
						</Card>
					}
				</Stack>
			</Grid>
			<Grid item xs={12} md={8} lg={9}>
				<Stack spacing={2}>
					{error && <Alert severity="error">{error}</Alert>}
					{results && results.nodes.length > 0 && elements.edges.length === 0 &&
						<Alert severity="info">No edges of the selected types for patient {patient_id}.</Alert>
					}
					{results && results.nodes.length === 0 &&
						<Alert severity="info">
							{found ?
								`No gene is altered in ${omic_signal_threshold} or more omic layers in patient ${patient_id}.` :
								`No patient with id "${patient_id}" was found.`
							}
						</Alert>
					}
					<Card>
						<Box sx={{ paddingX: 2.5, paddingY: 1.5, borderBottom: 1, borderColor: "divider", backgroundColor: "paperGray.main" }}>
							<PatientSignalToolbar elements={elements} searchParams={searchParams} />
						</Box>
						<CardContent>
							{(searchParams.view === "table") ?
								<div style={{ minHeight: 700 }}><NetworkTable data={elements} schema={schema} /></div> :
								<div style={{ minHeight: 700, position: "relative" }}>
									{patient_id && <Typography variant="h5" sx={{ textAlign: "center" }}>Multiomics Signal for Patient {patient_id}</Typography>}
									<Cytoscape
										elements={elements}
										wide={true}
										stepsize={100}
										tooltip_templates_edges={tooltip_templates_edges}
										tooltip_templates_nodes={tooltip_templates_nodes}
										filter_field="filter"
										header_endpoint={header_endpoint}
										curve_style="bezier"
									/>
								</div>
							}
						</CardContent>
					</Card>
				</Stack>
			</Grid>
		</Grid>
	)
}

export default PatientSignal
