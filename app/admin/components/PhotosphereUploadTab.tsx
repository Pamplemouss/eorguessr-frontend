import PanoramaBatchUploader from "@/app/components/PanoramaBatchUploader/PanoramaBatchUploader";

interface PhotosphereUploadTabProps {
    onComplete: (uploadedFiles: string[]) => void;
}

export default function PhotosphereUploadTab({ onComplete }: PhotosphereUploadTabProps) {
    return (
        <div className="max-w-7xl m-auto">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Télécharger des Photosphères</h2>
                <p className="text-gray-600">Téléchargez et traitez vos photosphères par lot.</p>
            </div>
            <PanoramaBatchUploader onComplete={onComplete} />
        </div>
    );
}