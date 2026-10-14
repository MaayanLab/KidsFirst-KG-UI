import { ReactNode, Suspense } from 'react'
import { Box, Container } from '@mui/material'
import Subheader from '@/components/Subheader'
import Footer from '@/components/Footer'
import { UISchema } from '@/app/api/schema/route'

// Header is rendered by the root layout so it can animate between the landing and page states
export default function PageShell({schema, fullscreen, children}: {
	schema: UISchema,
	fullscreen?: string,
	children?: ReactNode
}) {
	return (
		<Box sx={{flex: 1, display: "flex", flexDirection: "column", backgroundColor: "background.default"}}>
			{children ?
				<Container component="main" maxWidth={fullscreen ? "xl": "lg"} sx={{flex: 1, paddingTop: {xs: 3, md: 4}, paddingBottom: {xs: 4, md: 6}}}>
					{!fullscreen && <Suspense><Subheader schema={schema}/></Suspense>}
					{children}
				</Container>:
				<Box sx={{flex: 1}}/>
			}
			{!fullscreen && <Footer {...schema.footer}/>}
		</Box>
	)
}
