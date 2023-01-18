import React, { ComponentProps, Suspense, useMemo } from 'react'
import { Stage, Layer, Rect, Text, Group } from 'react-konva'
import { useResizeDetector } from 'react-resize-detector'
import { CardHeader, Card, Col, Container, Row, CardBody } from 'reactstrap'
import styled, { useTheme } from 'styled-components'
import { getAminoacidColor } from 'src/helpers/getAminoacidColor'
import { getTextColor } from 'src/helpers/getTextColor'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import type { GeneCluster, SpeciesDesc } from 'src/hooks/useDataIndexQuery'
import { SequenceType, useGeneClusterData } from 'src/hooks/useDataIndexQuery'
import { FastaEntry, Mutation, parseFastaToRefAndMutations, SequenceEntry } from 'src/io/parseFasta'
import { LOADING } from 'src/components/Loading/Loading'
import { getNucleotideColor } from 'src/helpers/getNucleotideColor'

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
          <MsaRefRow refEntry={data.refEntry} seqType={seqType} />
          {rows}
        </Group>
      </Layer>
    </Stage>
  )
}

const MSA_CHAR_HEIGHT = 20
const MSA_CHAR_WIDTH = 20
const MSA_CHAR_FONT_SIZE = 14

export interface MsaRefRowProps {
  refEntry: FastaEntry
  seqType: SequenceType
}

function MsaRefRow({ refEntry, seqType }: MsaRefRowProps) {
  const chars = useMemo(() => <MsaSequence seq={refEntry.seq} seqType={seqType} />, [refEntry.seq, seqType])
  return <Group>{chars}</Group>
}

export interface MsaRowProps extends ComponentProps<typeof Group> {
  refEntry: FastaEntry
  entry: SequenceEntry
  mutationsOnly?: boolean
  seqType: SequenceType
}

function MsaRow({ refEntry, entry, mutationsOnly, seqType, ...restProps }: MsaRowProps) {
  const component = useMemo(() => {
    const mutations = entry.mutations.filter((mut) => mut.pos < refEntry.seq.length)
    if (mutationsOnly) {
      return <MsaSequence seq={applyMutations(refEntry.seq, mutations)} seqType={seqType} />
    }
    return <MsaMutations mutations={mutations} seqType={seqType} />
  }, [entry.mutations, mutationsOnly, refEntry.seq, seqType])
  return <Group {...restProps}>{component}</Group>
}

function applyMutations(refSeq: string, mutations: Mutation[]) {
  const seq = refSeq.split('')
  mutations
    .filter((mut) => mut.pos < refSeq.length)
    .forEach(({ pos, qry }) => {
      seq[pos] = qry
    })
  return seq.join('')
}

export interface MsaMutationsProps extends ComponentProps<typeof Group> {
  mutations: Mutation[]
  seqType: SequenceType
}

function MsaMutations({ mutations, seqType, ...restProps }: MsaMutationsProps) {
  const chars = useMemo(
    () =>
      mutations.map(({ pos, qry }) => (
        <MsaCharacter key={pos} x={MSA_CHAR_WIDTH * pos} y={0} character={qry} seqType={seqType} />
      )),
    [mutations, seqType],
  )
  return <Group {...restProps}>{chars}</Group>
}

export interface MsaSequenceProps extends ComponentProps<typeof Group> {
  seq: string
  seqType: SequenceType
}

function MsaSequence({ seq, seqType, ...restProps }: MsaSequenceProps) {
  const chars = useMemo(
    () =>
      seq.split('').map((c, pos) => (
        // eslint-disable-next-line react/no-array-index-key
        <MsaCharacter key={`${c}-${pos}`} x={MSA_CHAR_WIDTH * pos} y={0} character={c} seqType={seqType} />
      )),
    [seq, seqType],
  )
  return <Group {...restProps}>{chars}</Group>
}

export interface MsaCharacterProps extends ComponentProps<typeof Group> {
  character: string
  seqType: SequenceType
}

function MsaCharacter({ character, seqType, ...restProps }: MsaCharacterProps) {
  const theme = useTheme()
  const { textColor, fillColor } = useMemo(() => {
    const fillColor = seqType === SequenceType.Aa ? getAminoacidColor(character) : getNucleotideColor(character)
    return { textColor: getTextColor(theme, fillColor), fillColor }
  }, [character, seqType, theme])

  return (
    <Group {...restProps}>
      <Rect width={MSA_CHAR_WIDTH} height={MSA_CHAR_HEIGHT} fill={fillColor} strokeWidth={0.5} stroke="#ffffffaa" />
      <Text
        width={MSA_CHAR_WIDTH}
        height={MSA_CHAR_HEIGHT}
        fill={textColor}
        text={character}
        fontSize={MSA_CHAR_FONT_SIZE}
        fontFamily="monospace"
        align="center"
        verticalAlign="middle"
      />
    </Group>
  )
}
