import React, { Suspense } from 'react'
import { LOADING } from 'src/components/Loading/Loading'

import type { SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { useGeneClusterData, useGeneClusterJson } from 'src/hooks/useDataIndexQuery'
import { Layout } from 'src/components/Layout/Layout'

export interface SpeciesPageProps {
  species: SpeciesDesc
}

export function SpeciesPage({ species }: SpeciesPageProps) {
  return (
    <Layout>
      <Suspense fallback={LOADING}>
        <SpeciesInfo species={species} />
      </Suspense>
    </Layout>
  )
}

export function SpeciesInfo({ species }: SpeciesPageProps) {
  const geneJson = useGeneClusterJson(species.pathogenName)
  const geneId = geneJson[0].msa

  const geneClusterData = useGeneClusterData(species.pathogenName, geneId)
  const { alnAa, alnAaReduced, alnNa, alnNaReduced, nwk, patternsJson, treeJson } = geneClusterData

  return (
    <>
      <h2>{`Species: ${species.pathogenName}`}</h2>
      <p>
        {JSON.stringify(
          { species, data: { alnAa, alnAaReduced, alnNa, alnNaReduced, nwk, patternsJson, treeJson } },
          null,
          2,
        )}
      </p>
    </>
  )
}
