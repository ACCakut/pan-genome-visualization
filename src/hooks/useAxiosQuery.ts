import type { QueryKey, UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { axiosFetch } from 'src/io/axiosFetch'

export type QueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'initialData'> & {
  initialData?: () => undefined
}

export interface UseAxiosQueryOptions<TData = unknown> extends QueryOptions<TData, Error, TData, string[]> {
  delay?: number
}

export function useAxiosQuery<TData = unknown>(url: string, options?: UseAxiosQueryOptions<TData>): TData {
  const newOptions = useMemo(() => {
    let newOptions: UseAxiosQueryOptions<TData> = {
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: Number.POSITIVE_INFINITY,
    }
    if (options) {
      newOptions = { ...newOptions, ...options }
    }
    return newOptions
  }, [options])

  const res = useQuery<TData, Error, TData, string[]>(
    [url],
    async () => {
      if (options?.delay) {
        await new Promise((resolve) => {
          setInterval(resolve, options.delay)
        })
      }
      return axiosFetch(url)
    },
    newOptions,
  )

  return useMemo(() => {
    if (!res.data) {
      throw new Error('Fetch failed: index.json')
    }
    return res.data
  }, [res.data])
}
