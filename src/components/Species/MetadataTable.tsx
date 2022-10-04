import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import { MetadataEntry, SpeciesDesc, useSpeciesMetadata } from 'src/hooks/useDataIndexQuery'
import { Table } from '../Table/Table'

export function sanitizeTsvValue(value?: string) {
  if (!value || value.toString().toLowerCase().trim() === 'unknown') {
    return ''
  }
  return value
}

const METADATA_TABLE_COLUMNS: ColumnDef<MetadataEntry>[] = [
  {
    id: 'Accession',
    header: 'Accession',
    accessorFn: (meta) => sanitizeTsvValue(meta.accession),
    size: 100,
  },
  {
    id: 'Strain',
    header: 'Strain',
    accessorFn: (meta) => sanitizeTsvValue(meta.strain),
    size: 100,
  },
  {
    id: 'Collection date',
    header: 'Collection date',
    accessorFn: (meta) => sanitizeTsvValue(meta.collection_date),
    size: 100,
  },
  {
    id: 'Country',
    header: 'Country',
    accessorFn: (meta) => sanitizeTsvValue(meta.country),
    size: 100,
  },
  {
    id: 'Host',
    header: 'Host',
    accessorFn: (meta) => sanitizeTsvValue(meta.host),
    size: 100,
  },
  {
    id: 'Organism',
    header: 'Organism',
    accessorFn: (meta) => sanitizeTsvValue(meta.organism),
  },
]

const METADATA_TABLE_COLUMN_ORDER = METADATA_TABLE_COLUMNS.map((column) => column.id as string)

const METADATA_TABLE_SEARCH_KEYS: Extract<keyof MetadataEntry, string>[] = [
  'accession',
  'strain',
  'collection_date',
  'country',
  'host',
  'organism',
]

export interface MetadataTableProps {
  species: SpeciesDesc
}

export function MetadataTable({ species }: MetadataTableProps) {
  const { t } = useTranslationSafe()
  const metadata = useSpeciesMetadata(species.id)

  return (
    <Table
      title={t('Select metadata')}
      searchTitle={t('Search metadata')}
      data_={metadata}
      columns_={METADATA_TABLE_COLUMNS}
      initialColumnOrder={METADATA_TABLE_COLUMN_ORDER}
      searchKeys={METADATA_TABLE_SEARCH_KEYS}
    />
  )
}
