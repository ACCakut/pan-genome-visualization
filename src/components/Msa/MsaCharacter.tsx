import React, { ComponentProps, useMemo } from 'react'
import { Group, Rect, Text } from 'react-konva'
import { getAminoacidColor } from 'src/helpers/getAminoacidColor'
import { getNucleotideColor } from 'src/helpers/getNucleotideColor'
import { getTextColor } from 'src/helpers/getTextColor'
import { SequenceType } from 'src/hooks/useDataIndexQuery'
import { useTheme } from 'styled-components'

export const MSA_CHAR_HEIGHT = 20
export const MSA_CHAR_WIDTH = 20
export const MSA_CHAR_FONT_SIZE = 14

export interface MsaCharacterProps extends ComponentProps<typeof Group> {
  character: string
  seqType: SequenceType
}

export function MsaCharacter({ character, seqType, ...restProps }: MsaCharacterProps) {
  const theme = useTheme()
  const { textColor, fillColor } = useMemo(() => {
    const fillColor = seqType === SequenceType.Aa ? getAminoacidColor(character) : getNucleotideColor(character)
    return { textColor: getTextColor(theme, fillColor), fillColor }
  }, [character, seqType, theme])

  const text = useMemo(() => {
    if (character === ' ') {
      return null
    }

    return (
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
    )
  }, [character, textColor])

  return (
    <Group {...restProps}>
      <Rect width={MSA_CHAR_WIDTH} height={MSA_CHAR_HEIGHT} fill={fillColor} strokeWidth={0.5} stroke="#ccca" />
      {text}
    </Group>
  )
}
