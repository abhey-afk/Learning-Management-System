import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useEditLectureMutation,
  useGetLectureByIdQuery,
  useRemoveLectureMutation,
} from "../../../features/api/courseApi";

const MEDIA_API = "http://localhost:8080/api/v1/media";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { courseId, lectureId } = useParams();

  const { data: lectureData } = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  const [editLecture, { isLoading, isSuccess, error, data }] =
    useEditLectureMutation();
  const [removeLecture, { isLoading: removeLoading, isSuccess: removeSuccess, data: removeData }] =
    useRemoveLectureMutation();

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle || "");
      setIsFree(lecture.isPreviewFree || false);
      setUploadVideoInfo(lecture.videoInfo || null);
      setVideoUrl(lecture.videoInfo?.videoUrl || "");
    }
  }, [lecture]);

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        });

        if (res.data.success) {
          const videoInfo = {
            videoUrl: res.data.data.url,
            publicId: res.data.data.public_id,
          };
          setUploadVideoInfo(videoInfo);
          setVideoUrl(res.data.data.url);
          toast.success("Video uploaded successfully!", {
            richColors: true,
            className: "font-medium",
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Video upload failed. Please try again.", {
          richColors: true,
          className: "font-medium",
        });
      } finally {
        setMediaProgress(false);
      }
    }
  };

  const editLectureHandler = async () => {
    const finalVideoInfo = videoUrl
      ? { videoUrl, publicId: uploadVideoInfo?.publicId || "" }
      : null;

    await editLecture({
      lectureTitle,
      videoInfo: finalVideoInfo,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "Lecture updated successfully!", {
        richColors: true,
        className: "font-medium",
      });
    }
    if (error) {
      toast.error(error.data.message || "Something went wrong", {
        richColors: true,
        className: "font-medium",
      });
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message || "Lecture removed successfully", {
        richColors: true,
        className: "font-medium",
      });
    }
  }, [removeSuccess]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl mx-auto mt-12 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Lecture</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update lecture title, video and availability.
          </p>
        </div>
        <button
          onClick={removeLectureHandler}
          disabled={removeLoading}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md text-sm font-medium disabled:opacity-60 transition-colors duration-200"
        >
          {removeLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Deleting...
            </div>
          ) : (
            "Delete"
          )}
        </button>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Lecture Title */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Lecture Title
          </label>
          <input
            type="text"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="e.g. Introduction to React"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow duration-200"
          />
        </div>

        {/* Video URL */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Video URL (Optional)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste a direct video URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow duration-200"
          />
          <p className="text-sm text-gray-500 mt-1">
            Note: Uploading a video file will override the URL above.
          </p>
        </div>

        {/* Upload Input */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Upload Video File
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={fileChangeHandler}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
          />
          {mediaProgress && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {uploadProgress}%
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Uploading your video. Please wait...
              </p>
            </div>
          )}
        </div>

        {/* Video Preview */}
        {videoUrl && (
          <div>
            <label className="font-medium text-sm text-gray-700">Preview:</label>
            <video
              src={videoUrl}
              controls
              className="mt-2 w-full max-h-72 rounded-lg shadow-sm border-2 border-gray-200"
            />
          </div>
        )}

        {/* Free Preview Option */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isFree"
            checked={isFree}
            onChange={() => setIsFree(!isFree)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <label htmlFor="isFree" className="text-sm text-gray-700">
            Mark this lecture as free preview
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            onClick={editLectureHandler}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-semibold disabled:opacity-60 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Update Lecture"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LectureTab;