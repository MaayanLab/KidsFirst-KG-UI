'use client'
import React, { useEffect, useState } from "react";
import {
	Grid, 
	Stack, 
	AppBar, 
	Toolbar,
	Divider,
	Container,
	Collapse,
	LinearProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { usePathname, useSearchParams } from "next/navigation";
import { UISchema } from '@/app/api/schema/route';
import { Logo } from '../misc/logo';
import Counter from '../Counter';
import { TextNav } from './TextNav';
import SmallNav from "./SmallNav";
import Hero from "./Hero";
import { has_landing } from "./landing";

export const Nav = ({tabs, ui_theme, divider, title, icon, counterTop, counter}:
	{
		ui_theme?: string,
		divider?: boolean,
		title: string,
		counter?: boolean,
		counterTop?: boolean,
		icon: {
			favicon: string,
			alt: string,
			avatar?: boolean
		},
		tabs: Array<{
			endpoint: string,
			label: string,
			component: string,
			position?:  string,
			props?: {
				[key: string]: any
			}
		}>}) => {
	
	const tab_component = {top: [], bottom:[]}
	for (const tab of tabs) {
		const position = tab.position || 'top'
		tab_component[position].push(
			<React.Fragment key={tab.label}>
				<TextNav path={tab.endpoint} title={tab.label}/>
			</React.Fragment>
		)
		if (divider) tab_component[position].push(<Divider key={tab.label + "div"} sx={{display: {xs: "none", sm: "none", md: "block", borderColor: "divider"}}} orientation='vertical' flexItem/>)
	}
	if (divider) {
		for (const position of Object.keys(tab_component)) {
			tab_component[position].pop()
		}
	}
	return (
		<Grid container justifyContent={"space-between"} alignItems={"center"}>
			<Grid item sx={{ flexGrow: 1 }}>
				<Logo alt={icon.alt} src={icon.favicon} title={title} avatar={icon.avatar} size='large' color="inherit"/>
			</Grid>
			<Grid item sx={{display: {xs: "none", sm: "none", md: "block"}}}>
					<Stack direction={"row"} alignItems={"center"} spacing={0.5}>
						{tab_component.top}
						{divider && <Divider sx={{display: {xs: "none", sm: "none", md: "block", borderColor: "divider"}}} orientation='vertical' flexItem/>}
						{(counter && tab_component.bottom.length === 0 && counterTop) && 
							<Counter ui_theme={ui_theme}/>
						}
					</Stack>
					
			</Grid>
			{tab_component.bottom.length > 0 &&
				<Grid item xs={12} sx={{display: {xs: "none", sm: "none", md: "block"}}}>
					<Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} spacing={2}>
						<Stack direction={"row"} alignItems={"center"} spacing={0.5}>
							{tab_component.bottom}		
						</Stack>
						<Counter ui_theme={ui_theme}/>
					</Stack>
					
				</Grid>
			}
			{(counter && tab_component.bottom.length === 0 && !counterTop) &&
				<Grid item xs={12} className='flex justify-end' sx={{display: {xs: "none", sm: "none", md: "block"}}}>		
					<div className="flex justify-end"><Counter ui_theme={ui_theme}/></div>
				</Grid>
			}
			<Grid item className='flex justify-end' sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
				<SmallNav counter={counter} tab_component={tab_component} ui_theme={ui_theme}/>
			</Grid>
		</Grid>
	)
}

// Lives in the root layout so it persists across navigation: on the landing page it
// expands into a hero that asks which tool to open, elsewhere it collapses to a compact bar.
export default function Header ({schema}: {schema:UISchema}) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const {title, icon, tabs, divider, counterTop, counter, fullWidth} = schema.header
	// set on card click so the hero collapses right away instead of after the page's server render
	const [pending, setPending] = useState<string | null>(null)
	useEffect(()=>{
		setPending(null)
	}, [pathname])
	const hero = pathname === "/" && has_landing(schema) && pending === null
	if (searchParams.get('fullscreen')) return null
	return  (
		<AppBar position={hero ? "relative": "sticky"} sx={{
			transition: "background 400ms ease",
			...(hero && {
				background: (theme) => `radial-gradient(1200px 500px at 50% -10%, ${alpha(theme.palette.secondary.main, 0.14)}, transparent 70%), ${theme.palette.background.default}`,
				backdropFilter: "none",
				borderBottomColor: "transparent",
			}),
		}}>
			<Container maxWidth={fullWidth ? false: "lg"}>
				<Collapse in={!hero} timeout={400}>
					<Toolbar disableGutters sx={{minHeight: {xs: 60, md: 68}}}>
						<Nav counterTop={counterTop} counter={counter} tabs={tabs} divider={divider} ui_theme={schema.ui_theme} title={title} icon={icon}/>
					</Toolbar>
				</Collapse>
				{has_landing(schema) &&
					<Collapse in={hero} timeout={500}>
						<Hero schema={schema} onSelect={setPending}/>
					</Collapse>
				}
			</Container>
			{pending !== null &&
				<LinearProgress color="secondary" sx={{position: "absolute", left: 0, right: 0, bottom: 0, height: 2}}/>
			}
		</AppBar>
	)
}