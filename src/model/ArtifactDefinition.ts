import { ArtifactPossibility } from './PossibilityDefinition'

export interface ArtifactDefinition {
	id: string
	name: string
	description: string
	possibilities?: ArtifactPossibility[]
}
