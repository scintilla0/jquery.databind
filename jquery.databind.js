/*!
 * jquery.databind.js - version 1.6.6 - 2023-05-23
 * Copyright (c) 2023 scintilla0 (https://github.com/scintilla0)
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
 * For a better visual effect, please add the CSS rule [.display-only, [data-display] { display: none; }] to your main stylesheet.
 */
(function() {
	const CORE = {DEFAULT_ID: '_data_bind_no_', ACTIVE_ITEM: 'activeItem', BIND: "data-bind",
			OPTION_TEXT: "data-bind-option-text", CHECK_FIELD: "data-check-field",
			DISPLAY: "data-display", DISPLAY_HIDE_CALLBACK: "data-display-hide-callback",
			DISPLAY_ONLY: "display-only", CALLBACK_FUNCTION_NAME: '_callback_function_name'};
	const OUTSIDE_CONSTANTS = {HIGHLIGHT_MINUS: "data-enable-highlight-minus"};
	const DEFAULT_CSS = {NON_SELECTABLE_OPACITY: '0.5'};
	const CommonUtil = _CommonUtil();

	let dataBindContainer = {};
	let dataBindFields = [];
	let displayControlInitiator = {};
	let displayControlImpacted = {};
	let nonIdIndex = 0;
	let activeItem;
	let displayControlFirstChange = true;

	$("[" + CORE.BIND + "]").each(prepareGroup);
	$(document)
		.on("keyup change", "input:text[" + CORE.BIND + "]", bindAction)
		.on("change", "select[" + CORE.BIND + "]", bindAction)
		.on("click", "input:radio[" + CORE.BIND + "]", bindAction)
		.on("click", "input[" + CORE.CHECK_FIELD + "], button[" + CORE.CHECK_FIELD + "]", checkAction);
	$("input:checkbox[" + CORE.CHECK_FIELD + "]").each(prepareCheckReverseLinkage);
	CommonUtil.initAndDeployListener("input." + CORE.DISPLAY_ONLY + ", select." + CORE.DISPLAY_ONLY + ", textarea." + CORE.DISPLAY_ONLY, prepareDisplayOnlyContent);
	CommonUtil.initAndDeployListener("[" + CORE.DISPLAY + "]", prepareDisplayControlEvent);
	for (let initiator in displayControlInitiator) {
		let selectorString = nameSelector(initiator);
		$(selectorString).filter(":not(:checkbox):not(:radio), :checkbox:checked, :radio:checked").change();
		setTimeout(() => displayControlFirstChange = false);
	}

	function bindAction({target: dom}) {
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
			$("input:checkbox[name" + nameSet[0] + "='" + nameSet[1] + "']").prop("checked", CommonUtil.exists(dom.checked) ? dom.checked : false);
		}
	}

	function prepareCheckReverseLinkage(_, item) {
		let name = $(item).attr(CORE.CHECK_FIELD);
		if (!CommonUtil.isBlank(name)) {
			let nameSet = extractName(name);
			let selector = $("input:checkbox[name" + nameSet[0] + "='" + nameSet[1] + "']");
			let bindReverseLinkageEvent = () => {
				$(selector).on("click", function() {
					$(item).prop("checked", $(selector).filter(":checked").length === $(selector).length);
				});
			};
			bindReverseLinkageEvent()
			CommonUtil.deployNodeAppendListener(selector, bindReverseLinkageEvent);
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
			initiatorArray[field[0]] = field[1];
			if (hasBound === true) {
				continue;
			}
			let bindDisplayControlEvent = (_, eventItem) => {
				$(eventItem).on("change", function() {
					for (let impacted of displayControlInitiator[field[0]]) {
						let initiators = displayControlImpacted[impacted];
						let show = true;
						for (let initiator in initiators) {
							let initiatorSelector = $(nameSelector(initiator));
							let value = initiators[initiator];
							if ($(initiatorSelector).is("input:checkbox, input:radio")) {
								show = $(initiatorSelector).filter("[value='" + value+ "']:checked").length === 1;
							} else if ($(initiatorSelector).is("select")) {
								show = $(initiatorSelector).find("option[value='" + value + "']:selected").length === 1;
							} else if ($(initiatorSelector).is("input:text, input:hidden, textarea")) {
								show = $(initiatorSelector).val() === value;
							} else if ($(initiatorSelector).is("label, span")) {
								show = $(initiatorSelector).text() === value;
							}
							if (show === false) {
								break;
							}
						}
						let targetSelector = $("[id='" + impacted + "']");
						if (show === true) {
							$(targetSelector).show();
						} else {
							$(targetSelector).hide();
							if (displayControlFirstChange === false && CommonUtil.exists(initiators[CORE.CALLBACK_FUNCTION_NAME])) {
								eval(initiators[CORE.CALLBACK_FUNCTION_NAME] + '(\"[id=\'' + impacted + '\']\")');
							}
						}
					}
				});
			};
			CommonUtil.initAndDeployListener($(nameSelector(field[0])), bindDisplayControlEvent);
		}
	}

	function nameSelector(name) {
		return "[name='" + name + "']";
	}

	function prepareDisplayOnlyContent(_, item) {
		if ($(item).is("input:checkbox, input:radio")) {
			$(item).on("click", () => false);
			$(item).parent("label, span, div").css("cursor", 'default').css("opacity", DEFAULT_CSS.NON_SELECTABLE_OPACITY);
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
			deployNodeAppendListener: deployNodeAppendListener,
			initAndDeployListener: initAndDeployListener,
			setValue: setValue
		};
	}

}) ();
