<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# SAMOSA SANCTITY INDEX 🎯

## Basic Details

### Team Name: Samosa Tribunal 

### Team Members: Malavika Sudhi

* Team Lead: Malavika Sudhi - Govt Model Engineering College

### Project Description

The Samosa Sanctity Index (SSI) is a computer-vision-powered system that determines how geometrically “samosa” a samosa actually is. It detects the specimen, analyzes its triangular geometry, measures angles, side proportions and symmetry, and produces a final **Samosa Sanctity Index** score with a suitably serious verdict.

### The Problem (that doesn't exist)

There is currently no standardized scientific method for determining whether a samosa is geometrically worthy of being called a samosa.

Some samosas have suspicious angles. Some have uneven sides. Some have absolutely no respect for symmetry.

The Samosa Sanctity Index addresses this critical problem that absolutely nobody asked us to solve.

### The Solution (that nobody asked for)

We built a computer vision system that examines an uploaded image of a samosa and evaluates its geometric sanctity.

The system:

* Detects whether the uploaded specimen is likely to be a samosa.
* Checks whether its profile is suitable for geometric examination.
* Measures its three angles.
* Measures its side lengths and compares their proportions with an ideal samosa triangle.
* Evaluates left-right symmetry.
* Combines the measurements into a weighted **Samosa Sanctity Index (SSI)**.
* Delivers a dramatic verdict based on the specimen's final score.

Because apparently, samosas needed a tribunal.

## Technical Details

### Technologies/Components Used

For Software:

* **Languages:** Python, JavaScript, HTML, CSS
* **Frameworks:** FastAPI
* **Libraries:** OpenCV, NumPy
* **Tools:** VS Code, Git, GitHub, Live Server
* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Python FastAPI
* **Computer Vision:** OpenCV

For Hardware:

* Not applicable — this is a software-only project.

### Implementation

For Software:

The application consists of a frontend interface and a Python-based computer vision backend.

The frontend allows the user to upload a samosa image and displays the examination process and final results. The backend receives the image through a FastAPI endpoint and uses computer vision techniques to identify the specimen and analyze its geometry.

The geometric analysis evaluates:

* **Angle conformity:** How closely the three measured angles match the chosen ideal samosa angles of approximately 70°, 55° and 55°.
* **Side conformity:** How closely the measured side proportions match the proportions expected from the ideal triangle.
* **Symmetry:** How closely the two sloping sides match each other in length.
* **Final SSI:** A weighted combination of the three conformity scores.

The final SSI uses:

* Angle conformity — **35%**
* Side conformity — **35%**
* Symmetry — **30%**

### Installation

Clone the repository:

```bash
git clone https://github.com/MALU-CYBER/Samosa_Sanctity_Index.git
cd Samosa_Sanctity_Index
```

Install the required Python dependencies:

```bash
pip install fastapi uvicorn opencv-python numpy python-multipart
```

### Run

Start the FastAPI backend:

```bash
cd backend
python -m uvicorn main:app --reload
```

The API will run locally at:

```text
http://127.0.0.1:8000
```

Open the frontend:

```text
frontend/index.html
```

using VS Code Live Server.

## Project Documentation

### Screenshots

![Screenshot1]()

*The landing page introduces the Samosa Sanctity Index and its highly important mission.*

![Screenshot2](Add screenshot of the specimen upload page here)

*The specimen examination page allows the user to upload a samosa for analysis.*

![Screenshot3](Add screenshot of the results page here)

*The results page displays the specimen's geometric measurements, conformity scores, SSI and final verdict.*

### Diagrams

![Workflow](USER UPLOADS IMAGE
        ↓
FRONTEND SENDS IMAGE
        ↓
FASTAPI BACKEND
        ↓
IMAGE PREPROCESSING
        ↓
SAMOSA DETECTION
        ↓
    ┌───────────────┐
    │ Is it a       │
    │ samosa?       │
    └───────┬───────┘
            │
       NO   │   YES
       ↓    │    ↓
   REJECT    CHECK GEOMETRY
                  ↓
          Geometry suitable?
             /          \
           NO            YES
           ↓              ↓
   Profile Uncooperative  MEASURE
                          ↓
                 ANGLES + SIDES
                          ↓
                     SYMMETRY
                          ↓
                 CONFORMITY SCORES
                          ↓
                     SSI SCORE
                          ↓
                  VERDICT GENERATION
                          ↓
                   RESULTS PAGE
)

*The workflow shows the process from image upload and computer vision detection through geometric analysis, SSI calculation and final verdict generation.*

For Hardware:

### Schematic & Circuit

Not applicable — this is a software-only project.

### Build Photos

Not applicable — no physical hardware is used.

## Project Demo

### Video

[https://drive.google.com/drive/folders/1QJlKsetIsTMxdJFNhvV1lmbruKnNaAuy]

*The demo demonstrates the complete Samosa Sanctity Index workflow, from uploading a specimen to receiving its final geometric verdict.*

### Additional Demos

[Add any additional demo materials or links here]

## Team Contributions

* **Malavika Sudhi:** Project concept, frontend development, UI/UX design, computer vision integration, SSI calculation logic, testing, documentation and deployment.

---

Made with ❤️ at TinkerHub Useless Projects

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000\&link=https%3A%2F%2Fwww.tinkerhub.org%2F)

![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)
