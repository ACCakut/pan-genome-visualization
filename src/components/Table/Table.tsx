import {
  ColumnDef,
  ColumnOrderState,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import copy from 'fast-copy'
import fuzzysort from 'fuzzysort'
import { get, isString, sortBy } from 'lodash'
import React, { ChangeEvent, useCallback, useDeferredValue, useMemo, useRef, useState } from 'react'
import { useVirtual } from 'react-virtual'
import { Col, Input, Row } from 'reactstrap'
import { reorder } from 'src/components/Table/helpers'
import { ColumnListDropdown } from 'src/components/Table/TableColumnList'
import { TableRow } from 'src/components/Table/TableRow'
import {
  TableWrapper,
  TableContainer,
  TableStyled,
  TableTitle,
  Tbody,
  Thead,
  Tr,
} from 'src/components/Table/TableStyles'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import { TableHeader } from './TableHeader'

export interface TableProps<T, I> {
  data_: T[]
  columns_: ColumnDef<T>[]
  initialColumnOrder: string[]
  searchKeys: Extract<keyof T, string>[]
  selectedRowId: I
  setSelectedRowId(id: I): void
  getRowId(item: T): I
  equals(left: T, right: T): boolean
}

export function Table<T, I>({
  data_,
  columns_,
  initialColumnOrder,
  selectedRowId,
  setSelectedRowId,
  getRowId,
  searchKeys,
  equals,
}: TableProps<T, I>) {
  const { t } = useTranslationSafe()
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [_, setSorting] = useState<SortingState>([])
  const [columns] = React.useState(columns_)
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() => copy(initialColumnOrder))
  const [columnVisibility, setColumnVisibility] = React.useState({})

  const setSelectedRowIndexFun = useCallback((i: I) => () => setSelectedRowId(i), [setSelectedRowId])

  const [searchTerm_, setSearchTerm] = useState('')
  const searchTerm = useDeferredValue(searchTerm_)
  const onSearchTermChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value)
    },
    [setSearchTerm],
  )

  const [initialData, setInitialData] = useState(data_)
  const data = useMemo(() => {
    const results = fuzzysort.go(searchTerm, initialData, { keys: searchKeys, all: true }).map((result) => {
      // Increase relevance if any of the candidate's words start with any of the search terms or include one exactly
      const words = searchKeys
        .map((key) => get(result.obj, key) as unknown)
        .filter(isString)
        .flatMap((word) => word.split(' '))
        .map((word) => word.toLowerCase())

      if (words.length === 0) {
        return result
      }

      const searchTerms = searchTerm.split(' ')
      if (searchTerms.some((searchTerm) => words[0].startsWith(searchTerm))) {
        return { ...result, score: result.score * 0.05 }
      }
      if (words.some((word) => searchTerms.some((searchTerm) => word.startsWith(searchTerm)))) {
        return { ...result, score: result.score * 0.1 }
      }
      if (words.some((word) => searchTerms.some((searchTerm) => word.includes(searchTerm)))) {
        return { ...result, score: result.score * 0.15 }
      }
      return result
    })

    const relevant = sortBy(results, (result) => -result.score).map((result) => result.obj)
    const irrelevant = initialData.filter((candidate) => !relevant.some((relevant) => equals(relevant, candidate)))
    return [...relevant, ...irrelevant]
  }, [equals, initialData, searchKeys, searchTerm])

  const table = useReactTable({
    data,
    columns,
    state: { columnOrder, columnVisibility },
    columnResizeMode: 'onEnd',
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows } = table.getRowModel()

  const { virtualItems: virtualRows, totalSize } = useVirtual({
    parentRef: tableContainerRef,
    size: rows.length,
    overscan: 15,
  })

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0
  const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0

  const onRowReorder = useCallback(
    (srcRowIndex: number, dstRowIndex: number) => {
      setInitialData(reorder(data, srcRowIndex, dstRowIndex))
    },
    [data],
  )

  const headerComponents = table.getHeaderGroups().map((headerGroup) => (
    <Tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => (
        <TableHeader<T> key={header.id} header={header} table={table} />
      ))}
    </Tr>
  ))

  const rowComponents = virtualRows.map((virtualRow) => {
    const row = rows[virtualRow.index]
    const rowId = getRowId(row.original)
    const isHighlighted = rowId === selectedRowId
    return (
      <TableRow<T>
        key={row.id}
        row={row}
        isHighlighted={isHighlighted}
        onClick={setSelectedRowIndexFun(rowId)}
        onRowReorder={onRowReorder}
      />
    )
  })

  return (
    <TableWrapper>
      <Row noGutters>
        <Col sm={6} className="d-flex">
          <TableTitle>{t('Select a gene')}</TableTitle>
        </Col>

        <Col sm={5}>
          <Input
            type="text"
            title="Search gene"
            placeholder="Search gene"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-gramm="false"
            value={searchTerm}
            onChange={onSearchTermChange}
          />
        </Col>

        <Col sm={1}>
          <ColumnListDropdown table={table} initialColumnOrder={initialColumnOrder} />
        </Col>
      </Row>

      <Row noGutters className="mt-2">
        <TableContainer ref={tableContainerRef}>
          <TableStyled>
            <Thead>{headerComponents}</Thead>
            <Tbody>
              <TableSpacer height={paddingTop} />
              {rowComponents}
              <TableSpacer height={paddingBottom} />
            </Tbody>
          </TableStyled>
        </TableContainer>
      </Row>
    </TableWrapper>
  )
}

function TableSpacer({ height }: { height: number }) {
  const component = useMemo(
    () => (
      <tr>
        {/* eslint-disable-next-line react-perf/jsx-no-new-object-as-prop */}
        <td style={{ height: `${height}px` }} />
      </tr>
    ),
    [height],
  )

  if (height <= 0) {
    return null
  }

  return component
}
