import { FaUpload, FaList, FaMap } from "react-icons/fa";
import { TabType } from "../types/Photosphere";

interface AdminTabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function AdminTabNavigation({ activeTab, onTabChange }: AdminTabNavigationProps) {
    const tabs = [
        {
            id: 'photosphere-upload' as TabType,
            label: 'Upload Photosphères',
            icon: <FaUpload />,
            description: 'Télécharger des photosphères'
        },
        {
            id: 'photosphere-library' as TabType,
            label: 'Bibliothèque',
            icon: <FaList />,
            description: 'Gérer les photosphères existantes'
        },
        {
            id: 'maps' as TabType,
            label: 'Cartes',
            icon: <FaMap />,
            description: 'Gérer les cartes'
        }
    ];

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                                ${activeTab === tab.id
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}