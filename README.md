# jquery.databind
A plugin for data binding and related auto-configuration.

CDN URL:
`https://cdn.jsdelivr.net/gh/scintilla0/jquery.databind@latest/jquery.databind.js`

CDN URL(min.js):
`https://cdn.jsdelivr.net/gh/scintilla0/jquery.databind@latest/jquery.databind.min.js`

### [Demo](https://codepen.io/scintilla_0/full/XWxyoLM)

### Change log

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
