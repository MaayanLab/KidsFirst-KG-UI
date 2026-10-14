'use client'
import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Autocomplete, TextField, Button, Stack, Typography, Link, Checkbox, Chip, Tooltip, Divider } from "@mui/material"
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { router_push } from "@/utils/client_side"
import { Selector } from "../misc"
import { SectionLabel } from "../misc/ui"
import { ENRICHMENT_NODE_TYPES, OMIC_SIGNAL_THRESHOLDS } from "@/app/api/patient_signal/constants"

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

type PatientOption = { id: string, [key: string]: any }

// node_search wraps the term in a regex, so escape anything the user types
const escape_regex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const PatientSignalForm = ({
	patient_id,
	enrichment_node_type,
	omic_signal_threshold,
	examples = [],
	edge_types = [],
	relation = [],
	searchParams,
}: {
	patient_id: string,
	enrichment_node_type: string,
	omic_signal_threshold: number,
	examples?: Array<string>,
	edge_types?: Array<string>,
	relation?: Array<string>,
	searchParams: { [key: string]: string },
}) => {
	const router = useRouter()
	const pathname = usePathname()
	const [inputTerm, setInputTerm] = useState<string>(patient_id)
	const [options, setOptions] = useState<{ [key: string]: PatientOption }>({})
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		setInputTerm(patient_id)
	}, [patient_id])

	useEffect(() => {
		const controller = new AbortController()
		const resolve_options = async () => {
			setLoading(true)
			try {
				const query = new URLSearchParams({ type: "Patient", field: "id", term: escape_regex(inputTerm || ""), limit: "25" })
				const res = await fetch(`${process.env.NEXT_PUBLIC_PREFIX ? process.env.NEXT_PUBLIC_PREFIX : ''}/api/knowledge_graph/node_search?${query.toString()}`, {
					method: 'GET',
					signal: controller.signal
				})
				if (res.ok) setOptions(await res.json())
			} catch (error) {
				// aborted by a newer keystroke
			} finally {
				setLoading(false)
			}
		}
		const timeout = setTimeout(resolve_options, 250)
		return () => {
			clearTimeout(timeout)
			controller.abort()
		}
	}, [inputTerm])

	const submit = (id: string, node_type: string = enrichment_node_type, threshold: number = omic_signal_threshold) => {
		const value = (id || '').trim()
		if (!value) return
		const { patient_id: _, enrichment_node_type: __, omic_signal_threshold: ___, ...rest } = searchParams
		router_push(router, pathname, { ...rest, patient_id: encodeURIComponent(value), enrichment_node_type: node_type, omic_signal_threshold: `${threshold}` })
	}

	// empty selection shows every edge type
	const set_relation = (r: Array<string>) => {
		const { relation: _, patient_id: __, ...rest } = searchParams
		const query: { [key: string]: string } = { ...rest, patient_id: encodeURIComponent(patient_id), enrichment_node_type, omic_signal_threshold: `${omic_signal_threshold}` }
		if (r.length > 0) query.relation = r.map(encodeURIComponent).join(',')
		router_push(router, pathname, query)
	}

	// keep selected types listed even if the current patient has none of them
	const relation_options = Array.from(new Set([...edge_types, ...relation])).sort()

	return (
		<form onSubmit={(e) => {
			e.preventDefault()
			submit(inputTerm)
		}}>
			<Stack spacing={1.25}>
				<SectionLabel>Patient ID</SectionLabel>
				<Autocomplete
					freeSolo
					options={Object.keys(options)}
					inputValue={inputTerm || ''}
					onInputChange={(evt, value) => setInputTerm(value)}
					onChange={(evt, value) => {
						if (typeof value === 'string') submit(value)
					}}
					loading={loading}
					filterOptions={(x) => x}
					renderOption={({ key, ...props }: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key }, option) => (
						<li key={option} {...props}>
							<Typography variant="body2">{option}</Typography>
						</li>
					)}
					renderInput={(params) => (
						<TextField {...params}
							placeholder="e.g. 7316-100"
							size="small"
						/>
					)}
				/>
				<SectionLabel sx={{ paddingTop: 0.5 }}>Enrichment node type</SectionLabel>
				<Selector
					entries={[...ENRICHMENT_NODE_TYPES]}
					value={enrichment_node_type}
					prefix="enrichment_node_type"
					onChange={(node_type: string) => submit(inputTerm || patient_id, node_type)}
				/>
				<SectionLabel sx={{ paddingTop: 0.5 }}>Minimum omic layers</SectionLabel>
				<Selector
					entries={OMIC_SIGNAL_THRESHOLDS.map(i => `${i}`)}
					value={`${omic_signal_threshold}`}
					prefix="omic_signal_threshold"
					onChange={(threshold: string) => submit(inputTerm || patient_id, enrichment_node_type, Number(threshold))}
				/>
				<Button type="submit" variant="contained" color="secondary" size="large" disabled={!(inputTerm || '').trim()} sx={{ marginTop: 1 }}>
					Run query
				</Button>
				{relation_options.length > 0 &&
					<React.Fragment>
						<Divider sx={{ paddingTop: 1, marginBottom: 1 }} />
						<SectionLabel>Filter edge types</SectionLabel>
						<Autocomplete
							multiple
							disableCloseOnSelect
							options={relation_options}
							value={relation}
							onChange={(e, r) => set_relation(r)}
							renderInput={(params) => (
								<TextField {...params} size="small" label="Select Relation" placeholder="Select Relation" />
							)}
							renderOption={({ key, ...props }: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key }, option, { selected }) => (
								<li key={option} {...props}>
									<Checkbox
										icon={icon}
										checkedIcon={checkedIcon}
										sx={{ marginRight: 1 }}
										checked={selected}
									/>
									{option}
								</li>
							)}
							renderTags={() => null}
						/>
						<Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5}>
							{relation.length === 0 ?
								<Typography variant="caption" sx={{ color: "text.secondary" }}>Showing all edge types</Typography> :
								relation.map((value) => (
									<Tooltip title={value} key={value} placement="top">
										<Chip label={value}
											color="primary"
											size="small"
											onDelete={() => set_relation(relation.filter(i => i !== value))}
										/>
									</Tooltip>
								))
							}
						</Stack>
					</React.Fragment>
				}
				{examples.length > 0 &&
					<Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center" sx={{ paddingTop: 0.5 }}>
						<Typography variant="caption" sx={{ color: "text.secondary" }}>Examples:</Typography>
						{examples.map(e => (
							<Link key={e} component="button" type="button" variant="caption" color="secondary" underline="none" onClick={() => submit(e)}
								sx={{
									paddingX: 1,
									paddingY: 0.25,
									borderRadius: 999,
									border: 1,
									borderColor: "divider",
									backgroundColor: "background.paper",
									"&:hover": { backgroundColor: "action.hover", borderColor: "secondary.light" },
								}}
							>
								{e}
							</Link>
						))}
					</Stack>
				}
			</Stack>
		</form>
	)
}

export default PatientSignalForm
