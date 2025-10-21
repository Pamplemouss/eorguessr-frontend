import { FaCog } from "react-icons/fa";
import { TabType } from "../types/Photosphere";

interface AdminHeaderProps {
    activeTab: TabType;
    photospheresCount: number;
}

export default function AdminHeader({ activeTab, photospheresCount }: AdminHeaderProps) {
    return (
        <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <FaCog className="text-2xl text-purple-600" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Administration Eorguessr
                        </h1>
                    </div>

                    <div className="text-sm text-gray-600">
                        {activeTab === 'photosphere-library' && `${photospheresCount} photosphère(s)`}
                    </div>
                </div>
            </div>
        </div>
    );
}

