"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createGuestbookPost } from "@/lib/supabase/guestbook";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { ImageType } from "@/types/guestbook";
import { DrawingCanvas } from "./DrawingCanvas";

export function GuestbookForm() {
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [imageType, setImageType] = useState<ImageType>("upload");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [drawingBlob, setDrawingBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!uploadFile) {
      setUploadPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(uploadFile);
    setUploadPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [uploadFile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    const selectedImage = imageType === "upload" ? uploadFile : drawingBlob;
    if (!authorName.trim() || !message.trim() || !selectedImage) {
      setError("이름, 메시지, 이미지 또는 그림을 모두 입력해 주세요.");
      return;
    }

    if (!isSupabaseConfigured) {
      setError("Supabase 환경 변수를 먼저 설정해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createGuestbookPost({
        authorName,
        message,
        imageFile: selectedImage,
        imageType,
        fileExtension: uploadFile?.name.split(".").pop()
      });
      setAuthorName("");
      setMessage("");
      setUploadFile(null);
      setDrawingBlob(null);
      setStatus("방명록이 등록되었습니다. 보드에서 새 포스트잇을 확인해 보세요.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "방명록 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="guestbook-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          이름
          <input
            value={authorName}
            maxLength={40}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="예: 민지"
            required
          />
        </label>
        <label>
          메시지
          <textarea
            value={message}
            maxLength={240}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="오늘의 추억을 짧게 남겨 주세요."
            required
          />
        </label>
      </div>

      <fieldset className="image-mode">
        <legend>이미지 입력 방식</legend>
        <label>
          <input
            type="radio"
            name="imageType"
            checked={imageType === "upload"}
            onChange={() => setImageType("upload")}
          />
          사진 업로드
        </label>
        <label>
          <input
            type="radio"
            name="imageType"
            checked={imageType === "drawing"}
            onChange={() => setImageType("drawing")}
          />
          직접 그리기
        </label>
      </fieldset>

      {imageType === "upload" ? (
        <div className="upload-box">
          <label>
            사진 선택
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
            />
          </label>
          {uploadPreview ? (
            <img src={uploadPreview} alt="업로드 미리보기" className="image-preview" />
          ) : (
            <p className="helper-text">선택한 사진이 여기에 미리보기로 표시됩니다.</p>
          )}
        </div>
      ) : (
        <DrawingCanvas onChange={setDrawingBlob} />
      )}

      {error && <p className="form-message error" role="alert">{error}</p>}
      {status && <p className="form-message success" role="status">{status}</p>}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "등록 중..." : "방명록 남기기"}
        </button>
        <Link href="/board" className="secondary-link">
          보드 보러가기
        </Link>
      </div>
    </form>
  );
}
