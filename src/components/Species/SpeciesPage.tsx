import React, { Suspense } from 'react'

import type { SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { useGeneClusterData, useGeneClusterJson } from 'src/hooks/useDataIndexQuery'
import { LOADING } from 'src/components/Loading/Loading'
import { Layout } from 'src/components/Layout/Layout'
import { GeneClustersTable } from 'src/components/Species/GeneClustersTable'

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
  const geneJson = useGeneClusterJson(species.id)
  const gene = geneJson.clusters[0]

  const geneClusterData = useGeneClusterData(species.id, gene)
  const { aa_aln, aa_aln_reduced, na_aln, na_aln_reduced, nwk, patterns_json, tree_json } = geneClusterData

  return (
    <>
      <h2>{`Species: ${species.name}`}</h2>
      <GeneClustersTable clusters={geneJson.clusters} />
      <p>
        {JSON.stringify(
          {
            species,
            data: {
              aa_aln,
              aa_aln_reduced,
              na_aln,
              na_aln_reduced,
              nwk,
              patterns_json,
              tree_json,
            },
          },
          null,
          2,
        )}
      </p>
    </>
  )
}
