import { UISchema } from '@/app/api/schema/route'

// The root path is a landing page when the schema configures one and no tab claims "/"
export const has_landing = (schema: UISchema) => (
	schema.header.landing !== undefined && !schema.header.tabs.some(tab => tab.endpoint === "/")
)
