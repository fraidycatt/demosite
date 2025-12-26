import type { File } from '../system/index.js';

export interface GlobalsTheme {
	primary?: string;
	gray?: string;
	borderRadius?: string;
	fonts?: {
		families?: {
			display?: string;
			body?: string;
			code?: string;
		};
	};
}

export interface Globals {
	address_country?: string | null;
	address_locality?: string | null;
	address_region?: string | null;
	/** URL for the build / deploy hook that starts a new build */
	build_hook_url?: string | null;
	description?: string | null;
	email?: string | null;
	id?: string;
	/** Logo to use on light backgrounds */
	logo_on_light_bg?: (string | File) | null;
	/** Logo to use on dark backgrounds */
	logo_on_dark_bg?: (string | File) | null;
	og_image?: (string | File) | null;
	phone?: string | null;
	postal_code?: string | null;
	routes?: { [key: string]: any } | null;
	social_links: { [key: string]: any } | null;
	street_address?: string | null;
	/** What's the website title? */
	tagline?: string | null;
	/** Theme configuration including colors, border radius, and fonts */
	theme?: GlobalsTheme | null;
	/** What's the website title? */
	title?: string | null;
	/** What's is the base url for the site? */
	url?: string | null;
	contact?: string;
	deployment?: string;
	/** This will be the default metadata used for SEO */
	seo?: string;
	social?: string;
	notice_deployment?: string;
}
