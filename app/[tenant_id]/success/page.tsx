export default async function Success({ params }: { params: { tenant_id: string } }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <div className="flex items-center justify-center w-24 h-24 mb-4 rounded-full bg-green-100">
                <svg
                    className="w-24 h-24 text-green-500"
                    viewBox="0 0 52 52"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        cx="26"
                        cy="26"
                        r="25"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="animate-circle"
                    />
                    <path
                        d="M14 27l7 7 16-16"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-check"
                    />
                </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Success!</h1>
            <p className="text-lg text-gray-600">You have successfully connected to the captive portal.</p>
        </div>
    )
}