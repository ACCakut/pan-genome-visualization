import React from 'react'
import { Col, Row } from 'reactstrap'
import styled from 'styled-components'
import { Table as ReactTable } from '@tanstack/react-table'

import { SearchBox } from 'src/components/Common/SearchBox'
import { ColumnListDropdown } from 'src/components/Table/TableColumnList'

export const TableTitle = styled.h3`
  padding: 0;
  margin: auto 0;
`

export interface TableHeadingProps<T> {
  table: ReactTable<T>
  initialColumnOrder: string[]
  title: string
  searchTitle: string
  searchTerm: string
  onSearchTermChange(term: string): void
}

export function TableHeading<T>({
  title,
  searchTitle,
  searchTerm,
  onSearchTermChange,
  table,
  initialColumnOrder,
}: TableHeadingProps<T>) {
  return (
    <Row noGutters>
      <Col sm={6} className="d-flex">
        <TableTitle>{title}</TableTitle>
      </Col>

      <Col sm={5}>
        <SearchBox searchTitle={searchTitle} searchTerm={searchTerm} onSearchTermChange={onSearchTermChange} />
      </Col>

      <Col sm={1}>
        <ColumnListDropdown table={table} initialColumnOrder={initialColumnOrder} />
      </Col>
    </Row>
  )
}
