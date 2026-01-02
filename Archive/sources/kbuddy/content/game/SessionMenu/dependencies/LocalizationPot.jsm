/*!
 * LocalizationPot.js v1.0.0
 * (c) 2020 Agatha Reed
 */
const KEY_PATTERN = /{{\s*([A-Z:\.]+)\s*}}/gi;
const STRING_FALLBACK = "Untranslated String";
const VALUE_FALLBACK = "Missing Value";

function flattenObject(obj, delimeter = '.', namespace = '') {
	let finalObject = {};
	for (const key of Object.keys(obj)) {
		const value = obj[key];
		const newKey = namespace.length === 0 ? key : namespace + delimeter + key;
		if (typeof value === "object") {
			const newObject = flattenObject(value, delimeter, newKey);
			finalObject = { ...finalObject, ...newObject };
		} else {
			finalObject[newKey] = value;
		}
	}
	return finalObject;
}

export default class LocalizationPot extends Map {
	constructor(translations, options) {
		const opts = {
			stringFallbackKey: null,
			valueFallbackKey: null,
			delimeter: '.',
			...options
		};
		if (!Array.isArray(translations) && typeof translations === "object") {
			const flatObj = flattenObject(translations, opts.delimeter);
			super(Object.keys(flatObj).map(key => [ key, flatObj[key] ]));
		} else {
			super(translations);
		}
		this.stringFallbackKey = opts.stringFallbackKey;
		this.valueFallbackKey = opts.valueFallbackKey;
	}

	static install(Vue) {
		Vue.mixin({
			beforeCreate() {
				const translations = this.$options.translations;
				if (typeof translations !== "undefined") {
					if (translations instanceof LocalizationPot) {
						this.$translations = translations;
					} else {
						this.$translations = new LocalizationPot(translations);
					}
				} else {
					this.$translations = this.$parent && this.$parent.$translations;
				}
			}
		});
		Vue.directive("translate", (el, { value: key, arg, modifiers }, { context: vm }) => {
			if (vm && vm.$translate) {
				if (arg) el.setAttribute(arg, vm.$translate(key, null, modifiers.blank && ''));
				else el.textContent = vm.$translate(key, null, modifiers.blank && '');
			}
		});
		Vue.prototype.$translate = function(key, values, fallback) {
			return this.$translations
				? this.$translations.translate(key, values, fallback)
				: (typeof fallback !== "undefined" ? fallback : this.stringFallback);
		};
	}

	translate(key, values, fallback) {
		if (this.has(key)) {
			return this.get(key).replace(KEY_PATTERN, (_, valueKey) => {
				return values && valueKey in values
					? values[valueKey]
					: (typeof fallback !== "undefined" ? fallback : this.valueFallback);
			});
		} else {
			return typeof fallback !== "undefined" ? fallback : this.stringFallback;
		}
	}

	get stringFallback() {
		return this.get(this.stringFallbackKey) || STRING_FALLBACK;
	}
	
	get valueFallback() {
		return this.get(this.valueFallbackKey) || VALUE_FALLBACK;
	}
}

if (typeof window !== "undefined" && typeof window.Vue !== "undefined") {
	window.Vue.use(LocalizationPot);
}