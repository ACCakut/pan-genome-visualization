import React, { Suspense, useMemo } from 'react'
import { useRecoilValue } from 'recoil'

import type { GeneCluster, SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { useGeneClusterData, useGeneClusterJson } from 'src/hooks/useDataIndexQuery'
import { LOADING } from 'src/components/Loading/Loading'
import { Layout } from 'src/components/Layout/Layout'
import { GeneClustersTable } from 'src/components/Species/GeneClustersTable'
import { currentGeneIdAtom } from 'src/state/genes'

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
  const currentGeneId = useRecoilValue(currentGeneIdAtom(species.id))

  const gene = useMemo(
    () => geneJson.clusters.find((cluster) => cluster.id === currentGeneId),
    [currentGeneId, geneJson.clusters],
  )

  if (!gene) {
    return null
  }

  return (
    <>
      <h2>{`Species: ${species.name}`}</h2>
      <GeneClustersTable species={species} clusters={geneJson.clusters} />
      {gene && <GeneClustersSection species={species} gene={gene} />}
    </>
  )
}

export interface GeneClustersSectionProps {
  species: SpeciesDesc
  gene?: GeneCluster
}

export function GeneClustersSection({ species, gene }: GeneClustersSectionProps) {
  if (!gene) {
    return null
  }
  return (
    <Suspense fallback={LOADING}>
      <GeneClustersData species={species} gene={gene} />
    </Suspense>
  )
}

export interface GeneClustersDataProps {
  species: SpeciesDesc
  gene: GeneCluster
}

export function GeneClustersData({ species, gene }: GeneClustersDataProps) {
  const geneClusterData = useGeneClusterData(species.id, gene)
  const { aa_aln, aa_aln_reduced, na_aln, na_aln_reduced, nwk, patterns_json, tree_json } = geneClusterData

  return (
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
  )
}
