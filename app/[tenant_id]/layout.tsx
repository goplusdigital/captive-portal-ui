import { headers } from 'next/headers'
import TenantProvider from '../libs/TenantProvider'

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerList = await headers() // ✅ ต้อง await

  const tenant = {
    id: headerList.get('x-tenant-id'),
    name: headerList.get('x-tenant-name'),
    logo: headerList.get('x-tenant-logo'),
    flags: JSON.parse(headerList.get('x-tenant-flags') ?? '{}'),
    bg_color: headerList.get('x-tenant-bg-color') ?? '#535353',
  }

  return (
    <TenantProvider tenant={tenant}>
      {children}
    </TenantProvider>
  )
}