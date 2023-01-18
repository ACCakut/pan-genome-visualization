/* eslint-disable react/no-array-index-key */
import React, { ComponentProps, ForwardedRef, forwardRef, useMemo } from 'react'
import Konva from 'konva'
import { Group, Rect, Text } from 'react-konva'
import { MSA_CHAR_HEIGHT, MSA_CHAR_WIDTH, MsaCharacter } from 'src/components/Msa/MsaCharacter'
import type { SequenceType } from 'src/hooks/useDataIndexQuery'

const MSA_POS_FONT_SIZE = 8

export interface MsaRefSequenceProps extends ComponentProps<typeof Group> {
  seq: string
  seqType: SequenceType
}

export const MsaRefSequence = forwardRef(function MsaRefSequenceWithRef(
  { seq, seqType, ...restProps }: MsaRefSequenceProps,
  ref: ForwardedRef<Konva.Group>,
) {
  const chars = useMemo(
    () =>
      seq.split('').map((c, pos) => (
        <Group key={pos} x={MSA_CHAR_WIDTH * pos}>
          {(pos + 1) % 2 === 0 && <MsaPosition pos={pos + 1} />}
          <MsaCharacter y={MSA_CHAR_HEIGHT} character={c} seqType={seqType} />
        </Group>
      )),
    [seq, seqType],
  )
  return (
    <Group ref={ref} {...restProps}>
      {chars}
    </Group>
  )
})

export interface MsaPositionProps extends ComponentProps<typeof Group> {
  pos: number
}

function MsaPosition({ pos, ...restProps }: MsaPositionProps) {
  const text = useMemo(() => {
    return (
      <Text
        width={MSA_CHAR_WIDTH}
        height={MSA_CHAR_HEIGHT}
        fill="#222a"
        text={pos.toString()}
        fontSize={MSA_POS_FONT_SIZE}
        fontFamily="monospace"
        align="center"
        verticalAlign="middle"
      />
    )
  }, [pos])

  return (
    <Group {...restProps}>
      <Rect x={-MSA_CHAR_WIDTH} width={MSA_CHAR_WIDTH * 2} height={MSA_CHAR_HEIGHT} fill="#aaa" />
      {text}
    </Group>
  )
}
