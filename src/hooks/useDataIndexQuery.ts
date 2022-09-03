import urljoin from 'url-join'
import { ErrorInternal } from 'src/helpers/ErrorInternal'
import { useAxiosQueries, UseAxiosQueriesOptions, useAxiosQuery, UseAxiosQueryOptions } from 'src/hooks/useAxiosQuery'

export interface SpeciesDesc {
  pathogenName: string
}

export interface DataIndexJson {
  datasets: SpeciesDesc[]
}

export interface GeneClusterJson {
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

export function useGeneClusterJson(
  speciesSlug: string,
  options?: UseAxiosQueryOptions<GeneClusterJson[]>,
): GeneClusterJson[] {
  return useAxiosQuery<GeneClusterJson[]>(
    urljoin(getDataRootUrl(), 'dataset', speciesSlug, 'geneCluster.json'),
    options,
  )
}

export function useGeneClusterDataFileUrl(speciesSlug: string, geneClusterId: string, suffix: string): string {
  return urljoin(getDataRootUrl(), 'dataset', speciesSlug, 'geneCluster', `${geneClusterId}`, suffix)
}

export interface GeneClusterData {
  alnAa: string
  alnAaReduced: string
  alnNa: string
  alnNaReduced: string
  nwk: string
  patternsJson: string
  treeJson: string
}

export function useGeneClusterData(
  speciesSlug: string,
  geneClusterId: string,
  options?: UseAxiosQueriesOptions<GeneClusterData>,
) {
  const urlBase = urljoin(getDataRootUrl(), 'dataset', speciesSlug, 'geneCluster', `${geneClusterId}`)
  return useAxiosQueries<GeneClusterData>(
    {
      alnAa: `${urlBase}_aa_aln.fa`,
      alnAaReduced: `${urlBase}_aa_aln_reduced.fa`,
      alnNa: `${urlBase}_na_aln.fa`,
      alnNaReduced: `${urlBase}_na_aln_reduced.fa`,
      nwk: `${urlBase}.nwk`,
      patternsJson: `${urlBase}_patterns.json`,
      treeJson: `${urlBase}_tree.json`,
    },
    options,
  )
}
