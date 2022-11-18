import React, { Suspense, useMemo } from 'react'
import { Col, Container, Row } from 'reactstrap'
import { useRecoilValue } from 'recoil'

import type { GeneCluster, SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { currentGeneIdAtom } from 'src/state/genes'
import { useGeneClusterData, useGeneClusterJson } from 'src/hooks/useDataIndexQuery'
import { GeneClustersTable } from 'src/components/Species/GeneClustersTable'
import { LOADING } from 'src/components/Loading/Loading'
import { Layout } from 'src/components/Layout/Layout'
import { Tree } from 'src/components/Tree/Tree'
import { MetadataTable } from 'src/components/Species/MetadataTable'

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
    <Container fluid>
      <Row noGutters>
        <Col>
          <h2 className="text-center">{species.name}</h2>
        </Col>
      </Row>

      <Row noGutters>
        <Col>
          <GeneClustersTable species={species} clusters={geneJson.clusters} />
        </Col>
      </Row>

      <Row noGutters className="my-4">
        <Col>{gene && <GeneClustersSection species={species} gene={gene} />}</Col>
      </Row>
    </Container>
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
      <Container fluid>
        <Row noGutters>
          <Col>
            <Tree species={species} gene={gene} />
          </Col>
        </Row>

        <Row noGutters>
          <Col>
            <MetadataTable species={species} />
          </Col>
        </Row>
        <Row noGutters>
          <Col>
            <GeneClustersData species={species} gene={gene} />
          </Col>
        </Row>
      </Container>
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
    <div className="d-flex w-100 overflow-x-scroll">
      <pre className="overflow-x-scroll bg-dark text-light">
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
      </pre>
    </div>
  )
}
