import { invLerp, lerp } from "@/lib/utils/lerp";
import { useEffect, useMemo, useState } from "react";
import { useMap as useLeafletMap } from "react-leaflet";
import { useGameMap } from "@/app/providers/GameMapContextProvider";
import { useMap } from "@/app/providers/MapContextProvider";
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { FaLongArrowAltUp, FaMinus, FaPlus } from "react-icons/fa";
import { Map } from "@/lib/types/Map";

function ControlButton({
    onClick,
    title,
    children,
    disabled = false,
}: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    disabled?: boolean;
}) {
    return (
        <div
            onClick={() => {
                if (!disabled) onClick();
            }}
            title={title}
            className={`m-0.5 -rotate-90 overflow-hidden relative flex justify-center items-center rounded shadow w-5 h-5 shadow-black bg-gradient-to-tr from-[#513b1e] via-[#b49665] to-[#513b1e] outline-t outline-yellow-300/50 ${disabled ? "opacity-40" : "cursor-pointer hover:from-[#665033] hover:via-[#c9b17a] hover:to-[#665033]"}`}
        >
            {children}
        </div>
    );
}

function ZoomSliderComponent({
    leafletMap,
    currentMap,
    setCurrentMapById,
    maps,
}: {
    leafletMap: L.Map;
    currentMap: any;
    setCurrentMapById: (id: string | null) => void;
    maps: Map[];
}) {
    const [value, setValue] = useState(invLerp(leafletMap.getMinZoom(), leafletMap.getMaxZoom(), leafletMap.getZoom()) * 100);

    const handleOnChange = (event: any) => {
        setValue(event.target.value);
        leafletMap.setZoom(lerp(leafletMap.getMinZoom(), leafletMap.getMaxZoom(), event.target.value / 100), { animate: false });
    };

    useEffect(() => {
        const onZoom = () => {
            setValue(invLerp(leafletMap.getMinZoom(), leafletMap.getMaxZoom(), leafletMap.getZoom()) * 100);
        };

        leafletMap.on('zoom', onZoom);
        return () => {
            leafletMap.off('zoom', onZoom);
        };
    }, [leafletMap]);

    const hasParentMap = currentMap?.parentMap;
    const hasAncestorMap = useMemo(() => {
        // Find the oldest ancestor map
        let ancestorId = currentMap?.parentMap;
        let ancestorMap = null;
        while (ancestorId) {
            ancestorMap = maps.find((map) => map.id === ancestorId);
            if (ancestorMap) {
                ancestorId = ancestorMap.parentMap;
            } else {
                break;
            }
        }
        return ancestorMap?.id || false;
    }, [currentMap, maps]);

    const handleParentMapClick = () => {
        if (hasParentMap) {
            setCurrentMapById(currentMap.parentMap!);
        }
    };

    const handleAncestorMapClick = () => {
        if (hasAncestorMap) setCurrentMapById(hasAncestorMap);
    };

    return (
        <div className="flex rotate-90 origin-top-left absolute -top-2 left-4">
            <ControlButton
                onClick={handleAncestorMapClick}
                title={hasAncestorMap ? "Go to ancestor map" : "No ancestor map"}
                disabled={!hasAncestorMap}
            >
                <div className="w-3 h-2.5 shadow-sm shadow-yellow-200 border border-black m-auto"></div>
            </ControlButton>
            <ControlButton
                onClick={handleParentMapClick}
                title={hasParentMap ? "Go to parent map" : "No parent map"}
                disabled={!hasParentMap}
            >
                <FaLongArrowAltUp className="text-slate-900 text-[1rem] z-10" />
                <FaLongArrowAltUp className="absolute text-yellow-200/40 text-[1rem] top-[4px] left-[4px]" />
            </ControlButton>
            <ControlButton
                onClick={() => leafletMap.zoomIn()}
                title="Zoom in"
            >
                <FaPlus className="text-slate-900 text-[1rem] z-10" />
                <FaPlus className="absolute text-yellow-200/40 text-[1rem] top-[4px] left-[4px]" />
            </ControlButton>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={handleOnChange}
                className="zoom-slider w-24 4k:w-40 rotate-180 origin-center accent-red-300 ml-0.5"
            />
            <ControlButton
                onClick={() => leafletMap.setZoom(leafletMap.getMinZoom())}
                title="Zoom to min"
            >
                <FaMinus className="text-slate-900 text-[1rem] z-10" />
                <FaMinus className="absolute text-yellow-200/40 text-[1rem] top-[4px] left-[4px]" />
            </ControlButton>
        </div>
    );
}

export default function MapControl({ useGameContext = false }: { useGameContext?: boolean }) {
    // Use the appropriate context based on the prop
    const gameContext = useGameContext ? useGameMap() : null;
    const adminContext = !useGameContext ? useMap() : null;
    
    const currentMap = useGameContext ? gameContext!.currentMap : adminContext!.currentMap;
    const setCurrentMapById = useGameContext ? gameContext!.setCurrentMapById : adminContext!.setCurrentMapById;
    const availableMaps = useGameContext ? gameContext!.availableMaps : adminContext!.maps;
    
    const leafletMap = useLeafletMap();

    useEffect(() => {
        const control = new L.Control({ position: "topleft" });

        control.onAdd = function () {
            const div = L.DomUtil.create('div', 'custom-zoom-control');

            // Prevent map interactions when interacting with the control
            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);

            // Create React root and render component
            const root = createRoot(div);
            root.render(
                <ZoomSliderComponent
                    leafletMap={leafletMap}
                    currentMap={currentMap}
                    setCurrentMapById={setCurrentMapById}
                    maps={availableMaps}
                />
            );

            // Store root for cleanup
            (div as any)._reactRoot = root;

            return div;
        };

        control.onRemove = function (map) {
            const div = this.getContainer();
            if (div && (div as any)._reactRoot) {
                // Defer the unmounting to avoid race condition
                setTimeout(() => {
                    (div as any)._reactRoot.unmount();
                }, 0);
            }
        };

        leafletMap.addControl(control);

        return () => {
            leafletMap.removeControl(control);
        };
    }, [leafletMap]);

    return null;
}
