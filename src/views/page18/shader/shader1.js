export const testVertexShader = `
    varying vec2 vUv;
    void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
export const testFragmentShader = `
    varying vec2 vUv;
    uniform float iTime;  // 时间
    uniform vec3 iResolution; // 分辨率

    float circle(in vec2 uv, in float radius, in float thickness){
        float len = length(uv) - radius;
        return 1.0 - smoothstep(thickness/2.0, thickness, abs(len));
    }

    mat2 rotate2d(float angle){
        return mat2(cos(angle), - sin(angle),sin(angle), cos(angle));
    }

    float vertical_line(in vec2 uv){
        if (uv.y > 0.0 && length(uv) < 1.2){
            float theta = mod(180.0 * atan(uv.y, uv.x)/3.14, 360.0);
            float gradient = clamp(1.0-theta/90.0,0.0,1.0);
            return 0.5 * gradient;
        }
        return 0.0;
    }

    void main() {
        vec2 uv = vUv -0.5;
        // 扩大坐标系 现在整个uv的 xy在0-3之间来变化来
        uv*=3.;
        
        vec3 color = vec3(0.0);
        vec3 circle_color = vec3(0.541,0.749,0.839);
        
        color = mix(color, circle_color + 0.2, circle(uv, 1.2, 0.01));
        color = mix(color, circle_color, circle(uv, 0.8, 0.01));
        color = mix(color, circle_color, circle(uv, 0.4, 0.01));
        color = mix(color, circle_color, circle(uv, 0.05, 0.01));
        
        mat2 rotation_matrix = rotate2d(- iTime);
        
        color = mix(color, circle_color, vertical_line(rotation_matrix * uv));
        gl_FragColor = vec4(color, 0.3);
    }
`;
