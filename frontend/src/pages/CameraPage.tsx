import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:8000"; // Backend URL

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [staffId, setStaffId] = useState("");
    const [staffName, setStaffName] = useState(""); 

  // Start camera
  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setError("Camera access denied");
      }
    };

    startCam();
  }, []);

  // Capture image frame
  const captureFrame = (): Blob | null => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Mirror
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/jpeg");
    const byteString = atob(dataURL.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: "image/jpeg" });
  };

  // Enroll staff
  const handleEnroll = async () => {
    if (!staffId.trim()) return toast.error("Enter staff ID");
    if (!staffName.trim()) return toast.error("Enter Staff Name");
    
    const imgBlob = captureFrame();
    if (!imgBlob) return toast.error("Camera not ready");

    const fd = new FormData();
    fd.append("staffId", staffId);
    fd.append("staffName", staffName); // ✅ NEW
    fd.append("files", imgBlob, "face.jpg");

    toast.loading("Enrolling...");

    try {
      const res = await fetch(`${API_BASE}/enroll`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      toast.dismiss();

      if (json.success) {
        toast.success(`${staffName} with staff Id ${staffId} enrolled successfully`);
      } else {
        toast.error(json.error || "Enroll failed");
      }
    } catch {
      toast.dismiss();
      toast.error("API error");
    }
  };

  // Recognize staff
  const handleRecognize = async () => {
    const imgBlob = captureFrame();
    if (!imgBlob) return toast.error("Camera not ready");

    const fd = new FormData();
    fd.append("file", imgBlob, "probe.jpg");

    toast.loading("Recognizing...");

    try {
      const res = await fetch(`${API_BASE}/recognize`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      toast.dismiss();

      if (json.success) {
        toast.success(`Welcome ${json.name} with staffId ${json.staffId} (Score ${json.score})`);
      } else {
        toast.error(json.msg || "Face not recognized");
      }
    } catch {
      toast.dismiss();
      toast.error("API error");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-100">
      <nav className="w-full bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Face Attendance</h1>
      </nav>

      <div className="flex-1 flex justify-center items-start mt-8 px-4 pb-12">
        <div className="w-full max-w-md">
          {/* Camera Preview */}
          <div className="relative w-full pb-[75%] bg-black rounded-xl overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"
            />
          </div>

          {error && (
            <p className="text-red-600 text-center mt-3 text-sm">{error}</p>
          )}

          {/* Staff ID Field */}
          <input
            type="text"
            placeholder="Enter Staff ID"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full mt-6 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          {/* ✅ Staff Name Input */}
          <input
            type="text"
            placeholder="Enter Staff Name"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            className="w-full mt-6 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleEnroll}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Enroll
            </button>

            <button
              onClick={handleRecognize}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Recognize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
