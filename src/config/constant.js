// 着色器配置
export const vertexShader = '\t\t\tvarying vec2 vUv;\n' +
    '\n' +
    '\t\t\tvoid main() {\n' +
    '\n' +
    '\t\t\t\tvUv = uv;\n' +
    '\n' +
    '\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
    '\n' +
    '\t\t\t}'

//着色器配置
export const fragmentShader = '\t\t\tuniform sampler2D baseTexture;\n' +
    '\t\t\tuniform sampler2D bloomTexture;\n' +
    '\n' +
    '\t\t\tvarying vec2 vUv;\n' +
    '\n' +
    '\t\t\tvoid main() {\n' +
    '\n' +
    '\t\t\t\tgl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );\n' +
    '\n' +
    '\t\t\t}'



// 材质类型列表
export const meshTypeList = [
    // {
    //     value: 'MeshBasicMaterial',
    //     label: '基础网格材质',
    //     color: true,
    //     wireframe: true,
    //     depthWrite: true,
    //     opacity: true,
    // },
    // {
    //     value: 'MeshLambertMaterial',
    //     label: 'Lambert网格材质',
    //     color: true,
    //     wireframe: true,
    //     depthWrite: true,
    //     opacity: true,
    // },
    {
        value: 'MeshMatcapMaterial',
        label: 'MeshMatcap材质',
        color: true,
        wireframe: false,
        depthWrite: true,
        opacity: true,
    },
    {
        value: 'MeshPhongMaterial',
        label: 'Phong网格材质',
        remark: '一种用于具有镜面高光的光泽表面的材质。'
    },
    {
        value: 'MeshPhysicalMaterial',
        label: '物理--网格材质',
        color: true,
        wireframe: true,
        depthWrite: true,
        opacity: true,
    },
    {
        value: 'MeshStandardMaterial',
        label: '标准--网格材质',
        opacity: true,
        color: true,
    },
    // {
    //     value: 'MeshToonMaterial',
    //     label: '卡通着色的材质',
    //     color: true,
    //     wireframe: true,
    //     depthWrite: true,
    //     opacity: true,
    // },
]
// 材质类型列表
export const meshSideList = [
    {
        value: 0,
        label: '背面',
    }, {
        value: 1,
        label: '前面',
    }, {
        value: 2,
        label: '双面',
    },
]