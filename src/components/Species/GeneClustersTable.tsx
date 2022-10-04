import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useRecoilState } from 'recoil'
import { Table } from 'src/components/Table/Table'
import { currentGeneIdAtom } from 'src/state/genes'

import { GeneCluster, geneClusterEquals, geneClusterGetId, SpeciesDesc } from 'src/hooks/useDataIndexQuery'

const SPECIES_TABLE_COLUMNS: ColumnDef<GeneCluster>[] = [
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

const SPECIES_TABLE_COLUMN_ORDER = SPECIES_TABLE_COLUMNS.map((column) => column.id as string)

const SPECIES_TABLE_SEARCH_KEYS: Extract<keyof GeneCluster, string>[] = ['mnemonic', 'name']

export interface GeneClustersTableProps {
  species: SpeciesDesc
  clusters: GeneCluster[]
}

export function GeneClustersTable({ species, clusters }: GeneClustersTableProps) {
  const [selectedRowId, setSelectedRowId] = useRecoilState(currentGeneIdAtom(species.id))
  return (
    <Table
      data_={clusters}
      columns_={SPECIES_TABLE_COLUMNS}
      initialColumnOrder={SPECIES_TABLE_COLUMN_ORDER}
      searchKeys={SPECIES_TABLE_SEARCH_KEYS}
      selectedRowId={selectedRowId}
      setSelectedRowId={setSelectedRowId}
      getRowId={geneClusterGetId}
      equals={geneClusterEquals}
    />
  )
}
