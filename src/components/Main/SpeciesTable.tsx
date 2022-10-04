import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { SpeciesDesc, SpeciesDownloads, useDataIndexQuery } from 'src/hooks/useDataIndexQuery'
import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import { Table } from 'src/components/Table/Table'
import { SpeciesTableCellDownloadList } from './SpeciesTableCellDownloadList'
import { SpeciesTableCellName } from './SpeciesTableCellName'

const SPECIES_TABLE_COLUMNS: ColumnDef<SpeciesDesc>[] = [
  {
    id: 'Name',
    header: 'Name',
    accessorFn: (row) => row,
    size: 200,
    cell: (context) => <SpeciesTableCellName species={context.getValue<SpeciesDesc>()} />,
  },
  {
    id: 'Source',
    header: 'Source',
    accessorFn: (row) => row.source,
    minSize: 75,
    size: 75,
  },
  {
    id: 'Strains',
    header: 'Strains',
    accessorFn: (row) => row.num_strains,
    minSize: 50,
    size: 50,
  },
  {
    id: 'Downloads',
    header: 'Downloads',
    accessorFn: (row) => row.downloads,
    minSize: 75,
    size: 75,
    cell: (context) => <SpeciesTableCellDownloadList downloads={context.getValue<SpeciesDownloads>()} />,
    enableSorting: false,
  },
]

const SPECIES_TABLE_COLUMN_ORDER = SPECIES_TABLE_COLUMNS.map((column) => column.id as string)

const SPECIES_TABLE_SEARCH_KEYS: Extract<keyof SpeciesDesc, string>[] = ['name']

export function SpeciesTable() {
  const { t } = useTranslationSafe()
  const { records } = useDataIndexQuery()
  return (
    <Table
      title={t('Select species')}
      searchTitle={t('Search species')}
      data_={records}
      columns_={SPECIES_TABLE_COLUMNS}
      initialColumnOrder={SPECIES_TABLE_COLUMN_ORDER}
      searchKeys={SPECIES_TABLE_SEARCH_KEYS}
    />
  )
}
