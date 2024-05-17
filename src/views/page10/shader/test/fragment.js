export const testFragmentShader = `
    uniform vec3 uColor;
    uniform sampler2D uTexture;

    varying vec2 vUv;
    varying float vElevation; //片元着色器中获取 vElevation  用它来改变 textureColor 的 r, g, b属性
    void main() {
        gl_FragColor = vec4(0.5, 0.0, 1.0, 1);
       
        vec4 textureColor = texture2D(uTexture, vUv);
        textureColor.rgb *= vElevation * 2.0 + 0.9;
        gl_FragColor = textureColor;
    }
`