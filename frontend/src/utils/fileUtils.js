export function buildOutputFileName(originalName, suffix, extension) {
  const baseName = originalName.replace(/\.pdf$/i, '')
  return `${baseName}_${suffix}.${extension}`
}

export function triggerDownload(data, fileName) {
  const blob = data instanceof Blob ? data : new Blob([data])
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}