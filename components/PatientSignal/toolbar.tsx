'use client'
import React, { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useQueryState } from "next-usequerystate"
import { Tooltip, IconButton, Menu, MenuItem, Stack, Box, ListItemIcon, ListItemText } from "@mui/material"
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
import { ToolbarGroup, activeSx } from "../misc/ui"

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
	const [layout, setLayout] = useQueryState('layout')
	const [, setDownloadImage] = useQueryState('download_image')
	const [anchorImage, setAnchorImage] = useState<HTMLElement>(null)
	const [anchorLayout, setAnchorLayout] = useState<HTMLElement>(null)

	const push = (query: {[key: string]: string}) => {
		if (query.patient_id) query.patient_id = encodeURIComponent(query.patient_id)
		router_push(router, pathname, query)
	}

	return (
		<Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
			<ToolbarGroup>
				<Tooltip title="Network view">
					<IconButton color="secondary"
						onClick={()=>{
							const {view, ...query} = searchParams
							push(query)
						}}
						sx={activeSx(!view)}
					>
						<Icon path={mdiGraph} size={0.8}/>
					</IconButton>
				</Tooltip>
				<Tooltip title="Table view">
					<IconButton color="secondary"
						onClick={()=>push({...searchParams, view: 'table'})}
						sx={activeSx(view === "table")}
					>
						<Icon path={mdiTable} size={0.8}/>
					</IconButton>
				</Tooltip>
			</ToolbarGroup>
			{!view &&
				<ToolbarGroup>
					<Tooltip title="Switch graph layout">
						<IconButton color="secondary" onClick={(e)=>setAnchorLayout(e.currentTarget)}>
							<FlipCameraAndroidIcon fontSize="small"/>
						</IconButton>
					</Tooltip>
					<Menu anchorEl={anchorLayout} open={anchorLayout!==null} onClose={()=>setAnchorLayout(null)}>
						{Object.entries(layouts).map(([label, {icon}])=>(
							<MenuItem key={label} selected={(layout || "Force-directed") === label} onClick={()=>{
								setAnchorLayout(null)
								setLayout(label)
							}}>
								<ListItemIcon>{icon()}</ListItemIcon>
								<ListItemText>{label}</ListItemText>
							</MenuItem>
						))}
					</Menu>
					<Tooltip title={edge_labels ? "Hide edge labels": "Show edge labels"}>
						<IconButton color="secondary" onClick={()=>setEdgeLabels(edge_labels ? null: 'true')} sx={activeSx(!!edge_labels)}>
							{edge_labels ? <VisibilityOffIcon fontSize="small"/>: <VisibilityIcon fontSize="small"/>}
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
						}} sx={activeSx(!!legend)}>
							{legend ? <LabelOffIcon fontSize="small"/>: <LabelIcon fontSize="small"/>}
						</IconButton>
					</Tooltip>
				</ToolbarGroup>
			}
			<Box sx={{flexGrow: 1}}/>
			<ToolbarGroup>
				<Tooltip title="Save subnetwork">
					<span>
						<IconButton color="secondary" disabled={!elements || elements.nodes.length === 0}
							onClick={()=>process_tables(elements)}
						>
							<SaveIcon fontSize="small"/>
						</IconButton>
					</span>
				</Tooltip>
				{!view &&
					<React.Fragment>
						<Tooltip title="Download graph as an image file">
							<IconButton color="secondary" onClick={(e)=>setAnchorImage(e.currentTarget)}>
								<CameraAltOutlinedIcon fontSize="small"/>
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
					</React.Fragment>
				}
				<Tooltip title={fullscreen ? "Exit full screen": "Full screen"}>
					<IconButton color="secondary" onClick={()=>{
						const {fullscreen, ...query} = searchParams
						if (!fullscreen) query['fullscreen'] = 'true'
						push(query)
					}}>
						{fullscreen ? <FullscreenExitIcon fontSize="small"/>: <FullscreenIcon fontSize="small"/>}
					</IconButton>
				</Tooltip>
			</ToolbarGroup>
		</Stack>
	)
}

export default PatientSignalToolbar
