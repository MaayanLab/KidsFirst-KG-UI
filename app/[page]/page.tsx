import { Component } from "../component_selector"
import { fetch_kg_schema } from "@/utils/initialize"
import { Suspense } from 'react'
import QueryTranslator from '@/components/QueryTranslator'
import PageShell from '@/components/Layout/PageShell'
export default async function Page({params, searchParams}: {
    searchParams: {
      filter?: string,
      fullscreen?: 'true',
      view?:string,
  	} | {
        term: string,
        field?: string,
        limit?: string,
        fullscreen?:'true',
        view?:string
    },
	params: {
		page: string
	}
}) {
  const schema = await fetch_kg_schema()
  const page = params.page
  const root_tab = {component: '', props: {}, endpoint: `${page}`}
  for (const tab of schema.header.tabs) {
    if (tab.endpoint === `/${page}`) {
      root_tab.component = tab.component
      root_tab.props = tab.props
    }
  }
  return (
    <PageShell schema={schema} fullscreen={searchParams.fullscreen}>
      <Suspense>
        <QueryTranslator>
          <Component searchParams={searchParams} {...root_tab}/>
        </QueryTranslator>
      </Suspense>
    </PageShell>
  )
}