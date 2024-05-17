import * as THREE from 'three';
import { track } from './track';

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setClearColor(0x020512, 0); //bgcolor#FFFACD
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1; //曝光


renderer.outputcolorspace = THREE.sRGBEncoding;







export { renderer }