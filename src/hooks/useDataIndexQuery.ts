import { useAxiosQuery, UseAxiosQueryOptions } from 'src/hooks/useAxiosQuery'

export interface SpeciesDesc {
  pathogenName: string
}

export interface DataIndex {
  datasets: SpeciesDesc[]
}

const DATA_ROOT_URL = process.env.DATA_ROOT_URL ?? ''

export function useDataIndexQuery(options?: UseAxiosQueryOptions<DataIndex>): DataIndex {
  return useAxiosQuery<DataIndex>(`${DATA_ROOT_URL}/index.json`, options)
}
