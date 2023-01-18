import React, { ComponentProps, useMemo } from 'react'
import { Group } from 'react-konva'
import { MSA_CHAR_WIDTH, MsaCharacter } from 'src/components/Msa/MsaCharacter'
import type { SequenceType } from 'src/hooks/useDataIndexQuery'

export interface MsaSequenceProps extends ComponentProps<typeof Group> {
  seq: string
  seqType: SequenceType
}

export function MsaSequence({ seq, seqType, ...restProps }: MsaSequenceProps) {
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
