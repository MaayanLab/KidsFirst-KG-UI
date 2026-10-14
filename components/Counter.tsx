'use client'
import { Stack, Typography } from '@mui/material';
import useSWR from 'swr';
const fetcher = (url) => fetch(url).then(r => r.json())
export const Counter = ({ui_theme}: {ui_theme?: string}) => {  

    const { data } = useSWR(`${process.env.NODE_ENV==="development" ? process.env.NEXT_PUBLIC_HOST_DEV : process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_PREFIX ? process.env.NEXT_PUBLIC_PREFIX: ''}/api/counter`, fetcher, { refreshInterval: 5000 })

    return (
        <Stack direction={"row"} spacing={0.75} alignItems={"center"} sx={{paddingX: 1.5, paddingY: 0.5, borderRadius: 999, border: 1, borderColor: "divider", backgroundColor: "background.paper"}}>
            <Typography variant="caption" sx={{color: "text.secondary"}}>Queries submitted</Typography>
            <Typography variant="caption" sx={{color: "text.primary", fontWeight: 700, fontVariantNumeric: "tabular-nums"}}>{(data || {}).count}</Typography>
        </Stack>
    )
}

export default Counter