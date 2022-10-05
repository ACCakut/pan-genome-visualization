import { Container, Table as TableBase } from 'reactstrap'
import styled from 'styled-components'

export const TableWrapper = styled(Container)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  max-width: 1000px;
`

export const TableContainer = styled.div`
  width: 100%;
  height: 600px;
  margin: 0 auto;
  overflow: hidden auto;
`

export const TableStyled = styled(TableBase)`
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
`

export const Thead = styled.thead`
  margin: 0;
  position: sticky;
  top: 0;
  background-color: ${(props) => props.theme.gray650};
`

export const Tbody = styled.tbody``

export const Tr = styled.tr<{
  $isHighlighted?: boolean
  $isDragging?: boolean
  $canDrop?: boolean
  $isDragOver?: boolean
}>`
  cursor: pointer;
  background-color: ${({ $isHighlighted, theme }) => $isHighlighted && theme.primary};
  outline: ${({ $isDragOver, theme }) => $isDragOver && theme.outline.drop};
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1.0)};
`

export const Td = styled.td<{ $isHighlighted?: boolean }>`
  padding: 6px;
  overflow: hidden;
  white-space: nowrap;
  color: ${({ $isHighlighted, theme }) => $isHighlighted && theme.white} !important;
`
