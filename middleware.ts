import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.CAPTIVE_API_BASE
const API_KEY = process.env.CAPTIVE_API_KEY

if (!API_BASE) throw new Error('CAPTIVE_API_BASE is not defined')
if (!API_KEY) throw new Error('CAPTIVE_API_KEY is not defined')

const macRegex = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i
const tenantRegex = /^[a-zA-Z0-9_-]+$/

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  

  const match = pathname.match(/^\/([^\/]+)\/authorize/)
  if (!match) return NextResponse.next()

  const tenantId = match[1]
  const apmac = searchParams.get('apmac')?.toLowerCase()
  const redirectUrl = searchParams.get('url')

  // ✅ Validate tenant format
  if (!tenantRegex.test(tenantId)) {
    return NextResponse.redirect(new URL('/invalid-tenant', req.url))
  }

  // ✅ Validate AP MAC
  if (!apmac || !macRegex.test(apmac)) {
    return NextResponse.redirect(new URL('/invalid-apmac', req.url))
  }

  // ✅ Validate redirect URL (prevent open redirect abuse)
  if (redirectUrl) {
    try {
      const parsed = new URL(redirectUrl)
      const allowedHosts = [
        'connectivitycheck.gstatic.com',
        'www.apple.com',
        'msftconnecttest.com',
      ]

      if (!allowedHosts.includes(parsed.hostname)) {
        return NextResponse.redirect(new URL('/invalid-redirect', req.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/invalid-redirect', req.url))
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(
      `${API_BASE}/api/portal/tenant/${tenantId}/config`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        signal: controller.signal,
        cache: 'no-store',
      }
    )

    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.redirect(new URL('/tenant-error', req.url))
    }

    const data = await res.json()
    console.log('Tenant config fetched:', data)

    if (!data.success || data.status !== 'active') {
      return NextResponse.redirect(new URL('/tenant-inactive', req.url))
    }

    // ✅ Validate AP against NAS list
    const nasList = data.nas || []
    const apValid = nasList.some(
      (nas: any) => nas.mac?.toLowerCase() === apmac
    )

    if (!apValid) {
      return NextResponse.redirect(new URL('/unauthorized-ap', req.url))
    }

    // ✅ Inject minimal safe tenant data to headers
    const requestHeaders = new Headers(req.headers)

    requestHeaders.set('x-tenant-id', tenantId)
    requestHeaders.set('x-tenant-name', data.name)
    requestHeaders.set('x-tenant-logo', data.logo)


    requestHeaders.set(
      'x-tenant-flags',
      JSON.stringify({
        member_portal: data.member_portal,
        guest_registration: data.guest_registration,
        voucher_enabled: data.voucher_enabled,
        coa: data.coa,
      })
    )

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    return NextResponse.redirect(new URL('/tenant-unreachable', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}
// https://captive-portal.goplus.co.th/1/authorize?cmd=login&mac=82:34:0e:61:32:e1&network=_owetm_Jiwa%20Guest1593063508&ip=192.168.250.200&apmac=48:2f:6b:c6:c3:7e&site=Mycools%20House&post=captive-2022.aio.cloudauth.net&url=http://connectivitycheck.gstatic.com/generate_204
// https://captive-portal.goplus.co.th/1/authorize?cmd=login&mac=82:34:0e:61:32:e1&network=_owetm_Jiwa%20Guest1593063508&ip=192.168.250.200&apmac=48:2f:6b:c6:c3:7e&site=Mycools%20House&post=captive-2022.aio.cloudauth.net&url=http://www.apple.com/library/test/success.html
