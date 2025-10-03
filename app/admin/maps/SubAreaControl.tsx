"use client";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { createRoot } from "react-dom/client";
import { Map } from "@/lib/types/Map";
import { useLocale } from "@/app/components/contexts/LocalContextProvider";
import { getMapById } from "@/lib/utils/getMapById";

type Props = {
    form: Partial<Map>;
    maps: Map[];
    onSubAreaClick?: (subAreaId: string) => void;
};

function SubAreaContent({ form, maps, locale, onSubAreaClick }: Props & { locale: string }) {
    return (
        <div className="text-right text-slate-100 p-2 pl-7 text-sm relative">
            <div className="absolute z-10 top-0 w-full h-full left-0 blur-sm bg-gradient-to-l from-black/40 via-black/40 via-20% to-transparent"></div>
            {form.subAreas?.map((subAreaId) => {
                const subMap = getMapById(maps, subAreaId);
                const name = subMap?.name[locale as keyof typeof subMap.name] || "Unknown";
                const active = form.id === subAreaId;

                return (
                    <div
                        key={subAreaId}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                            if (!active && onSubAreaClick) onSubAreaClick(subAreaId);
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

export default function SubAreaControl({ form, maps, onSubAreaClick }: Props) {
    const map = useMap();
    const { locale } = useLocale();

    useEffect(() => {
        if (!form.subAreas || form.subAreas.length === 0) return;

        const control = new L.Control({ position: "topright" });

        control.onAdd = () => {
            const div = L.DomUtil.create("div");
            const root = createRoot(div);

            root.render(
                <SubAreaContent
                    form={form}
                    maps={maps}
                    locale={locale}
                    onSubAreaClick={onSubAreaClick}
                />
            );

            return div;
        };

        control.addTo(map);

        return () => {
            control.remove();
        };
    }, [form, maps, locale, map, onSubAreaClick]);

    return null;
}
