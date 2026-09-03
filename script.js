/* =========================================================
   SAMOSA SANCTITY INDEX
   Browser-side geometric analysis using OpenCV.js
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const introScreen = document.getElementById("introScreen");
const labScreen = document.getElementById("labScreen");

const discoverButton = document.getElementById("discoverButton");

const uploadArea = document.getElementById("uploadArea");
const uploadBox = document.getElementById("uploadBox");
const uploadInput = document.getElementById("samosa-upload");

const previewSection = document.getElementById("previewSection");
const previewImage = document.getElementById("previewImage");
const analyzeButton = document.getElementById("analyzeButton");

const mascot = document.getElementById("mascot");
const magnifyingGlass = document.getElementById("magnifyingGlass");
const clipboard = document.getElementById("clipboard");

const verificationSection =
    document.getElementById("verificationSection");

const verificationTitle =
    document.getElementById("verificationTitle");

const verificationText =
    document.getElementById("verificationText");

const analysisSection =
    document.getElementById("analysisSection");

const analysisImage =
    document.getElementById("analysisImage");

const analysisCanvas =
    document.getElementById("analysisCanvas");

const resultImage =
    document.getElementById("resultImage");

const resultCanvas =
    document.getElementById("resultCanvas");

const analysisLog =
    document.getElementById("analysisLog");

const currentStage =
    document.getElementById("currentStage");

const progressBar =
    document.getElementById("progressBar");

const analysisPercent =
    document.getElementById("analysisPercent");

const resultsSection =
    document.getElementById("resultsSection");

const scoreNumber =
    document.getElementById("scoreNumber");

const scoreProgress =
    document.getElementById("scoreProgress");

const verdictTitle =
    document.getElementById("verdictTitle");

const verdictDescription =
    document.getElementById("verdictDescription");

const angleScore =
    document.getElementById("angleScore");

const sideScore =
    document.getElementById("sideScore");

const symmetryScore =
    document.getElementById("symmetryScore");

const angleBar =
    document.getElementById("angleBar");

const sideBar =
    document.getElementById("sideBar");

const symmetryBar =
    document.getElementById("symmetryBar");

const angleComment =
    document.getElementById("angleComment");

const sideComment =
    document.getElementById("sideComment");

const symmetryComment =
    document.getElementById("symmetryComment");

const detectedAngles =
    document.getElementById("detectedAngles");

const detectedSides =
    document.getElementById("detectedSides");

const calculationAngle =
    document.getElementById("calculationAngle");

const calculationSides =
    document.getElementById("calculationSides");

const calculationSymmetry =
    document.getElementById("calculationSymmetry");

const calculationFinal =
    document.getElementById("calculationFinal");

const damageText =
    document.getElementById("damageText");

const finalVerdict =
    document.getElementById("finalVerdict");

const finalMessage =
    document.getElementById("finalMessage");

const resultMascot =
    document.getElementById("resultMascot");

const restartButton =
    document.getElementById("restartButton");


/* =========================================================
   STATE
========================================================= */

let uploadedFile = null;
let uploadedURL = null;
let analysisResult = null;


/* =========================================================
   ENTER EXPERIENCE
========================================================= */

discoverButton.addEventListener("click", () => {

    introScreen.classList.add("hide");

    setTimeout(() => {
        labScreen.classList.add("show");
    }, 250);

});


/* =========================================================
   FILE UPLOAD
========================================================= */

uploadInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (file) {
        handleImage(file);
    }

});


/* =========================================================
   DRAG & DROP
========================================================= */

uploadBox.addEventListener("dragover", (event) => {

    event.preventDefault();

    uploadBox.classList.add("dragging");

    setMascotState("excited");

});


uploadBox.addEventListener("dragleave", () => {

    uploadBox.classList.remove("dragging");

    setMascotState("idle");

});


uploadBox.addEventListener("drop", (event) => {

    event.preventDefault();

    uploadBox.classList.remove("dragging");

    const file = event.dataTransfer.files[0];

    if (file) {
        handleImage(file);
    }

});


/* =========================================================
   MASCOT INTERACTION
========================================================= */

uploadBox.addEventListener("mouseenter", () => {

    if (!uploadedFile) {
        setMascotState("excited");
    }

});


uploadBox.addEventListener("mouseleave", () => {

    if (!uploadedFile) {
        setMascotState("idle");
    }

});


function setMascotState(state) {

    mascot.classList.remove(
        "inspecting",
        "thinking",
        "waiting",
        "nervous",
        "exhausted",
        "excited",
        "celebrating",
        "sad"
    );

    if (state !== "idle") {
        mascot.classList.add(state);
    }

}


/* =========================================================
   IMAGE HANDLER
========================================================= */

function handleImage(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        setMascotState("sad");

        alert("Please upload a JPG, PNG, or WEBP image.");

        setMascotState("idle");

        return;
    }


    uploadedFile = file;


    if (uploadedURL) {
        URL.revokeObjectURL(uploadedURL);
    }


    uploadedURL = URL.createObjectURL(file);

    previewImage.src = uploadedURL;

    analysisImage.src = uploadedURL;

    resultImage.src = uploadedURL;


    uploadArea.style.display = "none";

    previewSection.classList.add("active");


    setMascotState("excited");

    setTimeout(() => {
        setMascotState("idle");
    }, 1800);

}


/* =========================================================
   ANALYZE BUTTON
========================================================= */

analyzeButton.addEventListener("click", async () => {

    if (!uploadedFile) {
        return;
    }

    previewSection.style.display = "none";

    verificationSection.classList.add("show");

    setMascotState("inspecting");


    await wait(900);


    verificationTitle.textContent =
        "Checking samosa credentials...";

    verificationText.textContent =
        "Isolating the primary object and looking for suspiciously triangular behaviour.";


    await wait(1000);


    try {

        await waitForOpenCV();

        const verification =
            await verifySamosa(uploadedURL);


        if (!verification.valid) {

            verificationTitle.textContent =
                "SAMOSA NOT CONFIRMED.";

            verificationText.textContent =
                "We detected an object, but its samosa credentials are questionable. Please try a clearer photograph.";

            setMascotState("sad");

            return;
        }


        verificationTitle.textContent =
            "SAMOSA CONFIRMED.";

        verificationText.textContent =
            "Proceeding with unnecessary mathematical scrutiny.";

        setMascotState("excited");


        await wait(1100);

        verificationSection.classList.remove("show");

        await beginAnalysis();

    } catch (error) {

        console.error(error);

        verificationTitle.textContent =
            "THE GEOMETRY MACHINE OBJECTS.";

        verificationText.textContent =
            "The image could not be analysed. Please try another photograph.";

        setMascotState("sad");

    }

});


/* =========================================================
   WAIT FOR OPENCV
========================================================= */

function waitForOpenCV() {

    return new Promise((resolve, reject) => {

        let attempts = 0;

        const check = setInterval(() => {

            attempts++;

            if (
                typeof cv !== "undefined" &&
                cv.Mat
            ) {

                clearInterval(check);

                resolve();

            }


            if (attempts > 80) {

                clearInterval(check);

                reject(
                    new Error("OpenCV.js failed to load.")
                );

            }

        }, 250);

    });

}


/* =========================================================
   VERIFICATION
========================================================= */

async function verifySamosa(imageURL) {

    const src = await imageToMat(imageURL);

    const processed =
        preprocessImage(src);

    const contours =
        findContours(processed.binary);


    if (contours.length === 0) {

        cleanupMats(src, processed);

        return {
            valid: false
        };

    }


    let best = null;


    for (const contour of contours) {

        const area = cv.contourArea(contour);

        if (area < 1000) {
            continue;
        }


        const perimeter =
            cv.arcLength(contour, true);


        const approx =
            new cv.Mat();


        cv.approxPolyDP(
            contour,
            approx,
            0.035 * perimeter,
            true
        );


        const hull =
            new cv.Mat();

        cv.convexHull(
            contour,
            hull,
            false,
            true
        );


        const hullArea =
            cv.contourArea(hull);


        const solidity =
            hullArea > 0
                ? area / hullArea
                : 0;


        const triangleScore =
            triangularityScore(
                approx,
                area,
                perimeter
            );


        const candidateScore =
            triangleScore * 0.7 +
            Math.min(solidity, 1) * 30;


        if (
            !best ||
            candidateScore > best.score
        ) {

            best = {
                contour,
                approx,
                score: candidateScore
            };

        } else {

            approx.delete();

        }

        hull.delete();

    }


    const valid =
        best &&
        best.score >= 45;


    if (best) {
        best.approx.delete();
        best.contour.delete();
    }


    cleanupMats(src, processed);


    return {
        valid
    };

}


/* =========================================================
   MAIN ANALYSIS
========================================================= */

async function beginAnalysis() {

    analysisSection.classList.add("show");

    analysisLog.innerHTML = "";

    progressBar.style.width = "0%";

    analysisPercent.textContent = "0%";

    currentStage.textContent =
        "Initialising geometric analysis...";


    setMascotState("waiting");


    const stages = [

        {
            progress: 8,
            text:
                "Acquiring photographic specimen... Image successfully obtained. The samosa has surrendered itself for analysis.",
            mascot: "waiting"
        },

        {
            progress: 18,
            text:
                "Isolating primary object... Background objects are being politely ignored.",
            mascot: "inspecting"
        },

        {
            progress: 30,
            text:
                "Establishing triangular geometry... Searching for three major vertices.",
            mascot: "inspecting"
        },

        {
            progress: 42,
            text:
                "Calculating angular conformity... Comparing observed angles against the sacred 60°.",
            mascot: "waiting"
        },

        {
            progress: 55,
            text:
                "Evaluating side-length equality... The three sides are being asked to explain themselves.",
            mascot: "thinking"
        },

        {
            progress: 68,
            text:
                "Determining symmetry... Searching for evidence of bilateral cooperation.",
            mascot: "waiting"
        },

        {
            progress: 79,
            text:
                "Measuring deviation from the Ideal Samosa... Minor geometric crimes have been identified.",
            mascot: "nervous"
        },

        {
            progress: 90,
            text:
                "Computing individual conformity scores... The mathematics has become unnecessarily serious.",
            mascot: "nervous"
        },

        {
            progress: 97,
            text:
                "Combining geometric measurements... Consulting absolutely no external authority.",
            mascot: "nervous"
        }

    ];


    let calculationPromise =
        performGeometryAnalysis(uploadedURL);


    for (const stage of stages) {

        await wait(
            stage.progress === 8
                ? 500
                : 700
        );


        addAnalysisEntry(stage.text);

        currentStage.textContent =
            stage.text;

        setProgress(stage.progress);

        setMascotState(stage.mascot);


        if (
            stage.progress === 55 ||
            stage.progress === 79
        ) {

            await wait(300);

        }

    }


    analysisResult =
        await calculationPromise;


    await wait(700);


    addAnalysisEntry(
        "FINAL SANCTITY CALCULATION COMPLETE. The geometry has rendered its verdict."
    );

    currentStage.textContent =
        "Final geometric verdict ready.";

    setProgress(100);

    setMascotState("nervous");


    await wait(1200);


    showResults(analysisResult);

}


/* =========================================================
   PROGRESS
========================================================= */

function setProgress(value) {

    progressBar.style.width =
        `${value}%`;

    analysisPercent.textContent =
        `${value}%`;

}


/* =========================================================
   ANALYSIS LOG
========================================================= */

function addAnalysisEntry(text) {

    const entry =
        document.createElement("div");

    entry.className = "analysis-entry";

    entry.textContent = text;

    analysisLog.appendChild(entry);


    while (analysisLog.children.length > 7) {

        analysisLog.removeChild(
            analysisLog.firstChild
        );

    }

}


/* =========================================================
   REAL GEOMETRY ANALYSIS
========================================================= */

async function performGeometryAnalysis(imageURL) {

    const src =
        await imageToMat(imageURL);


    const processed =
        preprocessImage(src);


    const contours =
        findContours(processed.binary);


    let bestContour = null;
    let bestTriangle = null;
    let bestScore = -Infinity;


    for (const contour of contours) {

        const area =
            cv.contourArea(contour);

        if (area < 1200) {
            contour.delete();
            continue;
        }


        const perimeter =
            cv.arcLength(
                contour,
                true
            );


        const triangle =
            findThreeVertices(
                contour,
                perimeter
            );


        if (!triangle) {

            contour.delete();

            continue;

        }


        const triangularity =
            triangularityScore(
                triangle,
                area,
                perimeter
            );


        const bounding =
            cv.boundingRect(contour);


        const relativeArea =
            area /
            (
                bounding.width *
                bounding.height
            );


        const score =
            triangularity +
            relativeArea * 30;


        if (score > bestScore) {

            if (bestContour) {
                bestContour.delete();
            }

            if (bestTriangle) {
                bestTriangle.delete();
            }


            bestContour =
                contour;

            bestTriangle =
                triangle;

            bestScore =
                score;

        } else {

            triangle.delete();
            contour.delete();

        }

    }


    if (!bestContour || !bestTriangle) {

        cleanupMats(src, processed);

        throw new Error(
            "No suitable triangular specimen detected."
        );

    }


    const points =
        getPoints(bestTriangle);


    const ordered =
        orderTrianglePoints(points);


    const sides =
        calculateSides(ordered);


    const angles =
        calculateAngles(
            ordered,
            sides
        );


    const angleConformity =
        calculateAngleConformity(
            angles
        );


    const sideConformity =
        calculateSideConformity(
            sides
        );


    const symmetry =
        calculateSymmetry(
            processed.binary,
            bestContour
        );


    const finalScore =
        clamp(
            angleConformity * 0.4 +
            sideConformity * 0.35 +
            symmetry * 0.25,
            0,
            100
        );


    drawTriangle(
        analysisCanvas,
        analysisImage,
        ordered
    );


    drawTriangle(
        resultCanvas,
        resultImage,
        ordered
    );


    const result = {

        score: finalScore,

        angles,

        sides,

        angleConformity,

        sideConformity,

        symmetry,

        points: ordered

    };


    cleanupMats(
        src,
        processed
    );


    bestContour.delete();
    bestTriangle.delete();


    return result;

}


/* =========================================================
   PREPROCESS IMAGE
========================================================= */

function preprocessImage(src) {

    const resized =
        new cv.Mat();

    const maxDimension = 900;

    const scale =
        Math.min(
            1,
            maxDimension /
            Math.max(
                src.cols,
                src.rows
            )
        );


    cv.resize(
        src,
        resized,
        new cv.Size(
            Math.round(src.cols * scale),
            Math.round(src.rows * scale)
        )
    );


    const gray =
        new cv.Mat();


    cv.cvtColor(
        resized,
        gray,
        cv.COLOR_RGBA2GRAY
    );


    const blurred =
        new cv.Mat();


    cv.GaussianBlur(
        gray,
        blurred,
        new cv.Size(5, 5),
        0
    );


    const edges =
        new cv.Mat();


    cv.Canny(
        blurred,
        edges,
        50,
        140
    );


    const kernel =
        cv.Mat.ones(
            5,
            5,
            cv.CV_8U
        );


    const closed =
        new cv.Mat();


    cv.morphologyEx(
        edges,
        closed,
        cv.MORPH_CLOSE,
        kernel
    );


    return {

        resized,
        gray,
        blurred,
        edges,
        binary: closed,
        kernel

    };

}


/* =========================================================
   FIND CONTOURS
========================================================= */

function findContours(binary) {

    const contourMat =
        new cv.MatVector();

    const hierarchy =
        new cv.Mat();


    cv.findContours(
        binary,
        contourMat,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
    );


    const contours = [];


    for (
        let i = 0;
        i < contourMat.size();
        i++
    ) {

        contours.push(
            contourMat.get(i)
        );

    }


    contourMat.delete();
    hierarchy.delete();


    return contours;

}


/* =========================================================
   FIND THREE VERTICES
========================================================= */

function findThreeVertices(
    contour,
    perimeter
) {

    const epsilons = [
        0.01,
        0.015,
        0.02,
        0.025,
        0.03,
        0.04,
        0.05,
        0.065,
        0.08
    ];


    for (const epsilon of epsilons) {

        const approx =
            new cv.Mat();


        cv.approxPolyDP(
            contour,
            approx,
            epsilon * perimeter,
            true
        );


        if (
            approx.rows === 3
        ) {

            return approx;

        }


        approx.delete();

    }


    return null;

}


/* =========================================================
   TRIANGULARITY
========================================================= */

function triangularityScore(
    approx,
    area,
    perimeter
) {

    if (
        !approx ||
        approx.rows !== 3
    ) {
        return 0;
    }


    const triangleArea =
        cv.contourArea(approx);


    if (triangleArea <= 0) {
        return 0;
    }


    const areaRatio =
        Math.min(
            triangleArea / area,
            1
        );


    const trianglePerimeter =
        cv.arcLength(
            approx,
            true
        );


    const perimeterSimilarity =
        1 -
        Math.min(
            Math.abs(
                trianglePerimeter -
                perimeter
            ) / perimeter,
            1
        );


    return (
        areaRatio * 70 +
        perimeterSimilarity * 30
    );

}


/* =========================================================
   GET POINTS
========================================================= */

function getPoints(mat) {

    const points = [];


    for (
        let i = 0;
        i < mat.rows;
        i++
    ) {

        const x =
            mat.data32S[i * 2];

        const y =
            mat.data32S[i * 2 + 1];


        points.push({
            x,
            y
        });

    }


    return points;

}


/* =========================================================
   ORDER TRIANGLE
========================================================= */

function orderTrianglePoints(points) {

    const sorted =
        [...points].sort(
            (a, b) =>
                a.y - b.y
        );


    const top =
        sorted[0];


    const bottom =
        sorted.slice(1).sort(
            (a, b) =>
                a.x - b.x
        );


    return [
        top,
        bottom[1],
        bottom[0]
    ];

}


/* =========================================================
   SIDE CALCULATIONS
========================================================= */

function distance(a, b) {

    return Math.sqrt(
        Math.pow(
            b.x - a.x,
            2
        ) +
        Math.pow(
            b.y - a.y,
            2
        )
    );

}


function calculateSides(points) {

    const a =
        distance(
            points[1],
            points[2]
        );

    const b =
        distance(
            points[0],
            points[2]
        );

    const c =
        distance(
            points[0],
            points[1]
        );


    return [
        a,
        b,
        c
    ];

}


/* =========================================================
   ANGLE CALCULATIONS
========================================================= */

function angleFromSides(
    adjacentA,
    adjacentB,
    opposite
) {

    const denominator =
        2 *
        adjacentA *
        adjacentB;


    if (denominator === 0) {
        return 0;
    }


    let cosine =
        (
            adjacentA ** 2 +
            adjacentB ** 2 -
            opposite ** 2
        ) /
        denominator;


    cosine =
        clamp(
            cosine,
            -1,
            1
        );


    return (
        Math.acos(cosine) *
        180 /
        Math.PI
    );

}


function calculateAngles(
    points,
    sides
) {

    const [
        a,
        b,
        c
    ] = sides;


    const angleTop =
        angleFromSides(
            b,
            c,
            a
        );


    const angleRight =
        angleFromSides(
            a,
            c,
            b
        );


    const angleLeft =
        angleFromSides(
            a,
            b,
            c
        );


    return [
        angleTop,
        angleRight,
        angleLeft
    ];

}


/* =========================================================
   ANGLE CONFORMITY
========================================================= */

function calculateAngleConformity(
    angles
) {

    const scores =
        angles.map(
            angle => {

                const deviation =
                    Math.abs(
                        angle - 60
                    );

                return clamp(
                    1 -
                    deviation / 60,
                    0,
                    1
                ) * 100;

            }
        );


    return average(scores);

}


/* =========================================================
   SIDE CONFORMITY
========================================================= */

function calculateSideConformity(
    sides
) {

    const mean =
        average(sides);


    if (mean === 0) {
        return 0;
    }


    const deviations =
        sides.map(
            side =>
                Math.abs(
                    side - mean
                ) / mean
        );


    const averageDeviation =
        average(deviations);


    return clamp(
        1 -
        averageDeviation,
        0,
        1
    ) * 100;

}


/* =========================================================
   SYMMETRY
========================================================= */

function calculateSymmetry(
    binary,
    contour
) {

    const rect =
        cv.boundingRect(contour);


    const roi =
        binary.roi(rect);


    const flipped =
        new cv.Mat();


    cv.flip(
        roi,
        flipped,
        1
    );


    const diff =
        new cv.Mat();


    cv.absdiff(
        roi,
        flipped,
        diff
    );


    const total =
        roi.rows *
        roi.cols *
        255;


    const difference =
        cv.sumElems(diff)[0];


    let score =
        100 *
        (
            1 -
            difference /
            total
        );


    /*
        A triangular silhouette does not always
        align perfectly with the image bounding box,
        so we keep the result bounded and forgiving.
    */

    score =
        clamp(
            score * 1.25,
            0,
            100
        );


    roi.delete();
    flipped.delete();
    diff.delete();


    return score;

}


/* =========================================================
   DRAW DETECTED TRIANGLE
========================================================= */

function drawTriangle(
    canvas,
    image,
    points
) {

    if (!image.complete) {

        image.onload = () =>
            drawTriangle(
                canvas,
                image,
                points
            );

        return;

    }


    const width =
        image.naturalWidth;

    const height =
        image.naturalHeight;


    if (!width || !height) {
        return;
    }


    canvas.width = width;
    canvas.height = height;


    const ctx =
        canvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /*
        OpenCV analysis was resized to max 900px.
        We scale the detected coordinates back
        to the original image.
    */

    const scale =
        Math.max(
            width,
            height
        ) > 900
            ? Math.max(
                width,
                height
            ) / 900
            : 1;


    const scaled =
        points.map(
            p => ({
                x: p.x * scale,
                y: p.y * scale
            })
        );


    ctx.beginPath();

    ctx.moveTo(
        scaled[0].x,
        scaled[0].y
    );

    ctx.lineTo(
        scaled[1].x,
        scaled[1].y
    );

    ctx.lineTo(
        scaled[2].x,
        scaled[2].y
    );

    ctx.closePath();


    ctx.strokeStyle =
        "#df5d29";

    ctx.lineWidth =
        Math.max(
            3,
            width / 350
        );

    ctx.stroke();


    scaled.forEach(
        (point, index) => {

            ctx.beginPath();

            ctx.arc(
                point.x,
                point.y,
                Math.max(
                    6,
                    width / 80
                ),
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#18291f";

            ctx.fill();


            ctx.strokeStyle =
                "#f4ead8";

            ctx.lineWidth = 2;

            ctx.stroke();


            ctx.fillStyle =
                "#f4ead8";

            ctx.font =
                `${Math.max(
                    14,
                    width / 45
                )}px DM Mono`;

            ctx.fillText(
                String.fromCharCode(
                    65 + index
                ),
                point.x + 10,
                point.y - 10
            );

        }
    );

}


/* =========================================================
   RESULTS
========================================================= */

function showResults(result) {

    resultsSection.classList.add("show");

    setTimeout(() => {

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 150);


    const score =
        Number(
            result.score.toFixed(1)
        );


    animateNumber(
        scoreNumber,
        score
    );


    const circumference =
        2 *
        Math.PI *
        94;


    scoreProgress.style.strokeDasharray =
        circumference;


    scoreProgress.style.strokeDashoffset =
        circumference;


    setTimeout(() => {

        scoreProgress.style.strokeDashoffset =
            circumference *
            (1 - score / 100);

    }, 150);


    const verdict =
        getVerdict(score);


    verdictTitle.textContent =
        verdict.title;

    verdictDescription.textContent =
        verdict.description;


    const angle =
        Number(
            result.angleConformity.toFixed(1)
        );

    const sides =
        Number(
            result.sideConformity.toFixed(1)
        );

    const symmetry =
        Number(
            result.symmetry.toFixed(1)
        );


    animatePercentage(
        angleScore,
        angle
    );

    animatePercentage(
        sideScore,
        sides
    );

    animatePercentage(
        symmetryScore,
        symmetry
    );


    angleBar.style.width =
        `${angle}%`;

    sideBar.style.width =
        `${sides}%`;

    symmetryBar.style.width =
        `${symmetry}%`;


    angleComment.textContent =
        getAngleComment(angle);

    sideComment.textContent =
        getSideComment(sides);

    symmetryComment.textContent =
        getSymmetryComment(symmetry);


    detectedAngles.textContent =
        result.angles
            .map(
                angle =>
                    `${angle.toFixed(1)}°`
            )
            .join(" · ");


    detectedSides.textContent =
        result.sides
            .map(
                side =>
                    `${side.toFixed(1)} px`
            )
            .join(" · ");


    calculationAngle.textContent =
        `${angle}% ideal`;


    calculationSides.textContent =
        `${sides}% ideal`;


    calculationSymmetry.textContent =
        `${symmetry}% ideal`;


    calculationFinal.textContent =
        `${score}%`;


    damageText.textContent =
        getDamageReport(
            score,
            angle,
            sides,
            symmetry
        );


    finalVerdict.textContent =
        verdict.finalTitle;

    finalMessage.textContent =
        verdict.finalMessage;


    reactMascotToScore(
        score
    );

}


/* =========================================================
   SCORE VERDICT
========================================================= */

function getVerdict(score) {

    if (score >= 97) {

        return {

            title:
                "ABSOLUTELY SANCTIFIED",

            description:
                "We searched carefully for geometric irregularities. There were surprisingly few places to justify further investigation.",

            finalTitle:
                "THE IDEAL SAMOSA HAS BEEN SIGHTED",

            finalMessage:
                "Either this specimen is exceptionally disciplined, or geometry has decided to be generous today."

        };

    }


    if (score >= 90) {

        return {

            title:
                "GEOMETRICALLY SANCTIFIED",

            description:
                "The silhouette is remarkably close to the Ideal Samosa. The geometry has spoken favourably.",

            finalTitle:
                "CERTIFIED SANCTIFIED SAMOSA",

            finalMessage:
                "A highly respectable specimen. Minor imperfections have been noted and politely ignored."

        };

    }


    if (score >= 80) {

        return {

            title:
                "MOSTLY SANCTIFIED",

            description:
                "A strong geometric performance. A few corners have chosen individuality.",

            finalTitle:
                "MOSTLY SANCTIFIED",

            finalMessage:
                "The Ideal Samosa would probably approve after a brief discussion."

        };

    }


    if (score >= 60) {

        return {

            title:
                "SANCTITY COMPROMISED",

            description:
                "There is promising geometry here, but several measurements have begun wandering from the Ideal Samosa.",

            finalTitle:
                "A QUESTIONABLE SPECIMEN",

            finalMessage:
                "Further investigation may be unnecessary. Further snacking, however, remains entirely reasonable."

        };

    }


    if (score >= 50) {

        return {

            title:
                "QUESTIONABLE GEOMETRY",

            description:
                "The specimen is recognisably triangular, but the mathematical evidence is becoming difficult to defend.",

            finalTitle:
                "THE GEOMETRY NEEDS A MEETING",

            finalMessage:
                "We recommend a calm conversation between the three sides."

        };

    }


    if (score >= 30) {

        return {

            title:
                "GEOMETRIC HERESY",

            description:
                "The measurements have moved considerably away from the Ideal Samosa. Several concerns have been documented.",

            finalTitle:
                "SANCTITY CRITICAL",

            finalMessage:
                "The geometry has raised several concerns. The specimen remains a samosa, but perfection is currently out of office."

        };

    }


    return {

        title:
            "GEOMETRY HAS LEFT THE CHAT",

        description:
            "This silhouette is dramatically different from the equilateral Ideal Samosa. The mathematics is requesting a moment.",

        finalTitle:
            "FURTHER INVESTIGATION REQUIRED",

        finalMessage:
            "This is no longer merely a geometry problem. It is a culinary situation."

    };

}


/* =========================================================
   COMPONENT COMMENTARY
========================================================= */

function getAngleComment(score) {

    if (score >= 95) {
        return "THE ANGLES HAVE CHOSEN PEACE.";
    }

    if (score >= 80) {
        return "The angles are cooperating rather nicely.";
    }

    if (score >= 60) {
        return "The angles have begun to wander.";
    }

    if (score >= 40) {
        return "THE ANGLES ARE CURRENTLY HAVING A DISAGREEMENT.";
    }

    return "The angles appear to have separate plans.";
}


function getSideComment(score) {

    if (score >= 95) {
        return "THE SIDES ARE SUSPICIOUSLY COOPERATIVE.";
    }

    if (score >= 80) {
        return "The three sides are mostly on speaking terms.";
    }

    if (score >= 60) {
        return "The sides are showing some independence.";
    }

    if (score >= 40) {
        return "The three sides appear to disagree.";
    }

    return "THE THREE SIDES HAVE NEVER MET EACH OTHER.";
}


function getSymmetryComment(score) {

    if (score >= 95) {
        return "SYMMETRY IS FRANKLY SUSPICIOUS.";
    }

    if (score >= 80) {
        return "Symmetry is looking quite respectable.";
    }

    if (score >= 60) {
        return "Symmetry has submitted a mixed report.";
    }

    if (score >= 40) {
        return "Symmetry appears to be under investigation.";
    }

    return "WE LOOKED FOR SYMMETRY. IT LEFT THE BUILDING.";
}


/* =========================================================
   DAMAGE REPORT
========================================================= */

function getDamageReport(
    score,
    angle,
    sides,
    symmetry
) {

    const lowest =
        Math.min(
            angle,
            sides,
            symmetry
        );


    if (score >= 90) {

        return `
            The specimen performed exceptionally well.
            Angles reached ${angle}% conformity,
            side equality reached ${sides}%,
            and symmetry reached ${symmetry}%.
            There is very little geometric damage to report.
        `;

    }


    if (lowest === angle) {

        return `
            The main disturbance appears to be angular.
            The sides managed ${sides}% conformity and symmetry
            reached ${symmetry}%, but the angles scored ${angle}%.
            Somewhere along the way, 60° became more of a suggestion.
        `;

    }


    if (lowest === sides) {

        return `
            The angles were reasonably cooperative at ${angle}%,
            and symmetry reached ${symmetry}%.
            Unfortunately, the sides scored only ${sides}%.
            Equality was discussed. It was not achieved.
        `;

    }


    return `
        Angles reached ${angle}% conformity and the sides reached
        ${sides}%, but symmetry settled at ${symmetry}%.
        The specimen appears to have misunderstood the importance
        of bilateral cooperation.
    `;

}


/* =========================================================
   MASCOT RESULT REACTION
========================================================= */

function reactMascotToScore(score) {

    resultMascot.classList.remove(
        "celebrating",
        "excited",
        "sad",
        "nervous"
    );


    if (score >= 90) {

        resultMascot.classList.add(
            "celebrating"
        );

        return;

    }


    if (score >= 75) {

        resultMascot.classList.add(
            "excited"
        );

        return;

    }


    if (score >= 50) {

        resultMascot.classList.add(
            "waiting"
        );

        return;

    }


    if (score >= 30) {

        resultMascot.classList.add(
            "sad"
        );

        return;

    }


    resultMascot.classList.add(
        "sad"
    );

}


/* =========================================================
   ANIMATED NUMBERS
========================================================= */

function animateNumber(
    element,
    target
) {

    const duration =
        1400;

    const start =
        performance.now();


    function frame(now) {

        const progress =
            Math.min(
                (now - start) /
                duration,
                1
            );


        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const value =
            target *
            eased;


        element.textContent =
            value.toFixed(1);


        if (progress < 1) {

            requestAnimationFrame(
                frame
            );

        }

    }


    requestAnimationFrame(
        frame
    );

}


function animatePercentage(
    element,
    target
) {

    let current = 0;

    const duration = 900;

    const start =
        performance.now();


    function frame(now) {

        const progress =
            Math.min(
                (now - start) /
                duration,
                1
            );


        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        current =
            target *
            eased;


        element.textContent =
            `${current.toFixed(1)}%`;


        if (progress < 1) {

            requestAnimationFrame(
                frame
            );

        }

    }


    requestAnimationFrame(
        frame
    );

}


/* =========================================================
   IMAGE → OPENCV MAT
========================================================= */

function imageToMat(imageURL) {

    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();

            image.onload = () => {

                const canvas =
                    document.createElement(
                        "canvas"
                    );


                const max =
                    1000;


                const scale =
                    Math.min(
                        1,
                        max /
                        Math.max(
                            image.naturalWidth,
                            image.naturalHeight
                        )
                    );


                canvas.width =
                    Math.round(
                        image.naturalWidth *
                        scale
                    );


                canvas.height =
                    Math.round(
                        image.naturalHeight *
                        scale
                    );


                const ctx =
                    canvas.getContext(
                        "2d"
                    );


                ctx.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                try {

                    const mat =
                        cv.imread(canvas);

                    resolve(mat);

                } catch (error) {

                    reject(error);

                }

            };


            image.onerror =
                () =>
                    reject(
                        new Error(
                            "Could not load image."
                        )
                    );


            image.src =
                imageURL;

        }
    );

}


/* =========================================================
   HELPERS
========================================================= */

function average(values) {

    if (!values.length) {
        return 0;
    }

    return (
        values.reduce(
            (sum, value) =>
                sum + value,
            0
        ) /
        values.length
    );

}


function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            value,
            min
        ),
        max
    );

}


function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


function cleanupMats(
    src,
    processed
) {

    if (src) {
        src.delete();
    }

    if (!processed) {
        return;
    }

    Object.values(processed)
        .forEach(mat => {

            if (
                mat &&
                typeof mat.delete === "function"
            ) {

                mat.delete();

            }

        });

}


/* =========================================================
   RESTART
========================================================= */

restartButton.addEventListener(
    "click",
    () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        resultsSection.classList.remove(
            "show"
        );


        analysisSection.classList.remove(
            "show"
        );


        verificationSection.classList.remove(
            "show"
        );


        previewSection.classList.remove(
            "active"
        );


        previewSection.style.display =
            "none";


        uploadArea.style.display =
            "block";


        uploadInput.value =
            "";


        uploadedFile =
            null;


        analysisResult =
            null;


        analysisLog.innerHTML =
            "";


        setProgress(0);

        setMascotState("idle");

    }
);