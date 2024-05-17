

export const testVertexShader = `
    uniform vec2 uFrequency;

    uniform float uTime;

    varying vec2 vUv; //需要通过 varying 发送到片元着色器
    varying float vElevation; //顶点着色器中，把风的高程存储 elevation 变量中，然后通过 varying 发送到片元着色器
    
    void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
        modelPosition.z += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;

        float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
        elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;
        modelPosition.z += elevation;


        vElevation = elevation;
        vUv = uv;
    }
`