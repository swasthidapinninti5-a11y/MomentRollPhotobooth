/* =========================
   MOMENT Roll
   Digital Photobooth
========================= */


/* =========================
   ELEMENTS
========================= */

const homePage = document.getElementById("home");
const boothPage = document.getElementById("booth");

const startButton = document.getElementById("startButton");
const backButton = document.getElementById("backButton");

const video = document.getElementById("video");
const canvas = document.getElementById("captureCanvas");

const captureButton = document.getElementById("captureButton");

const countdown = document.getElementById("countdown");
const cameraMessage = document.getElementById("cameraMessage");

const photoCounter = document.getElementById("photoCounter");
const photoStrip = document.getElementById("photoStrip");

const downloadButton = document.getElementById("downloadButton");
const resetButton = document.getElementById("resetButton");

const filterButtons = document.querySelectorAll(".filter-button");


/* =========================
   VARIABLES
========================= */

let photos = [];

let currentFilter = "normal";

let cameraStream = null;

let isTakingPhoto = false;


/* =========================
   START BUTTON
========================= */

startButton.addEventListener("click", () => {
    openBooth();
});


/* =========================
   OPEN PHOTOBOOTH
========================= */

async function openBooth() {

    homePage.classList.remove("active");
    boothPage.classList.add("active");

    photos = [];
    currentFilter = "normal";

    photoCounter.textContent = "0";

    updateFilterButtons();
    updatePhotoStrip();

    downloadButton.disabled = true;

    await startCamera();
}


/* =========================
   START CAMERA
========================= */

async function startCamera() {

    cameraMessage.textContent = "STARTING CAMERA...";

    try {

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: {
                    ideal: 1920
                },
                height: {
                    ideal: 1080
                }
            },
            audio: false
        });

        video.srcObject = cameraStream;

        cameraMessage.textContent = "CAMERA READY";

    } catch (error) {

        console.error(error);

        cameraMessage.textContent =
            "CAMERA ACCESS DENIED";

        alert(
            "Please allow camera access in your browser to use the photobooth."
        );
    }
}


/* =========================
   STOP CAMERA
========================= */

function stopCamera() {

    if (cameraStream) {

        cameraStream.getTracks().forEach(track => {
            track.stop();
        });

        cameraStream = null;
    }

    video.srcObject = null;
}


/* =========================
   CAPTURE BUTTON
========================= */

captureButton.addEventListener("click", async () => {

    if (isTakingPhoto) return;

    if (photos.length >= 4) {
        return;
    }

    if (!cameraStream) {
        alert("Camera isn't ready yet.");
        return;
    }

    await takePhoto();
});


/* =========================
   TAKE PHOTO
========================= */

async function takePhoto() {

    isTakingPhoto = true;

    captureButton.disabled = true;

    cameraMessage.textContent = "GET READY...";

    await runCountdown();

    captureImage();

    captureButton.disabled = false;

    isTakingPhoto = false;
}


/* =========================
   COUNTDOWN
========================= */

function runCountdown() {

    return new Promise(resolve => {

        let number = 3;

        countdown.textContent = number;

        const timer = setInterval(() => {

            number--;

            if (number > 0) {

                countdown.textContent = number;

            } else {

                clearInterval(timer);

                countdown.textContent = "";

                resolve();
            }

        }, 1000);

    });
}


/* =========================
   CAPTURE IMAGE
========================= */

function captureImage() {

    if (!video.videoWidth || !video.videoHeight) {
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    /*
       Mirror the image so it looks
       like the camera preview.
    */

    ctx.save();

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.restore();


    const imageData = canvas.toDataURL(
        "image/jpeg",
        0.95
    );

    photos.push(imageData);

    photoCounter.textContent = photos.length;

    updatePhotoStrip();


    if (photos.length === 4) {

        downloadButton.disabled = false;

        cameraMessage.textContent =
            "STRIP READY ✦";

    } else {

        cameraMessage.textContent =
            `${photos.length} / 4 CAPTURED`;
    }
}


/* =========================
   UPDATE PHOTO STRIP
========================= */

function updatePhotoStrip() {

    photoStrip.innerHTML = "";


    /*
       Add captured photos
    */

    photos.forEach((photo, index) => {

        const photoContainer =
            document.createElement("div");

        photoContainer.className =
            "captured-photo";

        const img =
            document.createElement("img");

        img.src = photo;

        img.alt =
            `Captured photo ${index + 1}`;

        applyFilter(img);

        photoContainer.appendChild(img);

        photoStrip.appendChild(photoContainer);
    });


    /*
       Add empty slots
    */

    for (
        let i = photos.length;
        i < 4;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-photo";

        empty.innerHTML =
            `<span>0${i + 1}</span>`;

        photoStrip.appendChild(empty);
    }


    /*
       Footer
    */

    const footer =
        document.createElement("div");

    footer.className =
        "strip-footer";

    footer.textContent =
        "MOMENT Roll ✦ 2026";

    photoStrip.appendChild(footer);
}


/* =========================
   FILTER BUTTONS
========================= */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentFilter =
            button.dataset.filter;

        updateFilterButtons();

        updatePhotoStrip();
    });

});


function updateFilterButtons() {

    filterButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );

    });
}


/* =========================
   APPLY FILTER
========================= */

function applyFilter(element) {

    element.style.filter = "none";

    if (currentFilter === "bw") {

        element.style.filter =
            "grayscale(1) contrast(1.1)";

    }

    else if (currentFilter === "warm") {

        element.style.filter =
            "sepia(0.35) saturate(1.2) contrast(1.05) brightness(1.03)";

    }

    else if (currentFilter === "soft") {

        element.style.filter =
            "brightness(1.05) contrast(0.9) saturate(0.85) blur(0.3px)";

    }

    else if (currentFilter === "grain") {

        element.style.filter =
            "contrast(1.12) saturate(0.85)";
    }
}


/* =========================
   DOWNLOAD STRIP
========================= */

downloadButton.addEventListener(
    "click",
    downloadStrip
);


function downloadStrip() {

    if (photos.length !== 4) {
        return;
    }


    const width = 900;

    const padding = 35;

    const photoWidth =
        width - padding * 2;

    const photoHeight =
        Math.round(photoWidth * 0.75);

    const gap = 20;

    const footerHeight = 80;

    const height =
        padding +
        photoHeight * 4 +
        gap * 3 +
        footerHeight +
        padding;


    const downloadCanvas =
        document.createElement("canvas");

    downloadCanvas.width = width;
    downloadCanvas.height = height;


    const ctx =
        downloadCanvas.getContext("2d");


    /*
       Background
    */

    ctx.fillStyle = "#f8f2e8";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
       Draw each photo
    */

    let y = padding;


    photos.forEach(photo => {

        const img =
            new Image();

        img.onload = () => {

            ctx.save();


            /*
               Apply filters
            */

            if (currentFilter === "bw") {

                ctx.filter =
                    "grayscale(1) contrast(1.1)";

            }

            else if (currentFilter === "warm") {

                ctx.filter =
                    "sepia(0.35) saturate(1.2) contrast(1.05)";
            }

            else if (currentFilter === "soft") {

                ctx.filter =
                    "brightness(1.05) contrast(0.9) saturate(0.85)";
            }

            else if (currentFilter === "grain") {

                ctx.filter =
                    "contrast(1.12) saturate(0.85)";
            }


            /*
               Mirror photo
            */

            ctx.translate(
                width,
                0
            );

            ctx.scale(
                -1,
                1
            );


            ctx.drawImage(
                img,
                padding,
                y,
                photoWidth,
                photoHeight
            );


            ctx.restore();

            y += photoHeight + gap;


            /*
               Download after all images
            */

            if (y >=
                padding +
                photoHeight * 4 +
                gap * 3
            ) {

                ctx.fillStyle =
                    "#29231d";

                ctx.font =
                    "500 22px 'DM Mono', monospace";

                ctx.textAlign =
                    "center";

                ctx.fillText(
                    "MOMENT Roll ✦ 2026",
                    width / 2,
                    height - 35
                );


                const link =
                    document.createElement("a");

                link.download =
                    "moment-roll-vintage-photostrip.jpg";

                link.href =
                    downloadCanvas.toDataURL(
                        "image/jpeg",
                        0.95
                    );

                link.click();
            }

        };

        img.src = photo;
    });
}


/* =========================
   RESET
========================= */

resetButton.addEventListener(
    "click",
    resetPhotos
);


function resetPhotos() {

    photos = [];

    currentFilter = "normal";

    photoCounter.textContent = "0";

    downloadButton.disabled = true;

    updateFilterButtons();

    updatePhotoStrip();

    cameraMessage.textContent =
        "CAMERA READY";
}


/* =========================
   BACK BUTTON
========================= */

backButton.addEventListener(
    "click",
    () => {

        stopCamera();

        boothPage.classList.remove("active");

        homePage.classList.add("active");

    }
);


/* =========================
   CLEAN UP CAMERA
========================= */

window.addEventListener(
    "beforeunload",
    () => {
        stopCamera();
    }
);