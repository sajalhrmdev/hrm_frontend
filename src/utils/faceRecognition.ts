import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

let detector: any = null;

export const loadFaceDetector = async () => {
  if (detector) return detector;

  detector = await faceLandmarksDetection.createDetector(
    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
    {
      runtime: "mediapipe",
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
      refineLandmarks: false,
    },
  );

  return detector;
};

export const generateEmbedding = async (video: HTMLVideoElement) => {
  const detector = await loadFaceDetector();

  const faces = await detector.estimateFaces(video);

  if (!faces.length) {
    throw new Error("No face detected");
  }

  if (faces.length > 1) {
    throw new Error("Multiple faces detected");
  }

  const embedding = faces[0].keypoints.flatMap((point: any) => [
    point.x,
    point.y,
    point.z || 0,
  ]);

  return embedding;
};
