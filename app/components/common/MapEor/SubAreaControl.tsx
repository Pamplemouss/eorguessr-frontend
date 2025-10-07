"use client";
import { useEffect } from "react";
import L from "leaflet";
import { createRoot } from "react-dom/client";
import { useMap as useLeafletMap } from "react-leaflet";
import { useMap } from "@/app/providers/MapContextProvider";
import { useLocale } from "@/app/providers/LocalContextProvider";
import { getMapById } from "@/lib/utils/getMapById";

function SubAreaContent({
    currentMap,
    maps,
    setCurrentMapById,
    changeMapEnabled,
}: {
    currentMap: ReturnType<typeof useMap>["currentMap"];
    maps: ReturnType<typeof useMap>["maps"];
    setCurrentMapById: ReturnType<typeof useMap>["setCurrentMapById"];
    changeMapEnabled: ReturnType<typeof useMap>["changeMapEnabled"];
}) {
    const { locale } = useLocale();
    if (!currentMap) return null;

    return (
        <div className="text-right text-slate-100 p-2 pl-7 text-sm relative">
            <div className="absolute z-10 top-0 w-full h-full left-0 blur-sm bg-gradient-to-l from-black/40 via-black/40 via-20% to-transparent"></div>
            {currentMap.subAreas?.map((subAreaId) => {
                const subMap = getMapById(maps, subAreaId);
                const name = subMap?.name[locale as keyof typeof subMap.name] || "Unknown";
                const active = currentMap.id === subAreaId;

                return (
                    <div
                        key={subAreaId}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                            if (!active && changeMapEnabled) setCurrentMapById(subAreaId);
                        }}
                    >

                        <span className="grow z-20 text-shadow shadow-black">{name}</span>
                        {active ? (
                            <div className="z-20 m-auto h-2.5 w-2.5 bg-yellow-400 rounded-full shadow-[0_0_2px_2px] shadow-yellow-500/80 border border-yellow-100/50"></div>
                        ) : (
                            <div className="z-20 relative m-auto h-2.5 w-2.5 bg-slate-200/20 rounded-full shadow-slate-100/50 shadow-[0_0.5px_2px_0.5px] after:absolute after:bg-slate-100/10 after:rounded-full after:top-0.5 after:left-0.5 after:w-[4px] after:h-[4px] after:shadow-slate-100/10 after:shadow-[0_0_2px_0.5px]"></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function SubAreaControl() {
    const { currentMap, maps, setCurrentMapById, changeMapEnabled } = useMap();
    const map = useLeafletMap();
    const { locale } = useLocale();

    useEffect(() => {
        if (!currentMap?.subAreas || currentMap.subAreas.length === 0) return;

        const control = new L.Control({ position: "topright" });

        control.onAdd = () => {
            const div = L.DomUtil.create("div");
            const root = createRoot(div);

            root.render(
                <SubAreaContent
                    currentMap={currentMap}
                    maps={maps}
                    setCurrentMapById={setCurrentMapById}
                    changeMapEnabled={changeMapEnabled}
                />
            );

            return div;
        };

        control.addTo(map);

        return () => {
            control.remove();
        };
    }, [currentMap, maps, locale, map, setCurrentMapById, changeMapEnabled]);

    return null;
}
