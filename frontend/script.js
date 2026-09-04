/* =========================================================
   SAMOSA SANCTITY INDEX
   Frontend only.
   backend/main.py is untouched.
========================================================= */

const API_URL = "http://127.0.0.1:8000/analyze";


/* =========================================================
   ELEMENTS
========================================================= */

const introScene = document.getElementById("introScene");
const labScene = document.getElementById("labScene");
const analysisScene = document.getElementById("analysisScene");
const resultScene = document.getElementById("resultScene");

const introMascot = document.querySelector(".intro-mascot");
const findButton = document.getElementById("findButton");

const fileInput = document.getElementById("fileInput");
const previewArea = document.getElementById("previewArea");
const previewImage = document.getElementById("previewImage");
const fileName = document.getElementById("fileName");
const examineButton = document.getElementById("examineButton");
const uploadButton = document.querySelector(".upload-button");

const analysisImage = document.getElementById("analysisImage");

const introBubble = document.getElementById("introBubble");
const labBubble = document.getElementById("labBubble");
const analysisBubble = document.getElementById("analysisBubble");
const resultBubble = document.getElementById("resultBubble");

const consoleMessage = document.getElementById("consoleMessage");
const analysisCounter = document.getElementById("analysisCounter");
const analysisStatus = document.getElementById("analysisStatus");

const successResult = document.getElementById("successResult");
const rejectionResult = document.getElementById("rejectionResult");
const profileResult = document.getElementById("profileResult");
const errorResult = document.getElementById("errorResult");

const congratulations = document.getElementById("congratulations");

const scoreNumber = document.getElementById("scoreNumber");
const verdictTitle = document.getElementById("verdictTitle");
const verdictMessage = document.getElementById("verdictMessage");

const angleScore = document.getElementById("angleScore");
const sideScore = document.getElementById("sideScore");
const symmetryScore = document.getElementById("symmetryScore");

const angleBar = document.getElementById("angleBar");
const sideBar = document.getElementById("sideBar");
const symmetryBar = document.getElementById("symmetryBar");

const apexAngle = document.getElementById("apexAngle");
const leftAngle = document.getElementById("leftAngle");
const rightAngle = document.getElementById("rightAngle");

const leftSide = document.getElementById("leftSide");
const rightSide = document.getElementById("rightSide");
const baseSide = document.getElementById("baseSide");

const weakestMetric = document.getElementById("weakestMetric");

const detectionConfidence = document.getElementById("detectionConfidence");
const colorEvidence = document.getElementById("colorEvidence");
const shapeEvidence = document.getElementById("shapeEvidence");
const triangleEvidence = document.getElementById("triangleEvidence");

const pieChart = document.getElementById("ssiPie");
const pieScore = document.getElementById("pieScore");

const angleContribution = document.getElementById("angleContribution");
const sideContribution = document.getElementById("sideContribution");
const symmetryContribution = document.getElementById("symmetryContribution");

const rejectionTitle = document.getElementById("rejectionTitle");
const rejectionMessage = document.getElementById("rejectionMessage");
const profileMessage = document.getElementById("profileMessage");
const errorMessage = document.getElementById("errorMessage");

const againButton = document.getElementById("againButton");
const retryButton = document.getElementById("retryButton");
const profileRetryButton = document.getElementById("profileRetryButton");
const errorRetryButton = document.getElementById("errorRetryButton");


let selectedFile = null;
let analysisRunning = false;


/* =========================================================
   HELPERS
========================================================= */

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function setMood(selector, mood) {

    const mascots = document.querySelectorAll(selector);

    mascots.forEach(mascot => {

        mascot.classList.remove(
            "happy",
            "excited",
            "thinking",
            "nervous",
            "sad",
            "shocked",
            "impatient"
        );

        mascot.classList.add(mood);
    });
}


function showBubble(element, text, duration = 3000) {

    if (!element) return;

    element.textContent = text;
    element.classList.add("show");

    setTimeout(() => {
        element.classList.remove("show");
    }, duration);
}


function resetResults() {

    successResult.style.display = "none";
    rejectionResult.style.display = "none";
    profileResult.style.display = "none";
    errorResult.style.display = "none";

    congratulations.classList.remove("visible");

    scoreNumber.textContent = "0";

    angleScore.textContent = "0%";
    sideScore.textContent = "0%";
    symmetryScore.textContent = "0%";

    angleBar.style.width = "0%";
    sideBar.style.width = "0%";
    symmetryBar.style.width = "0%";

    if (detectionConfidence) {
        detectionConfidence.textContent = "—";
    }

    if (colorEvidence) {
        colorEvidence.textContent = "—";
    }

    if (shapeEvidence) {
        shapeEvidence.textContent = "—";
    }

    if (triangleEvidence) {
        triangleEvidence.textContent = "—";
    }

    if (pieScore) {
        pieScore.textContent = "0%";
    }

    if (angleContribution) {
        angleContribution.textContent = "—";
    }

    if (sideContribution) {
        sideContribution.textContent = "—";
    }

    if (symmetryContribution) {
        symmetryContribution.textContent = "—";
    }

    if (pieChart) {
        pieChart.style.setProperty("--angle-share", "33.33%");
        pieChart.style.setProperty("--side-share", "33.33%");
        pieChart.style.setProperty("--symmetry-share", "33.34%");
    }

    setMood(".result-character", "happy");
}


function showScene(scene) {

    [introScene, labScene, analysisScene, resultScene]
        .forEach(item => item.classList.remove("active"));

    scene.classList.add("active");
}


/* =========================================================
   INTRO STORY
========================================================= */

async function runIntro() {

    const mascot = introMascot.querySelector(".mascot");

    await wait(900);

    /*
       WALK INTO SCREEN
    */

    mascot.classList.add("walking");
    setMood(".intro-mascot .mascot", "curious");

    introMascot.animate(
        [
            {
                left: "-180px"
            },
            {
                left: "calc(50% - 70px)"
            }
        ],
        {
            duration: 2500,
            easing: "cubic-bezier(.2,.8,.2,1)",
            fill: "forwards"
        }
    );

    await wait(2600);

    mascot.classList.remove("walking");

    /*
       FIRST DIALOGUE
    */

    showBubble(
        introBubble,
        "Have you ever wondered if you're... somewhat geometrically perfect?",
        4300
    );

    await wait(4500);

    /*
       THINKING
    */

    setMood(".intro-mascot .mascot", "thinking");

    showBubble(
        introBubble,
        "…I have.",
        2600
    );

    await wait(3000);

    /*
       FINAL LINE
    */

    setMood(".intro-mascot .mascot", "excited");

    showBubble(
        introBubble,
        "Let's find out.",
        2500
    );

    await wait(2700);

    /*
       WALK TOWARDS BUTTON
    */

    mascot.classList.add("walking");

    introMascot.animate(
        [
            {
                left: "calc(50% - 70px)",
                bottom: "29vh"
            },
            {
                left: "calc(50% - 70px)",
                bottom: "19vh"
            }
        ],
        {
            duration: 1700,
            easing: "cubic-bezier(.2,.8,.2,1)",
            fill: "forwards"
        }
    );

    await wait(1800);

    /*
       LITTLE PAUSE BEFORE TOUCHING BUTTON
    */

    mascot.classList.remove("walking");
    setMood(".intro-mascot .mascot", "shocked");

    await wait(500);

    /*
       TOUCH BUTTON
       The hand/arm visually reaches toward it.
    */

    mascot.classList.add("excited");

    introMascot.animate(
        [
            {
                transform: "translateY(0)"
            },
            {
                transform: "translateY(12px) scale(.96)"
            },
            {
                transform: "translateY(0) scale(1)"
            }
        ],
        {
            duration: 650,
            easing: "ease-out",
            fill: "forwards"
        }
    );

    findButton.animate(
        [
            {
                transform: "scale(1)"
            },
            {
                transform: "scale(1.08)"
            },
            {
                transform: "scale(1)"
            }
        ],
        {
            duration: 550,
            easing: "ease-out"
        }
    );

    await wait(650);

    /*
       AUTOMATIC TRANSITION.
       NO CLICK REQUIRED.
    */

    transitionToLab();
}


/* =========================================================
   INTRO → LAB
========================================================= */

function transitionToLab() {

    introScene.classList.add("leaving");

    setTimeout(() => {

        labScene.classList.add("active");

        introScene.style.display = "none";

        setTimeout(() => {

            const mascot = document.querySelector(".lab-character");

            setMood(".lab-character", "happy");

            showBubble(
                labBubble,
                "Okay. This is a very serious laboratory.",
                3500
            );

            mascot.animate(
                [
                    {
                        transform: "translateX(70px) translateY(0)"
                    },
                    {
                        transform: "translateX(0) translateY(-8px)"
                    }
                ],
                {
                    duration: 1000,
                    easing: "cubic-bezier(.2,.8,.2,1)",
                    fill: "forwards"
                }
            );

        }, 700);
    }, 800);
}


/* =========================================================
   FILE SELECTION
========================================================= */

fileInput.addEventListener("change", () => {

    const file = fileInput.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        return;
    }

    selectedFile = file;

    const imageURL = URL.createObjectURL(file);

    previewImage.src = imageURL;
    fileName.textContent = file.name;

    previewArea.classList.add("visible");

    document.getElementById("emptySpecimen").style.display = "none";

    examineButton.disabled = false;
    examineButton.classList.add("visible");

    const mascot = document.querySelector(".lab-character");

    setMood(".lab-character", "excited");

    showBubble(
        labBubble,
        "Oh. OH. We have a specimen.",
        3200
    );

    mascot.animate(
        [
            {
                transform: "translateY(0) rotate(0deg)"
            },
            {
                transform: "translateY(-15px) rotate(-3deg)"
            },
            {
                transform: "translateY(0) rotate(2deg)"
            }
        ],
        {
            duration: 800,
            easing: "ease-out"
        }
    );
});


uploadButton.addEventListener("click", (event) => {
    event.preventDefault();
    fileInput.click();
});


/* =========================================================
   BEGIN EXAMINATION
========================================================= */

examineButton.addEventListener("click", async () => {

    if (!selectedFile || analysisRunning) {
        return;
    }

    analysisRunning = true;

    await startAnalysis(selectedFile);
});


/* =========================================================
   ANALYSIS THEATRE
========================================================= */

const analysisStages = [
    {
        counter: "01 / 07",
        message: "THE LITTLE TRIANGLE HAS ENTERED THE ROOM.",
        bubble: "Hmm. Let's see what we're dealing with.",
        mood: "thinking",
        line: "lineShape",
        status: "LOOKING..."
    },
    {
        counter: "02 / 07",
        message: "THE THREE IMPORTANT CORNERS ARE BEING CONSIDERED.",
        bubble: "Those corners look like they have secrets.",
        mood: "thinking",
        line: "lineCorners",
        status: "LOOKING AT CORNERS..."
    },
    {
        counter: "03 / 07",
        message: "THE ANGLES ARE GETTING INVOLVED.",
        bubble: "Why is geometry like this?",
        mood: "impatient",
        line: "lineAngles",
        status: "CONSIDERING ANGLES..."
    },
    {
        counter: "04 / 07",
        message: "THE SIDES ARE COMPARING THEMSELVES.",
        bubble: "That side is giving me a look.",
        mood: "nervous",
        line: "lineSides",
        status: "COMPARING SIDES..."
    },
    {
        counter: "05 / 07",
        message: "SYMMETRY: ARE THESE TWO SIDES EVEN FRIENDS?",
        bubble: "Both sides are pretending to be twins.",
        mood: "impatient",
        line: "lineSymmetry",
        status: "CHECKING SYMMETRY..."
    },
    {
        counter: "06 / 07",
        message: "WE HAVE MEASURED A TRIANGLE. THIS IS SERIOUS.",
        bubble: "This is getting uncomfortably precise.",
        mood: "nervous",
        line: "lineVerdict",
        status: "DOING THE VERY IMPORTANT MATH..."
    },
    {
        counter: "07 / 07",
        message: "THE NUMBERS ARE NUMBERS. I DON'T KNOW WHAT TO TELL YOU.",
        bubble: "Oh. OH. I think we found something.",
        mood: "excited",
        line: "lineVerdict",
        status: "THE NUMBER HAS SPOKEN."
    }
];


async function playAnalysisStages() {

    const lines = document.querySelectorAll(".console-line");

    lines.forEach(line => {
        line.classList.remove("active", "done");
        line.querySelector("i").textContent = "waiting";
    });

    for (let i = 0; i < analysisStages.length; i++) {

        const stage = analysisStages[i];

        analysisCounter.textContent = stage.counter;
        consoleMessage.textContent = stage.message;
        analysisStatus.textContent = stage.status;

        setMood(".mini-character", stage.mood);

        showBubble(
            analysisBubble,
            stage.bubble,
            3200
        );

        lines.forEach(line => {
            if (line.id === stage.line) {
                line.classList.add("active");

                const status = line.querySelector("i");

                if (i >= 5) {
                    status.textContent = "checking";
                } else {
                    status.textContent = "examining";
                }
            }
        });

        await wait(2200);

        const currentLine = document.getElementById(stage.line);

        if (currentLine) {
            currentLine.classList.remove("active");
            currentLine.classList.add("done");

            currentLine.querySelector("i").textContent = "done";
        }
    }
}


/* =========================================================
   REAL BACKEND REQUEST
========================================================= */

async function fetchAnalysis(file) {

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        API_URL,
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }

    return await response.json();
}


/* =========================================================
   START ANALYSIS
========================================================= */

async function startAnalysis(file) {

    /*
       Move uploaded image into analysis scene
    */

    analysisImage.src = URL.createObjectURL(file);

    labScene.classList.remove("active");

    await wait(450);

    analysisScene.classList.add("active");

    setMood(".mini-character", "thinking");

    /*
       IMPORTANT:
       The animation and actual backend request happen together.

       We don't invent measurements.
       The results wait for the actual backend response.
    */

    const apiPromise = fetchAnalysis(file);
    const theatrePromise = playAnalysisStages();

    try {

        const [data] = await Promise.all([
            apiPromise,
            theatrePromise
        ]);

        /*
           Make sure the audience gets a tiny beat
           before the reveal.
        */

        analysisStatus.textContent = "THE NUMBER HAS SPOKEN.";

        setMood(".mini-character", "excited");

        showBubble(
            analysisBubble,
            "Okay... moment of truth.",
            2500
        );

        await wait(1200);

        showResults(data);

    } catch (error) {

        console.error(error);

        await wait(600);

        showError(error);

    } finally {

        analysisRunning = false;
    }
}


/* =========================================================
   RESULT ROUTER
========================================================= */

function showResults(data) {

    analysisScene.classList.remove("active");

    resetResults();

    resultScene.classList.add("active");

    /*
       NOT A SAMOSA
    */

    if (
        data.samosa_detected === false ||
        data.detection_status === "not_samosa"
    ) {

        showRejection(data);

        return;
    }


    /*
       SAMOSA BUT GEOMETRY UNAVAILABLE
    */

    if (
        data.samosa_detected === true &&
        data.geometry_suitable === false
    ) {

        showProfileProblem(data);

        return;
    }


    /*
       REAL RESULT
    */

    if (
        data.success === true &&
        data.geometry_suitable === true &&
        data.statistics &&
        typeof data.ssi === "number"
    ) {

        showSuccess(data);

        return;
    }


    showError({
        message: data.message || "The laboratory returned an unexpected result."
    });
}


/* =========================================================
   SUCCESS
========================================================= */

async function showSuccess(data) {

    successResult.style.display = "block";

    const mascot = document.querySelector(".result-character");

    /*
       Actual backend verdict.
    */

    verdictTitle.textContent =
        data.verdict?.title || "SAMOSA VERIFIED";

    verdictMessage.textContent =
        data.verdict?.message || "The specimen has been measured.";

    /*
       CONGRATULATIONS only for the genuinely ideal range.
    */

    if (Number(data.ssi) >= 95) {
        congratulations.classList.add("visible");
    }

    /*
       Actual statistics from backend.
    */

    const angle = Number(data.statistics.angle_conformity);
    const side = Number(data.statistics.side_conformity);
    const symmetry = Number(data.statistics.symmetry_conformity);
    const ssi = Number(data.ssi);

    /*
       Count-up score
    */

    await animateNumber(
        scoreNumber,
        0,
        ssi,
        1500
    );

    angleScore.textContent = `${angle.toFixed(2)}%`;
    sideScore.textContent = `${side.toFixed(2)}%`;
    symmetryScore.textContent = `${symmetry.toFixed(2)}%`;

    angleBar.style.width = `${Math.max(0, Math.min(100, angle))}%`;
    sideBar.style.width = `${Math.max(0, Math.min(100, side))}%`;
    symmetryBar.style.width = `${Math.max(0, Math.min(100, symmetry))}%`;

    /*
       Detection evidence
       These are all actual backend values.
    */

    if (detectionConfidence) {
        detectionConfidence.textContent =
            `${Number(data.detection_confidence ?? 0).toFixed(2)}%`;
    }

    if (data.detection_evidence) {

        if (colorEvidence) {
            colorEvidence.textContent =
                `${Number(data.detection_evidence.color_score ?? 0).toFixed(2)}%`;
        }

        if (shapeEvidence) {
            shapeEvidence.textContent =
                `${Number(data.detection_evidence.shape_score ?? 0).toFixed(2)}%`;
        }

        if (triangleEvidence) {
            triangleEvidence.textContent =
                `${Number(data.detection_evidence.triangle_identity ?? 0).toFixed(2)}%`;
        }
    }

    /*
       SSI contribution chart.

       The three actual conformity scores are multiplied
       by their real weights:
       angle 35%
       side 35%
       symmetry 30%

       The pie therefore shows how the actual SSI
       is composed, rather than inventing statistics.
    */

    const angleContributionValue = angle * 0.35;
    const sideContributionValue = side * 0.35;
    const symmetryContributionValue = symmetry * 0.30;

    const totalContribution =
        angleContributionValue +
        sideContributionValue +
        symmetryContributionValue;

    if (totalContribution > 0 && pieChart) {

        const angleShare =
            (angleContributionValue / totalContribution) * 100;

        const sideShare =
            (sideContributionValue / totalContribution) * 100;

        const symmetryShare =
            (symmetryContributionValue / totalContribution) * 100;

        pieChart.style.setProperty(
            "--angle-share",
            `${angleShare}%`
        );

        pieChart.style.setProperty(
            "--side-share",
            `${sideShare}%`
        );

        pieChart.style.setProperty(
            "--symmetry-share",
            `${symmetryShare}%`
        );
    }

    if (pieScore) {
        pieScore.textContent = `${ssi.toFixed(2)}%`;
    }

    if (angleContribution) {
        angleContribution.textContent =
            `${angleContributionValue.toFixed(2)} pts`;
    }

    if (sideContribution) {
        sideContribution.textContent =
            `${sideContributionValue.toFixed(2)} pts`;
    }

    if (symmetryContribution) {
        symmetryContribution.textContent =
            `${symmetryContributionValue.toFixed(2)} pts`;
    }

    /*
       Geometry
    */

    if (data.geometry && data.geometry.angles) {

        apexAngle.textContent =
            `${Number(data.geometry.angles.apex).toFixed(2)}°`;

        leftAngle.textContent =
            `${Number(data.geometry.angles.left_base).toFixed(2)}°`;

        rightAngle.textContent =
            `${Number(data.geometry.angles.right_base).toFixed(2)}°`;
    }

    if (data.geometry && data.geometry.sides) {

        leftSide.textContent =
            Number(data.geometry.sides.left).toFixed(2);

        rightSide.textContent =
            Number(data.geometry.sides.right).toFixed(2);

        baseSide.textContent =
            Number(data.geometry.sides.base).toFixed(2);
    }

    /*
       Backend's actual weakest-metric commentary.
    */

    if (data.verdict?.commentary) {

        weakestMetric.textContent =
            data.verdict.commentary;

    } else if (data.verdict?.weakest_metric) {

        weakestMetric.textContent =
            `${data.verdict.weakest_metric} is currently the weakest link.`;
    }

    /*
       Mascot reaction is based on ACTUAL SSI.
    */

    if (ssi >= 95) {

        setMood(".result-character", "excited");

        showBubble(
            resultBubble,
            "OH. OH. WE DID IT.",
            4500
        );

        mascotCelebrate(mascot);

    } else if (ssi >= 75) {

        setMood(".result-character", "happy");

        showBubble(
            resultBubble,
            "Honestly? That's pretty respectable.",
            4500
        );

    } else if (ssi >= 50) {

        setMood(".result-character", "nervous");

        showBubble(
            resultBubble,
            "Okay... there are some concerns.",
            4500
        );

    } else {

        setMood(".result-character", "sad");

        showBubble(
            resultBubble,
            "We need to talk about those sides.",
            4500
        );
    }
}


/* =========================================================
   SCORE ANIMATION
========================================================= */

function animateNumber(element, start, end, duration) {

    return new Promise(resolve => {

        const startTime = performance.now();

        function update(currentTime) {

            const elapsed = currentTime - startTime;

            const progress =
                Math.min(elapsed / duration, 1);

            const eased =
                1 - Math.pow(1 - progress, 3);

            const value =
                start + (end - start) * eased;

            element.textContent =
                value.toFixed(2);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(update);
    });
}


/* =========================================================
   CELEBRATION
========================================================= */

function mascotCelebrate(mascot) {

    mascot.animate(
        [
            {
                transform: "translateY(0) rotate(0deg)"
            },
            {
                transform: "translateY(-22px) rotate(-5deg)"
            },
            {
                transform: "translateY(0) rotate(5deg)"
            },
            {
                transform: "translateY(-12px) rotate(-3deg)"
            },
            {
                transform: "translateY(0) rotate(0deg)"
            }
        ],
        {
            duration: 1300,
            easing: "ease-out"
        }
    );
}


/* =========================================================
   REJECTION
========================================================= */

function showRejection(data) {

    rejectionResult.style.display = "block";

    rejectionTitle.textContent = "SPECIMEN REJECTED";

    rejectionMessage.textContent =
        data.message ||
        "The evidence does not meet the requirements for samosa status.";

    setMood(".sad-character", "sad");

    showBubble(
        document.getElementById("rejectionBubble"),
        "I thought we had something.",
        5000
    );
}


/* =========================================================
   PROFILE PROBLEM
========================================================= */

function showProfileProblem(data) {

    profileResult.style.display = "block";

    profileMessage.textContent =
        data.message ||
        "This is definitely a samosa. Unfortunately, the geometry cannot be examined from this angle.";

    setMood(".concerned-character", "concerned");

    showBubble(
        document.querySelector(".profile-bubble"),
        "Please rotate me. I cannot work under these conditions.",
        5000
    );
}


/* =========================================================
   ERROR
========================================================= */

function showError(error) {

    analysisScene.classList.remove("active");

    resetResults();

    resultScene.classList.add("active");

    errorResult.style.display = "block";

    errorMessage.textContent =
        error?.message ||
        "Something went wrong while examining the specimen.";

    setMood(".result-character", "sad");
}


/* =========================================================
   RESET / ANOTHER SAMOSA
========================================================= */

function resetApplication() {

    selectedFile = null;

    fileInput.value = "";

    previewImage.src = "";
    analysisImage.src = "";
    fileName.textContent = "image.jpg";

    previewArea.classList.remove("visible");

    document.getElementById("emptySpecimen").style.display = "flex";

    examineButton.disabled = true;
    examineButton.classList.remove("visible");

    resetResults();

    resultScene.classList.remove("active");
    analysisScene.classList.remove("active");

    labScene.classList.add("active");

    setMood(".lab-character", "happy");

    showBubble(
        labBubble,
        "Another brave specimen.",
        3000
    );
}


againButton.addEventListener("click", resetApplication);
retryButton.addEventListener("click", resetApplication);
profileRetryButton.addEventListener("click", resetApplication);
errorRetryButton.addEventListener("click", resetApplication);


/* =========================================================
   START
========================================================= */

window.addEventListener("load", () => {

    resetResults();

    /*
       Intro deliberately waits before beginning.
       This gives the page time to breathe.
    */

    setMood(".intro-mascot .mascot", "curious");

    runIntro();
});