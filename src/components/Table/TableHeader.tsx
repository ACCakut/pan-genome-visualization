import React, { useCallback, useMemo } from 'react'
import { Column, flexRender, Header, Table as ReactTable } from '@tanstack/react-table'
import { ConnectableElement, useDrag, useDrop } from 'react-dnd'
import styled from 'styled-components'
import { GeneCluster } from 'src/hooks/useDataIndexQuery'
import { reorderByValue } from './helpers'

export interface TableHeaderProps<T> {
  header: Header<T, unknown>
  table: ReactTable<T>
}

const Th = styled.th<{ $width?: number; $isDragging?: boolean; $canDrop?: boolean; $isDragOver?: boolean }>`
  position: relative;
  width: ${(props) => props.$width}px;
  height: 45px;
  padding: 0 !important;
  margin: 0 !important;
  border: ${({ theme }) => `1px solid ${theme.gray700}`} !important;
  border-right: ${({ theme }) => `2px solid ${theme.gray600}`} !important;
  color: ${(props) => props.theme.gray100};
  background-color: ${({ $isDragOver, theme }) => ($isDragOver ? theme.gray600 : theme.gray700)};
  outline: ${({ $isDragOver, theme }) => $isDragOver && theme.outline.drop};
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1.0)};
`

const ColumnHeaderContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`

const ColumnHeaderContent = styled.span`
  margin: auto;
  overflow: hidden;
  white-space: nowrap;
  background-color: transparent !important;
`

export interface ColumnHeaderResizerProps {
  $isResizing: boolean
  $deltaOffset?: number | null
}

const ColumnHeaderResizer = styled.span.attrs<ColumnHeaderResizerProps>(({ $isResizing, $deltaOffset }) => ({
  style: {
    transform: $isResizing && `translate(${$deltaOffset ?? 0}px)`,
  },
}))<ColumnHeaderResizerProps>`
  display: inline-block;
  position: absolute;
  right: -2.5px;
  top: 0;
  height: 100%;
  width: 5px;
  background-color: ${({ $isResizing, theme }) => $isResizing && theme.primary};
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  z-index: 999;
`

export function TableHeader<T>({ header, table }: TableHeaderProps<T>) {
  const { getState, setColumnOrder } = table
  const { columnOrder } = getState()
  const { column, colSpan, isPlaceholder } = header

  const [{ canDrop, isDragOver }, dropRef] = useDrop({
    accept: 'column',
    drop: (draggedColumn: Column<GeneCluster>) => {
      const newColumnOrder = reorderByValue(columnOrder, draggedColumn.id, column.id)
      setColumnOrder(newColumnOrder)
    },
    canDrop: () => true,
    collect: (monitor) => ({
      isDragOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  })

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    item: () => column,
    type: 'column',
  })

  const attachRef = useCallback(
    (element: ConnectableElement) => {
      dropRef(element)
      previewRef(element)
    },
    [dropRef, previewRef],
  )

  const content = useMemo(() => {
    if (isPlaceholder) {
      return null
    }
    return (
      <ColumnHeaderContent onClick={column.getToggleSortingHandler()}>
        {flexRender(column.columnDef.header, header.getContext())}
        {{
          asc: ' ^',
          desc: ' v',
        }[column.getIsSorted() as string] ?? null}
      </ColumnHeaderContent>
    )
  }, [column, header, isPlaceholder])

  return (
    <Th
      ref={attachRef}
      colSpan={colSpan}
      $width={header.getSize()}
      $isDragging={isDragging}
      $canDrop={canDrop}
      $isDragOver={isDragOver}
    >
      <ColumnHeaderContainer ref={dragRef}>{content}</ColumnHeaderContainer>
      <ColumnHeaderResizer
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        $isResizing={column.getIsResizing()}
        $deltaOffset={table.getState().columnSizingInfo.deltaOffset}
      />
    </Th>
  )
}
