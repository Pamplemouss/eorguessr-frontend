import { invLerp, lerp } from "@/lib/utils/lerp";
import { useEffect, useMemo, useState, useRef } from "react";
import { useMap as useLeafletMap } from "react-leaflet";
import { useGameMap } from "@/app/providers/GameMapContextProvider";
import { useMap } from "@/app/providers/MapContextProvider";
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { FaLongArrowAltUp, FaMinus, FaPlus } from "react-icons/fa";
import { Map } from "@/lib/types/Map";
import Image from "next/image";


function ControlButton({
    onClick,
    title,
    disabled = false,
    active = false,
    imageSrc,
    alt,
    className = "",
}: {
    onClick: () => void;
    title: string;
    disabled?: boolean;
    active?: boolean;
    imageSrc: string;
    alt: string;
    className?: string;
}) {
    return (
        <div
            onClick={() => {
                if (!disabled) onClick();
            }}
            title={title}
            className={`-rotate-90 flex items-center justify-center relative ${disabled ? "opacity-40 pointer-events-none" : "cursor-pointer"} ${className}`}
            style={{ minWidth: 24, minHeight: 24 }}
        >
            {active && (
                <Image
                    src="/map/outline_icon.png"
                    alt="Map Outline Icon"
                    width={24}
                    height={24}
                    className="absolute top-0 left-0 z-10"
                    style={{ pointerEvents: 'none' }}
                />
            )}
            <Image
                src={imageSrc}
                alt={alt}
                width={24}
                height={24}
                className={
                    !disabled
                        ? active
                            ? "filter brightness-[140%] grayscale-[20%]"
                            : "filter hover:brightness-[115%]"
                        : undefined
                }
            />
        </div>
    );
}

function MapControlComponent({
    leafletMap,
    currentMap,
    setCurrentMapById,
    maps,
    showMapDetails,
    setShowMapDetails,
}: {
    leafletMap: L.Map;
    currentMap: any;
    setCurrentMapById: (id: string | null) => void;
    maps: Map[];
    showMapDetails?: boolean;
    setShowMapDetails?: (show: boolean) => void;
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

    const handleShowMapDetailsClick = () => {
        setShowMapDetails?.(!showMapDetails);
    };

    return (
        <div className="flex rotate-90 origin-top-left absolute -top-2 left-4">
            <ControlButton
                onClick={handleAncestorMapClick}
                title={hasAncestorMap ? "Go to ancestor map" : "No ancestor map"}
                disabled={!hasAncestorMap}
                imageSrc="/map/ancestor_icon.png"
                alt="Map Ancestor Icon"
            />
            <ControlButton
                onClick={handleParentMapClick}
                title={hasParentMap ? "Go to parent map" : "No parent map"}
                disabled={!hasParentMap}
                imageSrc="/map/up_icon.png"
                alt="Map Up Icon"
            />
            <ControlButton
                onClick={handleShowMapDetailsClick}
                title={showMapDetails ? "Hide map details" : "Show map details"}
                active={showMapDetails}
                imageSrc="/map/text_icon.png"
                alt="Map Text Icon"
            />
            <ControlButton
                onClick={() => leafletMap.zoomIn()}
                title="Zoom in"
                imageSrc="/map/zoom_icon.png"
                alt="Map Zoom Icon"
                className="ml-2"
            />
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={handleOnChange}
                className="zoom-slider w-24 4k:w-40 rotate-180 origin-center accent-red-300"
            />
            <ControlButton
                onClick={() => leafletMap.zoomOut()}
                title="Zoom out"
                imageSrc="/map/unzoom_icon.png"
                alt="Map Unzoom Icon"
            />
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
    // Only adminContext has showMapDetails and setShowMapDetails
    const showMapDetails = !useGameContext ? adminContext?.showMapDetails : undefined;
    const setShowMapDetails = !useGameContext ? adminContext?.setShowMapDetails : undefined;

    const leafletMap = useLeafletMap();
    // Store the root and div so we can update the React component without re-creating the control
    const controlRef = useRef<L.Control | null>(null);
    const divRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);

    // Create the control only once
    useEffect(() => {
        if (!leafletMap) return;
        if (controlRef.current) return;
        const control = new L.Control({ position: "topleft" });
        control.onAdd = function () {
            const div = L.DomUtil.create('div', 'custom-zoom-control');
            divRef.current = div;
            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);
            const root = createRoot(div);
            rootRef.current = root;
            // Initial render
            root.render(
                <MapControlComponent
                    leafletMap={leafletMap}
                    currentMap={currentMap}
                    setCurrentMapById={setCurrentMapById}
                    maps={availableMaps}
                    showMapDetails={showMapDetails}
                    setShowMapDetails={setShowMapDetails}
                />
            );
            (div as any)._reactRoot = root;
            return div;
        };
        control.onRemove = function () {
            const div = divRef.current;
            if (div && (div as any)._reactRoot) {
                setTimeout(() => {
                    (div as any)._reactRoot.unmount();
                }, 0);
            }
        };
        leafletMap.addControl(control);
        controlRef.current = control;
        return () => {
            leafletMap.removeControl(control);
            controlRef.current = null;
            divRef.current = null;
            rootRef.current = null;
        };
    }, [leafletMap]);

    // Update the React component inside the control when props change
    useEffect(() => {
        if (rootRef.current && divRef.current) {
            rootRef.current.render(
                <MapControlComponent
                    leafletMap={leafletMap}
                    currentMap={currentMap}
                    setCurrentMapById={setCurrentMapById}
                    maps={availableMaps}
                    showMapDetails={showMapDetails}
                    setShowMapDetails={setShowMapDetails}
                />
            );
        }
    }, [leafletMap, currentMap, setCurrentMapById, availableMaps, showMapDetails, setShowMapDetails]);

    return null;
}
