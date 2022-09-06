import { isNil } from 'lodash'
import React, { PropsWithChildren, useMemo } from 'react'
import { LinkExternal } from 'src/components/Link/LinkExternal'

import { useTranslationSafe } from 'src/helpers/useTranslationSafe'
import { getDataRootUrl, SpeciesDownloads } from 'src/hooks/useDataIndexQuery'
import urljoin from 'url-join'

export interface SpeciesTableCellDownloadListProps {
  downloads?: SpeciesDownloads
}

export function SpeciesTableCellDownloadList({ downloads }: SpeciesTableCellDownloadListProps) {
  const { t } = useTranslationSafe()

  const links = useMemo(() => {
    const links = [
      { key: 'G', text: t('Gene cluster JSON'), url: downloads?.['gene cluster json'] },
      { key: 'M', text: t('Metadata table'), url: downloads?.['metadata table'] },
      { key: 'S', text: t('Strain/species tree'), url: downloads?.['strain/species tree'] },
      { key: 'A', text: t('All gene alignments'), url: downloads?.['all gene alignments'] },
      { key: 'C', text: t('Core gene alignments'), url: downloads?.['core gene alignments'] },
    ]

    return links.map(({ key, text, url }) => (
      <SpeciesTableDownloadLink key={key} url={url} title={text}>
        {key}
      </SpeciesTableDownloadLink>
    ))
  }, [downloads, t])

  return <span>{links}</span>
}

export interface SpeciesTableDownloadLinkProps {
  title: string
  url?: string
}

export function SpeciesTableDownloadLink({ url, children, title }: PropsWithChildren<SpeciesTableDownloadLinkProps>) {
  const fullUrl = useMemo(() => urljoin(getDataRootUrl(), url ?? ''), [url])

  if (isNil(url)) {
    return null
  }

  return (
    <span className="mx-1" title={title}>
      <LinkExternal download href={fullUrl}>
        {children}
      </LinkExternal>
    </span>
  )
}
