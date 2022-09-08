/* eslint-disable sonarjs/no-identical-functions */
import type { QueriesOptions, QueryKey, UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { concurrent } from 'fasy'
import { keys, values, zip } from 'lodash'
import { useMemo } from 'react'

import { ErrorInternal } from 'src/helpers/ErrorInternal'
import { sanitizeError } from 'src/helpers/sanitizeError'
import { axiosFetch } from 'src/io/axiosFetch'
import { parseCsv } from 'src/io/parseCsv'
import { useQueries } from './useQueriesWithSuspense'

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
      throw new Error(`Fetch failed: ${url}`)
    }
    return res.data
  }, [res.data, url])
}

export type UseAxiosQueriesOptions<TData = unknown> = QueriesOptions<TData[]> & { delay?: number }

export function useAxiosQueries<TData = unknown>(
  queries: Record<string, string>,
  options?: UseAxiosQueriesOptions<TData>,
): TData {
  const newOptions = useMemo(() => {
    let newOptions = {
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

  const results = useQueries({
    queries: values(queries).map((url) => ({
      ...newOptions,
      suspense: true,
      useErrorBoundary: true,
      queryKey: [url],
      async queryFn() {
        if (options?.delay) {
          await new Promise((resolve) => {
            setInterval(resolve, options.delay)
          })
        }
        return axiosFetch(url)
      },
    })),
    options: {
      suspense: true,
    },
  })

  return useMemo(() => {
    return Object.fromEntries(
      zip(keys(queries), values(queries), results).map(([key, url, result]) => {
        if (!key || !url || !result) {
          throw new ErrorInternal('useAxiosQueries: Attempted to zip arrays of different sizes.')
        }

        if (!result.data) {
          throw new Error(`Fetch failed: ${key}: ${url}`)
        }
        return [key, result.data]
      }),
    )
  }, [queries, results]) as unknown as TData
}

/** Downloads and extracts .tar file */
export function useAxiosTarQuery(
  url: string,
  options?: UseAxiosQueryOptions<Record<string, string>>,
): Record<string, string> {
  const newOptions = useMemo(() => {
    let newOptions: UseAxiosQueryOptions<Record<string, string>> = {
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

  const res = useQuery<Record<string, string>, Error, Record<string, string>, string[]>(
    [url],
    async () => {
      if (options?.delay) {
        await new Promise((resolve) => {
          setInterval(resolve, options.delay)
        })
      }

      const res = await axiosFetch<ArrayBuffer>(url, { responseType: 'arraybuffer' })

      return import('js-untar')
        .then(({ default: untar }) => {
          return untar(res)
        })
        .then(
          async function filfill(extractedFiles) {
            return Object.fromEntries(await concurrent.map(async (f) => [f.name, await f.blob.text()], extractedFiles))
          },
          function reject(error_: unknown) {
            const error = sanitizeError(error_)
            error.message = `When extracting tar archive '${url}': ${error.message}`
            throw error
          },
        )
    },
    newOptions,
  )

  return useMemo(() => {
    if (!res.data) {
      throw new Error(`Fetch failed: ${url}`)
    }
    return res.data
  }, [res.data, url])
}

/** Downloads and parses .tsv file */
export function useAxiosCsvQuery<T>(url: string, delimiter: string, options?: UseAxiosQueryOptions<T[]>): T[] {
  const newOptions = useMemo(() => {
    let newOptions: UseAxiosQueryOptions<T[]> = {
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

  const res = useQuery(
    [url],
    async () => {
      if (options?.delay) {
        await new Promise((resolve) => {
          setInterval(resolve, options.delay)
        })
      }

      const res = await axiosFetch<string>(url, { responseType: 'text' })
      return parseCsv<T>(res, delimiter)
    },
    newOptions,
  )

  return useMemo(() => {
    if (!res.data) {
      throw new Error(`Fetch failed: ${url}`)
    }
    return res.data
  }, [res.data, url])
}
