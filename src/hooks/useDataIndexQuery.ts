import { get, mapValues } from 'lodash'
import { useMemo } from 'react'
import urljoin from 'url-join'
import { ErrorInternal } from 'src/helpers/ErrorInternal'
import { useAxiosQuery, UseAxiosQueryOptions, useAxiosTarQuery } from 'src/hooks/useAxiosQuery'

export interface SpeciesDesc {
  pathogenName: string
}

export interface DataIndexJson {
  datasets: SpeciesDesc[]
}

export interface GeneCluster {
  geneId: number
  geneLen: number
  count: number
  dupli: string
  dup_detail: string
  ann: string
  msa: string
  divers: string
  event: string
  allAnn: string
  GName: string
  allGName: string
  locus: string
  archive: string
  archive_files: {
    aa_aln?: string
    aa_aln_reduced?: string
    na_aln?: string
    na_aln_reduced?: string
    nwk?: string
    patterns_json?: string
    tree_json?: string
  }
}

export interface GeneClusterJson {
  created_at: string
  clusters: GeneCluster[]
}

export function getDataRootUrl(): string {
  const DATA_ROOT_URL = process.env.DATA_ROOT_URL // eslint-disable-line prefer-destructuring
  if (!DATA_ROOT_URL) {
    throw new ErrorInternal('The variable "DATA_ROOT_URL" is not set.')
  }
  return DATA_ROOT_URL
}

export function getDataIndexJsonUrl(): string {
  return urljoin(getDataRootUrl(), 'index.json')
}

export function useDataIndexQuery(options?: UseAxiosQueryOptions<DataIndexJson>): DataIndexJson {
  return useAxiosQuery<DataIndexJson>(getDataIndexJsonUrl(), options)
}

export function useGeneClusterJson(speciesSlug: string, options?: UseAxiosQueryOptions<GeneClusterJson>) {
  return useAxiosQuery<GeneClusterJson>(
    urljoin(getDataRootUrl(), 'dataset', speciesSlug, 'gene_cluster_v2.json'),
    options,
  )
}

export interface GeneClusterData {
  aa_aln?: string
  aa_aln_reduced?: string
  na_aln?: string
  na_aln_reduced?: string
  nwk?: string
  patterns_json?: string
  tree_json?: string
}

export function useGeneClusterData(
  speciesSlug: string,
  cluster: GeneCluster,
  options?: UseAxiosQueryOptions<Record<string, string>>,
): GeneClusterData {
  const archiveUrl = useMemo(
    () => urljoin(getDataRootUrl(), 'dataset', speciesSlug, cluster.archive),
    [cluster.archive, speciesSlug],
  )

  const clusterArchive = useAxiosTarQuery(archiveUrl, options)

  return useMemo(
    () =>
      mapValues(cluster.archive_files, (filename) => {
        if (!filename) {
          return undefined
        }
        const content = get(clusterArchive, filename, undefined)
        if (!content) {
          throw new ErrorInternal(`File ${filename} not found in data archive`)
        }
        return content
      }),
    [cluster.archive_files, clusterArchive],
  )
}
