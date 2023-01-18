import React, { Suspense, UIEvent, useCallback, useMemo, useRef } from 'react'
import Konva from 'konva'
import { clamp } from 'lodash'
import { Group, Layer, Stage as StageBase } from 'react-konva'
import { useResizeDetector } from 'react-resize-detector'
import { useDraggable } from 'src/hooks/useDraggable'
import styled from 'styled-components'
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap'
import { LOADING } from 'src/components/Loading/Loading'
import { MSA_CHAR_HEIGHT, MSA_CHAR_WIDTH } from 'src/components/Msa/MsaCharacter'
import { MsaRow } from 'src/components/Msa/MsaRow'
import { MsaSequence } from 'src/components/Msa/MsaSequence'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import type { GeneCluster, SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { SequenceType, useGeneClusterData } from 'src/hooks/useDataIndexQuery'
import { parseFastaToRefAndMutations } from 'src/io/parseFasta'

const MsaContainer = styled(Container)`
  height: 300px;
  max-height: 300px;
`

export interface MsaProps {
  gene: GeneCluster
  seqType: SequenceType
  species: SpeciesDesc
  aspectRatio?: number
  maxWidth?: number
  maxHeight?: number
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

function MsaImpl({ maxWidth, maxHeight, aspectRatio, ...restProps }: MsaProps) {
  const {
    width,
    height,
    ref: containerRef,
  } = useResizeDetector({
    handleHeight: true,
    refreshOptions: { leading: true, trailing: true },
  })

  const adjustedWidth = clamp(width ?? 0, 0, maxWidth ?? Number.POSITIVE_INFINITY)
  const adjustedHeight = clamp(adjustedWidth / (aspectRatio ?? 10), height ?? 0, maxHeight ?? Number.POSITIVE_INFINITY)

  return (
    <div className="w-100 h-100" ref={containerRef}>
      <MsaSized width={adjustedWidth} height={adjustedHeight} {...restProps} />
    </div>
  )
}

export interface MsaSizedProps extends MsaProps {
  width: number
  height: number
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

  const { rows, numChars } = useMemo(() => {
    if (!data) {
      return { rows: [], numChars: 0 }
    }

    const { refEntry, entries } = data

    const rows = entries.map((entry, i) => (
      <MsaRow key={entry.index} refEntry={refEntry} entry={entry} y={1 + MSA_CHAR_HEIGHT * i} seqType={seqType} />
    ))

    const numChars = refEntry.seq.length
    return { rows, numChars }
  }, [data, seqType])

  const scrollContainer = useRef<HTMLDivElement>(null)
  const stage = useRef<Konva.Stage>(null)
  const {
    events: { onMouseDown },
  } = useDraggable(scrollContainer, {
    decayRate: 0.1,
    safeDisplacement: 0,
    applyRubberBandEffect: 'x',
  })

  const onScroll = useCallback((_e: UIEvent<HTMLDivElement>) => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollTop } = scrollContainer.current

      const dx = scrollLeft - PADDING
      const dy = scrollTop - PADDING

      if (stage.current) {
        stage.current.container().style.transform = `translate(${dx}px, ${dy}px)`
        stage.current.x(-dx)
        stage.current.y(-dy)
      }
    }
  }, [])

  if (!data) {
    return null
  }

  const largeWidth = MSA_CHAR_WIDTH * numChars
  const largeHeight = MSA_CHAR_HEIGHT * rows.length

  return (
    <MsaScrollContainer
      $width={width}
      $height={height}
      ref={scrollContainer}
      onScroll={onScroll}
      onMouseDown={onMouseDown}
    >
      <MsaLargeContainer $width={largeWidth} $height={largeHeight}>
        <Stage width={width + PADDING} height={height + PADDING} ref={stage}>
          <Layer clearBeforeDraw>
            <Group>
              <MsaSequence seq={data.refEntry.seq} seqType={seqType} />
              {rows}
            </Group>
          </Layer>
        </Stage>
      </MsaLargeContainer>
    </MsaScrollContainer>
  )
}

const PADDING = 100

const MsaLargeContainer = styled.div<{ $width: number; $height: number }>`
  margin: 0;
  padding: 0;
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  overflow: hidden;
`

const MsaScrollContainer = styled.div<{ $width: number; $height: number }>`
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  overflow: scroll;
`

const Stage = styled(StageBase)`
  position: relative;
  outline: none;
`
