import React, { useState, useRef, useMemo, ChangeEvent, useCallback, useDeferredValue } from 'react'
import { sortBy } from 'lodash'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtual } from 'react-virtual'
import { Col, Container, Input, Row } from 'reactstrap'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import styled from 'styled-components'
import fuzzysort from 'fuzzysort'

import { SpeciesDesc, SpeciesDownloads, useDataIndexQuery } from 'src/hooks/useDataIndexQuery'
import { SpeciesTableCellDownloadList } from './SpeciesTableCellDownloadList'
import { SpeciesTableCellName } from './SpeciesTableCellName'

const SPECIES_TABLE_COLUMNS: ColumnDef<SpeciesDesc>[] = [
  {
    header: 'Name',
    accessorFn: (row) => row,
    size: 200,
    cell: (context) => <SpeciesTableCellName species={context.getValue<SpeciesDesc>()} />,
  },
  {
    header: 'Source',
    accessorFn: (row) => row.source,
    minSize: 75,
    size: 75,
  },
  {
    header: 'Strains',
    accessorFn: (row) => row.num_strains,
    minSize: 50,
    size: 50,
  },
  {
    header: 'Downloads',
    accessorFn: (row) => row.downloads,
    minSize: 75,
    size: 75,
    cell: (context) => <SpeciesTableCellDownloadList downloads={context.getValue<SpeciesDownloads>()} />,
    enableSorting: false,
  },
]

const DatasetSelectorContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  max-width: 700px;
`

const DatasetSelectorTitle = styled.h3`
  padding: 0;
  margin: auto 0;
`

const TableContainer = styled.div`
  width: 100%;
  height: 600px;
  margin: 0 auto;
  overflow: auto;
`

const Table = styled.table`
  border-collapse: collapse;
  border-spacing: 0;
  font-family: arial, sans-serif;
  table-layout: fixed;
  width: 100%;
`

const Thead = styled.thead`
  background: lightgray;
  margin: 0;
  position: sticky;
  top: 0;
`

const Tbody = styled.tbody``

const Tr = styled.tr``

const Th = styled.th<{ $width?: number }>`
  width: ${(props) => props.$width}px;
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
  overflow: hidden;
  white-space: nowrap;
`

const Td = styled.td`
  padding: 6px;
  overflow: hidden;
  white-space: nowrap;
`

export function SpeciesTable() {
  const { t } = useTranslationSafe()
  const indexJson = useDataIndexQuery()
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const [searchTerm_, setSearchTerm] = useState('')
  const searchTerm = useDeferredValue(searchTerm_)
  const onSearchTermChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value)
    },
    [setSearchTerm],
  )

  const data = useMemo(() => {
    const results = fuzzysort.go(searchTerm, indexJson.records, { keys: ['name'], all: true }).map((result) => {
      // Increase relevance if any of the candidate's words start with any of the search terms or include one exactly
      const nameLower = result.obj.name.toLowerCase()
      const searchTerms = searchTerm.split(' ')
      if (searchTerms.some((searchTerm) => nameLower.startsWith(searchTerm))) {
        return { ...result, score: result.score * 0.05 }
      }
      if (nameLower.split(' ').some((word) => searchTerms.some((searchTerm) => word.startsWith(searchTerm)))) {
        return { ...result, score: result.score * 0.1 }
      }
      if (searchTerms.some((searchTerm) => nameLower.includes(searchTerm))) {
        return { ...result, score: result.score * 0.15 }
      }
      return result
    })
    const relevant = sortBy(results, (result) => -result.score).map((result) => result.obj)
    const irrelevant = indexJson.records.filter((candidate) => !relevant.includes(candidate))
    return [...relevant, ...irrelevant]
  }, [indexJson.records, searchTerm])

  const table = useReactTable({
    data,
    columns: SPECIES_TABLE_COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
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

  return (
    <DatasetSelectorContainer>
      <Row noGutters>
        <Col sm={6} className="d-flex">
          <DatasetSelectorTitle>{t('Select a species')}</DatasetSelectorTitle>
        </Col>

        <Col sm={6}>
          <Input
            type="text"
            title="Search species"
            placeholder="Search species"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-gramm="false"
            value={searchTerm}
            onChange={onSearchTermChange}
          />
        </Col>
      </Row>

      <Row noGutters className="mt-2">
        <TableContainer ref={tableContainerRef}>
          <Table>
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th key={header.id} colSpan={header.colSpan} $width={header.getSize()}>
                      {header.isPlaceholder ? null : (
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
                        <div onClick={header.column.getToggleSortingHandler()}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' ^',
                            desc: ' v',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>

            <Tbody>
              <TableSpacer height={paddingTop} />

              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index]
                return (
                  <Tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
                    })}
                  </Tr>
                )
              })}

              <TableSpacer height={paddingBottom} />
            </Tbody>
          </Table>
        </TableContainer>
      </Row>
    </DatasetSelectorContainer>
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
