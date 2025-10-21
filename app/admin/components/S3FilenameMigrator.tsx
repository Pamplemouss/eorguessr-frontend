import React, { useState } from 'react';

interface MigrationResult {
    mapId: string;
    mapName: string;
    oldImagePath: string;
    newImagePath: string;
    updated: boolean;
    s3Updated: boolean;
    error?: string;
}

interface MigrationResponse {
    success: boolean;
    dryRun: boolean;
    summary: {
        totalMaps: number;
        needsUpdate: number;
        alreadyCorrect: number;
        errors: number;
        updated: number;
        s3Updated: number;
        s3Warnings: number;
    };
    results: MigrationResult[];
}

export const S3FilenameMigrator: React.FC = () => {
    const [migrationData, setMigrationData] = useState<MigrationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const runMigration = async (dryRun: boolean) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/migrate-map-filenames', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dryRun })
            });

            if (!response.ok) {
                throw new Error('Failed to run migration');
            }

            const data: MigrationResponse = await response.json();
            setMigrationData(data);
        } catch (error) {
            console.error('Migration error:', error);
            alert('Migration failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    const formatFilename = (filename: string) => {
        if (filename.length > 30) {
            return filename.substring(0, 27) + '...';
        }
        return filename;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">S3 Filename Migration</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Migrate existing map filenames to use the improved sanitized format with proper expansion codes (e.g., "Endwalker" → "ew") and map type detection. 
                    This will update both MongoDB records and rename files on S3.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => runMigration(true)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Running...
                        </>
                    ) : (
                        <>
                            🔍 Preview Migration (Dry Run)
                        </>
                    )}
                </button>

                {migrationData && migrationData.dryRun && (
                    <button
                        onClick={() => runMigration(false)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Applying...
                            </>
                        ) : (
                            <>
                                ⚠️ Apply Migration (Real)
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Results Summary */}
            {migrationData && (
                <div className="space-y-4">
                    <div className={`p-4 rounded-md ${migrationData.dryRun ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{migrationData.dryRun ? '🔍' : '✅'}</span>
                            <h3 className="font-semibold text-gray-900">
                                {migrationData.dryRun ? 'Preview Results' : 'Migration Complete'}
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-sm">
                            <div>
                                <div className="font-medium text-gray-700">Total Maps</div>
                                <div className="text-xl font-bold">{migrationData.summary.totalMaps}</div>
                            </div>
                            <div>
                                <div className="font-medium text-gray-700">Need Update</div>
                                <div className="text-xl font-bold text-orange-600">{migrationData.summary.needsUpdate}</div>
                            </div>
                            <div>
                                <div className="font-medium text-gray-700">Already Correct</div>
                                <div className="text-xl font-bold text-green-600">{migrationData.summary.alreadyCorrect}</div>
                            </div>
                            <div>
                                <div className="font-medium text-gray-700">Errors</div>
                                <div className="text-xl font-bold text-red-600">{migrationData.summary.errors}</div>
                            </div>
                            <div>
                                <div className="font-medium text-gray-700">DB Updated</div>
                                <div className="text-xl font-bold text-blue-600">{migrationData.summary.updated}</div>
                            </div>
                            <div>
                                <div className="font-medium text-gray-700">S3 Updated</div>
                                <div className="text-xl font-bold text-green-600">{migrationData.summary.s3Updated}</div>
                            </div>
                            <div>
                                <div className="font-medium text-gray-700">S3 Warnings</div>
                                <div className="text-xl font-bold text-yellow-600">{migrationData.summary.s3Warnings}</div>
                            </div>
                        </div>
                    </div>

                    {/* Toggle Details */}
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        {showDetails ? 'Hide Details' : 'Show Details'} ({migrationData.results.length} items)
                    </button>

                    {/* Detailed Results */}
                    {showDetails && (
                        <div className="border border-gray-200 rounded-md overflow-hidden">
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700">Map Name</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700">Old Filename</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700">New Filename</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {migrationData.results.map((result) => (
                                            <tr key={result.mapId} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 font-medium">{result.mapName}</td>
                                                <td className="px-3 py-2 font-mono text-xs" title={result.oldImagePath}>
                                                    {formatFilename(result.oldImagePath)}
                                                </td>
                                                <td className="px-3 py-2 font-mono text-xs" title={result.newImagePath}>
                                                    {formatFilename(result.newImagePath)}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {result.error ? (
                                                        <div className="space-y-1">
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs block">
                                                                {result.error}
                                                            </span>
                                                        </div>
                                                    ) : result.updated ? (
                                                        <div className="space-y-1">
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs block">
                                                                ✅ DB Updated
                                                            </span>
                                                            {result.s3Updated ? (
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs block">
                                                                    ✅ S3 Updated
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs block">
                                                                    ⚠️ S3 Not Found
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : result.oldImagePath === result.newImagePath ? (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                                            ✓ Already correct
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                                            📝 Will update
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};