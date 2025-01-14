function getFingerprint() {
	const fingerprint = {};

	// Browser and system info
	fingerprint.userAgent = navigator.userAgent;
	fingerprint.language = navigator.language;
	fingerprint.platform = navigator.platform;
	fingerprint.hardwareConcurrency = navigator.hardwareConcurrency;
	fingerprint.screenResolution = `${screen.width}x${screen.height}`;
	fingerprint.colorDepth = screen.colorDepth;
	fingerprint.deviceMemory = navigator.deviceMemory || "unknown";

	// Plugins (if enabled)
	fingerprint.plugins = Array.from(navigator.plugins).map(plugin => plugin.name);

	// Timezone
	fingerprint.timezoneOffset = new Date().getTimezoneOffset();

	// Installed fonts (use canvas to fingerprint fonts)
	fingerprint.fonts = detectFonts();

	// WebGL Fingerprinting (render a 3D scene and hash the output)
	fingerprint.webgl = getWebGLFingerprint();

	// Canvas Fingerprinting (render text and hash the output)
	fingerprint.canvas = getCanvasFingerprint();

	return fingerprint;
}

// Detect installed fonts (basic example)
function detectFonts() {
	const fontList = ["Arial", "Courier New", "Times New Roman", "Verdana"];
	const detectedFonts = [];
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	for (const font of fontList) {
		context.font = `72px ${font}`;
		const width = context.measureText("test").width;
		detectedFonts.push(`${font}: ${width}`);
	}

	return detectedFonts;
}

// WebGL Fingerprinting
function getWebGLFingerprint() {
	try {
		const canvas = document.createElement("canvas");
		const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		if (!gl) return "No WebGL";

		const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
		const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
		const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

		return `${vendor} - ${renderer}`;
	} catch (e) {
		return "WebGL not supported";
	}
}

// Canvas Fingerprinting
function getCanvasFingerprint() {
	try {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		ctx.textBaseline = "top";
		ctx.font = "14px Arial";
		ctx.fillText("Hello, world!", 2, 2);

		return canvas.toDataURL();
	} catch (e) {
		return "Canvas not supported";
	}
}

// Audio Fingerprint
function getAudioFingerprint() {
    return new Promise((resolve, reject) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        oscillator.connect(analyser);
        analyser.connect(audioCtx.destination);

        oscillator.start(0);
        oscillator.stop(audioCtx.currentTime + 1);

        setTimeout(() => {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);

            const fingerprint = dataArray.reduce((acc, value) => acc + value.toString(16), '').replace(/^0+|0+$/g, '');
            resolve(fingerprint);
        }, 1000);
    });
}