import React from 'react'
import { Col, Container, Row } from 'reactstrap'
import styled from 'styled-components'

import type { GeneCluster, SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { GeneTree } from 'src/components/Tree/GeneTree'
import { SpeciesTree } from 'src/components/Tree/SpeciesTree'

const TreeContainer = styled(Container)`
  height: 500px;
`

export interface TreeProps {
  species: SpeciesDesc
  gene: GeneCluster
}

export function Tree({ species, gene }: TreeProps) {
  return (
    <TreeContainer fluid>
      <Row noGutters className="w-100 h-100">
        <Col className="h-100">
          <SpeciesTree species={species} />
        </Col>
        <Col className="h-100">
          <GeneTree species={species} gene={gene} />
        </Col>
      </Row>
    </TreeContainer>
  )
}
