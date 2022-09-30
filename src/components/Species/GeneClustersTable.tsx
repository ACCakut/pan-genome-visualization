import React, { useState, useRef, useMemo, ChangeEvent, useCallback, useDeferredValue } from 'react'
import { sortBy, isString, get, isEqual } from 'lodash'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import {
  Table as ReactTable,
  Column,
  ColumnOrderState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Header,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtual } from 'react-virtual'
import {
  Button,
  Col,
  Container,
  CustomInput,
  FormGroup,
  Input,
  Label,
  Row,
  Table as TableBase,
  Popover as PopoverBase,
  PopoverProps,
  Card,
  CardBody,
  CardHeader,
} from 'reactstrap'
import { useRecoilState } from 'recoil'
import { currentGeneIdAtom } from 'src/state/genes'
import styled, { useTheme } from 'styled-components'
import fuzzysort from 'fuzzysort'
import { ConnectableElement, useDrag, useDrop } from 'react-dnd'
import { IoReorderFourOutline as IconReorder } from 'react-icons/io5'
import { MdUndo as IconUndo } from 'react-icons/md'
import { BsThreeDotsVertical as MenuIcon } from 'react-icons/bs'

import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import type { GeneCluster, SpeciesDesc } from 'src/hooks/useDataIndexQuery'

const SPECIES_TABLE_COLUMNS: ColumnDef<GeneCluster>[] = [
  {
    id: 'ID',
    header: 'ID',
    accessorFn: (gene) => gene.id,
    size: 50,
    minSize: 50,
    maxSize: 50,
  },
  {
    id: 'Mnemonic',
    header: 'Mnemonic',
    accessorFn: (gene) => gene.mnemonic,
    size: 100,
  },
  {
    id: 'Name',
    header: 'Name',
    accessorFn: (gene) => gene.name,
    size: 250,
  },
  {
    id: 'Strains',
    header: 'Strains',
    accessorFn: (gene) => gene.num_strains,
    minSize: 60,
    maxSize: 60,
    size: 60,
  },
  {
    id: 'Duplicated',
    header: 'Duplicated',
    accessorFn: (gene) => gene.dupli,
    minSize: 80,
    maxSize: 80,
    size: 80,
  },
  {
    id: 'Events',
    header: 'Events',
    accessorFn: (gene) => gene.num_events,
    minSize: 50,
    size: 50,
  },
  {
    id: 'Diversity',
    header: 'Diversity',
    accessorFn: (gene) => gene.divers,
    minSize: 60,
    size: 60,
  },
  {
    id: 'Length',
    header: 'Length',
    accessorFn: (gene) => gene.length,
    minSize: 60,
    size: 60,
  },
]

const SPECIES_TABLE_COLUMN_ORDER = SPECIES_TABLE_COLUMNS.map((column) => column.id as string)

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

const Th = styled.th<{ $width?: number; $isDragging?: boolean; $canDrop?: boolean; $isDragOver?: boolean }>`
  width: ${(props) => props.$width}px;
  border-bottom: 1px solid ${(props) => props.theme.gray600};
  border-right: 1px solid ${(props) => props.theme.gray600};
  overflow: hidden;
  white-space: nowrap;
  color: ${(props) => props.theme.gray100};
  background-color: ${({ $isDragOver, theme }) => ($isDragOver ? theme.gray600 : theme.gray700)};
  outline: ${({ $isDragOver, theme }) => $isDragOver && theme.outline.drop};
  opacity: ${({ $isDragging }) => ($isDragging ? 0.1 : 1.0)};
`

const Td = styled.td<{ $isHighlighted?: boolean }>`
  padding: 6px;
  overflow: hidden;
  white-space: nowrap;
  color: ${({ $isHighlighted, theme }) => $isHighlighted && theme.white} !important;
`

const reorderColumn = (draggedColumnId: string, targetColumnId: string, columnOrder: string[]): ColumnOrderState => {
  columnOrder.splice(
    columnOrder.indexOf(targetColumnId),
    0,
    columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0],
  )
  return [...columnOrder]
}

export interface DraggableColumnHeaderProps {
  header: Header<GeneCluster, unknown>
  table: ReactTable<GeneCluster>
}

export function DraggableColumnHeader({ header, table }: DraggableColumnHeaderProps) {
  const { getState, setColumnOrder } = table
  const { columnOrder } = getState()
  const { column, colSpan, isPlaceholder } = header

  const [{ canDrop, isDragOver }, dropRef] = useDrop({
    accept: 'column',
    drop: (draggedColumn: Column<GeneCluster>) => {
      const newColumnOrder = reorderColumn(draggedColumn.id, column.id, columnOrder)
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
      dragRef(element)
      dropRef(element)
      previewRef(element)
    },
    [dragRef, dropRef, previewRef],
  )

  const content = useMemo(() => {
    if (isPlaceholder) {
      return null
    }
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
      <div onClick={column.getToggleSortingHandler()}>
        {flexRender(column.columnDef.header, header.getContext())}
        {{
          asc: ' ^',
          desc: ' v',
        }[column.getIsSorted() as string] ?? null}
      </div>
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
      {content}
    </Th>
  )
}

const ColumnListUl = styled.ul`
  width: 100%;
  padding-left: 0;
`

const ColumnListLi = styled.li<{ $isDragging?: boolean; $canDrop?: boolean; $isDragOver?: boolean }>`
  background-color: ${({ $canDrop, $isDragOver, theme }) =>
    $isDragOver ? theme.gray300 : $canDrop ? theme.gray150 : undefined};
  outline: ${({ $isDragOver, theme }) => $isDragOver && theme.outline.drop};
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1.0)};
  list-style: none;
  display: flex;
`

export interface ColumnListItemProps<T> {
  table: ReactTable<T>
  column: Column<T, unknown>
}

export function ColumnListItem<T>({ table, column }: ColumnListItemProps<T>) {
  const { getState, setColumnOrder } = table
  const { columnOrder } = getState()

  const [{ canDrop, isDragOver }, dropRef] = useDrop({
    accept: 'column',
    drop: (draggedColumn: Column<GeneCluster>) => {
      const newColumnOrder = reorderColumn(draggedColumn.id, column.id, columnOrder)
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
      dragRef(element)
      dropRef(element)
      previewRef(element)
    },
    [dragRef, dropRef, previewRef],
  )

  const theme = useTheme()
  const id = useMemo(() => `column-toggle-${column.id}`, [column.id])

  return (
    <ColumnListLi $isDragging={isDragging} $canDrop={canDrop} $isDragOver={isDragOver} ref={attachRef}>
      <div ref={previewRef}>
        <FormGroup check inline>
          <IconReorder color={theme.gray600} size={16} />
          <CustomInput
            className="ml-1"
            id={id}
            type="checkbox"
            checked={column.getIsVisible()}
            onChange={column.getToggleVisibilityHandler()}
          />
          <Label htmlFor={id} check>
            {column.id}
          </Label>
        </FormGroup>
      </div>
    </ColumnListLi>
  )
}

export function ColumnList<T>({ table }: { table: ReactTable<T> }) {
  const { t } = useTranslationSafe()
  const id = 'columns-toggle-all'

  const { columnOrder } = table.getState()
  const columns = table.getAllLeafColumns()

  const isDefaultOrder = useMemo(() => isEqual(columnOrder, SPECIES_TABLE_COLUMN_ORDER), [columnOrder])

  const resetColumnOrder = useCallback(() => {
    table.setColumnOrder([...SPECIES_TABLE_COLUMN_ORDER])
  }, [table])

  const columnCheckboxes = useMemo(
    () => columns.map((column) => <ColumnListItem key={column.id} table={table} column={column} />),
    [columns, table],
  )

  return (
    <ColumnListUl>
      <ColumnListLi>
        <FormGroup check inline>
          <CustomInput
            id={id}
            type="checkbox"
            checked={table.getIsAllColumnsVisible()}
            onChange={table.getToggleAllColumnsVisibilityHandler()}
          />
          <Label htmlFor={id} check>
            {t('Toggle All')}
          </Label>
          <Button
            className="p-0 m-0 ml-2"
            color="link"
            onClick={resetColumnOrder}
            title={t('Reset column order and visibility')}
            hidden={isDefaultOrder}
          >
            <IconUndo size={12} />
            <span className="ml-1">{t('Reset order')}</span>
          </Button>
        </FormGroup>
      </ColumnListLi>
      {columnCheckboxes}
    </ColumnListUl>
  )
}

export const Popover = styled(PopoverBase)<PopoverProps & { $width: string }>`
  & .popover {
    max-width: ${({ $width }) => `${$width}px`};
  }
  & .popover.show.bs-popover-auto {
    min-width: ${({ $width }) => `${$width}px`};
  }
`

export function ColumnListDropdown<T>({ table }: { table: ReactTable<T> }) {
  const id = 'menu'
  const { t } = useTranslationSafe()
  const theme = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const toggle = useCallback(() => setDropdownOpen((prevState) => !prevState), [])
  return (
    <Button id={id} color="link" onClick={toggle}>
      <MenuIcon color={theme.gray700} size={16} />
      <Popover target={id} placement="bottom-end" delay={0} fade={false} $width={300} isOpen={dropdownOpen} hideArrow>
        <Card>
          <CardHeader className="bg-dark text-light">{t('Columns')}</CardHeader>
          <CardBody>
            <Row noGutters>
              <Col>
                <ColumnList table={table} />
              </Col>
            </Row>
            <Row noGutters>
              <Col>
                <Button color="secondary" onClick={toggle}>
                  {t('Ok')}
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Popover>
    </Button>
  )
}

export interface GeneClustersTableProps {
  species: SpeciesDesc
  clusters: GeneCluster[]
}

export function GeneClustersTable({ species, clusters }: GeneClustersTableProps) {
  const { t } = useTranslationSafe()
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columns] = React.useState(SPECIES_TABLE_COLUMNS)
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([...SPECIES_TABLE_COLUMN_ORDER])
  const [columnVisibility, setColumnVisibility] = React.useState({})

  const [selectedGene, setSelectedGene_] = useRecoilState(currentGeneIdAtom(species.id))
  const setSelectedGene = useCallback((geneId: number) => () => setSelectedGene_(geneId), [setSelectedGene_])

  const [searchTerm_, setSearchTerm] = useState('')
  const searchTerm = useDeferredValue(searchTerm_)
  const onSearchTermChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value)
    },
    [setSearchTerm],
  )

  const data = useMemo(() => {
    const keys: Extract<keyof GeneCluster, string>[] = ['mnemonic', 'name']

    const results = fuzzysort.go(searchTerm, clusters, { keys, all: true }).map((result) => {
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
    const irrelevant = clusters.filter((candidate) => !relevant.some((relevant) => relevant.id === candidate.id))
    return [...relevant, ...irrelevant]
  }, [clusters, searchTerm])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnOrder, columnVisibility },
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

  return (
    <DatasetSelectorContainer>
      <Row noGutters>
        <Col sm={6} className="d-flex">
          <DatasetSelectorTitle>{t('Select a gene')}</DatasetSelectorTitle>
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
          <ColumnListDropdown table={table} />
        </Col>
      </Row>

      <Row noGutters className="mt-2">
        <TableContainer ref={tableContainerRef}>
          <Table>
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <DraggableColumnHeader key={header.id} header={header} table={table} />
                  ))}
                </Tr>
              ))}
            </Thead>

            <Tbody>
              <TableSpacer height={paddingTop} />

              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index]
                const geneId = row.getValue<number>('ID')
                const isHighlighted = geneId === selectedGene
                return (
                  <Tr key={row.id} onClick={setSelectedGene(geneId)} $isHighlighted={isHighlighted}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <Td key={cell.id} $isHighlighted={isHighlighted}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Td>
                      )
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
