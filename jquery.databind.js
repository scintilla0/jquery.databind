/*!
 * jquery.databind.js - version 1.6.24 - 2024-01-28
 * Copyright (c) 2023-2024 scintilla0 (https://github.com/scintilla0)
 * Contributors: Squibler
 * @license MIT License http://www.opensource.org/licenses/mit-license.html
 * @license GPL2 License http://www.gnu.org/licenses/gpl.html
 *
 * A plugin for data binding and related auto-configuration.
 * Requires jQuery.
 * Add the attribute [data-bind="$fieldName"] to enable automatic configuration, e.g. [data-bind="userName"]．
 * Add the attribute [data-bind-option-text] to bind the option text of the other source in group instead of its exact value to this DOM element.
 * Add the attribute [data-check-field="$name"] to a button or a checkbox to control the check status of a set of checkboxes, e.g. [data-check-field="retired"].
 * Support [*], [^] and [$] characters for a more flexible way to specify the name of the target checkboxes, e.g. [data-check-field=".retired$"].
 * Add the attribute [data-display="$name:$value"] to a DOM element to control its display status
 * 	according to the value of the specified DOM elements, e.g. [data-display="gender:1"].
 * Add the attribute [data-display-hide-callback="$functionName"] to invoke the specified function as a callback when the DOM element is hidden.
 * Add the class [display-only] to an input or select element to display its content as a read-only span element that is not editable and not visible.
 * Invoke $("$selector").readonlyCheckable() to make checkbox or radio elements readonly via js code if they are unmodifiable.
 * For a better visual effect, please add the CSS rule [.display-only, [data-display] { display: none; }] to your main stylesheet.
 * Invoke $("$selector").boolean() to evaluate the boolean value of an element. Returns null if it is unparseable.
 * A boolean test value can be passed in when evaluate whether the element reserves the target boolean value, e.g. $("$selector").boolean(false).
 * Invoke $.isBlank() or $("$selector").isBlank() to evaluate whether parameter or the value of the target dom is undefined, null or blank.
 */
(function($) {
	const CORE = {DEFAULT_ID: '_data_bind_no_', ACTIVE_ITEM: 'activeItem', BIND: "data-bind",
			OPTION_TEXT: "data-bind-option-text", CHECK_FIELD: "data-check-field",
			DISPLAY: "data-display", DISPLAY_HIDE_CALLBACK: "data-display-hide-callback",
			DISPLAY_ONLY: "display-only", DISPLAY_ONLY_DEPLOYED: "display-only-deployed",
			MAINTAIN_DISABLED: "maintain-disabled", TEMPLATE_ID_SELECTOR: "[id*='emplate']",
			CALLBACK_FUNCTION_NAME: '_callback_function_name'};
	const OUTSIDE_CONSTANTS = {HIGHLIGHT_MINUS: "data-enable-highlight-minus"};
	const DEFAULT_CSS = {NON_SELECTABLE_OPACITY: '0.5'};
	const CommonUtil = _CommonUtil();
	$.fn.extend({
		readonlyCheckable: readonlyCheckable,
		boolean: boolean,
		isBlank: isBlank
	});
	$.extend({
		isBlank: CommonUtil.isBlank
	});

	let dataBindContainer = {};
	let dataBindFields = [];
	let displayControlInitiator = {};
	let displayControlImpacted = {};
	let nonIdIndex = 0;
	let activeItem;
	let displayControlFirstChange = true;

	$("[" + CORE.BIND + "]").each(prepareGroup);
	$(document)
		.on("keyup change", "input:text[" + CORE.BIND + "], textarea[" + CORE.BIND + "]", bindAction)
		.on("change", "select[" + CORE.BIND + "]", bindAction)
		.on("click", "input:radio[" + CORE.BIND + "]", bindAction)
		.on("click", "input[" + CORE.CHECK_FIELD + "], button[" + CORE.CHECK_FIELD + "]", checkAction);
	$("input:text, textarea, select, input:radio:checked").filter("[" + CORE.BIND + "]").each(bindAction);
	$("input:checkbox").filter("[" + CORE.CHECK_FIELD + "]").each(prepareCheckReverseLinkage);
	$("input, textarea, select").filter("[disabled]").addClass(CORE.MAINTAIN_DISABLED);
	CommonUtil.initAndDeployListener($("input, select, textarea").filter("." + CORE.DISPLAY_ONLY), prepareDisplayOnlyContent);
	CommonUtil.initAndDeployListener($("[" + CORE.DISPLAY + "]"), prepareDisplayControlEvent);
	triggerDisplayControlEventAtReady();

	function bindAction({target: dom}, item) {
		if (!CommonUtil.exists(dom) && CommonUtil.exists(item)) {
			dom = $(item)[0];
		}
		activeItem = dom.id;
		let fieldName = $(dom).attr(CORE.BIND);
		if (!CommonUtil.exists(dataBindContainer[fieldName])) {
			$("[" + CORE.BIND + "='" + fieldName + "']").each(prepareGroup);
		}
		dataBindContainer[fieldName] = dom.value;
	}

	function prepareGroup(_, dom) {
		let fieldName = $(dom).attr("" + CORE.BIND + "");
		if (!CommonUtil.isBlank(fieldName)) {
			if (CommonUtil.isBlank(dom.id)) {
				dom.id = (CORE.DEFAULT_ID + nonIdIndex ++);
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
				let dataBindDoms = $("[" + CORE.BIND + "='" + fieldName + "']");
				// maxlength highlight minus adapt
				let activeItemDom = $("[id='" + CommonUtil.wrapQuotes(activeItem) + "']");
				let fontColor = $(activeItemDom).css("color");
				// maxlength highlight minus adapt end
				if (CommonUtil.exists($(activeItemDom).attr(CORE.OPTION_TEXT))) {
					let reverseOption = $(dataBindDoms).filter("select").find("option:contains('" + value + "')")
							.filter((_, item) => $(item).text() === value);
					value = $(reverseOption).length === 1 ? $(reverseOption).val() : '';
				}
				$(dataBindDoms).each((_, item) => {
					let notCurrentDom = activeItem !== $(item).attr("id");
					if (notCurrentDom) {
						// select2Used adapt
						if ($(item).hasClass("select2Used")) {
							let option = $(item).find("option[value='" + value + "']");
							if ($(option).length === 0) {
								value = '';
								option = $(item).find("option[value='" + value + "']");
							}
							let optionText = $(option).text();
							$(item).next().find("span.select2-selection__rendered").html(optionText).attr("title", optionText);
						}
						// select2Used adapt end
						if (CommonUtil.exists($(item).attr(CORE.OPTION_TEXT))) {
							for (let index = 0; index < dataBindDoms.length; index ++) {
								if (notCurrentDom) {
									let sourceItem = $(dataBindDoms).eq(index);
									if ($(sourceItem).is("select")) {
										value = $(sourceItem).find("option[value='" + value + "']").html();
										break;
									}
								}
							}
						}
						CommonUtil.setValue(value, false, $(item));
						$(item).blur();
						// maxlength highlight minus adapt
						if (CommonUtil.exists($(activeItemDom).attr(OUTSIDE_CONSTANTS.HIGHLIGHT_MINUS)) && CommonUtil.exists(fontColor)) {
							$(item).css("color", fontColor);
						}
						// maxlength highlight minus adapt end
					}
				});
			}
		});
	}

	function checkAction({target: dom}) {
		let name = $(dom).attr(CORE.CHECK_FIELD);
		if (!CommonUtil.isBlank(name)) {
			let nameSet = extractName(name);
			let targetDom = $("input:checkbox[name" + nameSet[0] + "='" + nameSet[1] + "']");
			$(targetDom).prop("checked", CommonUtil.exists(dom.checked) ? dom.checked : false);
			$(targetDom).filter("[" + CORE.CHECK_FIELD + "]").each((_, item) => checkAction({target: $(item)[0]}));
		}
	}

	function prepareCheckReverseLinkage(_, item) {
		let name = $(item).attr(CORE.CHECK_FIELD);
		if (!CommonUtil.isBlank(name)) {
			let nameSet = extractName(name);
			let selectorString = "input:checkbox[name" + nameSet[0] + "='" + nameSet[1] + "']";
			$(document).on("change", selectorString, () => {
				let selector = $(selectorString);
				$("[" + CORE.CHECK_FIELD + "='" + name +"']").prop("checked", $(selector).filter(":checked").length === $(selector).length).change();
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

	function prepareDisplayControlEvent(_, item) {
		let dataBindField = $(item).attr(CORE.DISPLAY);
		if (!CommonUtil.exists(dataBindField)) {
			return;
		}
		let itemId = $(item).attr("id");
		if (CommonUtil.isBlank(itemId)) {
			$(item).attr("id", CORE.DEFAULT_ID + nonIdIndex ++);
			itemId = $(item).attr("id");
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
		for (let field of dataBindField.split(';')) {
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
				initiatorArray[field[0]] = [];
			}
			if (field[1].startsWith('[') && field[1].endsWith(']')) {
				for (let singleFieldValue of field[1].substring(1, field[1].length - 1).split(',')) {
					initiatorArray[field[0]].push(singleFieldValue);
				}
			} else {
				initiatorArray[field[0]].push(field[1]);
			}
			if (hasBound === true || initiatorArray[field[0]].length === 0) {
				continue;
			}
			let bindDisplayControlEvent = (_, eventItem) => {
				$(document).on("change", "#" + $(eventItem).attr("id"), () => {
					for (let impacted of displayControlInitiator[field[0]]) {
						let initiators = displayControlImpacted[impacted];
						let show = true;
						for (let initiator in initiators) {
							if (initiator === CORE.CALLBACK_FUNCTION_NAME) {
								continue;
							}
							let initiatorSelector = $(nameSelector(initiator));
							let showTest = false;
							for (let value of initiators[initiator]) {
								if (CommonUtil.isBlank(value) && $(initiatorSelector).is("input:checkbox")) {
									showTest = $(initiatorSelector).filter(":checked").length === 0;
								} else if ($(initiatorSelector).is("input:checkbox, input:radio")) {
									showTest = $(initiatorSelector).filter("[value='" + value+ "']:checked").length === 1;
								} else if ($(initiatorSelector).is("select")) {
									showTest = $(initiatorSelector).find("option[value='" + value + "']:selected").length === 1;
								} else if ($(initiatorSelector).is("input:text, input:hidden, textarea")) {
									showTest = $(initiatorSelector).val() === value;
								} else if ($(initiatorSelector).is("label, span")) {
									showTest = $(initiatorSelector).text() === value;
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
						let targetSelector = $("[id='" + impacted + "']");
						let impactedElements = $(targetSelector).find("input, textarea, select");
						if (show === true) {
							$(targetSelector).show();
							$(impactedElements).find(":not(." + CORE.MAINTAIN_DISABLED + ")").prop("disabled", false);
						} else {
							$(targetSelector).hide();
							$(impactedElements).find("." + CORE.MAINTAIN_DISABLED).prop("disabled", true);
							if (displayControlFirstChange === false && CommonUtil.exists(initiators[CORE.CALLBACK_FUNCTION_NAME])) {
								eval(initiators[CORE.CALLBACK_FUNCTION_NAME] + '(\"[id=\'' + impacted + '\']\")');
							}
						}
					}
				});
			};
			$(nameSelector(field[0])).each((_, initiatorItem) => {
				if (CommonUtil.isBlank($(initiatorItem).attr("id"))) {
					$(initiatorItem).attr("id", CORE.DEFAULT_ID + nonIdIndex ++);
				}
			});
			CommonUtil.initAndDeployListener($(nameSelector(field[0])), bindDisplayControlEvent);
		}
	}

	function triggerDisplayControlEventAtReady() {
		for (let initiator in displayControlInitiator) {
			let selectorString = nameSelector(initiator);
			$(selectorString).filter(":not(:checkbox):not(:radio), input:checkbox:checked, input:radio:checked").change();
			let processedName = [];
			$(selectorString).filter("input:checkbox:not(:checked)").each((_, item) => {
				let name = $(item).attr("name");
				if (!processedName.includes(name) && $("input:checkbox[name='" + name + "']:checked").length === 0) {
					$(item).change();
					processedName.push(name);
				}
			});
		}
		setTimeout(() => displayControlFirstChange = false);
	}

	function nameSelector(name) {
		return "[name='" + name + "']";
	}

	function prepareDisplayOnlyContent(_, item) {
		let hidden = ":hidden"; // evasion of IDEA warning
		if ($(item).hasClass(CORE.DISPLAY_ONLY_DEPLOYED) ||
				$(item).closest(CORE.TEMPLATE_ID_SELECTOR + hidden).length > 0 || $(item).closest(CORE.TEMPLATE_ID_SELECTOR).closest(hidden).length > 0) {
			return;
		}
		if ($(item).is("input:checkbox, input:radio")) {
			$(item).readonlyCheckable();
		} else {
			let value = $(item).val();
			let dataBindField = $(item).attr(CORE.BIND);
			let dataBindProperty = (CommonUtil.exists(dataBindField) ? ' ' + CORE.BIND + '="' + dataBindField + '"' : '');
			if ($(item).is("select")) {
				value = $(item).find("option[value='" + value + "']").html();
			}
			$(item).after('<span' + dataBindProperty + '>' + value + '</span>');
			$(item).css("display", 'none');
		}
		$(item).addClass(CORE.DISPLAY_ONLY_DEPLOYED);
	}

	function readonlyCheckable() {
		$(this).on("click", () => false);
		$(this).parent("label, span, div").css("cursor", 'default').css("opacity", DEFAULT_CSS.NON_SELECTABLE_OPACITY);
	}

	function boolean(testValue) {
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
				throw 'Invalid type of argument. Expected: boolean. Received: ' + typeof testValue + '.';
			}
			return testValue === value;
		} else {
			return value;
		}
	}

	function isBlank() {
		let isBlank = true;
		$(this).each((_, item) => {
			if (($(item).is("input:radio, input:checkbox") && $(item).is(":checked")) ||
				(!$(item).is("input:radio, input:checkbox") && !CommonUtil.isBlank($(item).val()))) {
				return isBlank = false;
			}
		});
		return isBlank;
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
			return string.replaceAll('\'', '\\\'').replaceAll('\"', '\\\"');
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

		function deployNodeAppendListener(selector, event) {
			new MutationObserver(mutationList => {
				for (let mutation of mutationList) {
					for (let node of mutation.addedNodes) {
						let targetNode = $(node).is(selector) ? $(node) : $(node).find(selector);
						$(targetNode).each(event);
					}
				}
			}).observe(document.body, {childList: true, subtree: true});
		}

		function initAndDeployListener(selector, event) {
			$(selector).each(event);
			deployNodeAppendListener(selector, event);
		}

		function setValue(value, doChange, ...selectors) {
			for (let selector of selectors) {
				$(selector).each((_, item) => {
					if ($(item).is("input:radio, input:checkbox")) {
						$(item).prop("checked", false);
						$(item).filter("[value='" + value.toString() + "']").prop("checked", true);
					} else if ($(item).is("input:text, input:hidden, textarea, select")) {
						$(item).val(value);
					} else if ($(item).is("label, span")) {
						$(item).text(value);
					} else if ($(item).is("a")) {
						$(item).attr("href", value);
					}
					if (doChange === true) {
						throttle(() => $(item).blur().change(), $(item).attr("id"));
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
