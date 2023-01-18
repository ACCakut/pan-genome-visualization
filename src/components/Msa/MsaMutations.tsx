import React, { ComponentProps, useMemo } from 'react'
import { Group } from 'react-konva'
import type { SequenceType } from 'src/hooks/useDataIndexQuery'
import type { Mutation } from 'src/io/parseFasta'
import { MSA_CHAR_WIDTH, MsaCharacter } from 'src/components/Msa/MsaCharacter'

export interface MsaMutationsProps extends ComponentProps<typeof Group> {
  mutations: Mutation[]
  seqType: SequenceType
}

export function MsaMutations({ mutations, seqType, ...restProps }: MsaMutationsProps) {
  const chars = useMemo(
    () =>
      mutations.map(({ pos, qry }) => (
        <MsaCharacter key={pos} x={MSA_CHAR_WIDTH * pos} y={0} character={qry} seqType={seqType} />
      )),
    [mutations, seqType],
  )
  return <Group {...restProps}>{chars}</Group>
}
