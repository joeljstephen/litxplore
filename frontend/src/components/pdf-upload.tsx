import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Paper, useUploadPaper } from "@/lib/api/generated";
import { MAX_PAPERS_FOR_REVIEW } from "@/lib/constants";

interface PDFUploadProps {
  onPaperAdd: (paper: Paper) => void;
  currentPaperCount: number;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes

export function PDFUpload({ onPaperAdd, currentPaperCount }: PDFUploadProps) {
  // Orval v8 wraps in { data, status }
  const uploadPaper = useUploadPaper({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 200) {
          onPaperAdd(response.data);
          toast.success("PDF uploaded successfully");
        }
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload PDF";
        toast.error(errorMessage);
        console.error("Upload error:", error);
      },
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (currentPaperCount >= MAX_PAPERS_FOR_REVIEW) {
      toast.error(
        `You can only select up to ${MAX_PAPERS_FOR_REVIEW} papers for review`
      );
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds the limit of 15MB");
      return;
    }

    uploadPaper.mutate(
      { data: { file } },
      {
        onSettled: () => {
          // Clear the file input on success or error
          if (e.target.value) e.target.value = "";
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        disabled={uploadPaper.isPending}
        className="max-w-xs"
      />
      {uploadPaper.isPending && (
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  );
}
