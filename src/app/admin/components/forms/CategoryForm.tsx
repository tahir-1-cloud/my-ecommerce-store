
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, FolderOpen } from "lucide-react";

import Button from "@/app/admin/components/ui/Button";
import Modal from "@/app/admin/components/ui/Modal";
import { Input, Textarea } from "@/app/admin/components/ui/Field";
import ImageUpload from "@/app/admin/components/ui/ImageUpload";
import type { CategoryRequest } from "@/types/category";

interface CategoryFormProps {
  initialData?: {
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    isActive?: boolean;
  } | null;
  onSubmit: (data: CategoryRequest) => Promise<void>;
  onCancel: () => void;
}

export default function CategoryForm({
  initialData = null,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialData?.name ?? "");
    setDescription(initialData?.description ?? "");
    setImageUrl(initialData?.imageUrl ?? "");
    setImageFile(null);
    setIsActive(initialData?.isActive ?? true);
    setError("");
  }, [initialData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    const payload: CategoryRequest = {
      name: trimmedName,
      description: description.trim() || null,
      image: imageFile,
      isActive,
    };

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the category. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={initialData ? "Edit Category" : "Add Category"}
      description={
        initialData
          ? "Update the category details below."
          : "Enter the details to create a new category."
      }
      icon={<FolderOpen size={19} strokeWidth={1.9} />}
      onClose={onCancel}
      closeDisabled={submitting}
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Category Name"
          required
          autoFocus
          maxLength={150}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Electronics"
          disabled={submitting}
        />

        <Textarea
          label="Description"
          optional
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Enter a short category description"
          disabled={submitting}
        />

        <ImageUpload
          label="Category Image"
          optional
          file={imageFile}
          existingUrl={imageUrl || null}
          onSelect={(file) => {
            setError("");
            setImageFile(file);
          }}
          onRemove={() => {
            setImageFile(null);
            setImageUrl("");
          }}
          onError={setError}
          disabled={submitting}
        />

  

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button type="submit" loading={submitting}>
            {initialData ? "Update Category" : "Save Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
