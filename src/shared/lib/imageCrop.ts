export interface ImageCropRect {
  sx: number
  sy: number
  sw: number
  sh: number
}

export interface ImageCropSize {
  width: number
  height: number
}

interface ImageCropOutput {
  crop: ImageCropRect
  output: ImageCropSize
}

export function calculateCenterCrop(
  source: ImageCropSize,
  target: ImageCropSize,
): ImageCropRect {
  const sourceRatio = source.width / source.height
  const targetRatio = target.width / target.height

  if (sourceRatio > targetRatio) {
    const sw = source.height * targetRatio

    return {
      sx: (source.width - sw) / 2,
      sy: 0,
      sw,
      sh: source.height,
    }
  }

  const sh = source.width / targetRatio

  return {
    sx: 0,
    sy: (source.height - sh) / 2,
    sw: source.width,
    sh,
  }
}

export function calculateCenterCropOutput(
  source: ImageCropSize,
  target: ImageCropSize,
): ImageCropOutput {
  const crop = calculateCenterCrop(source, target)

  return {
    crop,
    output: {
      width: Math.round(crop.sw),
      height: Math.round(crop.sh),
    },
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("이미지를 불러올 수 없습니다."))
    }
    image.src = url
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("이미지를 변환할 수 없습니다."))
          return
        }
        resolve(blob)
      },
      type,
      quality,
    )
  })
}

export async function cropImageFile(
  file: File,
  target: ImageCropSize,
): Promise<File> {
  const image = await loadImage(file)
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("이미지를 편집할 수 없습니다.")
  }
  if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    throw new Error("이미지 크기를 확인할 수 없습니다.")
  }

  const { crop, output } = calculateCenterCropOutput(
    { width: image.naturalWidth, height: image.naturalHeight },
    target,
  )

  canvas.width = output.width
  canvas.height = output.height
  context.drawImage(
    image,
    crop.sx,
    crop.sy,
    crop.sw,
    crop.sh,
    0,
    0,
    output.width,
    output.height,
  )

  const outputType = file.type === "image/jpeg" ? "image/jpeg" : "image/png"
  const blob = await canvasToBlob(canvas, outputType, 0.92)
  const extension = outputType === "image/png" ? "png" : "jpg"
  const baseName = file.name.replace(/\.[^.]*$/, "") || "image"

  return new File([blob], `${baseName}.${extension}`, {
    lastModified: Date.now(),
    type: outputType,
  })
}
