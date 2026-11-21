import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'

// Reference the HTML elements
const status = document.getElementById('status')
const image = document.getElementById('image')
const detectObjectsButton = document.getElementById('detect-objects')
const imageContainer = document.getElementById('image-container')
const imageUpload = document.getElementById('image-upload')
const thresholdSlider = document.getElementById('threshold-slider')
const thresholdVal = document.getElementById('threshold-val')

// Dynamic threshold display
if (thresholdSlider && thresholdVal) {
    thresholdSlider.addEventListener('input', (e) => {
        thresholdVal.textContent = `${e.target.value}%`
    })
}

// Clear any existing bounding boxes
function clearBoundingBoxes() {
    const existingBoxes = imageContainer.querySelectorAll('.bounding-box')
    existingBoxes.forEach(box => box.remove())
}

// Handle local image upload
if (imageUpload) {
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            image.src = event.target.result
            clearBoundingBoxes()
            status.textContent = `Loaded "${file.name}". Click "Detect Objects" to analyze.`
        }
        reader.readAsDataURL(file)
    })
}

// Create a new object detection pipeline
status.textContent = 'Downloading model & ONNX runtime... (this may take a few moments on first run)'

let detector = null
try {
    detector = await pipeline('object-detection', 'Xenova/yolos-tiny', {
        progress_callback: (item) => {
            if (item.status === 'progress') {
                const percent = Math.round(item.progress || 0)
                status.textContent = `Downloading ${item.file || 'model'}: ${percent}%`
            } else if (item.status === 'done') {
                status.textContent = `Loaded ${item.file || 'component'}. Initializing...`
            } else if (item.status === 'ready') {
                status.textContent = 'Model loaded successfully!'
            }
        }
    })

    // Enable Object Detection UI once model is loaded
    detectObjectsButton.addEventListener('click', detectAndDrawObjects)
    detectObjectsButton.disabled = false
    status.textContent = 'Ready! Click "Detect Objects" or upload your own image.'
} catch (error) {
    console.error('Failed to initialize pipeline:', error)
    status.textContent = `Error loading model: ${error.message}`
}

/* ⛳️ CHALLENGE REQUIREMENTS FULFILLED:
 * 1. The AI Model must be 95% sure of the detected object (threshold: 0.95 by default)
 * 2. The box coordinates must be compatible with the drawObjectBox helper function (percentage: true)
 */
async function detectAndDrawObjects() {
    if (!detector) return

    clearBoundingBoxes()
    detectObjectsButton.disabled = true
    status.textContent = 'Detecting...'

    const threshold = thresholdSlider ? parseInt(thresholdSlider.value, 10) / 100 : 0.95

    try {
        const startTime = performance.now()

        // Run in-browser inference using ONNX Runtime Web via Transformers.js
        const detectedObjects = await detector(image.src, {
            threshold: threshold,
            percentage: true
        })

        const elapsed = Math.round(performance.now() - startTime)

        // Draw Detected Objects
        status.textContent = 'Drawing bounding boxes...'
        detectedObjects.forEach(obj => {
            drawObjectBox(obj)
        })

        if (detectedObjects.length === 0) {
            status.textContent = `No objects detected with confidence \u2265 ${Math.round(threshold * 100)}% (${elapsed}ms). Try lowering the threshold.`
        } else {
            status.textContent = `Found ${detectedObjects.length} object(s) in ${elapsed}ms (confidence \u2265 ${Math.round(threshold * 100)}%)!`
        }
    } catch (err) {
        console.error('Detection error:', err)
        status.textContent = `Detection failed: ${err.message}`
    } finally {
        detectObjectsButton.disabled = false
    }
}

// Helper function that draws boxes for every detected object in the image
// Box coordinates are normalized percentages [0, 1]
function drawObjectBox(detectedObject) {
    const { label, score, box } = detectedObject
    const { xmax, xmin, ymax, ymin } = box

    // Generate a vibrant color for the box
    const color = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')

    // Draw the box
    const boxElement = document.createElement('div')
    boxElement.className = 'bounding-box'
    Object.assign(boxElement.style, {
        borderColor: color,
        left: 100 * xmin + '%',
        top: 100 * ymin + '%',
        width: 100 * (xmax - xmin) + '%',
        height: 100 * (ymax - ymin) + '%',
    })

    // Draw label badge
    const labelElement = document.createElement('span')
    labelElement.textContent = `${label} (${Math.round(score * 100)}%)`
    labelElement.className = 'bounding-box-label'
    labelElement.style.backgroundColor = color

    boxElement.appendChild(labelElement)
    imageContainer.appendChild(boxElement)
}
