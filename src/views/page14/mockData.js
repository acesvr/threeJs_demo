export const mockData = [
  {
    name: "1柱", //groupName
    vertex: [
      [0, 1, 0],
      [0, -1, 0],
      [0, -4, 0],
    ],
    childer: [
      {
        name: "1柱-1段",
        height: 2,
        position: { x: 0, y: 0, z: 0 },
        color: 0xffff00,
        remark: "土层",
        topV: { x: 0, y: 1, z: 0 }, //顶尖的顶点数据 xz不变，y值 = position.y + (height/2)
        bottomV: { x: 0, y: -1, z: 0 }, //底部的顶点数据 xz不变，y值 = position.y - (height/2)
      },
      {
        name: "1柱-2段",
        height: 3,
        position: { x: 0, y: -2.5, z: 0 }, //第2段的 position.y = 0 - 上1段position.y / 2 - 当前段 position.y / 2
        color: 0xff0000,
        remark: "煤层",
      },
    ],
  },
  {
    name: "2柱",
    vertex: [
      [10, 1.5, 4.0],
      [10, 0.5, 4.0],
      [10, -4.5, 4.0],
    ],
    childer: [
      {
        name: "2柱-1段",
        height: 1.0,
        position: { x: 10.0, y: 1.0, z: 4.0 },
        color: 0xffff00,
        remark: "土层",
      },
      {
        name: "2柱-2段",
        height: 5.0,
        position: { x: 10.0, y: -2.0, z: 4.0 },
        color: 0xff0000,
        remark: "煤层",
      },
    ],
  },
  {
    name: "3柱",
    vertex: [
      [10.0, 1.5, 14.0],
      [10.0, 0.5, 14.0],
      [10.0, -0.5, 14.0],
    ],

    childer: [
      {
        name: "3柱-1段",
        height: 1.0,
        position: { x: 10.0, y: 1.0, z: 14.0 },
        color: 0xffff00,
        remark: "土层",
      },
      {
        name: "3柱-2段",
        height: 1.0,
        position: { x: 10, y: 0, z: 14.0 },
        color: 0xff0000,
        remark: "煤层",
      },
      {
        name: "3柱-3段",
        height: 3.0,
        position: { x: 10.0, y: -2.0, z: 14.0 },
        color: 0xff00ff,
        remark: "煤层",
      },
    ],
  },
  {
    name: "4柱",
    vertex: [
      [8, 1.5, 18.0],
      [8, 0.5, 18.0],
      [8, -0.5, 18.0],
    ],

    childer: [
      {
        name: "4柱-1段",
        height: 1.0,
        position: { x: 8, y: 1.0, z: 18.0 },
        color: 0xffff00,
        remark: "土层",
      },
      {
        name: "4柱-2段",
        height: 1.0,
        position: { x: 8, y: 0, z: 18 },
        color: 0xff0000,
        remark: "煤层",
      },
      {
        name: "4柱-3段",
        height: 3.0,
        position: { x: 8, y: -2.0, z: 18 },
        color: 0xff00ff,
        remark: "煤层",
      },
    ],
  },
];

export const vertices = [];

export var face = [
  {
    name: "第一层面",
    color: 0xffff00,
    data: [
      // 第1个点
      0, 1, 0,
      // 第2个点
      10, 1.5, 4,
      // 第3个点
      10, 1.5, 14,
    ],
  },
  {
    name: "第二层面",
    color: 0xff0000,
    data: [
      // 第1个点
      0, -1, 0,
      // 第2个点
      10, 0.5, 4,
      // 第3个点
      10, 0.5, 14,

      8, 0.5, 18,
    ],
    faceIndex: [0, 1, 2, 0, 2, 3],
  },
  {
    name: "第三层面",
    color: 0xffffff,
    data: [
      // 第1个点
      0, -4, 0,
      // 第2个点
      10, -4.5, 4,
      // 第3个点
      10, -0.5, 14,

      8, -0.5, 18,
    ],
    faceIndex: [0, 1, 2, 0, 2, 3],
  },
];
