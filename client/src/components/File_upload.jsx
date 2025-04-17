"use client";
import React, { useState } from "react";
import { FileUpload } from "./ui/file_upload";

export function FileUploadDemo({selectedFile , setValue}) {
  const [files, setFiles] = useState([]);
  const handleFileUpload = async(files) => {
   
      setFiles(files);
      selectedFile(files);
  };

  return (
    (<div
      className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-emerald-500 dark:border-neutral-800 rounded-lg">
      <FileUpload onChange={handleFileUpload} value={setValue}/>
    </div>)
  );
}
