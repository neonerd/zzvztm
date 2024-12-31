
export class UI {
	rootEl: HTMLElement

	constructor (rootDivId = 'app') {
		const el = document.getElementById(rootDivId)
		if (!el) {
			throw new Error('Could not find root UI element.')
		}

		this.rootEl = el
		this.rootEl.style.width = '100vw'
		this.rootEl.style.height = '100vh'
	}
}
