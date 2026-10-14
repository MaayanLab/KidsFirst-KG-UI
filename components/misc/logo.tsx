import Link from "next/link"
import Image from "next/image"
import { Typography, Box } from "@mui/material"
import { ElevatedIconButton } from "../Header/buttons"
import { sanitize } from "../SanitizedHTML"
export const Logo = ({src, alt, title, color="secondary", size, avatar}: {src: string, alt: string, title: string, color: "primary"| "secondary" | "inherit", size?: "small" | "large", avatar?: boolean}) => {
    const dim = size === 'large' ? 40: 32
    return (
        <Link href={process.env.NEXT_PUBLIC_HOMEPAGE || "/"} className='flex items-center space-x-3'>
            {avatar ?
            <div>
                <ElevatedIconButton
                    aria-label="menu"
                    sx={{width: dim, height: dim, backgroundColor: "inherit"}}
                >
                    <Image style={{padding: 3, objectFit: "contain"}} fill={true} alt={alt} src={src} />
                </ElevatedIconButton>
            </div>:
                <Box sx={{
                    width: dim,
                    height: dim,
                    flexShrink: 0,
                    position: "relative",
                    borderRadius: "10px",
                    overflow: "hidden",
                    backgroundColor: "#FFF",
                    boxShadow: "0 0 0 1px rgba(15, 23, 42, 0.08)",
                }}>
                    <Image style={{padding: 3, objectFit: "contain"}} fill={true} alt={alt} src={src} />
                </Box>
            }
            <div>
                <Typography variant={size==='large'?'cfde':'cfde_small'} color={color} dangerouslySetInnerHTML={sanitize(title)}></Typography>
            </div>
        </Link>
    )
}
