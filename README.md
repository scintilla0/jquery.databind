# jquery.databind.js
A plugin for data binding and related auto-configuration.

CDN URL:
`https://cdn.jsdelivr.net/gh/scintilla0/jquery.databind@latest/jquery.databind.js`

CDN URL(min.js):
`https://cdn.jsdelivr.net/gh/scintilla0/jquery.databind@latest/jquery.databind.min.js`

### [Demo](https://scintilla0.github.io/jquery.databind/)

### Change log

#### 1.9.5 (2024-10-11)
*	[data-display] event can be triggered by [data-bind] event's effects now.
*	Minor typo fixes.

#### 1.9.4 (2024-08-09)
*	Span elements generated on a select elements by [display-only] event now will have a [data-bind-option-text] property.

#### 1.9.3 (2024-07-31)
*	[data-display-hide-callback] event repeatedly triggered fixed.

#### 1.9.2 (2024-07-31)
*	$(selector).readonly()'s css loading method changed.

#### 1.9.1 (2024-07-11)
*	Add method $(selector).isChecked().

#### 1.9.0 (2024-06-28)
*	`IMPORTANT` Change method name from ~~$(selector).readonlyCheckable()~~ to $(selector).readonly().
*	`IMPORTANT` Change the class name added by $(selector).readonly() from ~~"readonly-checkable-item"~~ to "readonly-item".
*	Logic of $(selector).readonly()'s preventing checkbox/radio click action changed.
*	$(selector).readonly() now can simply add property [readonly] to plain input and textarea elements.
*	$(selector).readonly() now supports default Chrome/Firefox disabled style for checkbox, radio and select elements.
*	Add method $(selector).removeReadonly() to remove $(selector).readonly()'s effects.

#### 1.8.3 (2024-06-25)
*	$(selector).readonlyCheckable() now supports select elements.
*	$(selector).readonlyCheckable() supports bootstrap css style for select elements, other elements will be fulfilled in later version.
*	$(selector).readonlyCheckable() now adds a class "readonly-checkable-item" for customized styles.

#### 1.8.2 (2024-06-23)
*	Use ES6 template strings.
*	Minor Optimization.

#### 1.8.1 (2024-06-12)
*	[data-unchecked-value] event preferentially generates checkbox under form element.

#### 1.8.0 (2024-06-11)
*	Add event [data-enable]/[data-disable] to do the similar as [data-display]/[data-hide].
*	Add event [data-unchecked-value] to offer a default value when an unchecked checkbox element is submitted.
*	[data-bind] event now can be initiated by checkbox elements, but only when with [data-bind-checkbox-text] property.

#### 1.7.2 (2024-04-22)
*	[data-bind-option-text] now can be assigned to a specified element property.
*	[data-bind] not working when multiple elements using [data-bind-option-text] fixed.
*	Some elements not cleared when value is empty in [data-bind] event fixed.

#### 1.7.1 (2024-04-22)
*	[data-display] event on checkbox and radio elements not triggered when no item selected fixed.

#### 1.7.0 (2024-03-11)
*	Add event [data-hide] to do the opposite of [data-display].

#### 1.6.29 (2024-03-11)
*	Span elements generated by [display-only] affected by XSS fixed.

#### 1.6.28 (2024-03-04)
*	Span elements generated by [display-only] not displaying line break fixed.

#### 1.6.27 (2024-02-04)
*	Malfunction of property [disabled] of the elements impacted by [data-display] event fixed.

#### 1.6.26 (2024-02-01)
*	Add $(selector).modify() and $(selector).increase() to quickly modify the value or text of the target element.
*	$(selector).boolean() now permits only one element selected.

#### 1.6.25 (2024-01-30)
*	[data-display] event unable to listen to the newly added elements due to a wrong modification fixed.
*	[data-display] event not triggered when target dom's id contains "." or other special characters that can be used for jquery selectors fixed.

#### 1.6.24 (2024-01-28)
*	Minor optimization.

#### 1.6.23 (2024-01-27)
*	Minor optimization.

#### 1.6.22 (2024-01-27)
*	Changing status triggers every single [data-display] event fixed.

#### 1.6.21 (2024-01-22)
*	Add $(selector).isEmpty() and $.isEmpty() to evaluate whether parameter or the value of the target dom is undefined, null or blank.
*	Prevent elements being re-enabled if they are not disabled by [data-display] event.

#### 1.6.20 (2024-01-09)
*	Add $(selector).boolean() to evaluate the boolean value of an element.

#### 1.6.19 (2024-01-05)
*	Add $(selector).readonlyCheckable() to make checkbox or radio elements readonly if they are unmodifiable.

#### 1.6.18 (2023-12-15)
*	[data-display] now binds event on $(document) instead of the very elements.

#### 1.6.17 (2023-12-12)
*	[data-display] event not triggered when assigned an empty value for checkbox elements fixed.

#### 1.6.16 (2023-12-07)
*	[data-check-field] event now can be chained-triggered.
*	[data-check-field]'s reverse event now can only be triggered by change action.

#### 1.6.15 (2023-12-06)
*	[data-display] event now disables all elements when hidden.

#### 1.6.14 (2023-12-05)
*	[data-display-hide-callback] event not working properly fixed.

#### 1.6.13 (2023-12-05)
*	[data-display] event not working properly with [data-display-hide-callback] assigned fixed.

#### 1.6.12 (2023-12-04)
*	[data-display] event can accept multiple target values.

#### 1.6.11 (2023-11-21)
*	Add initial refresh for [data-bind] elements.

#### 1.6.10 (2023-07-14)
*	Add support for jQuery's no Conflict mode. (Contributor: [Squibler](https://github.com/Squibler))
*	Add [data-bind] event for textarea elements. (Contributor: [Squibler](https://github.com/Squibler))

#### 1.6.9 (2023-06-09)
*	Prevent initialization of "display-only" items in hidden templates which are wrapped by a hidden [id*='emplate'] element.

#### 1.6.8 (2023-05-29)
*	Rollback the modification in 1.6.7 and add a new class to achieve the purpose instead.

#### 1.6.7 (2023-05-25)
*	Remove class "display-only" after ready to prevent re-triggering the appending event while using other plug-ins such as tablesorter.js.

#### 1.6.6 (2023-05-23)
*	[data-bind] event initiated by [data-bind-option-text] elements now evaluates its value as option text whether selects and options exist or not.
*	Minor optimization.

#### 1.6.5 (2023-05-21)
*	Repeated binding of [data-display] event when multiple elements are bound to a same field fixed.

#### 1.6.4 (2023-05-21)
*	Button elements with no attribute [checked] unable to uncheck fixed.

#### 1.6.3 (2023-05-21)
*	[data-bind] event can be initiated by radio elements now.

#### 1.6.2 (2023-05-21)
*	Remove unused exports of the internal utils.

#### 1.6.1 (2023-05-18)
*	Initial release
