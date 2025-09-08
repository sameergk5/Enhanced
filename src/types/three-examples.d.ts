declare module 'three/examples/jsm/loaders/GLTFLoader' {
	import { Loader } from 'three'
	export class GLTFLoader extends Loader {
		load(
			url: string,
			onLoad: (gltf: any) => void,
			onProgress?: (event: any) => void,
			onError?: (error: unknown) => void
		): void
	}
}
