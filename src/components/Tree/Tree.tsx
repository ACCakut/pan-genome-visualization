import React, { Suspense } from 'react'
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap'
import styled from 'styled-components'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import type { GeneCluster, SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { GeneTree } from 'src/components/Tree/GeneTree'
import { SpeciesTree } from 'src/components/Tree/SpeciesTree'
import { LOADING } from 'src/components/Loading/Loading'

const TreeContainer = styled(Container)`
  height: 500px;
`

export interface TreeProps {
  species: SpeciesDesc
  gene: GeneCluster
}

export default function Tree({ species, gene }: TreeProps) {
  const { t } = useTranslationSafe()

  return (
    <TreeContainer fluid>
      <Row noGutters className="w-100 h-100">
        <Col className="h-100 m-1">
          <Card className="w-100 h-100">
            <CardHeader>
              <h4>{t('Strain graph')}</h4>
            </CardHeader>
            <CardBody>
              <Suspense fallback={LOADING}>
                <SpeciesTree species={species} />
              </Suspense>
            </CardBody>
          </Card>
        </Col>
        <Col className="h-100 m-1">
          <Card className="w-100 h-100">
            <CardHeader>
              <h4>{t('Gene graph')}</h4>
            </CardHeader>
            <CardBody>
              <Suspense fallback={LOADING}>
                <GeneTree species={species} gene={gene} />
              </Suspense>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </TreeContainer>
  )
}
