import { useEffect, useState } from "react"

export default function Terms({ tenant }: { tenant: any }) {
  if (!tenant) {
    return <></>
  }
  const apiBase = process.env.NEXT_PUBLIC_CAPTIVE_API_BASE || "https://captive.goplus.co.th"
  const [termsContent, setTermsContent] = useState("")
  const [termsTitle, setTermsTitle] = useState("Terms of Service")
  useEffect(() => {
    if (tenant.id){
        fetchTerms(tenant.id)
    }
        console.log(tenant)
  }, [tenant])

  const fetchTerms = async (tenantId: string) => {
    try {
      const res = await fetch(`${apiBase}/api/portal/tenant/${tenantId}/terms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CAPTIVE_API_KEY}`
        },
      })

      if (!res.ok) {
        console.error('Failed to fetch terms:', res.statusText)
        return null
      }

      const data = await res.json()
    //   return data
    setTermsContent(data.terms.contents.th.content || "No terms provided.")
    setTermsTitle(data.terms.contents.th.title || "Terms of Service")
    } catch (error) {
      console.error('Error fetching terms:', error)
      return null
    }
  }

  const terms = tenant.terms_en || tenant.terms_th || "No terms provided."

  return (
    <div>
      <div  dangerouslySetInnerHTML={{ __html: termsContent }}></div>
    </div>
  )
}