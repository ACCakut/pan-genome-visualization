import React, { Suspense, useMemo } from 'react'
import { Group, Layer, Stage } from 'react-konva'
import { useResizeDetector } from 'react-resize-detector'
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap'
import { LOADING } from 'src/components/Loading/Loading'
import { MSA_CHAR_HEIGHT } from 'src/components/Msa/MsaCharacter'
import { MsaRow } from 'src/components/Msa/MsaRow'
import { MsaSequence } from 'src/components/Msa/MsaSequence'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import type { GeneCluster, SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { SequenceType, useGeneClusterData } from 'src/hooks/useDataIndexQuery'
import { parseFastaToRefAndMutations } from 'src/io/parseFasta'
import styled from 'styled-components'

const MsaContainer = styled(Container)`
  height: 600px;
`

export interface MsaProps {
  gene: GeneCluster
  seqType: SequenceType
  species: SpeciesDesc
}

export default function Msa(props: MsaProps) {
  const { t } = useTranslationSafe()
  return (
    <MsaContainer fluid>
      <Row noGutters className="w-100 h-100 m-0 p-0">
        <Col className="m-0 p-0 pr-1">
          <Card className="h-100">
            <CardHeader>
              <h4>{t('Sequences')}</h4>
            </CardHeader>
            <CardBody>
              <Suspense fallback={LOADING}>
                <MsaImpl {...props} />
              </Suspense>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </MsaContainer>
  )
}

function MsaImpl({ species, gene, seqType }: MsaProps) {
  const {
    width,
    height,
    ref: containerRef,
  } = useResizeDetector({
    handleHeight: true,
    refreshOptions: { leading: true, trailing: true },
  })

  return (
    <div className="w-100 h-100" ref={containerRef}>
      <MsaSized width={width} height={height} species={species} gene={gene} seqType={seqType} />
    </div>
  )
}

export interface MsaSizedProps extends MsaProps {
  width?: number
  height?: number
}

function MsaSized({ species, gene, seqType, width, height }: MsaSizedProps) {
  const { aa_aln_reduced, na_aln_reduced } = useGeneClusterData(species, gene)

  const data = useMemo(() => {
    const fasta = seqType === SequenceType.Aa ? aa_aln_reduced : na_aln_reduced
    if (!fasta) {
      return null
    }
    return parseFastaToRefAndMutations(fasta)
  }, [aa_aln_reduced, na_aln_reduced, seqType])

  const rows = useMemo(() => {
    if (!data) {
      return null
    }

    const { refEntry, entries } = data

    return entries.map((entry, i) => (
      <MsaRow key={entry.index} refEntry={refEntry} entry={entry} y={1 + MSA_CHAR_HEIGHT * i} seqType={seqType} />
    ))
  }, [data, seqType])

  if (!data) {
    return null
  }

  return (
    <Stage width={width} height={height}>
      <Layer clearBeforeDraw>
        <Group>
          <MsaSequence seq={data.refEntry.seq} seqType={seqType} />
          {rows}
        </Group>
      </Layer>
    </Stage>
  )
}
