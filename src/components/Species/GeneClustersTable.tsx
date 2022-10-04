import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useRecoilState } from 'recoil'

import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import { Table } from 'src/components/Table/Table'
import { currentGeneIdAtom } from 'src/state/genes'
import { GeneCluster, geneClusterGetId, SpeciesDesc } from 'src/hooks/useDataIndexQuery'

const GENE_CLUSTERS_TABLE_COLUMNS: ColumnDef<GeneCluster>[] = [
  {
    id: 'ID',
    header: 'ID',
    accessorFn: (gene) => gene.id,
    size: 50,
    minSize: 40,
    maxSize: 200,
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
    size: 60,
    minSize: 50,
    maxSize: 200,
  },
  {
    id: 'Duplicated',
    header: 'Duplicated',
    accessorFn: (gene) => gene.dupli,
    size: 80,
    minSize: 50,
    maxSize: 200,
  },
  {
    id: 'Events',
    header: 'Events',
    accessorFn: (gene) => gene.num_events,
    size: 50,
    minSize: 30,
    maxSize: 200,
  },
  {
    id: 'Diversity',
    header: 'Diversity',
    accessorFn: (gene) => gene.divers,
    size: 60,
    minSize: 50,
    maxSize: 200,
  },
  {
    id: 'Length',
    header: 'Length',
    accessorFn: (gene) => gene.length,
    size: 60,
    minSize: 50,
    maxSize: 200,
  },
]

const GENE_CLUSTERS_TABLE_COLUMN_ORDER = GENE_CLUSTERS_TABLE_COLUMNS.map((column) => column.id as string)

const GENE_CLUSTERS_TABLE_SEARCH_KEYS: Extract<keyof GeneCluster, string>[] = ['mnemonic', 'name']

export interface GeneClustersTableProps {
  species: SpeciesDesc
  clusters: GeneCluster[]
}

export function GeneClustersTable({ species, clusters }: GeneClustersTableProps) {
  const { t } = useTranslationSafe()
  const [selectedRowId, setSelectedRowId] = useRecoilState(currentGeneIdAtom(species.id))
  return (
    <Table
      title={t('Select gene')}
      searchTitle={t('Search genes')}
      data_={clusters}
      columns_={GENE_CLUSTERS_TABLE_COLUMNS}
      initialColumnOrder={GENE_CLUSTERS_TABLE_COLUMN_ORDER}
      searchKeys={GENE_CLUSTERS_TABLE_SEARCH_KEYS}
      selectedRowId={selectedRowId}
      setSelectedRowId={setSelectedRowId}
      getRowId={geneClusterGetId}
    />
  )
}
