const skinUpload = document.getElementById('skinUpload') as HTMLInputElement;
const overlaySelect = document.getElementById('overlaySelect') as HTMLSelectElement;
const canvas = document.getElementById('previewCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const spinner = document.getElementById('spinner') as HTMLDivElement | null;
const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;

let baseImg: HTMLImageElement | null = null;
let overlayImg: HTMLImageElement | null = null;
let maskImg: HTMLImageElement | null = null;

function showSpinner(show: boolean) {
  if (!spinner) return;
  spinner.classList.toggle('hidden', !show);
}

function applyMask() {
  if (!maskImg) return;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const maskCtx = maskCanvas.getContext('2d')!;

  maskCtx.drawImage(maskImg, 0, 0);
  const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  const skinData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < maskData.data.length; i += 4) {
    const alpha = maskData.data[i + 3];
    if (alpha > 0) {
      skinData.data[i + 3] = 0;
    }
  }

  ctx.putImageData(skinData, 0, 0);
}

function renderPreview() {
  if (!baseImg || !overlayImg) return;
  showSpinner(true);

  requestAnimationFrame(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImg!, 0, 0);
    applyMask();
    ctx.drawImage(overlayImg!, 0, 0);
    downloadBtn.disabled = false;
    showSpinner(false);
  });
}

skinUpload.addEventListener('change', e => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const baseName = file.name.replace(/\.png$/i, "");
  const maskName = baseName + "_mask.png";
  const maskFile = input.files ? Array.from(input.files).find(f => f.name === maskName) : null;

  const reader = new FileReader();
  reader.onload = () => {
    baseImg = new Image();
    baseImg.onload = renderPreview;
    baseImg.src = reader.result as string;
  };
  reader.readAsDataURL(file);

  if (maskFile) {
    const maskReader = new FileReader();
    maskReader.onload = () => {
      maskImg = new Image();
      maskImg.onload = renderPreview;
      maskImg.src = maskReader.result as string;
    };
    maskReader.readAsDataURL(maskFile);
  } else {
    maskImg = null;
  }
});

overlaySelect.addEventListener('change', () => {
  overlayImg = new Image();
  overlayImg.onload = renderPreview;
  overlayImg.src = overlaySelect.value;
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'bunnysuit_skin.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Load default overlay
overlayImg = new Image();
overlayImg.onload = renderPreview;
overlayImg.src = overlaySelect.value;
