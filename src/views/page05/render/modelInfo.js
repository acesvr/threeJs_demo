const modelList = [
    {
        fileName: 'structure-window-wide.fbx',
        position: { x: 40, y: 0, z: 45 },
        scale: .1,
        rotation: { x: 0, y: 0, z: 0 },//以弧度来表示。（请参阅Euler angles- 欧拉角）
    },
    {
        fileName: 'structure-wall.fbx',
        position: { x: 25, y: 0, z: 45 },
        scale: .1,
        rotation: { x: 0, y: 0, z: 0 },
    },
    {
        fileName: 'structure-wall.fbx',
        position: { x: 15, y: 0, z: 45 },
        scale: .1,
        rotation: { x: 0, y: 0, z: 0 },
    },
    {
        fileName: 'door.fbx',
        position: { x: 20, y: 0.02, z: 49.9 },
        scale: .1,
        rotation: { x: 0, y: 0, z: 0 },
    },
    {
        fileName: 'structure-corner-inner.fbx',
        position: { x: 5, y: 0, z: 45 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    },
    {
        fileName: 'structure-window-wide.fbx',
        position: { x: 5, y: 0, z: 30 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    },
    {
        fileName: 'structure-corner-outer.fbx',
        position: { x: 5, y: 0, z: 5 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    },
    {
        fileName: 'structure-wall.fbx',
        position: { x: -15, y: 0, z: 5 },
        scale: .1,
        rotation: { x: 0, y: 0, z: 0 },
    },
    {
        fileName: 'structure-corner-inner.fbx',
        position: { x: -25, y: 0, z: 5 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    },
    {
        fileName: 'structure-window.fbx',
        position: { x: -25, y: 0, z: -5 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    },
    {
        fileName: 'structure-wall.fbx',
        position: { x: -25, y: 0, z: -15 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    }, {
        fileName: 'structure-window.fbx',
        position: { x: -25, y: 0, z: -25 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    },
    {
        fileName: 'structure-wall.fbx',
        position: { x: -25, y: 0, z: -35 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    },
    {
        fileName: 'structure-doorway-wide.fbx',
        position: { x: -25, y: 0, z: -50 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    },
    {
        fileName: 'door-wide-open.fbx',
        position: { x: -25, y: 0, z: -50 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    }, {
        fileName: 'structure-wall.fbx',
        position: { x: -25, y: 0, z: -65 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    },
    {
        fileName: 'structure-window.fbx',
        position: { x: -25, y: 0, z: -75 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    }, {
        fileName: 'structure-wall.fbx',
        position: { x: -25, y: 0, z: -85 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    }, {
        fileName: 'structure-window.fbx',
        position: { x: -25, y: 0, z: -95 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    },
    // 墙壁over↑

    {
        fileName: 'box-small.fbx',
        position: { x: 25, y: 0.02, z: -45 },
        scale: .1,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        tagText: '我是box-small'
    },
    {
        fileName: 'box-small.fbx',
        position: { x: 25, y: 0.02, z: -15 },
        scale: .2,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        tagText: '我是box-big'
    },

    // 以下是地板
    {
        fileName: 'floor-large.fbx',
        position: { x: 40, y: 0, z: 30 },
        scale: .1,
    },
    {
        fileName: 'floor-large.fbx',
        position: { x: 20, y: 0, z: 30 },
        scale: .1,
    },
    {
        fileName: 'floor-large.fbx',
        position: { x: 20, y: 0, z: 10 },
        scale: .1,
    },
    {
        fileName: 'floor-large.fbx',
        position: { x: 40, y: 0, z: 10 },
        scale: .1,
    },
    {
        fileName: 'floor-large.fbx',
        position: { x: 40, y: 0, z: -10 },
        scale: .1,
    },
    {
        fileName: 'floor-large.fbx',
        position: { x: 20, y: 0, z: -10 },
        scale: .1,
    },
    {
        fileName: 'floor-large.fbx',
        position: { x: 0, y: 0, z: -10 },
        scale: .1,
    },
    {
        fileName: 'floor.fbx',
        position: { x: -15, y: 0, z: -5 },
        scale: .1,
    },
    {
        fileName: 'floor.fbx',
        position: { x: -15, y: 0, z: -15 },
        scale: .1,
    },
    {
        fileName: 'floor.fbx',
        position: { x: -15, y: 0, z: -25 },
        scale: .1,
    }, {
        fileName: 'floor.fbx',
        position: { x: -15, y: 0, z: -35 },
        scale: .1,
    }, {
        fileName: 'floor.fbx',
        position: { x: -15, y: 0, z: -45 },
        scale: .1,
    }, {
        fileName: 'floor.fbx',
        position: { x: -15, y: 0, z: -55 },
        scale: .1,
    }, {
        fileName: 'floor.fbx',
        position: { x: -15, y: 0, z: -65 },
        scale: .1,
    }, {
        fileName: 'floor.fbx',
        position: { x: -15, y: 0, z: -75 },
        scale: .1,
    }, {
        fileName: 'floor.fbx',
        position: { x: -15, y: 0, z: -85 },
        scale: .1,
    }, {
        fileName: 'floor.fbx',
        position: { x: -15, y: 0, z: -95 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 0, y: 0, z: -30 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 20, y: 0, z: -30 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 40, y: 0, z: -30 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 0, y: 0, z: -50 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 20, y: 0, z: -50 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 40, y: 0, z: -50 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 0, y: 0, z: -70 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 20, y: 0, z: -70 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 40, y: 0, z: -70 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 0, y: 0, z: -90 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 20, y: 0, z: -90 },
        scale: .1,
    }, {
        fileName: 'floor-large.fbx',
        position: { x: 40, y: 0, z: -90 },
        scale: .1,
    },
]

export { modelList }