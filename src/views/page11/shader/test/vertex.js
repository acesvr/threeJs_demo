export const testVertexShader = `
    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_Position.xyz = vec3(gl_Position.y, gl_Position.x, -gl_Position.z);
    }
`