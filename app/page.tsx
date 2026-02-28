import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/assets/logo.png"
          alt="Captive Portal Logo"
          width={120}
          height={120}
          className="rounded-full"
        />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Welcome to Captive Portal
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to access the internet.
        </p>
      </div>
    </div>
  );
}
