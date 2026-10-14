import { Container, Paper, Grid, Stack, Divider, Typography, Box } from '@mui/material'
import parse from 'html-react-parser';
import MiscComponent from '../misc';


export default function Footer({style, layout, footer_text}: {
    style?: {
        [key: string]: string | number
    },
    layout: Array<Array<
        {
            component: string,
            props?: {
                [key:string]: string|number|boolean
            }
        }
    >>,
    footer_text?: string
}) {
    return (
        <Paper component="footer" elevation={0} sx={{background: "#0F172A", color: "#FFF", borderRadius: 0, marginTop: "auto", ...style}}>
            <Container maxWidth="lg" sx={{paddingTop: {xs: 4, md: 5}, paddingBottom: 3}}>
                <Grid container justifyContent={"space-between"} alignItems={"center"} rowSpacing={3} columnSpacing={4}>
                    {layout.map((part, index)=>{
                        const items = []
                        for (const ind in part ) {
                            const item = part[ind]
                            items.push(<div key={`${item.component}${ind}`}><MiscComponent component={item.component} props={item.props}/></div>)
                            if (["text", "link"].indexOf(item.component) === -1) {
                                if (parseInt(ind) !== part.length - 1) items.push(<Divider key={`div${ind}`} sx={{borderColor: "rgba(255, 255, 255, 0.12)"}}/>)
                            }
                        }
                        return (
                            <Grid item key={index} sx={{opacity: 0.95}}>
                                <Stack direction={"column"} spacing={1.5}>
                                    {items}
                                </Stack>
                            </Grid>
                        )   
                    })}
                </Grid>
                {footer_text &&
                    <Box sx={{marginTop: 4, paddingTop: 2.5, borderTop: "1px solid rgba(255, 255, 255, 0.12)"}}>
                        <Typography variant="caption" component="div" sx={{color: "inherit", opacity: 0.85}}>{parse(footer_text)}</Typography>
                    </Box>
                }
            </Container>
        </Paper>
    )
}
