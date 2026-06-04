export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
            <div className="w-full max-w-md text-center">
                <div className="flex justify-center mb-8">
                    <img
                        src="/werksplay-logo.png"
                        alt="WerksPlay Logo"
                        className="w-20 h-20 md:w-24 md:h-24 object-contain"
                    />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Under Maintenance
                </h1>

                <p className="mt-4 text-gray-600 text-sm md:text-base leading-relaxed">
                    WerksPlay is currently undergoing scheduled maintenance.
                    We're making improvements and will be back online soon.
                </p>

                <div className="mt-8">
                    <div
                        className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500">
                        Service temporarily unavailable
                    </div>
                </div>
            </div>
        </div>
    );
}