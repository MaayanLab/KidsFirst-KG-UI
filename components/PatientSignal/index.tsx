import dynamic from "next/dynamic"
import { Grid, Typography, CircularProgress, Card, CardContent, Stack, Alert, Chip } from "@mui/material"
import { initialize_kg } from "../TermAndGeneSearch"
import NetworkTable from "../TermAndGeneSearch/network_table"
import PatientSignalForm from "./form"
import PatientSignalToolbar from "./toolbar"
import { resolve_patient_signal, patient_exists, filter_by_relation, get_edge_types, parse_relation } from "@/app/api/patient_signal/helper"
import { NetworkSchema } from "@/app/api/knowledge_graph/route"
import { DEFAULT_ENRICHMENT_NODE_TYPE, is_enrichment_node_type } from "@/app/api/patient_signal/constants"
const Cytoscape = dynamic(() => import('../Cytoscape'),
	{
		ssr: false,
		loading: () => <CircularProgress />
	}
)

const SIGNAL_KINDS = ["Gene", "Protein"]

const PatientSignal = async ({ searchParams, props }: {
	searchParams: {
		patient_id?: string,
		enrichment_node_type?: string,
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
		examples?: Array<string>,
	}
}) => {
	const { schema, tooltip_templates_nodes, tooltip_templates_edges } = await initialize_kg()
	const patient_id = (searchParams.patient_id || props.default_patient_id || '').trim()
	// unknown values in the URL or schema props fall back to the default instead of reaching the query
	const requested_type = (searchParams.enrichment_node_type || props.default_enrichment_node_type || '').trim()
	const enrichment_node_type = is_enrichment_node_type(requested_type) ? requested_type : DEFAULT_ENRICHMENT_NODE_TYPE
	const relation = parse_relation(searchParams.relation)
	let results: NetworkSchema | null = null
	let elements: NetworkSchema | null = null
	let error: string | null = null
	let found = true
	if (patient_id) {
		try {
			results = await resolve_patient_signal({ patient_id, enrichment_node_type })
			if (results.nodes.length === 0) found = await patient_exists({ patient_id })
			elements = filter_by_relation(results, relation)
		} catch (e) {
			console.error(e)
			error = e.message || 'Query failed'
		}
	}

	// summary describes the full query result; the relation filter only changes the graph
	const nodes = (results || { nodes: [] }).nodes
	const patient = nodes.find(i => i.data.kind === "Patient")
	const signal_symbols = Array.from(new Set(nodes.filter(i => SIGNAL_KINDS.indexOf(i.data.kind) > -1).map(i => i.data.label))).sort()
	const enriched_count = nodes.filter(i => i.data.kind === enrichment_node_type).length
	const header_endpoint = (schema.header.tabs.filter(i => i.component === 'KnowledgeGraph')[0] || { endpoint: '/' }).endpoint

	return (
		<Grid container spacing={2}>
			{props.title && <Grid item xs={12}>
				<Typography variant={"h2"}>{props.title}</Typography>
			</Grid>}
			{props.description && <Grid item xs={12}>
				<Typography variant={"subtitle1"}>{props.description}</Typography>
			</Grid>}
			<Grid item xs={12} md={4} lg={3}>
				<Card elevation={0} sx={{ borderRadius: "8px", backgroundColor: "tertiary.light" }}>
					<CardContent>
						<PatientSignalForm
							patient_id={patient_id}
							enrichment_node_type={enrichment_node_type}
							examples={props.examples}
							edge_types={results ? get_edge_types(results) : []}
							relation={relation}
							searchParams={searchParams}
						/>
					</CardContent>
				</Card>
				{results && results.nodes.length > 0 &&
					<Card elevation={0} sx={{ borderRadius: "8px", marginTop: 2 }}>
						<CardContent>
							<Stack spacing={1}>
								{patient && patient.data.histology &&
									<Typography variant="body2"><b>Histology:</b> {patient.data.histology}</Typography>
								}
								<Typography variant="body2"><b>{signal_symbols.length}</b> signal molecule{signal_symbols.length === 1 ? '' : 's'} (≥ 2 omic edges)</Typography>
								<Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5}>
									{signal_symbols.map(s => <Chip key={s} label={s} size="small" />)}
								</Stack>
								<Typography variant="body2"><b>{enriched_count}</b> enriched {enrichment_node_type} node{enriched_count === 1 ? '' : 's'}</Typography>
							</Stack>
						</CardContent>
					</Card>
				}
			</Grid>
			<Grid item xs={12} md={8} lg={9}>
				<Stack spacing={1}>
					<PatientSignalToolbar elements={elements} searchParams={searchParams} />
					{error && <Alert severity="error">{error}</Alert>}
					{results && results.nodes.length > 0 && elements.edges.length === 0 &&
						<Alert severity="info">No edges of the selected types for patient {patient_id}.</Alert>
					}
					{results && results.nodes.length === 0 &&
						<Alert severity="info">
							{found ?
								`No Gene or Protein has 3 or more omic edges from patient ${patient_id}.` :
								`No patient with id "${patient_id}" was found.`
							}
						</Alert>
					}
					<Card sx={{ borderRadius: "24px" }}>
						<CardContent>
							{(searchParams.view === "table") ?
								<div style={{ minHeight: 700 }}><NetworkTable data={elements} schema={schema} /></div> :
								<div style={{ minHeight: 700, position: "relative" }}>
									{patient_id && <Typography variant="h5" sx={{ textAlign: "center" }}><b>Multi-omic Signal for Patient {patient_id}</b></Typography>}
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
