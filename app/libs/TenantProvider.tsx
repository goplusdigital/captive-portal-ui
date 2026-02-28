"use client"

import { createContext, useContext } from "react"

const TenantContext = createContext<any>(null)

export default function TenantProvider({
  tenant,
  children,
}: {
  tenant: any
  children: React.ReactNode
}) {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}