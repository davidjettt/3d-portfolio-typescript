export interface ISizes {
    width: number,
    height: number
}


export interface IPoints {
    vertices: number[],
    colors: number[]

}

export interface IObject {
    mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>,
    update: () => any
}
