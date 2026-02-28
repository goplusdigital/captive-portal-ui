
"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation"
import { useTenant } from "@/app/libs/TenantProvider";
import { useEffect, useMemo } from "react"
import { adjustColor, getContrastColor } from "../../libs/colors"
import { useState } from "react"
import { Button, Checkbox, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "flowbite-react";
import Terms from "./terms";
import Swal from "sweetalert2";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

export default function Authorize() {
  const tenant = useTenant()
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)
  const [openTermsModal, setOpenTermsModal] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [autoLogin, setAutoLogin] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("กำลังตรวจสอบบัญชี...")
  const [termsContent, setTermsContent] = useState("")
  const [termsTitle, setTermsTitle] = useState("Terms of Service")
  const apiBase = process.env.NEXT_PUBLIC_CAPTIVE_API_BASE || "https://captive.goplus.co.th"
  const apiKey = process.env.NEXT_PUBLIC_CAPTIVE_API_KEY || ""



  // bg color is set from tenant config in layout.tsx, so we can use tenant flags to determine the bg color here
  const bgColor = tenant?.bg_color;
  const darker = useMemo(() => adjustColor(bgColor, -25), [bgColor])
  const lighter = useMemo(() => adjustColor(bgColor, -20), [bgColor])
  const textColor = useMemo(() => getContrastColor(bgColor), [bgColor])
  const backgroundStyle = useMemo(() => ({
    background: `
      radial-gradient(
        circle at -10% 110%,
        rgba(255,255,255,0.35) 0%,
        rgba(255,255,255,0.25) 20%,
        rgba(255,255,255,0.12) 40%,
        transparent 65%
      ),
      radial-gradient(
        circle at 110% 120%,
        rgba(255,255,255,0.25) 0%,
        rgba(255,255,255,0.15) 25%,
        transparent 60%
      ),
      linear-gradient(
        135deg,
        ${lighter} 0%,
        ${bgColor} 50%,
        ${darker} 100%
      )
    `
  }), [bgColor, lighter, darker])

  useEffect(() => {
    if (tenant && tenant.id) {
      fetchTerms(tenant.id)
    }
  }, [tenant])


  const doLogin = () => {
    let hasError = false
    if (username.trim() === "") {
      setUsernameError("กรุณากรอกชื่อผู้ใช้")
      hasError = true
    } else {
      setUsernameError("")
    }
    if (password.trim() === "") {
      setPasswordError("กรุณากรอกรหัสผ่าน")
      hasError = true
    } else {
      setPasswordError("")
    }
    if (hasError) {
      return
    }
    setLoading(true)

    setLoadingMessage("กำลังตรวจสอบบัญชี...")

    const res = fetch(apiBase + `/api/portal/tenant/${tenant.id}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        tenantId: tenant.id,
        username,
        password,
        redirectUri: searchParams.get("url") || undefined,
        macAddress: searchParams.get("mac") || undefined,
        clientIp: searchParams.get("ip") || undefined,
        network: searchParams.get("network") || undefined,
        autoLogin: autoLogin ? '1' : '0'

      })
    }).then(res => res.json())
      .then(data => {
        if (data.success) {
          // new form
          handleArubaInstantOnLogin()
        } else {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            html: data.message || "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
            confirmButtonColor: bgColor,
            confirmButtonText: "ลองใหม่",
            allowOutsideClick: false

          })
          setLoading(false)
        }
      })
      .catch(err => {
        console.error(err)
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          html: err.message || "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
          confirmButtonColor: bgColor,
          confirmButtonText: "ลองใหม่",

          allowOutsideClick: false,
        })
        setLoading(false)
      })
  }
  const handleArubaInstantOnLogin = () => {
    setLoading(true)
    setLoadingMessage("กำลังเชื่อมต่ออินเทอร์เน็ต...")
    setTimeout(() => {
      const form = document.createElement("form")
      form.method = "POST"
      form.action = `https://${searchParams.get("post")}/cgi-bin/login`
      const usernameInput = document.createElement("input")
      usernameInput.type = "hidden"
      usernameInput.name = "user"
      usernameInput.value = username
      form.appendChild(usernameInput)
      const passwordInput = document.createElement("input")
      passwordInput.type = "hidden"
      passwordInput.name = "password"
      passwordInput.value = password
      form.appendChild(passwordInput)
      const cmdInput = document.createElement("input")
      cmdInput.type = "hidden"
      cmdInput.name = "cmd"
      cmdInput.value = "authenticate"
      form.appendChild(cmdInput)
      const urlInput = document.createElement("input")
      urlInput.type = "hidden"
      urlInput.name = "url"
      urlInput.value = searchParams.get("url") || ""
      form.appendChild(urlInput)


      document.body.appendChild(form)

      form.submit()
    }, 1500)



  }


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

  if (!tenant) {
    return <div className="flex flex-col items-center justify-center h-screen font-bold">
      <Image src="/assets/icons/loading.gif" alt="Loading" width={100} height={100} className="mb-1" loading="eager" />
      <p>Loading...</p>
    </div>
  }

  return (
    <div className={`flex min-h-screen  justify-center dark:bg-black py-5 px-5`}
      style={backgroundStyle}
    >



      <Dialog open={openTermsModal} onClose={() => setOpenTermsModal(false)} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">

                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                      Terms of Service
                    </DialogTitle>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500 overflow-y-auto max-h-96 text-start">
                        <div dangerouslySetInnerHTML={{ __html: termsContent }}></div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => { setAcceptTerms(true); setOpenTermsModal(false); }}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto"
                >
                  I accept
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => { setAcceptTerms(false); setOpenTermsModal(false); }}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Decline
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>


      <div className="flex flex-col items-center gap-6 text-center rounded-2xl bg-white dark:bg-zinc-800 p-10 shadow-md relative w-full max-w-md mt-16 pt-16">
        <div className="flex flex-col items-center gap-6 text-center absolute -top-12">
          {tenant.logo === null || tenant.logo === "null" || tenant.logo === "" || tenant.logo === undefined ? (
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-md">
              <Image
                src="/assets/logo.png"
                alt="Default logo"
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-md p-1 dark:bg-black">
              <Image
                src={tenant.logo}
                alt={`${tenant.name} logo`}
                width={100}
                height={100}
                className="rounded-full"
              />

            </div>
          )}

        </div>
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">{tenant.name}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          เข้าสู่ระบบ/สมัครสมาชิก
        </p>
        {/* input username */}
        <div className="flex flex-col items-start gap-2 w-full">
          <label htmlFor="username" className="text-sm text-zinc-600 dark:text-zinc-400">ชื่อผู้ใช้</label>
          <input
            disabled={loading}
            type="text"
            id="username"
            name="username"
            className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:bg-zinc-700 dark:border-zinc-600 dark:focus:border-blue-500 placeholder:text-sm  disabled:cursor-not-allowed disabled:text-gray-400 ${usernameError ? "border-red-500 text-red-500" : ""}`}
            placeholder="กรอกชื่อผู้ใช้ของคุณ"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setUsernameError("") }}
          />
          {usernameError && <p className="text-red-500 text-xs mt-1">{usernameError}</p>}
        </div>
        {/* input password */}
        <div className="flex flex-col items-start gap-2 w-full">
          <label
            htmlFor="password"
            className="text-sm text-zinc-600 dark:text-zinc-400"
          >
            รหัสผ่าน
          </label>

          <div className="relative w-full">
            <input
              disabled={loading}
              type={show ? "text" : "password"}
              id="password"
              name="password"
              placeholder="กรอกรหัสผ่านของคุณ"
              className={`w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none dark:bg-zinc-700 dark:border-zinc-600 dark:focus:border-blue-500 placeholder:text-sm  disabled:cursor-not-allowed disabled:text-gray-400 ${passwordError ? "border-red-500 text-red-500" : ""}`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError("") }}
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300  disabled:cursor-not-allowed disabled:text-gray-400"
              disabled={loading}
            >
              {show ? (
                // eye-off
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.16.42-2.23 1.125-3.175M6.223 6.223A9.956 9.956 0 0112 5c5 0 9 4 9 7 0 1.48-.64 2.86-1.723 4.045M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18"
                  />
                </svg>
              ) : (
                // eye
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
        </div>
        {/* checkbox accept terms */}
        <div className="flex w-full flex-col gap-4" id="checkbox">
          <div className="flex items-center gap-2">
            <Checkbox id="acceptTerms" name="acceptTerms" checked={acceptTerms} onChange={(e) => { e.preventDefault(); setOpenTermsModal(true); }} disabled={loading} className="disabled:cursor-not-allowed disabled:text-gray-400" />
            <Label className="text-xs text-zinc-600 dark:text-zinc-400 disabled:cursor-not-allowed disabled:text-gray-400">
              ฉันยอมรับ
              <button onClick={() => setOpenTermsModal(true)} className="text-cyan-600 hover:underline dark:text-cyan-500 disabled:cursor-not-allowed disabled:text-gray-400" disabled={loading}>
                ข้อกำหนดและเงื่อนไขในการให้บริการ
              </button>
            </Label>
          </div>
        </div>
        <div className="flex w-full flex-col gap-4" id="checkbox">
          <div className="flex items-center gap-2">
            <Checkbox id="acceptAutoLogin" name="acceptAutoLogin" checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)} disabled={loading} className="disabled:cursor-not-allowed disabled:text-gray-400" />
            <Label htmlFor="acceptAutoLogin" className="text-xs text-zinc-600 dark:text-zinc-400 disabled:cursor-not-allowed disabled:text-gray-400">
              เปิดใช้งานระบบล็อกอินอัตโนมัติ (Auto-login)
            </Label>
          </div>
        </div>
        {/* submit button */}
        <div className="w-full">
          <Button

            disabled={!acceptTerms || loading}
            onClick={(e) => {
              e.preventDefault()
              doLogin()
            }}
            style={{
              backgroundColor: bgColor,
              color: textColor
            }}
            className={
              `flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 disabled:cursor-not-allowed disabled:opacity-30`
            }
          >

            {loading && <Spinner size="sm" light />}
            {loading && <span className="pl-3">{loadingMessage}</span>}
            {!loading && "ดำเนินการต่อ"}
          </Button>
        </div>
        {/* footer copyright */}
        <p className="text-xs text-gray-400 dark:text-zinc-600 mt-10 absolute bottom-5">
          &copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.
        </p>

      </div>


    </div>
  );
}
