/*!
 * jquery.databind.js - version 1.9.3 - 2024-07-31
 * @copyright (c) 2023-2024 scintilla0 (https://github.com/scintilla0)
 * @contributor: Squibler
 * @license MIT License http://www.opensource.org/licenses/mit-license.html
 * @license GPL2 License http://www.gnu.org/licenses/gpl.html
 */
/**
 * A plugin for data binding and related auto-configuration.
 * Requires jQuery 1.7.x or higher.
 * Add the attribute [data-bind="$fieldName"] to enable automatic configuration, e.g. [data-bind="userName"].
 * Add the attribute [data-bind-checkbox-text="$value"] to use the text as bind value when the event is initiated by a checkbox element.
 * Add the attribute [data-bind-option-text] to bind the option text of the other source in group instead of its exact value to this DOM element.
 * You can also use a specified element property as binding text using [data-bind-option-text="$propertyName"].
 * Add the attribute [data-check-field="$name"] to a button or a checkbox to control the check status of a set of checkboxes, e.g. [data-check-field="retired"].
 * Support [*], [^] and [$] characters for a more flexible way to specify the name of the target checkboxes, e.g. [data-check-field=".retired$"].
 * Add the attribute [data-display="$name:$value"] or [data-hide="$name:$value"] to a DOM element to control its display status
 * 	according to the value of the specified DOM elements, e.g. [data-display="gender:1"]. Notice that display is executed in preference to hide.
 * Add the attribute [data-enable="$name:$value"] or [data-disable="$name:$value"] to do similar as display and hide event, but only affect [disabled] property
 * 	instead of display status.
 * Add the attribute [data-display-hide-callback="$functionName"] to invoke the specified function as a callback when the DOM element is hidden.
 * Add the attribute [data-unchecked-value="$value"] to submit a default value when a checkbox element is not checked instead of submitting nothing.
 * Add the class [display-only] to an input or select element to display its content as a read-only span element that is not editable and not visible.
 * For a better visual effect, please add the CSS rule [.display-only, [data-display], [data-hide], [data-enable], [data-disable] { display: none; }] to your main stylesheet.
 * Invoke $("$selector").readonly() to make checkbox, radio or select elements readonly via js code if they are unmodifiable, and $("$selector").removeReadonly() to remove it.
 * Invoke $("$selector").boolean() to evaluate the boolean value of an element. Returns null if it is unparseable.
 * A boolean test value can be passed in when evaluate whether the element reserves the target boolean value, e.g. $("$selector").boolean(false).
 * Invoke $.isBlank() or $("$selector").isBlank() to evaluate whether parameter or the value of the target dom is undefined, null or blank.
 * Invoke $("$selector").isChecked() to evaluate whether the target checkbox or radio element is checked.
 * Invoke $("$selector").modify($function) or $("$selector").modify($prependString, $appendString) to quickly modify the value or text of the target element.
 * Invoke $("$selector").increase() or $("$selector").increase($increaseValue) to quickly modify the numeric value or text of the target element.
 */
(function($) {
	const CORE = {DEFAULT_ID: '_data_bind_no_', ACTIVE_ITEM: "activeItem", BIND: "data-bind",
			CHECKBOX_TEXT: "data-bind-checkbox-text", OPTION_TEXT: "data-bind-option-text", CHECK_FIELD: "data-check-field",
			DISPLAY: "data-display", HIDE: "data-hide", ENABLE: "data-enable", DISABLE: "data-disable",
			DISPLAY_HIDE_CALLBACK: "data-display-hide-callback", CALLBACK_FUNCTION_NAME: '_callback_function_name',
			UNCHECKED_VALUE: "data-unchecked-value", REVERSE_CHECKBOX_ID: "data-reverse-checkbox-id",
			DISPLAY_ONLY: "display-only", DISPLAY_ONLY_DEPLOYED: "display-only-deployed",
			MAINTAIN_DISABLED: 'maintain-disabled', TEMPLATE_ID_SELECTOR: "[id*=\"emplate\"]",
			READONLY_ITEM: 'readonly-item', BIND_FIELD: "bindField",
			IS_SHOW_OR_HIDE: "isShowOrHide", IS_DISPLAY_OR_ENABLED: "isDisplayOrEnabled"};
	const OUTSIDE_CONSTANTS = {HIGHLIGHT_MINUS: "data-enable-highlight-minus"};
	const DISPLAY_CONTROL_CONFIG_PRESET = {
		[CORE.DISPLAY]: {[CORE.IS_SHOW_OR_HIDE]: true, [CORE.IS_DISPLAY_OR_ENABLED]: true},
		[CORE.HIDE]: {[CORE.IS_SHOW_OR_HIDE]: false, [CORE.IS_DISPLAY_OR_ENABLED]: true},
		[CORE.ENABLE]: {[CORE.IS_SHOW_OR_HIDE]: true, [CORE.IS_DISPLAY_OR_ENABLED]: false},
		[CORE.DISABLE]: {[CORE.IS_SHOW_OR_HIDE]: false, [CORE.IS_DISPLAY_OR_ENABLED]: false}
	};
	const READONLY_CSS_PRESET = [{
		name: `bootstrap`,
		pickTest: () => $(`link`).filter((_, link) => link.href && (link.href.includes(`bootstrap.min.css`) || link.href.includes(`bootstrap.css`))).length >= 1,
		elementTypes: [
			{
				name: `checkable`,
				pickRange: checkable => $(checkable).parent(`label, span, div`).filter(`.form-check, .form-check-inline`),
				css: {
					'cursor': `default`,
					'opacity': `0.5`,
				}
			}, {
				name: `select`,
				pickRange: select => $(select),
				css: {
					'background-color': `#e9ecef`,
				}
			}
		]
	}, {
		name: `chrome`,
		pickTest: () => isBrowser(`Chrome`),
		elementTypes: [
			{
				name: `checkable`,
				pickRange: checkable => $(checkable),
				css: {
					'cursor': `default`,
					'filter': `grayscale(1)`,
					'opacity': `0.3`
				}
			}, {
				name: `select`,
				pickRange: select => $(select),
				css: {
					'cursor': `default`,
					'color': `#6d6d6d`,
					'opacity': `0.7`,
					'background-color': `#f8f8f8`,
					'border-color': `#d0d0d0`,
					'border-radius': `2.5px`
				}
			}
		]
	}, {
		name: `firefox`,
		pickTest: () => isBrowser(`Firefox`),
		elementTypes: [
			{
				name: `checkable`,
				pickRange: checkable => $(checkable),
				css: {
					'cursor': `default`,
					'filter': `grayscale(1)`,
					'opacity': `0.55`
				}
			}, {
				name: `select`,
				pickRange: select => $(select),
				css: {
					'cursor': `default`,
					'opacity': `0.6`
				}
			}
		]
	}, {
		name: `default`,
		pickTest: () => true,
		elementTypes: [
			{
				name: `checkable`,
				pickRange: checkable => $(checkable),
				css: {
					'cursor': `default`,
					'opacity': `0.5`
				}
			}, {
				name: `select`,
				pickRange: select => $(select),
				css: {
					'cursor': `default`,
					'opacity': `0.5`
				}
			}
		]
	}];

	const CommonUtil = _CommonUtil();
	$.fn.extend({
		readonly: readonly,
		removeReadonly: removeReadonly,
		boolean: boolean,
		isBlank: isBlank,
		isChecked: isChecked,
		increase: increase,
		modify: modify
	});
	$.extend({
		isBlank: CommonUtil.isBlank
	});

	let dataBindContainer = {};
	let dataBindFields = [];
	let displayControlInitiator = {};
	let displayControlImpacted = {};
	let displayControlEvents = [];
	let nonIdIndex = 0;
	let activeItem;
	let displayControlFirstChange = true;

	$(`[${CORE.BIND}]`).each(prepareGroup);
	$(document)
			.on("keyup change", `input:text[${CORE.BIND}], textarea[${CORE.BIND}]`, bindAction)
			.on("change", `select[${CORE.BIND}]`, bindAction)
			.on("click", `input:radio[${CORE.BIND}]`, bindAction)
			.on("click", `input:checkbox[${CORE.BIND}][${CORE.CHECKBOX_TEXT}]`, bindAction)
			.on("click", `input:checkbox[${CORE.CHECK_FIELD}], input:button[${CORE.CHECK_FIELD}], button[${CORE.CHECK_FIELD}]`, checkAction);
	$(`input:text, textarea, select, input:radio:checked`).filter(`[${CORE.BIND}]`).each(bindAction);
	$(`input:checkbox[${CORE.CHECK_FIELD}]`).each(prepareCheckReverseLinkage);
	$(`input:checkbox[${CORE.UNCHECKED_VALUE}]`).on("click, change", uncheckedDefaultLinkAction).each(prepareUncheckedLinkDefault);
	$(`input, textarea, select`).filter(`[disabled]`).addClass(CORE.MAINTAIN_DISABLED);
	CommonUtil.initAndDeployListener([`input`, `select`, `textarea`].map(item => `${item}.${CORE.DISPLAY_ONLY}`).join(`, `), prepareDisplayOnlyContent);
	CommonUtil.initAndDeployListener(`[${Object.keys(DISPLAY_CONTROL_CONFIG_PRESET).join(`], [`)}]`, prepareDisplayControlEvent);
	triggerDisplayControlEventAtReady();

	function bindAction({target: dom}, item) {
		if (!CommonUtil.exists(dom) && CommonUtil.exists(item)) {
			dom = $(item)[0];
		}
		activeItem = dom.id;
		let fieldName = $(dom).attr(CORE.BIND);
		if (!CommonUtil.exists(dataBindContainer[fieldName])) {
			$(`[${CORE.BIND}="${fieldName}"]`).each(prepareGroup);
		}
		dataBindContainer[fieldName] = dom.value;
	}

	function prepareGroup(_, dom) {
		let fieldName = $(dom).attr(CORE.BIND);
		if (!CommonUtil.isBlank(fieldName)) {
			if (CommonUtil.isBlank(dom.id)) {
				dom.id = getNextId();
			}
			if (!dataBindFields.includes(fieldName)) {
				dataBindFields.push(fieldName);
				prepareDataEvent(fieldName);
			}
		}
	}

	function prepareDataEvent(fieldName) {
		Object.defineProperty(dataBindContainer, fieldName, {
			set: function(value) {
				let dataBindDomBatch = $(`[${CORE.BIND}="${fieldName}"]`);
				// maxlength highlight minus adapt
				let activeItemDom = $(`[id="${CommonUtil.wrapQuotes(activeItem)}"]`);
				let fontColor = $(activeItemDom).css(`color`);
				// maxlength highlight minus adapt end
				let activeOptionTextName = $(activeItemDom).attr(CORE.OPTION_TEXT);
				let initiatingCheckbox = $(dataBindDomBatch).filter(`input:checkbox[${CORE.CHECKBOX_TEXT}]`);
				if (CommonUtil.exists(activeOptionTextName)) {
					let activeOptionTextGetter = getOptionTextGetter(activeOptionTextName);
					let reverseOption = $(dataBindDomBatch).filter(`select`).find(`option`)
							.filter((_, item) => activeOptionTextGetter.apply(null, [$(item)]) === value);
					value = $(reverseOption).length === 1 ? $(reverseOption).val() : ``;
				} else if ($(initiatingCheckbox).length === 1) {
					if ($(initiatingCheckbox).is(activeItemDom)) {
						value = $(initiatingCheckbox).is(`:checked`) ? $(initiatingCheckbox).attr(CORE.CHECKBOX_TEXT) : ``;
					}
				}
				$(dataBindDomBatch).each((_, item) => {
					let setValue = value;
					let notCurrentDom = activeItem !== $(item).attr(`id`);
					if (notCurrentDom) {
						// select2Used adapt
						if ($(item).hasClass(`select2Used`)) {
							let option = $(item).find(`option[value="${value}"]`);
							if ($(option).length === 0) {
								value = ``;
								setValue = value;
								option = $(item).find(`option[value="${value}"]`);
							}
							let optionText = $(option).text();
							$(item).next().find(`span.select2-selection__rendered`).text(optionText).attr(`title`, optionText);
						}
						// select2Used adapt end
						let optionTextName = $(item).attr(CORE.OPTION_TEXT);
						if (CommonUtil.exists(optionTextName)) {
							let optionTextGetter = getOptionTextGetter(optionTextName);
							for (let index = 0; index < dataBindDomBatch.length; index ++) {
								if (notCurrentDom) {
									let sourceItem = $(dataBindDomBatch).eq(index);
									if ($(sourceItem).is(`select`)) {
										setValue = optionTextGetter.apply(null, [$(sourceItem).find(`option[value="${value}"]`)]);
										break;
									}
								}
							}
						}
						if ($(item).is(`input:checkbox[${CORE.CHECKBOX_TEXT}]`)) {
							$(item).prop(`checked`, $(item).attr(CORE.CHECKBOX_TEXT) === setValue);
						} else {
							CommonUtil.setValue(setValue, false, $(item));
						}
						$(item).blur();
						// maxlength highlight minus adapt
						if (CommonUtil.exists($(activeItemDom).attr(OUTSIDE_CONSTANTS.HIGHLIGHT_MINUS)) && CommonUtil.exists(fontColor)) {
							$(item).css(`color`, fontColor);
						}
						// maxlength highlight minus adapt end
					}
				});
			}
		});
	}

	function getOptionTextGetter(optionTextName) {
		return CommonUtil.isBlank(optionTextName) ? selector => selector.text() : selector => selector.attr(optionTextName);
	}

	function checkAction({target: dom}) {
		let name = $(dom).attr(CORE.CHECK_FIELD);
		if (!CommonUtil.isBlank(name)) {
			let nameSet = extractName(name);
			let targetDom = $(`input:checkbox[name${nameSet[0]}="${nameSet[1]}"]`);
			$(targetDom).prop(`checked`, CommonUtil.exists(dom.checked) ? dom.checked : false);
			$(targetDom).filter(`[${CORE.CHECK_FIELD}]`).each((_, item) => checkAction({target: $(item)[0]}));
		}
	}

	function prepareCheckReverseLinkage(_, item) {
		let name = $(item).attr(CORE.CHECK_FIELD);
		if (!CommonUtil.isBlank(name)) {
			let nameSet = extractName(name);
			let selectorString = `input:checkbox[name${nameSet[0]}="${nameSet[1]}"]`;
			$(document).on("change", selectorString, () => {
				let selector = $(selectorString);
				$(`[${CORE.CHECK_FIELD}="${name}"]`).prop(`checked`, $(selector).filter(`:checked`).length === $(selector).length).change();
			});
		}
	}

	function extractName(name) {
		let nameSet = ['', null];
		if (name.startsWith('*') || name.startsWith('^') || name.startsWith('$')) {
			nameSet[0] = name.substring(0, 1);
			name = name.substring(1);
		} else if (name.endsWith('$')) {
			nameSet[0] = name.substring(name.length - 1);
			name = name.substring(0, name.length - 1);
		}
		nameSet[1] = CommonUtil.wrapQuotes(name);
		return nameSet;
	}

	function uncheckedDefaultLinkAction({target: dom}) {
		$(`input:checkbox[id="${$(dom).attr(CORE.REVERSE_CHECKBOX_ID)}"]`).prop(`checked`, !$(dom).prop(`checked`));
	}

	function prepareUncheckedLinkDefault(_, item) {
		let reverseCheckboxId = getNextId();
		let reverseCheckbox = $(`<input type="checkbox" id="${reverseCheckboxId}" name="${$(item).attr(`name`)}" value="` +
				$(item).attr(CORE.UNCHECKED_VALUE) + `"${$(item).prop(`checked`) ? `` : ` checked`} style="display: none;"/>`);
		$(reverseCheckbox).readonly();
		let form = $(item).closest(`form`);
		if ($(form).length === 1) {
			$(form).prepend(reverseCheckbox);
		} else {
			$(item).before(reverseCheckbox);
		}
		$(item).attr(CORE.REVERSE_CHECKBOX_ID, reverseCheckboxId).removeAttr(CORE.UNCHECKED_VALUE);
	}

	function prepareDisplayControlEvent(_, item) {
		let bindConfig = extractDisplayControlConfig(item);
		let itemId = $(item).attr(`id`);
		if (CommonUtil.isBlank(itemId)) {
			$(item).attr(`id`, getNextId());
			itemId = $(item).attr(`id`);
		}
		let initiatorArray = displayControlImpacted[itemId];
		if (!CommonUtil.exists(initiatorArray)) {
			displayControlImpacted[itemId] = {};
			initiatorArray = displayControlImpacted[itemId];
		}
		let callbackFunctionName = $(item).attr(CORE.DISPLAY_HIDE_CALLBACK);
		if (CommonUtil.exists(callbackFunctionName)) {
			initiatorArray[CORE.CALLBACK_FUNCTION_NAME] = callbackFunctionName;
		}
		for (let field of bindConfig[CORE.BIND_FIELD].split(';')) {
			field = field.split(':')
			let impactArray = displayControlInitiator[field[0]];
			let hasBound = true;
			if (!CommonUtil.exists(impactArray)) {
				hasBound = false;
				displayControlInitiator[field[0]] = [];
				impactArray = displayControlInitiator[field[0]];
			}
			impactArray.push(itemId);
			if (!CommonUtil.exists(initiatorArray[field[0]])) {
				initiatorArray[field[0]] = {bindConfig: bindConfig, value: []};
			}
			if (field[1].startsWith('[') && field[1].endsWith(']')) {
				for (let singleFieldValue of field[1].substring(1, field[1].length - 1).split(',')) {
					initiatorArray[field[0]].value.push(singleFieldValue);
				}
			} else {
				initiatorArray[field[0]].value.push(field[1]);
			}
			if (hasBound === true || initiatorArray[field[0]].value.length === 0) {
				continue;
			}
			let bindDisplayControlEvent = (_, eventItem) => {
				let eventItemId = $(eventItem).attr(`id`);
				if (!displayControlEvents.includes(eventItemId)) {
					$(document).on("change", `[id="${eventItemId}"]`, () => {
						for (let impacted of displayControlInitiator[field[0]]) {
							let initiators = displayControlImpacted[impacted];
							let show = true;
							let displayOrEnabled = true;
							for (let initiator in initiators) {
								if (initiator === CORE.CALLBACK_FUNCTION_NAME) {
									continue;
								}
								let initiatorSelector = $(nameSelector(initiator));
								let showTest = false;
								for (let value of initiators[initiator].value) {
									if (CommonUtil.isBlank(value) && $(initiatorSelector).is(`input:checkbox, input:radio`)) {
										showTest = $(initiatorSelector).filter(`:checked`).length === 0;
									} else if ($(initiatorSelector).is(`input:checkbox, input:radio`)) {
										showTest = $(initiatorSelector).filter(`[value="${value}"]:checked`).length === 1;
									} else if ($(initiatorSelector).is(`select`)) {
										showTest = $(initiatorSelector).find(`option[value="${value}"]:selected`).length === 1;
									} else if ($(initiatorSelector).is(`input:text, input:hidden, textarea`)) {
										showTest = $(initiatorSelector).val() === value;
									} else if ($(initiatorSelector).is(`label, span`)) {
										showTest = $(initiatorSelector).text() === value;
									}
									if (initiators[initiator].bindConfig[CORE.IS_SHOW_OR_HIDE] === false) {
										showTest = !showTest;
									}
									if (initiators[initiator].bindConfig[CORE.IS_DISPLAY_OR_ENABLED] === false) {
										displayOrEnabled = false;
									}
									if (showTest === true) {
										break;
									}
								}
								show = showTest;
								if (show === false) {
									break;
								}
							}
							let targetSelector = $(`[id="${impacted}"]`);
							let impactedElements = $(targetSelector).find(`input, textarea, select`).filter(`:not(.${CORE.MAINTAIN_DISABLED})`)
								.add($(targetSelector).filter(`input, textarea, select`).filter(`:not(.${CORE.MAINTAIN_DISABLED})`));
							if (show === true) {
								if (displayOrEnabled === true) {
									$(targetSelector).show();
								}
								$(impactedElements).prop(`disabled`, false);
							} else {
								if (displayOrEnabled === true) {
									$(targetSelector).hide();
								}
								$(impactedElements).prop(`disabled`, true);
								if (displayControlFirstChange === false && CommonUtil.exists(initiators[CORE.CALLBACK_FUNCTION_NAME])) {
									eval(`${initiators[CORE.CALLBACK_FUNCTION_NAME]}(\`[id="${impacted}"]\`)`);
								}
							}
						}
					});
					displayControlEvents.push(eventItemId);
				}
			};
			$(nameSelector(field[0])).each((_, initiatorItem) => {
				if (CommonUtil.isBlank($(initiatorItem).attr(`id`))) {
					$(initiatorItem).attr(`id`, getNextId());
				}
			});
			CommonUtil.initAndDeployListener($(nameSelector(field[0])), bindDisplayControlEvent);
		}
	}

	function extractDisplayControlConfig(item) {
		let bindConfig = {};
		for (let configType in DISPLAY_CONTROL_CONFIG_PRESET) {
			bindConfig[CORE.BIND_FIELD] = $(item).attr(configType);
			bindConfig[CORE.IS_SHOW_OR_HIDE] = DISPLAY_CONTROL_CONFIG_PRESET[configType][CORE.IS_SHOW_OR_HIDE];
			bindConfig[CORE.IS_DISPLAY_OR_ENABLED] = DISPLAY_CONTROL_CONFIG_PRESET[configType][CORE.IS_DISPLAY_OR_ENABLED];
			if (CommonUtil.exists(bindConfig[CORE.BIND_FIELD])) {
				break;
			}
		}
		return bindConfig;
	}

	function triggerDisplayControlEventAtReady() {
		for (let initiator in displayControlInitiator) {
			let selectorString = nameSelector(initiator);
			$(selectorString).filter(`:not(:checkbox):not(:radio)`).change();
			let processedName = [];
			$(selectorString).filter(`input:checkbox, input:radio`).each((_, item) => {
				let name = $(item).attr(`name`);
				if (!processedName.includes(name)) {
					$(item).change();
					processedName.push(name);
				}
			});
		}
		setTimeout(() => displayControlFirstChange = false);
	}

	function nameSelector(name) {
		return `[name="${name}"]`;
	}

	function getNextId() {
		return CORE.DEFAULT_ID + (nonIdIndex ++);
	}

	function prepareDisplayOnlyContent(_, item) {
		let hidden = `:hidden`; // evasion of IDEA warning
		if ($(item).hasClass(CORE.DISPLAY_ONLY_DEPLOYED) ||
				$(item).closest(CORE.TEMPLATE_ID_SELECTOR + hidden).length > 0 || $(item).closest(CORE.TEMPLATE_ID_SELECTOR).closest(hidden).length > 0) {
			return;
		}
		if ($(item).is(`input:checkbox, input:radio`)) {
			$(item).readonly();
		} else {
			let value = $(item).val();
			let dataBindField = $(item).attr(CORE.BIND);
			let dataBindProperty = (CommonUtil.exists(dataBindField) ? ` ${CORE.BIND}="${dataBindField}"` : ``);
			if ($(item).is(`select`)) {
				value = $(item).find(`option[value="${value}"]`).text();
			}
			let span = $(`<span${dataBindProperty} style="white-space: pre-wrap"></span>`);
			$(span).text(value);
			$(item).after(span);
			$(item).css(`display`, `none`);
		}
		$(item).addClass(CORE.DISPLAY_ONLY_DEPLOYED);
	}

	function readonly() {
		$(this).addClass(CORE.READONLY_ITEM);
		$(this).filter(`input:text, input:hidden, textarea`).prop(`readonly`, true);
		let checkable = $(this).filter(`input:radio, input:checkbox`).css(`pointer-events`, `none`);
		let select = $(this).filter(`select:not(.select2Used)`).css(`pointer-events`, `none`);
		$(checkable).each((_, item) => $(`[for="${$(item).attr(`id`)}"]`).css(`pointer-events`, `none`));
		readonlyCssPreset(checkable, select, false);
	}

	function removeReadonly() {
		$(this).removeClass(CORE.READONLY_ITEM);
		$(this).filter(`input:text, input:hidden, textarea`).prop(`readonly`, false);
		let checkable = $(this).filter(`input:radio, input:checkbox`).css(`pointer-events`, ``);
		let select = $(this).filter(`select:not(.select2Used)`).css(`pointer-events`, ``);
		$(checkable).each((_, item) => $(`[for="${$(item).attr(`id`)}"]`).css(`pointer-events`, ``));
		readonlyCssPreset(checkable, select, true);
	}

	function readonlyCssPreset(checkable, select, isRemoving) {
		for (let preset of READONLY_CSS_PRESET) {
			if (preset.pickTest.apply() === true) {
				for (let elementType of preset.elementTypes) {
					let target = elementType.name === `checkable` ? checkable : elementType.name === `select` ? select : null;
					let targetSelector = elementType.pickRange.apply(null, [target]);
					for (let style in elementType.css) {
						$(targetSelector).css(style, isRemoving ? `` : elementType.css[style]);
					}
				}
				break;
			}
		}
	}

	function isBrowser(type) {
		return navigator.userAgent.includes(type);
	}

	function boolean(testValue) {
		if ($(this).length > 1) {
			throw `Multiple elements selected is not permitted.`;
		}
		let value = null;
		let valueString = $(this).val();
		if (CommonUtil.exists(valueString)) {
			valueString = valueString.toLocaleLowerCase();
			if (valueString === "true") {
				value = true;
			} else if (valueString === "false") {
				value = false;
			}
		}
		if (CommonUtil.exists(testValue)) {
			if (typeof testValue !== "boolean") {
				throw `Invalid type of argument. Expected: boolean. Received: ${typeof testValue}.`;
			}
			return testValue === value;
		} else {
			return value;
		}
	}

	function isBlank() {
		let isBlank = true;
		$(this).each((_, item) => {
			if (($(item).is(`input:radio, input:checkbox`) && $(item).is(`:checked`)) ||
				(!$(item).is(`input:radio, input:checkbox`) && !CommonUtil.isBlank($(item).val()))) {
				return isBlank = false;
			}
		});
		return isBlank;
	}

	function isChecked() {
		return $(this).is(`input:radio:checked, input:checkbox:checked`);
	}

	function modify(operation, appendString) {
		if (CommonUtil.exists(operation) && typeof operation === "function" && !CommonUtil.exists(appendString)) {
			modifyCore(operation, this, false);
		} else if (CommonUtil.exists(operation) && CommonUtil.exists(appendString)
				&& (typeof operation === "string" || typeof operation === "number")
				&& (typeof appendString === "string" || typeof appendString === "number")) {
			modifyCore([operation, appendString], this, false);
		} else {
			throw `Invalid type of argument. Expected: function; string/number, string/number. Received: ` +
					typeof operation + `${CommonUtil.exists(appendString) ? `, ${typeof appendString}` : ``}.`;
		}
	}

	function increase(increaseValue = 1) {
		if (!isNaN(increaseValue) && typeof increaseValue !== "boolean") {
			modifyCore(value => Number(value) + Number(increaseValue), this, true);
		} else {
			throw `Invalid numeric increase value. Expected: number/string. Received: ` +
					typeof increaseValue + `${typeof increaseValue === "string" ? `(NaN)` : ``}.`;
		}
	}

	function modifyCore(operation, target, isIncreasing) {
		if (Array.isArray(operation)) {
			let appendString = operation;
			operation = value => appendString[0] + value + appendString[1];
		}
		$(target).each((_, item) => {
			let domChanger;
			if ($(item).is(`input:text, input:hidden, textarea`)) {
				domChanger = $.fn.val;
			} else if ($(item).is(`span, label`)) {
				domChanger = $.fn.text;
			} else {
				throw `Unmodifiable element type. Target: ${$(item).attr(`id`)}. Type: ` +
						$(item).prop(`tagName`).toLocaleLowerCase() + `${$(item).prop(`tagName`) === `INPUT` ? `:${$(item).prop(`type`)}` : ``}.`;
			}
			let originalValue = domChanger.apply($(item));
			if (isIncreasing === false || !isNaN(originalValue)) {
				domChanger.apply($(item), [operation.apply(null, [originalValue])]);
			}
		});
	}

	function _CommonUtil() {
		function exists(object) {
			return (typeof object !== "undefined" && object !== undefined && object !== null);
		}

		function isBlank(string) {
			return !(exists(string) && string.trim() !== '');
		}

		function wrapQuotes(string) {
			if (isBlank(string)) {
				return string;
			}
			return string.replaceAll('\'', '\\\'').replaceAll('\"', '\\\"').replaceAll('\`', '\\\`');
		}

		let throttleTimer = {};

		function throttle(callback, domId, delay = 0) {
			if (throttleTimer[domId] == null) {
				throttleTimer[domId] = setTimeout(() => throttleTimer[domId] = null, delay);
				setTimeout(() => callback.apply());
			} else {
				clearTimeout(throttleTimer[domId]);
				throttleTimer[domId] = setTimeout(() => throttleTimer[domId] = null, delay);
			}
		}

		function initAndDeployListener(selector, event) {
			applyEventGroupByName(selector, event);
			deployNodeAppendListener(selector, event);
		}

		function applyEventGroupByName(selector, event) {
			let buffer = {};
			let noneNamedIndex = 0;
			$(selector).each((_, item) => {
				let key = $(item).attr(`name`);
				if (!CommonUtil.exists(key)) {
					key = noneNamedIndex ++;
				}
				if (!CommonUtil.exists(buffer[key])) {
					buffer[key] = $();
				}
				buffer[key] = buffer[key].add(item);
			});
			for (let index in buffer) {
				event.apply(null, [null, buffer[index]]);
			}
		}

		function deployNodeAppendListener(selector, event) {
			new MutationObserver(mutationList => {
				for (let mutation of mutationList) {
					for (let node of mutation.addedNodes) {
						let targetNode = $(node).is(selector) ? $(node) : $(node).find(selector);
						applyEventGroupByName(targetNode, event);
					}
				}
			}).observe(document.body, {childList: true, subtree: true});
		}

		function setValue(value, doChange, ...selectors) {
			value = exists(value) ? value : '';
			for (let selector of selectors) {
				$(selector).each((_, item) => {
					if ($(item).is(`input:radio, input:checkbox`)) {
						$(item).prop(`checked`, false);
						$(item).filter(`[value="${value.toString()}"]`).prop(`checked`, true);
					} else if ($(item).is(`input:text, input:hidden, textarea, select`)) {
						$(item).val(value);
					} else if ($(item).is(`label, span, p`)) {
						$(item).text(value);
					} else if ($(item).is(`a`)) {
						$(item).attr(`href`, value);
					}
					if (doChange === true) {
						throttle(() => $(item).blur().change(), $(item).attr(`id`));
					}
				});
			}
		}

		return {
			exists: exists,
			isBlank: isBlank,
			wrapQuotes: wrapQuotes,
			initAndDeployListener: initAndDeployListener,
			setValue: setValue
		};
	}

}) (jQuery);
