import React, { ComponentProps, ForwardedRef, forwardRef, useMemo } from 'react'
import Konva from 'konva'
import { Group } from 'react-konva'
import { MSA_CHAR_WIDTH, MsaCharacter } from 'src/components/Msa/MsaCharacter'
import type { SequenceType } from 'src/hooks/useDataIndexQuery'

export interface MsaSequenceProps extends ComponentProps<typeof Group> {
  seq: string
  seqType: SequenceType
}

export const MsaSequence = forwardRef(function MsaSequenceWithRef(
  { seq, seqType, ...restProps }: MsaSequenceProps,
  ref: ForwardedRef<Konva.Group>,
) {
  const chars = useMemo(
    () =>
      seq.split('').map((c, pos) => (
        // eslint-disable-next-line react/no-array-index-key
        <MsaCharacter key={`${c}-${pos}`} x={MSA_CHAR_WIDTH * pos} character={c} seqType={seqType} />
      )),
    [seq, seqType],
  )
  return (
    <Group ref={ref} {...restProps}>
      {chars}
    </Group>
  )
})
