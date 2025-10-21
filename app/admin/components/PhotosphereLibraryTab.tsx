import PhotosphereList from "./PhotosphereList";
import PhotospherePreview from "./PhotospherePreview";
import PhotosphereStats from "./PhotosphereStats";
import { Photosphere } from "../types/Photosphere";

interface PhotosphereLibraryTabProps {
    photospheres: Photosphere[];
    selectedPhotosphere: Photosphere | null;
    onSelectPhotosphere: (photosphere: Photosphere | null) => void;
    onDeletePhotosphere: (id: string) => Promise<void>;
    loading: boolean;
    onRefresh: () => Promise<void>;
}

export default function PhotosphereLibraryTab({
    photospheres,
    selectedPhotosphere,
    onSelectPhotosphere,
    onDeletePhotosphere,
    loading,
    onRefresh
}: PhotosphereLibraryTabProps) {
    return (
        <div className="max-w-7xl m-auto">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Bibliothèque de Photosphères</h2>
                <p className="text-gray-600">Gérez vos photosphères existantes et prévisualisez-les.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <PhotosphereStats photospheres={photospheres} loading={loading} />
                    <PhotosphereList
                        photospheres={photospheres}
                        selectedPhotosphere={selectedPhotosphere}
                        onSelectPhotosphere={onSelectPhotosphere}
                        onDeletePhotosphere={onDeletePhotosphere}
                        loading={loading}
                        onRefresh={onRefresh}
                    />
                </div>
                <div className="lg:col-span-2">
                    <PhotospherePreview photosphere={selectedPhotosphere} />
                </div>
            </div>
        </div>
    );
}

