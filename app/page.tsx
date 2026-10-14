import { redirect } from "next/navigation"
import { Component } from "./component_selector"
import { fetch_kg_schema } from "@/utils/initialize"
import QueryTranslator from '@/components/QueryTranslator'
import PageShell from '@/components/Layout/PageShell'
import { has_landing } from '@/components/Header/landing'

export default async function Home({searchParams}: {
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
  }
}) {
  const schema = await fetch_kg_schema()
  if (has_landing(schema)) {
    // links shared before the landing page existed pointed the knowledge graph at "/"
    const kg_tab = schema.header.tabs.find(tab => tab.component === "KnowledgeGraph")
    if (kg_tab && Object.keys(searchParams).length > 0) {
      redirect(`${kg_tab.endpoint}?${new URLSearchParams(searchParams as {[key: string]: string}).toString()}`)
    }
    // the header renders the landing hero for "/"
    return <PageShell schema={schema}/>
  }
  const root_tab = {component: '', props: {}, endpoint: ""}
  for (const tab of schema.header.tabs) {
    if (tab.endpoint === "/") {
      root_tab.component = tab.component
      root_tab.props = tab.props
    }
  }
  return (
    <PageShell schema={schema} fullscreen={searchParams.fullscreen}>
      <QueryTranslator>
        <Component searchParams={searchParams} {...root_tab}/>
      </QueryTranslator>
    </PageShell>
  )
}
