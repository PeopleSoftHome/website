/**
 * 触发浏览器下载 Blob 文件
 * @param {Blob} blob - 文件 Blob
 * @param {string} filename - 下载文件名
 */
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
