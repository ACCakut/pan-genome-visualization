import React, { useMemo } from 'react'
import { Col, Row } from 'reactstrap'

import { Layout } from 'src/components/Layout/Layout'
import { Link } from 'src/components/Link/Link'
import MainPageContent from 'src/components/Main/MainPage.mdx'
import { useDataIndexQuery } from 'src/hooks/useDataIndexQuery'

export function MainPage() {
  const indexJson = useDataIndexQuery()

  const speciesLinks = useMemo(() => {
    return indexJson.datasets.map(({ pathogenName }) => (
      <li key={pathogenName}>
        <Link href={`/species/${pathogenName}`}>{`/species/${pathogenName}`}</Link>
      </li>
    ))
  }, [indexJson.datasets])

  return (
    <Layout>
      <MainPageContent />

      <Row noGutters>
        <Col>
          <ul>
            <li>
              <Link href={'/doesnotexist'}>{'/doesnotexist'}</Link>
            </li>
            <li>
              <Link href={'/species/doesnotexist'}>{'/species/doesnotexist'}</Link>
            </li>
          </ul>
        </Col>
      </Row>

      <Row noGutters>
        <Col>
          <ul>{speciesLinks}</ul>
        </Col>
      </Row>
    </Layout>
  )
}
