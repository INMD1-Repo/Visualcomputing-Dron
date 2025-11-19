// This file contains the timeline data for the drone show.

// DRONE_SHOW_JSON is an object that contains the data for the drone show.
export const DRONE_SHOW_JSON = {
    title: "PyeongChang Tribute",
    layers: [
      { id: "layer_01_standby", name: "이륙 대기", type: "grid", duration: 3000 },
      { id: "layer_02_rings", name: "오륜기 형상", type: "rings", duration: 5000 },
      { id: "layer_03_sphere", name: "지구본 회전", type: "sphere", duration: 5000 },
      { id: "layer_04_helix", name: "DNA 나선", type: "helix", duration: 5000 }
    ]
  };