'use client'
import React, { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useQueryState } from "next-usequerystate"
import { Tooltip, IconButton, Menu, MenuItem, Stack, Divider, ListItemIcon, ListItemText } from "@mui/material"
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import LabelIcon from '@mui/icons-material/Label'
import LabelOffIcon from '@mui/icons-material/LabelOff'
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import SaveIcon from '@mui/icons-material/Save'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import Icon from '@mdi/react'
import { mdiGraph, mdiTable } from '@mdi/js'
import { router_push } from "@/utils/client_side"
import { process_tables } from "@/utils/helper"
import { NetworkSchema } from "@/app/api/knowledge_graph/route"
import { default_layouts as layouts } from "../Cytoscape"

// Graph controls; Cytoscape reads edge_labels, legend, layout and download_image from the URL
const PatientSignalToolbar = ({
	elements,
	searchParams,
}: {
	elements: NetworkSchema | null,
	searchParams: {[key: string]: string},
}) => {
	const router = useRouter()
	const pathname = usePathname()
	const {view, fullscreen} = searchParams
	const [edge_labels, setEdgeLabels] = useQueryState('edge_labels')
	const [legend, setLegend] = useQueryState('legend')
	const [, setLegendSize] = useQueryState('legend_size')
	const [, setLayout] = useQueryState('layout')
	const [, setDownloadImage] = useQueryState('download_image')
	const [anchorImage, setAnchorImage] = useState<HTMLElement>(null)
	const [anchorLayout, setAnchorLayout] = useState<HTMLElement>(null)

	const push = (query: {[key: string]: string}) => {
		if (query.patient_id) query.patient_id = encodeURIComponent(query.patient_id)
		router_push(router, pathname, query)
	}

	return (
		<Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
			<Tooltip title={fullscreen ? "Exit full screen": "Full screen"}>
				<IconButton color="secondary" onClick={()=>{
					const {fullscreen, ...query} = searchParams
					if (!fullscreen) query['fullscreen'] = 'true'
					push(query)
				}}>
					{fullscreen ? <FullscreenExitIcon/>: <FullscreenIcon/>}
				</IconButton>
			</Tooltip>
			<Tooltip title="Network view">
				<IconButton color="secondary"
					onClick={()=>{
						const {view, ...query} = searchParams
						push(query)
					}}
					sx={{borderRadius: 5, background: !view ? "#e0e0e0": "none"}}
				>
					<Icon path={mdiGraph} size={0.8}/>
				</IconButton>
			</Tooltip>
			<Tooltip title="Table view">
				<IconButton color="secondary"
					onClick={()=>push({...searchParams, view: 'table'})}
					sx={{borderRadius: 5, background: view === "table" ? "#e0e0e0": "none"}}
				>
					<Icon path={mdiTable} size={0.8}/>
				</IconButton>
			</Tooltip>
			<Divider sx={{backgroundColor: "secondary.main", height: 20, borderRightWidth: 1}} orientation="vertical"/>
			<Tooltip title="Save subnetwork">
				<span>
					<IconButton color="secondary" disabled={!elements || elements.nodes.length === 0}
						onClick={()=>process_tables(elements)}
					>
						<SaveIcon/>
					</IconButton>
				</span>
			</Tooltip>
			{!view &&
				<React.Fragment>
					<Tooltip title="Download graph as an image file">
						<IconButton color="secondary" onClick={(e)=>setAnchorImage(e.currentTarget)}>
							<CameraAltOutlinedIcon/>
						</IconButton>
					</Tooltip>
					<Menu anchorEl={anchorImage} open={anchorImage!==null} onClose={()=>setAnchorImage(null)}>
						{['png', 'jpg', 'svg'].map(fmt=>(
							<MenuItem key={fmt} onClick={()=>{
								setAnchorImage(null)
								setDownloadImage(fmt)
							}}>{fmt.toUpperCase()}</MenuItem>
						))}
					</Menu>
					<Tooltip title="Switch graph layout">
						<IconButton color="secondary" onClick={(e)=>setAnchorLayout(e.currentTarget)}>
							<FlipCameraAndroidIcon/>
						</IconButton>
					</Tooltip>
					<Menu anchorEl={anchorLayout} open={anchorLayout!==null} onClose={()=>setAnchorLayout(null)}>
						{Object.entries(layouts).map(([label, {icon}])=>(
							<MenuItem key={label} onClick={()=>{
								setAnchorLayout(null)
								setLayout(label)
							}}>
								<ListItemIcon>{icon()}</ListItemIcon>
								<ListItemText>{label}</ListItemText>
							</MenuItem>
						))}
					</Menu>
					<Tooltip title={edge_labels ? "Hide edge labels": "Show edge labels"}>
						<IconButton color="secondary" onClick={()=>setEdgeLabels(edge_labels ? null: 'true')}>
							{edge_labels ? <VisibilityOffIcon/>: <VisibilityIcon/>}
						</IconButton>
					</Tooltip>
					<Tooltip title={legend ? "Hide legend": "Show legend"}>
						<IconButton color="secondary" onClick={()=>{
							if (legend) {
								setLegend(null)
								setLegendSize(null)
							} else {
								setLegend('true')
								setLegendSize('0')
							}
						}}>
							{legend ? <LabelOffIcon/>: <LabelIcon/>}
						</IconButton>
					</Tooltip>
				</React.Fragment>
			}
		</Stack>
	)
}

export default PatientSignalToolbar
