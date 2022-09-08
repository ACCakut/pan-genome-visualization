import React, { useState, useRef, useMemo, ChangeEvent, useCallback, useDeferredValue } from 'react'
import { sortBy, isString, get } from 'lodash'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtual } from 'react-virtual'
import { Col, Container, Input, Row, Table as TableBase } from 'reactstrap'
import styled from 'styled-components'
import fuzzysort from 'fuzzysort'

import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import { MetadataEntry, SpeciesDesc, useSpeciesMetadata } from 'src/hooks/useDataIndexQuery'

export function sanitizeTsvValue(value?: string) {
  if (!value || value.toString().toLowerCase().trim() === 'unknown') {
    return ''
  }
  return value
}

const SPECIES_TABLE_COLUMNS: ColumnDef<MetadataEntry>[] = [
  {
    id: 'Accession',
    header: 'Accession',
    accessorFn: (meta) => sanitizeTsvValue(meta.accession),
    size: 100,
  },
  {
    header: 'Strain',
    accessorFn: (meta) => sanitizeTsvValue(meta.strain),
    size: 100,
  },
  {
    header: 'Collection date',
    accessorFn: (meta) => sanitizeTsvValue(meta.collection_date),
    size: 100,
  },
  {
    header: 'Country',
    accessorFn: (meta) => sanitizeTsvValue(meta.country),
    size: 100,
  },
  {
    header: 'Host',
    accessorFn: (meta) => sanitizeTsvValue(meta.host),
    size: 100,
  },
  {
    header: 'Organism',
    accessorFn: (meta) => sanitizeTsvValue(meta.organism),
  },
]

const DatasetSelectorContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  max-width: 1000px;
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

const Table = styled(TableBase)`
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

const Tr = styled.tr<{ $isHighlighted?: boolean }>`
  cursor: pointer;
  background-color: ${({ $isHighlighted, theme }) => $isHighlighted && theme.primary};
`

const Th = styled.th<{ $width?: number }>`
  width: ${(props) => props.$width}px;
  border-bottom: 1px solid lightgray;
  border-right: 1px solid lightgray;
  overflow: hidden;
  white-space: nowrap;
`

const Td = styled.td<{ $isHighlighted?: boolean }>`
  padding: 6px;
  overflow: hidden;
  white-space: nowrap;
  color: ${({ $isHighlighted, theme }) => $isHighlighted && theme.white} !important;
`

export interface MetadataTableProps {
  species: SpeciesDesc
}

export function MetadataTable({ species }: MetadataTableProps) {
  const { t } = useTranslationSafe()
  const metadata = useSpeciesMetadata(species.id)

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
    if (metadata.length === 0) {
      return metadata
    }

    const keys = Object.keys(metadata[0])

    const results = fuzzysort.go(searchTerm, metadata, { keys, all: true }).map((result) => {
      // Increase relevance if any of the candidate's words start with any of the search terms or include one exactly
      const words = keys
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
    const irrelevant = metadata.filter(
      (candidate) => !relevant.some((relevant) => relevant.accession === candidate.accession),
    )
    return [...relevant, ...irrelevant]
  }, [metadata, searchTerm])

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
          <DatasetSelectorTitle>{t('Metadata')}</DatasetSelectorTitle>
        </Col>

        <Col sm={6}>
          <Input
            type="text"
            title="Search metadata"
            placeholder="Search metadata"
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
