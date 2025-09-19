import type { Config } from "tailwindcss";
const plugin = require('tailwindcss/plugin')

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				'myriad-cond': ["ui-sans-serif", "'Myriad Pro Condensed'"],
			},
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
			},
			textShadow: {
				DEFAULT: '1px 0px 2px var(--tw-shadow-color), -1px 0px 2px var(--tw-shadow-color), 0px 1px 2px var(--tw-shadow-color), 0px -1px 2px var(--tw-shadow-color)',
			},
		},
	},
	plugins: [
		require('tailwindcss-text-border'),
		plugin(function ({ matchUtilities, theme }: { matchUtilities: any, theme: any }) {
			matchUtilities(
				{
					'text-shadow': (value: string) => ({
						textShadow: value,
					}),
				},
				{ values: theme('textShadow') }
			)
		}),
	],
};
export default config;
