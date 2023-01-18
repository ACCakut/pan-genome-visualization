import React, { ComponentProps, useMemo } from 'react'
import { Group } from 'react-konva'
import { MsaMutations } from 'src/components/Msa/MsaMutations'
import { MsaSequence } from 'src/components/Msa/MsaSequence'
import { SequenceType } from 'src/hooks/useDataIndexQuery'
import { FastaEntry, Mutation, SequenceEntry } from 'src/io/parseFasta'

export interface MsaRowProps extends ComponentProps<typeof Group> {
  refEntry: FastaEntry
  entry: SequenceEntry
  mutationsOnly?: boolean
  seqType: SequenceType
}

export function MsaRow({ refEntry, entry, mutationsOnly, seqType, ...restProps }: MsaRowProps) {
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
