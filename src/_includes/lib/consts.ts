export const WEBSLAB_PROJECT = "impulsa";
export const WEBSLAB_DOMAIN = "ipsitec.es";
export const WEBSLAB_TOKEN = "TOKEN"; // TODO: temporary, should be user token

export const SITE_TITLE = "Impulsa";
export const SITE_DESCRIPTION = "Welcome to Impulsa!";

// TODO: Change to production URL
export const DB = {
	url: "ws://localhost:8000/",
	config: {
		access: "user",
		database: WEBSLAB_PROJECT,
		namespace: "webslab",
	},
};
