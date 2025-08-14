"use client"

import { useState } from "react"
import { authService, eventService, ticketService, getErrorMessage } from "../services/api"
import { CheckCircle, XCircle, AlertCircle, Play } from "lucide-react"

const ApiTester = () => {
    const [testResults, setTestResults] = useState({})
    const [testing, setTesting] = useState(false)

    const runTest = async (testName, testFunction) => {
        setTestResults((prev) => ({ ...prev, [testName]: { status: "running" } }))

        try {
            const result = await testFunction()
            setTestResults((prev) => ({
                ...prev,
                [testName]: {
                    status: "success",
                    message: result.message || "Test passed",
                    data: result.data,
                },
            }))
        } catch (error) {
            setTestResults((prev) => ({
                ...prev,
                [testName]: {
                    status: "error",
                    message: getErrorMessage(error),
                    error: error,
                },
            }))
        }
    }

    const runAllTests = async () => {
        setTesting(true)
        setTestResults({})

        const tests = [
            {
                name: "User Registration",
                test: async () => {
                    const testUser = {
                        userName: `testuser_${Date.now()}`,
                        email: `test_${Date.now()}@example.com`,
                        password: "TestPassword123!",
                        confirmPassword: "TestPassword123!",
                    }
                    const result = await authService.register(testUser)
                    return { message: "Registration successful", data: result }
                },
            },
            {
                name: "User Login",
                test: async () => {
                    const result = await authService.login("admin@test.com", "Admin123!")
                    return { message: "Login successful", data: result }
                },
            },
            {
                name: "Get User Profile",
                test: async () => {
                    const result = await authService.getProfile()
                    return { message: "Profile retrieved", data: result }
                },
            },
            {
                name: "Get All Events",
                test: async () => {
                    const result = await eventService.getAll()
                    return { message: `Retrieved ${result?.length || 0} events`, data: result }
                },
            },
            {
                name: "Create Event",
                test: async () => {
                    const testEvent = {
                        name: `Test Event ${Date.now()}`,
                        descrp: "This is a test event created by the API tester",
                        eventoDate: new Date(Date.now() + 86400000).toISOString(),
                        location: "Test Location",
                        bannerImageUrl: null,
                        rows: 10,
                        seatsPerRow: 15,
                    }
                    const result = await eventService.create(testEvent)
                    return { message: "Event created successfully", data: result }
                },
            },
            {
                name: "Get My Tickets",
                test: async () => {
                    const result = await ticketService.getMyTickets()
                    return { message: `Retrieved ${result?.length || 0} tickets`, data: result }
                },
            },
        ]

        for (const test of tests) {
            await runTest(test.name, test.test)
            // Small delay between tests
            await new Promise((resolve) => setTimeout(resolve, 500))
        }

        setTesting(false)
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case "error":
                return <XCircle className="w-5 h-5 text-red-500" />
            case "running":
                return <AlertCircle className="w-5 h-5 text-yellow-500 animate-spin" />
            default:
                return <div className="w-5 h-5 bg-gray-300 rounded-full" />
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">API Integration Tester</h2>
                <button
                    onClick={runAllTests}
                    disabled={testing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Play className="w-4 h-4" />
                    {testing ? "Running Tests..." : "Run All Tests"}
                </button>
            </div>

            <div className="space-y-4">
                {Object.entries(testResults).map(([testName, result]) => (
                    <div key={testName} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(result.status)}
                            <h3 className="font-semibold text-gray-900">{testName}</h3>
                        </div>

                        <div className="ml-8">
                            <p
                                className={`text-sm ${result.status === "success"
                                        ? "text-green-600"
                                        : result.status === "error"
                                            ? "text-red-600"
                                            : "text-yellow-600"
                                    }`}
                            >
                                {result.message}
                            </p>

                            {result.data && (
                                <details className="mt-2">
                                    <summary className="text-xs text-gray-500 cursor-pointer">View Response Data</summary>
                                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                        {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                </details>
                            )}

                            {result.error && (
                                <details className="mt-2">
                                    <summary className="text-xs text-red-500 cursor-pointer">View Error Details</summary>
                                    <pre className="mt-2 p-2 bg-red-50 rounded text-xs overflow-auto">
                                        {JSON.stringify(result.error.response?.data || result.error.message, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {Object.keys(testResults).length === 0 && !testing && (
                <div className="text-center py-8 text-gray-500">
                    <p>Click "Run All Tests" to test API integrations</p>
                </div>
            )}
        </div>
    )
}

export default ApiTester
