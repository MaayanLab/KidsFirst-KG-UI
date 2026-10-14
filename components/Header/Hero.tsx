'use client'
import Link from "next/link"
import Image from "next/image"
import { Box, Grid, Stack, Typography } from "@mui/material"
import { alpha } from "@mui/material/styles"
import HubIcon from '@mui/icons-material/Hub'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import ExploreIcon from '@mui/icons-material/Explore'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { UISchema } from '@/app/api/schema/route'
import { SectionLabel } from '../misc/ui'
import { sanitize } from '../SanitizedHTML'

const icons = {
	graph: HubIcon,
	patient: PersonSearchIcon,
}

// Landing-state header: large title plus one card per tab
export default function Hero({schema, onSelect}: {schema: UISchema, onSelect?: (endpoint: string) => void}) {
	const {title, icon, tabs, landing = {}} = schema.header
	const choices = tabs.filter(tab => !(tab.landing || {}).hidden)
	return (
		<Box sx={{paddingTop: {xs: 6, md: 10}, paddingBottom: {xs: 6, md: 10}, textAlign: "center"}}>
			<Stack alignItems="center" spacing={2.5}>
				<Box sx={{
					width: 72,
					height: 72,
					position: "relative",
					borderRadius: "20px",
					overflow: "hidden",
					backgroundColor: "#FFF",
					boxShadow: "0 0 0 1px rgba(15, 23, 42, 0.06), 0 12px 32px -12px rgba(15, 23, 42, 0.35)",
				}}>
					<Image style={{padding: 6, objectFit: "contain"}} fill={true} sizes="72px" alt={icon.alt} src={icon.favicon} priority/>
				</Box>
				<Typography variant="h1" component="h1" sx={{fontSize: {xs: 32, md: 48}, maxWidth: 820}}
					dangerouslySetInnerHTML={sanitize(landing.title || title)}
				/>
				{landing.subtitle &&
					<Typography variant="subtitle1" sx={{color: "text.secondary", fontSize: {xs: 15, md: 18}, maxWidth: 720}}>
						{landing.subtitle}
					</Typography>
				}
			</Stack>
			{landing.prompt && <SectionLabel sx={{marginTop: {xs: 5, md: 7}, marginBottom: 2}}>{landing.prompt}</SectionLabel>}
			<Grid container spacing={2.5} justifyContent="center" sx={{marginTop: landing.prompt ? 0: 5}}>
				{choices.map(tab => {
					const Icon = icons[(tab.landing || {}).icon] || ExploreIcon
					return (
						<Grid item xs={12} sm={6} md={5} key={tab.endpoint}>
							<Box component={Link} href={tab.endpoint} onClick={() => onSelect && onSelect(tab.endpoint)} sx={{
								display: "flex",
								flexDirection: "column",
								height: "100%",
								padding: 3,
								textAlign: "left",
								borderRadius: "16px",
								border: 1,
								borderColor: "divider",
								backgroundColor: "background.paper",
								boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
								transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
								"&:hover, &:focus-visible": {
									transform: "translateY(-2px)",
									borderColor: "secondary.light",
									boxShadow: "0 16px 32px -16px rgba(15, 23, 42, 0.3)",
								},
								"&:hover .hero-arrow, &:focus-visible .hero-arrow": {
									transform: "translateX(4px)",
								},
							}}>
								<Box sx={{
									width: 44,
									height: 44,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									borderRadius: "12px",
									marginBottom: 2,
									color: "secondary.main",
									backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
								}}>
									<Icon/>
								</Box>
								<Typography variant="h4" component="h2">{tab.label}</Typography>
								{(tab.landing || {}).description &&
									<Typography variant="body2" sx={{color: "text.secondary", marginTop: 1, lineHeight: 1.6}}>
										{tab.landing.description}
									</Typography>
								}
								<Stack direction="row" alignItems="center" spacing={0.5} sx={{marginTop: "auto", paddingTop: 2.5, color: "secondary.main"}}>
									<Typography variant="body2" sx={{fontWeight: 600}}>Open</Typography>
									<ArrowForwardIcon className="hero-arrow" fontSize="small" sx={{transition: "transform 160ms ease"}}/>
								</Stack>
							</Box>
						</Grid>
					)
				})}
			</Grid>
		</Box>
	)
}
