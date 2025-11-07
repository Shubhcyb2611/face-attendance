import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export async function loadLivenessModel() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );

  return await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
    },
    runningMode: "VIDEO",
    numFaces: 1,
  });
}

// compute eye aspect ratio quickly
function ear(landmarks: any, left: boolean) {
  const idx = left
    ? [33, 160, 158, 133, 153, 144]
    : [362, 385, 387, 263, 373, 380];

  const p = idx.map(i => landmarks[i]);
  const vertical = Math.hypot(p[1].x - p[5].x, p[1].y - p[5].y);
  const horizontal = Math.hypot(p[0].x - p[3].x, p[0].y - p[3].y);

  return vertical / horizontal;
}

export async function checkBlink(faceLM: any, video: HTMLVideoElement) {
  const frames = [];
  const t0 = performance.now();

  while (performance.now() - t0 < 1500) {
    const res = faceLM.detectForVideo(video, performance.now());
    if (res.faceLandmarks && res.faceLandmarks.length > 0) {
      frames.push(res.faceLandmarks[0]);
    }
    await new Promise(r => requestAnimationFrame(r));
  }

  if (frames.length < 3) return false;

  let closed = false;
  for (let f of frames) {
    const leftEAR = ear(f, true);
    const rightEAR = ear(f, false);

    if (leftEAR < 0.18 && rightEAR < 0.18) closed = true;
  }

  return closed;
}

export async function checkHeadTurn(faceLM: any, video: HTMLVideoElement) {
  const frames = [];
  const t0 = performance.now();

  while (performance.now() - t0 < 1500) {
    const res = faceLM.detectForVideo(video, performance.now());
    if (res.faceLandmarks && res.faceLandmarks.length > 0) {
      frames.push(res.faceLandmarks[0]);
    }
    await new Promise(r => requestAnimationFrame(r));
  }

  if (frames.length < 3) return false;

  // yaw = difference between left-most and right-most landmarks
  const yawVals = frames.map(f => f[33].x - f[263].x);
  const delta = Math.max(...yawVals) - Math.min(...yawVals);

  return delta > 0.10; // head turned left/right
}
