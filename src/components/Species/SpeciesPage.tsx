import React from 'react'

import type { SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { Layout } from 'src/components/Layout/Layout'

export interface SpeciesPageProps {
  species: SpeciesDesc
}

export function SpeciesPage({ species }: SpeciesPageProps) {
  return (
    <Layout>
      <h2>{`Species: ${species.pathogenName}`}</h2>
      <p>{JSON.stringify({ species })}</p>
    </Layout>
  )
}
