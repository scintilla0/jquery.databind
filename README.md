# jquery.databind.js
A plugin for data binding and related auto-configuration.

CDN URL:
`https://cdn.jsdelivr.net/gh/scintilla0/jquery.databind@latest/jquery.databind.js`

CDN URL(min.js):
`https://cdn.jsdelivr.net/gh/scintilla0/jquery.databind@latest/jquery.databind.min.js`

### [Demo](https://codepen.io/scintilla_0/full/XWxyoLM)

### Change log

#### 1.6.25 (2024-01-30)
*	[data-display] event cannot listen to the newly added elements due to a wrong modification fixed.
*	[data-display] event cannot be triggered when target dom's id contains "." or other special characters that can be used for jquery selectors fixed.

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
*	[data-display] now bind event on $(document) instead of the very elements.

#### 1.6.17 (2023-12-12)
*	[data-display] event cannot be triggered when assigned an empty value for checkbox elements fixed.

#### 1.6.16 (2023-12-07)
*	[data-check-field] event now can be chained-triggered.
*	[data-check-field]'s reverse event now can only be triggered by change action.

#### 1.6.15 (2023-12-06)
*	[data-display] event now disabled all elements when hidden.

#### 1.6.14 (2023-12-05)
*	[data-display-hide-callback] event not work properly fixed.

#### 1.6.13 (2023-12-05)
*	[data-display] event not work properly with [data-display-hide-callback] assigned fixed.

#### 1.6.12 (2023-12-04)
*	[data-display] event can accept multiple target values.

#### 1.6.11 (2023-11-21)
*	Add initial refresh for [data-bind] elements.

#### 1.6.10 (2023-07-14)
*	Add support for jQuery's no Conflict mode. (Contributor: [Squibler](https://github.com/Squibler))
*	Add [data-bind] event for textarea elements. (Contributor: [Squibler](https://github.com/Squibler))

#### 1.6.9 (2023-06-09)
*	Prevent initialization of "display-only" items in hidden templates which is wrapped by a hidden [id*='emplate'] element.

#### 1.6.8 (2023-05-29)
*	Rollback the modification in 1.6.7 and add a new class to achieve the purpose instead.

#### 1.6.7 (2023-05-25)
*	Remove class "display-only" after ready to prevent re-triggering the appending event while using other plug-ins such as tablesorter.js.

#### 1.6.6 (2023-05-23)
*	[data-bind] event initiated by a [data-bind-option-text] element now evaluates its value as option text whether selects and options exist or not.
*	Minor optimization.

#### 1.6.5 (2023-05-21)
*	Repeated binding of [data-display] event when multiple elements is bound to a same field fixed.

#### 1.6.4 (2023-05-21)
*	Button with no attribute [checked] unable to uncheck fixed.

#### 1.6.3 (2023-05-21)
*	[data-bind] event can be initiated by radio elements now.

#### 1.6.2 (2023-05-21)
*	Remove unused exports of the internal util.

#### 1.6.1 (2023-05-18)
*	Initial release
