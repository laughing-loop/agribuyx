/**
 * JsonLd Component
 * Renders a <script type="application/ld+json"> tag inside <Head>.
 * Pass any schema.org object from lib/schema.ts.
 *
 * Usage:
 *   <JsonLd schema={productSchema(product)} />
 *   <JsonLd schema={breadcrumbSchema(items)} id="breadcrumb" />
 */

import Head from 'next/head'

interface JsonLdProps {
  /** Schema.org structured data object */
  schema: Record<string, unknown>
  /** Optional unique id to avoid key conflicts when rendering multiple schemas */
  id?: string
}

export default function JsonLd({ schema, id }: JsonLdProps) {
  return (
    <Head>
      <script
        key={id || 'jsonld'}
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema, null, 0),
        }}
      />
    </Head>
  )
}
