import { ReactNode } from "react"
import { Box, Typography, SxProps, Theme } from "@mui/material"

// Bordered pill that groups related icon buttons in a toolbar
export const ToolbarGroup = ({children, sx={}}: {children: ReactNode, sx?: SxProps<Theme>}) => (
	<Box sx={{
		display: "inline-flex",
		alignItems: "center",
		gap: 0.25,
		padding: 0.5,
		border: 1,
		borderColor: "divider",
		borderRadius: "12px",
		backgroundColor: "background.paper",
		...sx
	}}>
		{children}
	</Box>
)

// Small uppercase label above a form field or panel section
export const SectionLabel = ({children, sx={}}: {children: ReactNode, sx?: SxProps<Theme>}) => (
	<Typography variant="overline" component="div" sx={{color: "text.secondary", lineHeight: 1.4, ...sx}}>
		{children}
	</Typography>
)

// Selected-state background for toggle icon buttons
export const activeSx = (active: boolean) => ({
	backgroundColor: active ? "action.selected": "transparent",
	color: active ? "secondary.main": undefined,
})
