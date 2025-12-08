console.log('=== EDITOR | ZVLASTNA ZBIERKA VECI Z TVOJHO MESTA')
console.log('=== (c) Andrej Sykora 2024 - 2025')
console.log('=== EDITOR | ZVLASTNA ZBIERKA VECI Z TVOJHO MESTA')

import { createApp, ref, reactive, onMounted } from 'vue'
import type { ArtifactDefinition } from './model/ArtifactDefinition'
import type { PossibilityDefinition } from './model/PossibilityDefinition'

const API_BASE = 'http://localhost:3001/api'

interface EditorState {
	activeTab: 'artifacts' | 'possibilities'
	artifacts: ArtifactDefinition[]
	possibilities: PossibilityDefinition[]
	editingArtifact: ArtifactDefinition | null
	editingPossibility: PossibilityDefinition | null
	saving: boolean
	loading: boolean
	lastSaved: string | null
}

const app = createApp({
	setup() {
		const state = reactive<EditorState>({
			activeTab: 'artifacts',
			artifacts: [],
			possibilities: [],
			editingArtifact: null,
			editingPossibility: null,
			saving: false,
			loading: true,
			lastSaved: null
		})

		const newArtifactId = ref('')
		const newArtifactName = ref('')
		const newArtifactDescription = ref('')
		const newPossibilityId = ref('')
		const newPossibilityName = ref('')
		const newPossibilityDescription = ref('')

		// Track original ID when editing (in case ID changes)
		const editingArtifactOriginalId = ref<string | null>(null)
		const editingPossibilityOriginalId = ref<string | null>(null)

		// API calls
		async function loadData() {
			state.loading = true
			try {
				const [artifactsRes, possibilitiesRes] = await Promise.all([
					fetch(`${API_BASE}/artifacts`),
					fetch(`${API_BASE}/possibilities`)
				])
				const artifacts = await artifactsRes.json()
				const possibilities = await possibilitiesRes.json()

				state.artifacts = artifacts.map((a: any, i: number) => ({
					id: a.id || `artifact-${i}`,
					name: a.name,
					description: a.description,
					possibilities: a.possibilities || []
				}))
				state.possibilities = possibilities
			} catch (err) {
				console.error('Failed to load data:', err)
			} finally {
				state.loading = false
			}
		}

		async function saveArtifacts() {
			state.saving = true
			try {
				const dataToSave = state.artifacts.map(a => ({
					id: a.id,
					name: a.name,
					description: a.description,
					possibilities: a.possibilities
				}))
				await fetch(`${API_BASE}/artifacts`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(dataToSave)
				})
				state.lastSaved = new Date().toLocaleTimeString()
			} catch (err) {
				console.error('Failed to save artifacts:', err)
			} finally {
				state.saving = false
			}
		}

		async function savePossibilitiesData() {
			state.saving = true
			try {
				await fetch(`${API_BASE}/possibilities`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(state.possibilities)
				})
				state.lastSaved = new Date().toLocaleTimeString()
			} catch (err) {
				console.error('Failed to save possibilities:', err)
			} finally {
				state.saving = false
			}
		}

		// Artifact CRUD
		async function addArtifact() {
			if (!newArtifactName.value.trim()) return
			const id = newArtifactId.value.trim() || `artifact-${Date.now()}`
			state.artifacts.push({
				id,
				name: newArtifactName.value,
				description: newArtifactDescription.value,
				possibilities: []
			})
			newArtifactId.value = ''
			newArtifactName.value = ''
			newArtifactDescription.value = ''
			await saveArtifacts()
		}

		function editArtifact(artifact: ArtifactDefinition) {
			editingArtifactOriginalId.value = artifact.id
			state.editingArtifact = { ...artifact, possibilities: [...(artifact.possibilities || [])] }
		}

		async function saveArtifact() {
			if (!state.editingArtifact || !editingArtifactOriginalId.value) return
			const index = state.artifacts.findIndex(a => a.id === editingArtifactOriginalId.value)
			if (index !== -1) {
				state.artifacts[index] = state.editingArtifact
			}
			state.editingArtifact = null
			editingArtifactOriginalId.value = null
			await saveArtifacts()
		}

		function cancelEditArtifact() {
			state.editingArtifact = null
		}

		async function deleteArtifact(id: string) {
			state.artifacts = state.artifacts.filter(a => a.id !== id)
			await saveArtifacts()
		}

		function addPossibilityToArtifact() {
			if (!state.editingArtifact) return
			if (!state.editingArtifact.possibilities) {
				state.editingArtifact.possibilities = []
			}
			state.editingArtifact.possibilities.push({
				count: 1,
				possibility: state.possibilities[0]?.id || ''
			})
		}

		function removePossibilityFromArtifact(index: number) {
			if (!state.editingArtifact?.possibilities) return
			state.editingArtifact.possibilities.splice(index, 1)
		}

		// Possibility CRUD
		async function addPossibility() {
			if (!newPossibilityName.value.trim()) return
			const id = newPossibilityId.value.trim() || newPossibilityName.value.toLowerCase().replace(/\s+/g, '-')
			state.possibilities.push({
				id,
				name: newPossibilityName.value,
				description: newPossibilityDescription.value
			})
			newPossibilityId.value = ''
			newPossibilityName.value = ''
			newPossibilityDescription.value = ''
			await savePossibilitiesData()
		}

		function editPossibility(possibility: PossibilityDefinition) {
			editingPossibilityOriginalId.value = possibility.id
			state.editingPossibility = { ...possibility }
		}

		async function savePossibility() {
			if (!state.editingPossibility || !editingPossibilityOriginalId.value) return
			const index = state.possibilities.findIndex(p => p.id === editingPossibilityOriginalId.value)
			if (index !== -1) {
				state.possibilities[index] = state.editingPossibility
			}
			state.editingPossibility = null
			editingPossibilityOriginalId.value = null
			await savePossibilitiesData()
		}

		function cancelEditPossibility() {
			state.editingPossibility = null
		}

		async function deletePossibility(id: string) {
			state.possibilities = state.possibilities.filter(p => p.id !== id)
			await savePossibilitiesData()
		}

		onMounted(() => {
			loadData()
		})

		return {
			state,
			newArtifactId,
			newArtifactName,
			newArtifactDescription,
			newPossibilityId,
			newPossibilityName,
			newPossibilityDescription,
			addArtifact,
			editArtifact,
			saveArtifact,
			cancelEditArtifact,
			deleteArtifact,
			addPossibilityToArtifact,
			removePossibilityFromArtifact,
			addPossibility,
			editPossibility,
			savePossibility,
			cancelEditPossibility,
			deletePossibility
		}
	},
	template: `
		<div class="max-w-6xl mx-auto p-6">
			<div class="flex justify-between items-center mb-6">
				<h1 class="text-3xl font-bold text-gray-800">Zvláštna zbierka - Editor</h1>
				<div class="text-sm text-gray-500">
					<span v-if="state.saving" class="text-yellow-600">Saving...</span>
					<span v-else-if="state.lastSaved" class="text-green-600">Saved at {{ state.lastSaved }}</span>
				</div>
			</div>

			<!-- Loading -->
			<div v-if="state.loading" class="text-center py-12">
				<div class="text-gray-500">Loading...</div>
			</div>

			<template v-else>
				<!-- Tabs -->
				<div class="flex space-x-4 mb-6">
					<button
						@click="state.activeTab = 'artifacts'"
						:class="state.activeTab === 'artifacts' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
						class="px-4 py-2 rounded-lg font-medium transition-colors">
						Artifacts
					</button>
					<button
						@click="state.activeTab = 'possibilities'"
						:class="state.activeTab === 'possibilities' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
						class="px-4 py-2 rounded-lg font-medium transition-colors">
						Possibilities
					</button>
				</div>

				<!-- Artifacts Tab -->
				<div v-if="state.activeTab === 'artifacts'" class="space-y-6">
					<!-- Add Artifact Form -->
					<div class="bg-white rounded-lg shadow p-6">
						<h2 class="text-xl font-semibold mb-4">Add New Artifact</h2>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<input
								v-model="newArtifactId"
								type="text"
								placeholder="ID (optional)"
								class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
							<input
								v-model="newArtifactName"
								type="text"
								placeholder="Name"
								class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
							<input
								v-model="newArtifactDescription"
								type="text"
								placeholder="Description"
								class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
						</div>
						<button
							@click="addArtifact"
							:disabled="state.saving"
							class="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
							Add Artifact
						</button>
					</div>

					<!-- Edit Artifact Modal -->
					<div v-if="state.editingArtifact" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
							<h2 class="text-xl font-semibold mb-4">Edit Artifact</h2>
							<div class="space-y-4">
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">ID</label>
									<input
										v-model="state.editingArtifact.id"
										type="text"
										class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 font-mono text-sm">
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
									<input
										v-model="state.editingArtifact.name"
										type="text"
										class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
									<textarea
										v-model="state.editingArtifact.description"
										rows="3"
										class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-2">Possibilities</label>
									<div v-for="(poss, index) in state.editingArtifact.possibilities" :key="index" class="flex items-center space-x-2 mb-2">
										<select v-model="poss.possibility" class="border rounded px-2 py-1">
											<option v-for="p in state.possibilities" :key="p.id" :value="p.id">{{ p.name }}</option>
										</select>
										<input v-model.number="poss.count" type="number" min="1" class="border rounded px-2 py-1 w-20">
										<button @click="removePossibilityFromArtifact(index)" class="text-red-600 hover:text-red-800">✕</button>
									</div>
									<button @click="addPossibilityToArtifact" class="text-blue-600 hover:text-blue-800 text-sm">+ Add Possibility</button>
								</div>
							</div>
							<div class="flex justify-end space-x-2 mt-6">
								<button @click="cancelEditArtifact" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
								<button @click="saveArtifact" :disabled="state.saving" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
							</div>
						</div>
					</div>

					<!-- Artifacts List -->
					<div class="bg-white rounded-lg shadow">
						<div class="flex justify-between items-center p-4 border-b">
							<h2 class="text-xl font-semibold">Artifacts ({{ state.artifacts.length }})</h2>
						</div>
						<div class="divide-y">
							<div v-for="artifact in state.artifacts" :key="artifact.id" class="p-4 hover:bg-gray-50">
								<div class="flex justify-between items-start">
									<div class="flex-1">
										<h3 class="font-medium text-gray-900">{{ artifact.name }}</h3>
										<p class="text-gray-400 text-xs font-mono">{{ artifact.id }}</p>
										<p class="text-gray-600 text-sm mt-1">{{ artifact.description }}</p>
										<div v-if="artifact.possibilities?.length" class="mt-2 flex flex-wrap gap-1">
											<span v-for="poss in artifact.possibilities" :key="poss.possibility"
												class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
												{{ poss.possibility }} ({{ poss.count }})
											</span>
										</div>
									</div>
									<div class="flex space-x-2 ml-4">
										<button @click="editArtifact(artifact)" class="text-blue-600 hover:text-blue-800">Edit</button>
										<button @click="deleteArtifact(artifact.id)" class="text-red-600 hover:text-red-800">Delete</button>
									</div>
								</div>
							</div>
							<div v-if="state.artifacts.length === 0" class="p-8 text-center text-gray-500">
								No artifacts yet. Add one above!
							</div>
						</div>
					</div>
				</div>

				<!-- Possibilities Tab -->
				<div v-if="state.activeTab === 'possibilities'" class="space-y-6">
					<!-- Add Possibility Form -->
					<div class="bg-white rounded-lg shadow p-6">
						<h2 class="text-xl font-semibold mb-4">Add New Possibility</h2>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<input
								v-model="newPossibilityId"
								type="text"
								placeholder="ID (optional)"
								class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
							<input
								v-model="newPossibilityName"
								type="text"
								placeholder="Name"
								class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
							<input
								v-model="newPossibilityDescription"
								type="text"
								placeholder="Description"
								class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
						</div>
						<button
							@click="addPossibility"
							:disabled="state.saving"
							class="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
							Add Possibility
						</button>
					</div>

					<!-- Edit Possibility Modal -->
					<div v-if="state.editingPossibility" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
							<h2 class="text-xl font-semibold mb-4">Edit Possibility</h2>
							<div class="space-y-4">
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">ID</label>
									<input
										v-model="state.editingPossibility.id"
										type="text"
										class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 font-mono text-sm">
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
									<input
										v-model="state.editingPossibility.name"
										type="text"
										class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
									<input
										v-model="state.editingPossibility.description"
										type="text"
										class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
								</div>
							</div>
							<div class="flex justify-end space-x-2 mt-6">
								<button @click="cancelEditPossibility" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
								<button @click="savePossibility" :disabled="state.saving" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
							</div>
						</div>
					</div>

					<!-- Possibilities List -->
					<div class="bg-white rounded-lg shadow">
						<div class="flex justify-between items-center p-4 border-b">
							<h2 class="text-xl font-semibold">Possibilities ({{ state.possibilities.length }})</h2>
						</div>
						<div class="divide-y">
							<div v-for="possibility in state.possibilities" :key="possibility.id" class="p-4 hover:bg-gray-50">
								<div class="flex justify-between items-center">
									<div>
										<h3 class="font-medium text-gray-900">{{ possibility.name }}</h3>
										<p v-if="possibility.description" class="text-gray-600 text-sm">{{ possibility.description }}</p>
										<p class="text-gray-400 text-xs mt-1">ID: {{ possibility.id }}</p>
									</div>
									<div class="flex space-x-2">
										<button @click="editPossibility(possibility)" class="text-blue-600 hover:text-blue-800">Edit</button>
										<button @click="deletePossibility(possibility.id)" class="text-red-600 hover:text-red-800">Delete</button>
									</div>
								</div>
							</div>
							<div v-if="state.possibilities.length === 0" class="p-8 text-center text-gray-500">
								No possibilities yet. Add one above!
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>
	`
})

app.mount('#editor')
