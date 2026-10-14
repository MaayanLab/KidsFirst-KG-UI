'use client'
import { useState } from "react"
import Link from "next/link"
import { Typography, Menu, MenuItem, ButtonBase, List, ListItem, Collapse } from "@mui/material"
import { usePathname } from "next/navigation"

export  function TextNav({title, path, props}:  {
	title: string, 
	path: string,
	props?: {
		"submenu"?: Array<{
			name: string,
			href: string,
		}>
	} 
}) {
	const pathname = `/${usePathname().split("/")[1]}`
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [clicked, setClicked] = useState<null | string>(null);
  	const open = Boolean(anchorEl);
	const active = pathname === path
	const sx = {
		display: "block",
		paddingX: 1.5,
		paddingY: 0.75,
		borderRadius: 999,
		whiteSpace: "nowrap",
		transition: "background-color 120ms ease, color 120ms ease",
		backgroundColor: active ? "action.selected": "transparent",
		color: active ? "secondary.main": undefined,
		fontWeight: active ? 600: undefined,
		"&:hover": {
			backgroundColor: active ? "action.selected": "action.hover",
			color: "secondary.main",
		},
	}
	if (props !== undefined && props.submenu !== undefined) {
		const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			if (anchorEl) setAnchorEl(null)
			else setAnchorEl(event.currentTarget);
		};
		const handleClose = () => {
			setAnchorEl(null);
		};
		return (
			<>
				<ButtonBase
					id="basic-button"
					aria-controls={open ? 'basic-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
					onClick={handleClick}
					sx={{padding: 0, marginLeft: 0, display: {xs: "none", sm: "none", md: "block"}}}
				>
					<Typography variant="nav" sx={sx}>{title}</Typography>
				</ButtonBase>
				<Menu
					id="basic-menu"
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					MenuListProps={{
					'aria-labelledby': 'basic-button',
					}}
					sx={{
						display: {xs: "none", sm: "none", md: "block"}
					}}
				>
					{props.submenu.map(({name, href})=>(
						<MenuItem key={name} onClick={handleClose}>
							<Link href={href}>
								<Typography variant="nav">{name}</Typography>
							</Link>
						</MenuItem>
					))}
				</Menu>
				<ListItem sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
					<ButtonBase
						id="basic-button"
						aria-controls={open ? 'basic-menu' : undefined}
						aria-haspopup="true"
						aria-expanded={open ? 'true' : undefined}
						onClick={()=>clicked===title?setClicked(null): setClicked(title)}
						sx={{padding: 0, marginLeft: 0}}
					>
						<Typography variant="nav_small" sx={{color: active ? "secondary.main": undefined}}>{title}</Typography>
					</ButtonBase>
				</ListItem>
				<Collapse in={clicked===title} timeout="auto" unmountOnExit  sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
					<List component="div" disablePadding>
						{props.submenu.map(({name, href})=>(
							<ListItem key={name} onClick={handleClose}>
								<Link href={href}>
									<Typography variant="nav">{name}</Typography>
								</Link>
							</ListItem>
						))}
					</List>
				</Collapse>
			</>
		)
	} else {
		return(
			<>
				<Link href={path}>
					<Typography sx={{...sx, display: {xs: "none", sm: "none", md: "block"}}} variant="nav" aria-current={active ? "page": undefined}>{title}</Typography>
				</Link>
				<ListItem sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
					<Link href={path}>
						<Typography variant="nav_small" sx={{color: active ? "secondary.main": undefined}}>{title}</Typography>
					</Link>
				</ListItem>
			</>
		)
	} 
}