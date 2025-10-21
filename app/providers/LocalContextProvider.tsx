"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type LocaleContextType = {
    locale: string;
    setLocale: (newLocale: string) => void;
};

const LocaleContext = createContext<LocaleContextType>({
    locale: "en",
    setLocale: () => { },
});

export function LocaleProvider({ children, defaultLang = "en" }: { children: ReactNode; defaultLang?: string }) {
    const [locale, setLocaleState] = useState(defaultLang);

    useEffect(() => {
        const storedLang = localStorage.getItem("lang");
        if (storedLang) {
            setLocaleState(storedLang);
        }
    }, []);

    useEffect(() => {
        // Apply font class to document body based on locale
        const body = document.body;
        
        // Remove existing locale font classes
        body.classList.remove('font-noto-jp');
        
        // Add appropriate font class for Japanese
        if (locale === 'ja') {
            body.classList.add('font-noto-jp');
        }
    }, [locale]);

    const setLocale = (newLocale: string) => {
        setLocaleState(newLocale);
        localStorage.setItem("lang", newLocale);
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale(): LocaleContextType {
    return useContext(LocaleContext);
}