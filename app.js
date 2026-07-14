// --- Atmospheric Fluid Background Animation (Dolby Inspired) ---
const canvas = document.getElementById('atmosCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

// Soundwave node configuration
let baseFrequency = 0.005;
let targetFrequency = 0.005;
let currentHue = 220; // Default Win11 Deep Blue
let targetHue = 220;

class Wave {
    constructor(phaseShift, amplitude, speed) {
        this.phaseShift = phaseShift;
        this.amplitude = amplitude;
        this.speed = speed;
        this.angle = Math.random() * 100;
    }
    draw() {
        this.angle += this.speed;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
            // Complex multi-sine function for organic fluid motion
            const y = height / 2 + 
                      Math.sin(x * baseFrequency + this.angle + this.phaseShift) * this.amplitude +
                      Math.cos(x * 0.002 - this.angle) * (this.amplitude * 0.3);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

const waves = [
    new Wave(0, 70, 0.008),
    new Wave(Math.PI / 3, 50, 0.005),
    new Wave(Math.PI / 1.5, 90, 0.003)
];

function animate() {
    ctx.fillStyle = 'rgba(10, 12, 20, 0.08)'; // Smooth motion trails
    ctx.fillRect(0, 0, width, height);

    // Smoothly transition background properties
    baseFrequency += (targetFrequency - baseFrequency) * 0.05;
    currentHue += (targetHue - currentHue) * 0.05;

    waves.forEach((wave, idx) => {
        ctx.strokeStyle = `hsla(${currentHue + (idx * 20)}, 75%, 60%, 0.12)`;
        ctx.lineWidth = 3 + idx;
        wave.draw();
    });

    requestAnimationFrame(animate);
}
animate();


// --- Password Checking Logic & UI Controls ---
const passwordInput = document.getElementById('passwordInput');
const toggleVisible = document.getElementById('toggleVisible');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const feedbackBox = document.getElementById('feedbackBox');
const crackTime = document.getElementById('crackTime');
const warning = document.getElementById('warning');
const suggestions = document.getElementById('suggestions');

// Reveal/Hide password functionality
toggleVisible.addEventListener('click', () => {
    const isPass = passwordInput.type === 'password';
    passwordInput.type = isPass ? 'text' : 'password';
    toggleVisible.textContent = isPass ? '🙈' : '👁️';
});

// Dynamic configuration matching safety profiles
const scoreMap = [
    { text: "Highly Vulnerable", colorClass: "strength-0", hue: 0, freq: 0.02 },
    { text: "Weak", colorClass: "strength-1", hue: 25, freq: 0.015 },
    { text: "Medium", colorClass: "strength-2", hue: 45, freq: 0.01 },
    { text: "Strong", colorClass: "strength-3", hue: 210, freq: 0.007 },
    { text: "Unbreakable", colorClass: "strength-4", hue: 145, freq: 0.004 }
];

passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    
    if (!val) {
        strengthBar.style.width = '0%';
        strengthBar.className = 'h-full w-0 rounded-full transition-all duration-500 ease-out';
        strengthText.textContent = "Empty";
        strengthText.className = "font-medium tracking-wide uppercase text-white/40";
        feedbackBox.classList.add('hidden');
        targetHue = 220;
        targetFrequency = 0.005;
        return;
    }

    // Call Zxcvbn for rigorous context/entropy calculation
    const result = zxcvbn(val);
    const score = result.score; // 0 to 4 integers
    const config = scoreMap[score];

    // Update UI Elements
    strengthBar.className = `h-full rounded-full transition-all duration-500 ease-out ${config.colorClass}`;
    strengthBar.style.width = `${(score + 1) * 20}%`;
    
    strengthText.textContent = config.text;
    strengthText.className = `font-medium tracking-wide uppercase transition-colors duration-300`;
    strengthText.style.color = window.getComputedStyle(strengthBar).backgroundColor;

    // Shift Audio/Visual atmosphere states
    targetHue = config.hue;
    targetFrequency = config.freq;

    // Show text/metrics analysis flyout
    feedbackBox.classList.remove('hidden');
    crackTime.innerHTML = `Estimated time to crack: <strong class="text-white">${result.crack_times_display.offline_fast_hashing_1e10_per_second}</strong>`;
    
    warning.textContent = result.feedback.warning || "";
    
    suggestions.innerHTML = "";
    result.feedback.suggestions.forEach(sug => {
        const li = document.createElement('li');
        li.textContent = sug;
        suggestions.appendChild(li);
    });
});
