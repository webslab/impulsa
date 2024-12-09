import { Jodit } from "jodit/es2021/jodit.min.js";
import { WEBSLAB_PROJECT, WEBSLAB_TOKEN } from "./consts.ts";

export { Jodit };

export function joditInit(selector: HTMLElement): Jodit {
	const storedTheme = localStorage.getItem("theme");

	const theme = storedTheme === "auto" ? "light" : storedTheme || "light";
	const language = navigator.language || "en";

	const config = {
		theme,
		language,

		uploader: {
			url: "/filefind/index.php?action=fileUpload",
			headers: {
				"X-WEBSLAB-Project": WEBSLAB_PROJECT,
				"X-WEBSLAB-Token": WEBSLAB_TOKEN, // authService.getToken(),
			},
			// prepareData: (formdata) => {
			// 	formdata.append("name", "Some parameter"); // $_POST['name'] on server
			// },
		},

		filebrowser: {
			ajax: {
				url: "/filefind/index.php",
				headers: {
					"X-WEBSLAB-Project": WEBSLAB_PROJECT,
					"X-WEBSLAB-Token": WEBSLAB_TOKEN, // authService.getToken(),
				},
			},
		},

		height: 550,
		minHeight: 400,

		disablePlugins: ["color", "font", "about", "mobile"],
		beautifyHTML: false,

		controls: {
			classSpan: {
				list: {
					"text-blue": "Blue",
					"text-danger": "Danger",
					"text-warning": "Warning",
				},
			},
		},
	};

	return Jodit.make(selector, config);
}
