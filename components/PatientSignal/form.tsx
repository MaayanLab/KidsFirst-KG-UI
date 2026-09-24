'use client'
import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Autocomplete, TextField, Button, Stack, Typography, Link, Checkbox, Chip, Tooltip, Divider } from "@mui/material"
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { router_push } from "@/utils/client_side"
import { Selector } from "../misc"
import { ENRICHMENT_NODE_TYPES } from "@/app/api/patient_signal/constants"

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

type PatientOption = { id: string, histology?: string, [key: string]: any }

// node_search wraps the term in a regex, so escape anything the user types
const escape_regex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const PatientSignalForm = ({
	patient_id,
	enrichment_node_type,
	examples = [],
	edge_types = [],
	relation = [],
	searchParams,
}: {
	patient_id: string,
	enrichment_node_type: string,
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

	const submit = (id: string, node_type: string = enrichment_node_type) => {
		const value = (id || '').trim()
		if (!value) return
		const { patient_id: _, enrichment_node_type: __, ...rest } = searchParams
		router_push(router, pathname, { ...rest, patient_id: encodeURIComponent(value), enrichment_node_type: node_type })
	}

	// empty selection shows every edge type
	const set_relation = (r: Array<string>) => {
		const { relation: _, patient_id: __, ...rest } = searchParams
		const query: { [key: string]: string } = { ...rest, patient_id: encodeURIComponent(patient_id), enrichment_node_type }
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
			<Stack spacing={1}>
				<Typography variant="body1" color="secondary"><b>Patient ID</b></Typography>
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
							<Stack>
								<Typography variant="body2">{option}</Typography>
								{options[option]?.histology &&
									<Typography variant="caption" color="text.secondary">{options[option].histology}</Typography>
								}
							</Stack>
						</li>
					)}
					renderInput={(params) => (
						<TextField {...params}
							placeholder="e.g. 7316-100"
							size="small"
							sx={{ backgroundColor: "#FFF" }}
						/>
					)}
				/>
				<Typography variant="body1" color="secondary"><b>Enrichment node type</b></Typography>
				<Selector
					entries={[...ENRICHMENT_NODE_TYPES]}
					value={enrichment_node_type}
					prefix="enrichment_node_type"
					sx={{ backgroundColor: "#FFF" }}
					onChange={(node_type: string) => submit(inputTerm || patient_id, node_type)}
				/>
				<Button type="submit" variant="contained" color="secondary" disabled={!(inputTerm || '').trim()}>
					Run query
				</Button>
				{relation_options.length > 0 &&
					<React.Fragment>
						<Divider sx={{ paddingTop: 1 }} />
						<Typography variant="body1" color="secondary"><b>Filter edge types</b></Typography>
						<Autocomplete
							multiple
							disableCloseOnSelect
							options={relation_options}
							value={relation}
							onChange={(e, r) => set_relation(r)}
							renderInput={(params) => (
								<TextField {...params} size="small" label="Select Relation" placeholder="Select Relation" sx={{ backgroundColor: "#FFF" }} />
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
								<Typography variant="caption">Showing all edge types</Typography> :
								relation.map((value) => (
									<Tooltip title={value} key={value} placement="top">
										<Chip label={value}
											color="primary"
											size="small"
											sx={{ borderRadius: "8px" }}
											onDelete={() => set_relation(relation.filter(i => i !== value))}
										/>
									</Tooltip>
								))
							}
						</Stack>
					</React.Fragment>
				}
				{examples.length > 0 &&
					<Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
						<Typography variant="caption">Examples:</Typography>
						{examples.map(e => (
							<Link key={e} component="button" type="button" variant="caption" color="secondary" onClick={() => submit(e)}>
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
