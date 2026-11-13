/** Saves a fetched file through a temporary link, then frees its URL. */
export const downloadFile = (blob: Blob, filename: string) => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	// The click starts the download synchronously; the URL is no longer needed.
	setTimeout(() => URL.revokeObjectURL(url), 0);
};
