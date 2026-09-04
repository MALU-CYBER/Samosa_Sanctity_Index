from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import cv2
import numpy as np
import math


app = FastAPI(title="Samosa Sanctity Index")


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# SSI SETTINGS
# =========================================================

IDEAL_APEX = 70.0
IDEAL_BASE = 55.0

ANGLE_WEIGHT = 0.35
SIDE_WEIGHT = 0.35
SYMMETRY_WEIGHT = 0.30


# =========================================================
# DETECTION SETTINGS
# =========================================================

# Detection is intentionally separate from SSI.
#
# We want geometry/silhouette to dominate identity.
# Color is supporting evidence only.

SAMOSA_IDENTITY_THRESHOLD = 70.0

MIN_WARM_RATIO = 0.30
MAX_RED_RATIO = 0.14


# =========================================================
# BASIC HELPERS
# =========================================================

def clamp(value, low=0.0, high=100.0):
    return max(low, min(high, float(value)))


def angle_between(a, b, c):

    ba = np.array(a, dtype=np.float64) - np.array(b, dtype=np.float64)
    bc = np.array(c, dtype=np.float64) - np.array(b, dtype=np.float64)

    denominator = np.linalg.norm(ba) * np.linalg.norm(bc)

    if denominator == 0:
        return 0.0

    cosine = np.dot(ba, bc) / denominator
    cosine = np.clip(cosine, -1.0, 1.0)

    return math.degrees(math.acos(cosine))


def distance(a, b):

    return float(
        np.linalg.norm(
            np.array(a, dtype=np.float64)
            - np.array(b, dtype=np.float64)
        )
    )


def polygon_area(points):

    pts = np.array(points, dtype=np.float32)

    if len(pts) < 3:
        return 0.0

    return abs(cv2.contourArea(pts))


def resize_image(image, max_dimension=1200):

    h, w = image.shape[:2]
    largest = max(h, w)

    if largest <= max_dimension:
        return image

    scale = max_dimension / largest

    return cv2.resize(
        image,
        (
            max(1, int(w * scale)),
            max(1, int(h * scale))
        ),
        interpolation=cv2.INTER_AREA
    )


# =========================================================
# COLOR ANALYSIS
# =========================================================

def analyze_samosa_color(image, contour):

    mask = np.zeros(
        image.shape[:2],
        dtype=np.uint8
    )

    cv2.drawContours(
        mask,
        [contour],
        -1,
        255,
        thickness=cv2.FILLED
    )

    hsv = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2HSV
    )

    pixels = hsv[mask > 0]

    if len(pixels) == 0:

        return {
            "score": 0.0,
            "warm_ratio": 0.0,
            "red_ratio": 0.0,
            "saturation": 0.0,
            "brightness": 0.0
        }

    h = pixels[:, 0].astype(np.float32)
    s = pixels[:, 1].astype(np.float32)
    v = pixels[:, 2].astype(np.float32)

    # -----------------------------------------------------
    # GOLDEN / BROWN FRIED-FOOD COLORS
    # -----------------------------------------------------

    golden = (
        (h >= 8) &
        (h <= 38) &
        (s >= 45) &
        (v >= 45)
    )

    brown = (
        (h >= 3) &
        (h <= 28) &
        (s >= 35) &
        (v >= 25) &
        (v <= 225)
    )

    warm = golden | brown

    warm_ratio = float(np.mean(warm))

    # -----------------------------------------------------
    # RED DETECTION
    # -----------------------------------------------------

    red = (
        (
            (h <= 8) |
            (h >= 170)
        ) &
        (s >= 70) &
        (v >= 50)
    )

    red_ratio = float(np.mean(red))

    # -----------------------------------------------------
    # BASIC LIGHTING
    # -----------------------------------------------------

    mean_saturation = float(np.mean(s))
    mean_brightness = float(np.mean(v))

    saturation_score = clamp(
        (mean_saturation - 25) / 100 * 100
    )

    brightness_score = clamp(
        (mean_brightness - 30) / 130 * 100
    )

    # -----------------------------------------------------
    # COLOR SCORE
    #
    # COLOR IS ONLY SUPPORTING EVIDENCE.
    # It must never dominate geometry.
    # -----------------------------------------------------

    score = (
        warm_ratio * 100 * 0.75
        + saturation_score * 0.10
        + brightness_score * 0.15
    )

    # Strong red contamination.

    if red_ratio > MAX_RED_RATIO:

        red_penalty = clamp(
            (red_ratio - MAX_RED_RATIO)
            / 0.35
            * 100
        )

        score -= red_penalty * 0.70

    # Red-dominated object.

    if red_ratio > 0.30:

        score = min(
            score,
            15.0
        )

    return {

        "score": round(
            clamp(score),
            2
        ),

        "warm_ratio": round(
            warm_ratio * 100,
            2
        ),

        "red_ratio": round(
            red_ratio * 100,
            2
        ),

        "saturation": round(
            mean_saturation,
            2
        ),

        "brightness": round(
            mean_brightness,
            2
        )
    }


# =========================================================
# MASK GENERATION
# =========================================================

def fill_contours(mask):

    result = np.zeros_like(mask)

    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    for contour in contours:

        if cv2.contourArea(contour) > 0:

            cv2.drawContours(
                result,
                [contour],
                -1,
                255,
                thickness=cv2.FILLED
            )

    return result


def create_masks(image):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    blurred = cv2.GaussianBlur(
        gray,
        (5, 5),
        0
    )

    masks = []

    # -----------------------------------------------------
    # OTSU
    # -----------------------------------------------------

    _, otsu = cv2.threshold(
        blurred,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    masks.append(otsu)
    masks.append(cv2.bitwise_not(otsu))

    # -----------------------------------------------------
    # ADAPTIVE
    # -----------------------------------------------------

    adaptive = cv2.adaptiveThreshold(
        blurred,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        7
    )

    masks.append(adaptive)
    masks.append(cv2.bitwise_not(adaptive))

    # -----------------------------------------------------
    # EDGE MASK
    # -----------------------------------------------------

    edges = cv2.Canny(
        blurred,
        50,
        150
    )

    kernel = np.ones(
        (7, 7),
        np.uint8
    )

    edges = cv2.morphologyEx(
        edges,
        cv2.MORPH_CLOSE,
        kernel,
        iterations=2
    )

    masks.append(
        fill_contours(edges)
    )

    # -----------------------------------------------------
    # BACKGROUND COLOR DISTANCE
    # -----------------------------------------------------

    lab = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2LAB
    )

    h, w = lab.shape[:2]

    border_size = max(
        2,
        int(min(h, w) * 0.05)
    )

    border_pixels = np.concatenate([
        lab[:border_size].reshape(-1, 3),
        lab[-border_size:].reshape(-1, 3),
        lab[:, :border_size].reshape(-1, 3),
        lab[:, -border_size:].reshape(-1, 3),
    ])

    background_color = np.median(
        border_pixels,
        axis=0
    ).astype(np.float32)

    diff = np.linalg.norm(
        lab.astype(np.float32)
        - background_color,
        axis=2
    )

    for threshold in [12, 20, 30]:

        background_mask = np.where(
            diff > threshold,
            255,
            0
        ).astype(np.uint8)

        background_mask = cv2.morphologyEx(
            background_mask,
            cv2.MORPH_OPEN,
            np.ones((3, 3), np.uint8)
        )

        background_mask = cv2.morphologyEx(
            background_mask,
            cv2.MORPH_CLOSE,
            np.ones((7, 7), np.uint8)
        )

        masks.append(
            background_mask
        )

    # -----------------------------------------------------
    # WARM COLOR MASK
    # -----------------------------------------------------

    hsv = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2HSV
    )

    warm_mask = cv2.inRange(
        hsv,
        np.array(
            [3, 35, 25],
            dtype=np.uint8
        ),
        np.array(
            [40, 255, 255],
            dtype=np.uint8
        )
    )

    warm_mask = cv2.morphologyEx(
        warm_mask,
        cv2.MORPH_OPEN,
        np.ones((3, 3), np.uint8)
    )

    warm_mask = cv2.morphologyEx(
        warm_mask,
        cv2.MORPH_CLOSE,
        np.ones((7, 7), np.uint8)
    )

    masks.append(
        warm_mask
    )

    return masks


# =========================================================
# TRIANGLE EXTRACTION
# =========================================================

def get_best_triangle(contour):

    perimeter = cv2.arcLength(
        contour,
        True
    )

    if perimeter <= 0:
        return None

    contour_area = cv2.contourArea(
        contour
    )

    candidates = []

    for epsilon_ratio in np.linspace(
        0.01,
        0.08,
        20
    ):

        approx = cv2.approxPolyDP(
            contour,
            epsilon_ratio * perimeter,
            True
        )

        if len(approx) != 3:
            continue

        points = approx.reshape(
            3,
            2
        ).astype(np.float32)

        triangle_area = polygon_area(
            points
        )

        if triangle_area <= 0:
            continue

        fill_ratio = (
            contour_area /
            triangle_area
        )

        if fill_ratio < 0.45:
            continue

        candidates.append(
            (
                fill_ratio,
                points
            )
        )

    if not candidates:
        return None

    candidates.sort(
        key=lambda x: x[0],
        reverse=True
    )

    return candidates[0][1]


# =========================================================
# TRIANGLE ORDERING
# =========================================================

def order_triangle(points):

    p = [
        np.array(
            x,
            dtype=np.float32
        )
        for x in points
    ]

    d01 = np.linalg.norm(
        p[0] - p[1]
    )

    d12 = np.linalg.norm(
        p[1] - p[2]
    )

    d20 = np.linalg.norm(
        p[2] - p[0]
    )

    sides = [
        (d01, 0, 1, 2),
        (d12, 1, 2, 0),
        (d20, 2, 0, 1),
    ]

    # Longest side becomes the base.
    sides.sort(
        key=lambda x: x[0],
        reverse=True
    )

    _, base_a, base_b, apex_index = sides[0]

    return (
        p[apex_index],
        p[base_a],
        p[base_b]
    )


# =========================================================
# TRIANGLE MEASUREMENTS
# =========================================================

def triangle_measurements(triangle):

    if triangle is None:
        return None

    apex, base_left, base_right = order_triangle(
        triangle
    )

    apex_angle = angle_between(
        base_left,
        apex,
        base_right
    )

    left_angle = angle_between(
        apex,
        base_left,
        base_right
    )

    right_angle = angle_between(
        apex,
        base_right,
        base_left
    )

    left_side = distance(
        apex,
        base_left
    )

    right_side = distance(
        apex,
        base_right
    )

    base_side = distance(
        base_left,
        base_right
    )

    return {

        "apex": apex_angle,

        "left_base": left_angle,

        "right_base": right_angle,

        "left_side": left_side,

        "right_side": right_side,

        "base_side": base_side,

        "apex_point": apex,

        "base_left": base_left,

        "base_right": base_right
    }


# =========================================================
# TRIANGLE IDENTITY EVIDENCE
# =========================================================
#
# IMPORTANT:
#
# This is NOT SSI.
#
# This asks:
#
# "Does the silhouette have the general geometry
#  expected from a samosa?"
#
# We intentionally use BROAD tolerances here.
#
# A real samosa can have:
# - curved edges
# - a blunt apex
# - uneven sides
# - imperfect base angles
#
# Those imperfections should lower SSI later,
# not automatically destroy samosa identity.
# =========================================================

def samosa_triangle_identity_score(triangle):

    measurements = triangle_measurements(
        triangle
    )

    if measurements is None:
        return 0.0

    apex = measurements["apex"]

    left = measurements["left_base"]

    right = measurements["right_base"]

    left_side = measurements["left_side"]

    right_side = measurements["right_side"]

    base = measurements["base_side"]

    if base <= 0:
        return 0.0

    # -----------------------------------------------------
    # APEX SCORE
    #
    # Broad tolerance:
    # 30 degrees away from ideal still gives evidence.
    # -----------------------------------------------------

    apex_score = clamp(
        100 -
        abs(
            apex -
            IDEAL_APEX
        ) * 1.25
    )

    # -----------------------------------------------------
    # BASE ANGLE SCORES
    #
    # Again, intentionally broad.
    # -----------------------------------------------------

    left_score = clamp(
        100 -
        abs(
            left -
            IDEAL_BASE
        ) * 1.25
    )

    right_score = clamp(
        100 -
        abs(
            right -
            IDEAL_BASE
        ) * 1.25
    )

    angle_score = (
        apex_score * 0.45
        +
        left_score * 0.275
        +
        right_score * 0.275
    )

    # -----------------------------------------------------
    # SIDE RATIO
    # -----------------------------------------------------

    ideal_ratio = (
        math.sin(
            math.radians(55)
        )
        /
        math.sin(
            math.radians(70)
        )
    )

    measured_left = (
        left_side /
        base
    )

    measured_right = (
        right_side /
        base
    )

    left_ratio_error = (
        abs(
            measured_left -
            ideal_ratio
        )
        /
        ideal_ratio
    )

    right_ratio_error = (
        abs(
            measured_right -
            ideal_ratio
        )
        /
        ideal_ratio
    )

    side_ratio_score = clamp(
        100 -
        (
            (
                left_ratio_error +
                right_ratio_error
            )
            /
            2
        )
        * 100
    )

    # -----------------------------------------------------
    # SYMMETRY
    # -----------------------------------------------------

    symmetry_score = clamp(
        100 *
        (
            1 -
            abs(
                left_side -
                right_side
            )
            /
            max(
                left_side,
                right_side
            )
        )
    )

    # -----------------------------------------------------
    # BASE ANGLE BALANCE
    #
    # A samosa generally has two reasonably related
    # lower angles.
    # -----------------------------------------------------

    base_angle_difference = abs(
        left -
        right
    )

    angle_balance_score = clamp(
        100 -
        base_angle_difference * 2.5
    )

    # -----------------------------------------------------
    # FINAL TRIANGLE IDENTITY
    #
    # This is deliberately geometry-heavy.
    # -----------------------------------------------------

    score = (
        angle_score * 0.45
        +
        side_ratio_score * 0.25
        +
        symmetry_score * 0.15
        +
        angle_balance_score * 0.15
    )

    return clamp(score)


# =========================================================
# PROFILE SUITABILITY
# =========================================================
#
# IMPORTANT:
#
# Detection and geometry suitability are DIFFERENT.
#
# A samosa can be detected while its geometry is unusable.
#
# Example:
# sam5 -> SAMOSA CONFIRMED
#         geometry unavailable
#
# =========================================================

def validate_profile_suitability(
    contour,
    triangle,
    image_shape
):

    if triangle is None:

        return {
            "suitable": False,
            "reason":
                "No clear triangular profile was found."
        }

    h, w = image_shape[:2]

    measurements = triangle_measurements(
        triangle
    )

    if measurements is None:

        return {
            "suitable": False,
            "reason":
                "Triangle measurements could not be established."
        }

    apex = measurements["apex_point"]

    base_left = measurements["base_left"]

    base_right = measurements["base_right"]

    apex_angle = measurements["apex"]

    # -----------------------------------------------------
    # 1. Triangle must represent the silhouette reasonably
    # -----------------------------------------------------

    contour_area = cv2.contourArea(
        contour
    )

    triangle_area = polygon_area(
        triangle
    )

    if triangle_area <= 0:

        return {
            "suitable": False,
            "reason":
                "Triangle area is unusable."
        }

    triangle_fill = (
        contour_area /
        triangle_area
    )

    if triangle_fill < 0.65:

        return {
            "suitable": False,
            "reason":
                "The silhouette does not form a clean profile."
        }

    # -----------------------------------------------------
    # 2. Apex must be separated from base.
    #
    # This catches top-down / foreshortened samosas.
    # -----------------------------------------------------

    base_y = (
        base_left[1] +
        base_right[1]
    ) / 2.0

    vertical_separation = abs(
        float(
            apex[1]
        )
        -
        float(
            base_y
        )
    )

    min_dimension = min(
        h,
        w
    )

    if vertical_separation < min_dimension * 0.12:

        return {
            "suitable": False,
            "reason":
                "The samosa is not presented in a clear side/profile view."
        }

    # -----------------------------------------------------
    # 3. Base must have meaningful width.
    # -----------------------------------------------------

    base_width = distance(
        base_left,
        base_right
    )

    object_width = cv2.boundingRect(
        contour
    )[2]

    if object_width <= 0:

        return {
            "suitable": False,
            "reason":
                "Object width could not be measured."
        }

    if base_width < object_width * 0.45:

        return {
            "suitable": False,
            "reason":
                "A clear base edge could not be established."
        }

    # -----------------------------------------------------
    # 4. Apex sanity.
    #
    # Broad enough for imperfect real samosas.
    # -----------------------------------------------------

    if not 35 <= apex_angle <= 105:

        return {
            "suitable": False,
            "reason":
                "No clear samosa apex was found."
        }

    # -----------------------------------------------------
    # 5. Side lengths must be measurable.
    # -----------------------------------------------------

    left_side = measurements["left_side"]

    right_side = measurements["right_side"]

    if left_side < min_dimension * 0.08:

        return {
            "suitable": False,
            "reason":
                "Left side is too short for reliable analysis."
        }

    if right_side < min_dimension * 0.08:

        return {
            "suitable": False,
            "reason":
                "Right side is too short for reliable analysis."
        }

    return {

        "suitable": True,

        "reason":
            "Clear triangular side profile detected."
    }


# =========================================================
# OBJECT SHAPE EVIDENCE
# =========================================================

def object_shape_evidence(
    contour,
    triangle,
    image_shape
):

    h, w = image_shape[:2]

    image_area = h * w

    contour_area = cv2.contourArea(
        contour
    )

    if contour_area <= 0:
        return 0.0

    area_fraction = (
        contour_area /
        image_area
    )

    if area_fraction < 0.005:
        return 0.0

    if area_fraction > 0.85:
        return 0.0

    hull = cv2.convexHull(
        contour
    )

    hull_area = cv2.contourArea(
        hull
    )

    if hull_area <= 0:
        return 0.0

    solidity = (
        contour_area /
        hull_area
    )

    perimeter = cv2.arcLength(
        contour,
        True
    )

    if perimeter <= 0:
        return 0.0

    circularity = (
        4 *
        math.pi *
        contour_area
        /
        (
            perimeter *
            perimeter
        )
    )

    # -----------------------------------------------------
    # BOUNDING BOX
    # -----------------------------------------------------

    x, y, bw, bh = cv2.boundingRect(
        contour
    )

    if bh <= 0:
        return 0.0

    aspect_ratio = (
        bw /
        bh
    )

    # Samosa-like proportions.
    aspect_score = clamp(
        100 -
        abs(
            aspect_ratio -
            0.95
        ) * 80
    )

    # -----------------------------------------------------
    # EXTENT
    # -----------------------------------------------------

    bounding_area = (
        bw *
        bh
    )

    extent = (
        contour_area /
        bounding_area
        if bounding_area > 0
        else 0
    )

    extent_score = clamp(
        (
            extent -
            0.25
        )
        /
        0.55
        *
        100
    )

    # -----------------------------------------------------
    # SOLIDITY
    # -----------------------------------------------------

    solidity_score = clamp(
        (
            solidity -
            0.55
        )
        /
        0.45
        *
        100
    )

    # -----------------------------------------------------
    # CIRCULARITY
    # -----------------------------------------------------
    #
    # A samosa should not look like a circle.
    # But curved edges are allowed.
    # -----------------------------------------------------

    if circularity >= 0.80:

        circularity_score = 0.0

    elif circularity >= 0.68:

        circularity_score = 25.0

    elif circularity >= 0.55:

        circularity_score = 65.0

    else:

        circularity_score = 100.0

    # -----------------------------------------------------
    # TRIANGLE REPRESENTATION
    # -----------------------------------------------------

    triangle_score = 0.0

    if triangle is not None:

        triangle_area = polygon_area(
            triangle
        )

        if triangle_area > 0:

            fill = (
                contour_area /
                triangle_area
            )

            triangle_score = clamp(
                (
                    fill -
                    0.45
                )
                /
                0.55
                *
                100
            )

    # -----------------------------------------------------
    # SHAPE SCORE
    # -----------------------------------------------------

    score = (
        solidity_score * 0.25
        +
        aspect_score * 0.15
        +
        extent_score * 0.15
        +
        circularity_score * 0.25
        +
        triangle_score * 0.20
    )

    return clamp(score)


# =========================================================
# CANDIDATE EVALUATION
# =========================================================
#
# THIS IS THE IMPORTANT MODIFIED PART.
#
# Geometry dominates identity.
#
# Color = 15%
# Silhouette = 25%
# Triangle geometry = 60%
#
# Therefore:
#
# Brown + triangular pizza
# does NOT automatically win.
#
# Wobbly samosa
# can still be accepted because triangle identity
# uses broad tolerances.
# =========================================================

def evaluate_candidate(
    contour,
    triangle,
    image
):

    color = analyze_samosa_color(
        image,
        contour
    )

    shape_score = object_shape_evidence(
        contour,
        triangle,
        image.shape
    )

    triangle_identity = (
        samosa_triangle_identity_score(
            triangle
        )
        if triangle is not None
        else 0.0
    )

    # -----------------------------------------------------
    # GEOMETRY-BASED IDENTITY
    # -----------------------------------------------------

    if triangle is not None:

        identity_score = (
            color["score"] * 0.15
            +
            shape_score * 0.25
            +
            triangle_identity * 0.60
        )

    else:

        # No usable triangle.
        #
        # We still allow a legitimate badly-photographed
        # samosa to be recognized, but only when its
        # silhouette + color evidence is strong.
        #
        # This is mainly useful for sam5.
        identity_score = (
            color["score"] * 0.30
            +
            shape_score * 0.70
        )

    # -----------------------------------------------------
    # RED OBJECT PROTECTION
    # -----------------------------------------------------

    if color["red_ratio"] > 30:

        identity_score = min(
            identity_score,
            15.0
        )

    # -----------------------------------------------------
    # LOW WARM EVIDENCE
    # -----------------------------------------------------

    if color["warm_ratio"] < 15:

        identity_score *= 0.45

    # -----------------------------------------------------
    # VERY CIRCULAR OBJECTS
    #
    # This is a strong anti-food/fruit/object filter.
    # -----------------------------------------------------

    perimeter = cv2.arcLength(
        contour,
        True
    )

    contour_area = cv2.contourArea(
        contour
    )

    if perimeter > 0:

        circularity = (
            4 *
            math.pi *
            contour_area
            /
            (
                perimeter *
                perimeter
            )
        )

        if circularity > 0.82:

            identity_score *= 0.25

    return {

        "identity_score":
            round(
                clamp(identity_score),
                2
            ),

        "color_score":
            color["score"],

        "warm_ratio":
            color["warm_ratio"],

        "red_ratio":
            color["red_ratio"],

        "shape_score":
            round(
                shape_score,
                2
            ),

        "triangle_identity":
            round(
                triangle_identity,
                2
            ),

        "contour":
            contour,

        "triangle":
            triangle
    }


# =========================================================
# SAMOSA DETECTOR
# =========================================================

def detect_samosa(image):

    masks = create_masks(
        image
    )

    candidates = []

    image_area = (
        image.shape[0] *
        image.shape[1]
    )

    for mask_index, mask in enumerate(
        masks
    ):

        cleaned = cv2.morphologyEx(
            mask,
            cv2.MORPH_OPEN,
            np.ones(
                (5, 5),
                np.uint8
            ),
            iterations=1
        )

        cleaned = cv2.morphologyEx(
            cleaned,
            cv2.MORPH_CLOSE,
            np.ones(
                (5, 5),
                np.uint8
            ),
            iterations=2
        )

        contours, _ = cv2.findContours(
            cleaned,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        for contour in contours:

            area = cv2.contourArea(
                contour
            )

            if area < image_area * 0.005:
                continue

            if area > image_area * 0.85:
                continue

            triangle = get_best_triangle(
                contour
            )

            evidence = evaluate_candidate(
                contour,
                triangle,
                image
            )

            evidence["mask_index"] = (
                mask_index
            )

            candidates.append(
                evidence
            )

    # -----------------------------------------------------
    # NO CANDIDATES
    # -----------------------------------------------------

    if not candidates:
        return None

    # -----------------------------------------------------
    # STRONGEST CANDIDATE
    # -----------------------------------------------------

    candidates.sort(
        key=lambda x:
            x["identity_score"],
        reverse=True
    )

    best = candidates[0]

    # -----------------------------------------------------
    # IDENTITY CHECK
    # -----------------------------------------------------

    if (
        best["identity_score"]
        <
        SAMOSA_IDENTITY_THRESHOLD
    ):

        return {
            "status":
                "not_samosa",
            **best
        }

    # -----------------------------------------------------
    # PROFILE SUITABILITY
    # -----------------------------------------------------

    profile = validate_profile_suitability(
        best["contour"],
        best["triangle"],
        image.shape
    )

    best["profile_reason"] = (
        profile["reason"]
    )

    if not profile["suitable"]:

        return {
            "status":
                "profile_uncooperative",
            **best
        }

    return {

        "status":
            "confirmed",

        **best
    }


# =========================================================
# SSI GEOMETRY ANALYSIS
# =========================================================
#
# DO NOT CHANGE THIS LOGIC.
#
# SSI remains:
#
# Angle       35%
# Side        35%
# Symmetry    30%
#
# This is the actual "sanctity" score.
# =========================================================

def analyze_geometry(triangle):

    apex, base_left, base_right = order_triangle(
        triangle
    )

    # -----------------------------------------------------
    # ANGLES
    # -----------------------------------------------------

    apex_angle = angle_between(
        base_left,
        apex,
        base_right
    )

    left_angle = angle_between(
        apex,
        base_left,
        base_right
    )

    right_angle = angle_between(
        apex,
        base_right,
        base_left
    )

    # -----------------------------------------------------
    # SIDES
    # -----------------------------------------------------

    left_side = distance(
        apex,
        base_left
    )

    right_side = distance(
        apex,
        base_right
    )

    base_side = distance(
        base_left,
        base_right
    )

    # -----------------------------------------------------
    # ANGLE CONFORMITY
    # -----------------------------------------------------

    angle_errors = [

        abs(
            apex_angle -
            IDEAL_APEX
        ),

        abs(
            left_angle -
            IDEAL_BASE
        ),

        abs(
            right_angle -
            IDEAL_BASE
        ),
    ]

    mean_angle_error = (
        sum(
            angle_errors
        )
        /
        3
    )

    angle_score = clamp(
        100 *
        (
            1 -
            mean_angle_error /
            30
        )
    )

    # -----------------------------------------------------
    # SIDE CONFORMITY
    # -----------------------------------------------------

    ideal_side_ratio = (
        math.sin(
            math.radians(55)
        )
        /
        math.sin(
            math.radians(70)
        )
    )

    measured_left_ratio = (
        left_side /
        base_side
    )

    measured_right_ratio = (
        right_side /
        base_side
    )

    left_error = (
        abs(
            measured_left_ratio -
            ideal_side_ratio
        )
        /
        ideal_side_ratio
    )

    right_error = (
        abs(
            measured_right_ratio -
            ideal_side_ratio
        )
        /
        ideal_side_ratio
    )

    mean_side_error = (
        left_error +
        right_error
    ) / 2

    side_score = clamp(
        100 *
        (
            1 -
            mean_side_error
        )
    )

    # -----------------------------------------------------
    # SYMMETRY
    # -----------------------------------------------------

    longest_sloping_side = max(
        left_side,
        right_side
    )

    if longest_sloping_side == 0:

        symmetry_score = 0

    else:

        symmetry_score = clamp(
            100 *
            (
                1 -
                abs(
                    left_side -
                    right_side
                )
                /
                longest_sloping_side
            )
        )

    # -----------------------------------------------------
    # SSI
    # -----------------------------------------------------

    ssi = (
        angle_score *
        ANGLE_WEIGHT

        +

        side_score *
        SIDE_WEIGHT

        +

        symmetry_score *
        SYMMETRY_WEIGHT
    )

    return {

        "angles": {

            "apex":
                round(
                    apex_angle,
                    2
                ),

            "left_base":
                round(
                    left_angle,
                    2
                ),

            "right_base":
                round(
                    right_angle,
                    2
                ),
        },

        "sides": {

            "left":
                round(
                    left_side,
                    2
                ),

            "right":
                round(
                    right_side,
                    2
                ),

            "base":
                round(
                    base_side,
                    2
                ),
        },

        "angle_conformity":
            round(
                angle_score,
                2
            ),

        "side_conformity":
            round(
                side_score,
                2
            ),

        "symmetry_conformity":
            round(
                symmetry_score,
                2
            ),

        "ssi":
            round(
                clamp(ssi),
                2
            ),
    }


# =========================================================
# DYNAMIC VERDICT
# =========================================================

def generate_verdict(analysis):

    ssi = analysis["ssi"]

    metrics = {

        "angle":
            analysis[
                "angle_conformity"
            ],

        "side":
            analysis[
                "side_conformity"
            ],

        "symmetry":
            analysis[
                "symmetry_conformity"
            ],
    }

    weakest = min(
        metrics,
        key=metrics.get
    )

    weakest_score = (
        metrics[weakest]
    )

    if ssi >= 95:

        verdict = (
            "THE CHOSEN SAMOSA"
        )

        message = (
            "Geometry this disciplined is "
            "frankly suspicious. "
            "The samosa has achieved enlightenment."
        )

    elif ssi >= 90:

        verdict = (
            "LEGALLY A SAMOSA"
        )

        message = (
            "The geometry is extremely convincing. "
            "No reasonable court could deny "
            "its samosa status."
        )

    elif ssi >= 80:

        verdict = (
            "RESPECTABLE SAMOSA"
        )

        message = (
            "A respectable specimen. "
            "Not mathematically flawless, "
            "but clearly doing its job."
        )

    elif ssi >= 70:

        verdict = (
            "QUESTIONABLE GEOMETRY"
        )

        message = (
            "It is definitely trying to be a samosa. "
            "The geometry department has some concerns."
        )

    elif ssi >= 50:

        verdict = (
            "SAMOSA UNDER INVESTIGATION"
        )

        message = (
            "The evidence is inconclusive. "
            "Authorities have been notified."
        )

    else:

        verdict = (
            "GEOMETRIC FELONY"
        )

        message = (
            "The shape has committed several "
            "mathematical offences. "
            "Samosa status is currently suspended."
        )

    if weakest == "angle":

        weakness = (
            f"Angles are currently the weakest link "
            f"at {weakest_score:.1f}% conformity."
        )

    elif weakest == "side":

        weakness = (
            f"Side proportions are causing problems "
            f"at {weakest_score:.1f}% conformity."
        )

    else:

        weakness = (
            f"Symmetry is filing a complaint "
            f"at {weakest_score:.1f}% conformity."
        )

    return {

        "title":
            verdict,

        "message":
            message,

        "weakest_metric":
            weakest,

        "weakest_score":
            round(
                weakest_score,
                2
            ),

        "commentary":
            weakness,
    }


# =========================================================
# API ENDPOINT
# =========================================================

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...)
):

    contents = await file.read()

    if not contents:

        return {

            "success":
                False,

            "samosa_detected":
                False,

            "filename":
                file.filename,

            "message":
                "No image data was received."
        }

    image_array = np.frombuffer(
        contents,
        dtype=np.uint8
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:

        return {

            "success":
                False,

            "samosa_detected":
                False,

            "filename":
                file.filename,

            "message":
                "The uploaded file could not "
                "be read as an image."
        }

    original_height, original_width = (
        image.shape[:2]
    )

    image = resize_image(
        image
    )

    # =====================================================
    # DETECTION
    # =====================================================

    detected = detect_samosa(
        image
    )

    # =====================================================
    # NOT A SAMOSA
    # =====================================================

    if (
        detected is None
        or
        detected["status"]
        ==
        "not_samosa"
    ):

        evidence = (
            detected
            if detected is not None
            else {}
        )

        return {

            "success":
                True,

            "samosa_detected":
                False,

            "geometry_suitable":
                False,

            "detection_status":
                "not_samosa",

            "filename":
                file.filename,

            "width":
                original_width,

            "height":
                original_height,

            "detection_confidence":
                round(
                    evidence.get(
                        "identity_score",
                        0
                    ),
                    2
                ),

            "detection_evidence": {

                "color_score":
                    evidence.get(
                        "color_score",
                        0
                    ),

                "warm_ratio":
                    evidence.get(
                        "warm_ratio",
                        0
                    ),

                "red_ratio":
                    evidence.get(
                        "red_ratio",
                        0
                    ),

                "shape_score":
                    evidence.get(
                        "shape_score",
                        0
                    ),

                "triangle_identity":
                    evidence.get(
                        "triangle_identity",
                        0
                    ),
            },

            "message":
                (
                    "🚨 SAMOSA FRAUD DETECTED 🚨 "
                    "The evidence does not meet the "
                    "minimum requirements for samosa status. "
                    "The Samosa Sanctity Tribunal has rejected "
                    "the specimen."
                )
        }

    # =====================================================
    # SAMOSA BUT PROFILE IS BAD
    # =====================================================

    if (
        detected["status"]
        ==
        "profile_uncooperative"
    ):

        return {

            "success":
                True,

            "samosa_detected":
                True,

            "geometry_suitable":
                False,

            "detection_status":
                "profile_uncooperative",

            "filename":
                file.filename,

            "width":
                original_width,

            "height":
                original_height,

            "detection_confidence":
                round(
                    detected[
                        "identity_score"
                    ],
                    2
                ),

            "detection_evidence": {

                "color_score":
                    detected[
                        "color_score"
                    ],

                "warm_ratio":
                    detected[
                        "warm_ratio"
                    ],

                "red_ratio":
                    detected[
                        "red_ratio"
                    ],

                "shape_score":
                    detected[
                        "shape_score"
                    ],

                "triangle_identity":
                    detected[
                        "triangle_identity"
                    ],
            },

            "message":
                (
                    "🥟 SAMOSA CONFIRMED. "
                    "GEOMETRY REFUSES TO COOPERATE. "
                    "This specimen is legitimate, but it "
                    "has chosen an angle that prevents "
                    "proper geometric examination. "
                    "Please rotate the samosa."
                )
        }

    # =====================================================
    # CONFIRMED SAMOSA + USABLE PROFILE
    # =====================================================

    triangle = detected[
        "triangle"
    ]

    analysis = analyze_geometry(
        triangle
    )

    verdict = generate_verdict(
        analysis
    )

    return {

        "success":
            True,

        "samosa_detected":
            True,

        "geometry_suitable":
            True,

        "detection_status":
            "confirmed",

        "filename":
            file.filename,

        "width":
            original_width,

        "height":
            original_height,

        "detection_confidence":
            round(
                detected[
                    "identity_score"
                ],
                2
            ),

        "detection_evidence": {

            "color_score":
                detected[
                    "color_score"
                ],

            "warm_ratio":
                detected[
                    "warm_ratio"
                ],

            "red_ratio":
                detected[
                    "red_ratio"
                ],

            "shape_score":
                detected[
                    "shape_score"
                ],

            "triangle_identity":
                detected[
                    "triangle_identity"
                ],
        },

        "statistics": {

            "angle_conformity":
                analysis[
                    "angle_conformity"
                ],

            "side_conformity":
                analysis[
                    "side_conformity"
                ],

            "symmetry_conformity":
                analysis[
                    "symmetry_conformity"
                ],

            "ssi":
                analysis[
                    "ssi"
                ],
        },

        "geometry": {

            "angles":
                analysis[
                    "angles"
                ],

            "sides":
                analysis[
                    "sides"
                ],
        },

        "ssi":
            analysis[
                "ssi"
            ],

        "verdict":
            verdict,
    }


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {

        "project":
            "Samosa Sanctity Index",

        "status":
            "online",

        "message":
            "Please submit a samosa for "
            "geometric evaluation."
    }