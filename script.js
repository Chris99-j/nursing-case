const patients = [];
const cases = [];

let patientIdCounter = 1;
let caseIdCounter = 1;

// Get DOM elements
const patientProfilesDiv = document.getElementById("patientProfiles");
const casePresentationsDiv = document.getElementById("casePresentations");
const caseForm = document.getElementById("caseForm");


// Pagination variables and filtered arrays
const patientsPerPage = 10;
let patientCurrentPage = 1;
let filteredPatients = [];

const casesPerPage = 10;
let caseCurrentPage = 1;
let filteredCases = [];

// Helper to find patient by ID
function getPatientById(id) {
  return patients.find(p => p.id === id);
}

// Add or find patient by unique fields, return patientId
function findOrAddPatient(name, age, sex, medicalDiagnosis, doctorDiagnosis, history) {
  let patient = patients.find(
    (p) => p.name === name && p.age === age && p.sex === sex
  );
  if (!patient) {
    patient = {
      id: patientIdCounter++,
      name,
      age,
      sex,
      medicalDiagnosis,
      doctorDiagnosis,
      history,
    };
    patients.push(patient);
  } else {
    // Optionally update existing patient fields if needed
    patient.medicalDiagnosis = medicalDiagnosis;
    patient.doctorDiagnosis = doctorDiagnosis;
    patient.history = history;
  }
  return patient.id;
}


// Add new case, linking to patientId
function addCase(patientId, medicalDiagnosis, doctorDiagnosis, history, summary, status, nurse, fileName) {
  const newCase = {
    id: caseIdCounter++,
    patientId,
    medicalDiagnosis,
    doctorDiagnosis,
    history,
    summary,
    status,
    nurse,
    attachedFileName: fileName || null,
  };
  cases.push(newCase);
}

// Render Patients with pagination and search
function renderPatientList() {
  const start = (patientCurrentPage - 1) * patientsPerPage;
  const end = start + patientsPerPage;
  const list = filteredPatients.slice(start, end);

  let html = `<table class="list-table">
    <thead><tr><th>Name</th><th>Age</th><th>Sex</th></tr></thead><tbody>`;

  if (list.length === 0) {
    html += `<tr><td colspan="3">No patients found</td></tr>`;
  } else {
    list.forEach((p) => {
      html += `<tr>
        <td>${p.name}</td>
        <td>${p.age}</td>
        <td>${p.sex}</td>
         <td>
          <button onclick="deletePatient(${p.id})">Delete</button>
        </td>
      </tr>`;
    });
  }
  html += "</tbody></table>";

  document.getElementById("patientList").innerHTML = html;
  renderPatientPagination();
}

function renderPatientPagination() {
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  let html = "";

  for (let i = 1; i <= totalPages; i++) {
    html += `<button ${
      i === patientCurrentPage ? "disabled" : ""
    } onclick="patientGoToPage(${i})">${i}</button>`;
  }

  document.getElementById("patientPagination").innerHTML = html;
}

function patientGoToPage(page) {
  patientCurrentPage = page;
  renderPatientList();
}

// Filter patients on search input
document.getElementById("patientSearch").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(query)
  );
  patientCurrentPage = 1;
  renderPatientList();
});

// Render Cases with pagination and search
function renderCaseList() {
  const start = (caseCurrentPage - 1) * casesPerPage;
  const end = start + casesPerPage;
  const list = filteredCases.slice(start, end);

  let html = `<table class="list-table">
    <thead>
      <tr>
        <th>Patient</th>
        <th>Medical Diagnosis</th>
        <th>Doctor Diagnosis</th>
        <th>History</th>
        <th>Summary</th>
        <th>Status</th>
        <th>Assigned Nurse</th>
        <th>File</th>
      </tr>
    </thead>
    <tbody>`;

  if (list.length === 0) {
    html += `<tr><td colspan="8">No cases found</td></tr>`;
  } else {
    list.forEach((c) => {
      const patient = patients.find((p) => p.id === c.patientId);
      html += `<tr>
        <td>${patient ? patient.name : "Unknown"}</td>
        <td>${c.medicalDiagnosis || "-"}</td>
        <td>${c.doctorDiagnosis || "-"}</td>
        <td>${c.history || "-"}</td>
        <td>${c.summary}</td>
        <td>${c.status}</td>
        <td>${c.nurse}</td>
        <td>${c.attachedFileName || "-"}</td>
      </tr>`;
    });
  }
  html += "</tbody></table>";

  document.getElementById("caseList").innerHTML = html;
  renderCasePagination();
}


function renderCasePagination() {
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);
  let html = "";

  for (let i = 1; i <= totalPages; i++) {
    html += `<button ${
      i === caseCurrentPage ? "disabled" : ""
    } onclick="caseGoToPage(${i})">${i}</button>`;
  }

  document.getElementById("casePagination").innerHTML = html;
}

function caseGoToPage(page) {
  caseCurrentPage = page;
  renderCaseList();
}

// Filter cases on search input
document.getElementById("caseSearch").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  filteredCases = cases.filter((c) => {
    const patient = patients.find((p) => p.id === c.patientId);
    return (
      (patient && patient.name.toLowerCase().includes(query)) ||
      c.summary.toLowerCase().includes(query) ||
      c.status.toLowerCase().includes(query) ||
      c.nurse.toLowerCase().includes(query)
    );
  });
  caseCurrentPage = 1;
  renderCaseList();
});

// Form submit handler
caseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const patientName = document.getElementById("patientName").value.trim();
  const patientAge = document.getElementById("patientAge").value.trim();
  const patientSex = document.getElementById("patientSex").value.trim();

  const medicalDiagnosis = document.getElementById("medicalDiagnosis").value.trim();
  const doctorDiagnosis = document.getElementById("doctorDiagnosis").value.trim();
  const history = document.getElementById("history").value.trim();

  const caseSummary = document.getElementById("caseSummary").value.trim();
  const caseStatus = document.getElementById("caseStatus").value.trim();
  const assignedNurse = document.getElementById("assignedNurse").value.trim();
  const fileName = document.getElementById("fileUpload").files[0]?.name || null;

  if (!patientName || !patientAge || !patientSex) {
    alert("Please fill patient name, age and sex");
    return;
  }

  if (caseForm.dataset.editPatientId) {
    // Edit existing patient
    const patientId = parseInt(caseForm.dataset.editPatientId, 10);
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      alert("Patient not found for editing");
      return;
    }
    patient.name = patientName;
    patient.age = patientAge;
    patient.sex = patientSex;
    patient.medicalDiagnosis = medicalDiagnosis;
    patient.doctorDiagnosis = doctorDiagnosis;
    patient.history = history;

    // Optional: Update cases linked to patient if you want

    delete caseForm.dataset.editPatientId;
  } else {
    // Add or find patient id
    const patientId = findOrAddPatient(patientName, patientAge, patientSex, medicalDiagnosis, doctorDiagnosis, history);

    // Add case linked to patientId
    addCase(patientId, medicalDiagnosis, doctorDiagnosis, history, caseSummary, caseStatus, assignedNurse, fileName);
  }

  caseForm.reset();
  filteredPatients = [...patients];
  filteredCases = [...cases];
  renderPatientList();
  renderCaseList();
  render();
});


// --- PRINT ---
document.getElementById("printBtn").addEventListener("click", () => {
  let printWindow = window.open("", "", "width=900,height=700");
  let html = `
  <h2>Patient Profiles</h2>
  <table border="1" cellspacing="0" cellpadding="5">
    <thead>
      <tr>
        <th>Name</th>
        <th>Age</th>
        <th>Sex</th>
        <th>Medical Diagnosis</th>
        <th>Doctor Diagnosis</th>
        <th>History</th>
      </tr>
    </thead>
    <tbody>
      ${patients.map(p => `
        <tr>
          <td>${p.name}</td>
          <td>${p.age}</td>
          <td>${p.sex}</td>
          <td>${p.medicalDiagnosis || ""}</td>
          <td>${p.doctorDiagnosis || ""}</td>
          <td>${p.history || ""}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Case Presentations</h2>
  <table border="1" cellspacing="0" cellpadding="5">
    <thead>
      <tr>
        <th>Patient Name</th>
        <th>Summary</th>
        <th>Status</th>
        <th>Assigned Nurse</th>
        <th>File</th>
      </tr>
    </thead>
    <tbody>
      ${cases.map(c => {
        const patient = getPatientById(c.patientId);
        return `
          <tr>
            <td>${patient ? patient.name : "Unknown"}</td>
            <td>${c.summary || ""}</td>
            <td>${c.status || ""}</td>
            <td>${c.nurse || ""}</td>
            <td>${c.attachedFileName || "No file attached"}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>
`;



  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
});

// --- EXPORT CSV ---
document.getElementById("exportCSVBtn").addEventListener("click", () => {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent +=
  "Patient Name,Age,Sex,Medical Diagnosis,Doctor Diagnosis,History,Case Summary,Status,Assigned Nurse,File\n";

cases.forEach((c) => {
  const patient = getPatientById(c.patientId);
  const row = [
    patient ? patient.name : "Unknown",
    patient ? patient.age : "",
    patient ? patient.sex : "",
    patient ? (patient.medicalDiagnosis || "") : "",
    patient ? (patient.doctorDiagnosis || "") : "",
    patient ? (patient.history || "") : "",
    `"${(c.summary || "").replace(/"/g, '""')}"`,
    c.status || "",
    c.nurse || "",
    c.attachedFileName || "",
  ].join(",");
  csvContent += row + "\n";
});


  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "profiles_and_cases.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// --- EXPORT PDF ---
document.getElementById("exportPDFBtn").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Patient Profiles", 14, 20);

  // Unique patients from patients array (already available)
  const uniquePatients = patients;

  // Patient Profiles table with extra columns
doc.autoTable({
  startY: 25,
  head: [["Name", "Age", "Sex", "Medical Diagnosis", "Doctor Diagnosis", "History"]],
  body: patients.map(p => [
    p.name,
    p.age,
    p.sex,
    p.medicalDiagnosis || "",
    p.doctorDiagnosis || "",
    p.history || ""
  ]),
});

// Cases table with existing columns
let finalY = doc.lastAutoTable.finalY + 10;
doc.setFontSize(16);
doc.text("Case Presentations", 14, finalY);

doc.autoTable({
  startY: finalY + 5,
  head: [["Patient Name", "Summary", "Status", "Assigned Nurse", "File"]],
  body: cases.map(c => {
    const patient = getPatientById(c.patientId);
    return [
      patient ? patient.name : "Unknown",
      c.summary || "",
      c.status || "",
      c.nurse || "",
      c.attachedFileName || "No file attached"
    ];
  }),
  styles: { fontSize: 10 },
  headStyles: { fillColor: [22, 160, 133] },
});


  doc.save("profiles_and_cases.pdf");
});

// --- Render cards ---
function render() {
  let patientHtml = "";
  patients.forEach((p) => {
    patientHtml += `
      <div class="card patient-card">
        <h3>${p.name}</h3>
        <p><strong>Age:</strong> ${p.age}</p>
        <p><strong>Sex:</strong> ${p.sex}</p>
        <p><strong>Medical Diagnosis:</strong> ${p.medicalDiagnosis || ""}</p>
        <p><strong>Doctor Diagnosis:</strong> ${p.doctorDiagnosis || ""}</p>
        <p><strong>History:</strong> ${p.history || ""}</p>
      </div>
    `;
  });
  patientProfilesDiv.innerHTML = patientHtml;

  // Render case cards
  let caseHtml = "";
  cases.forEach((c) => {
    const patient = getPatientById(c.patientId);
    caseHtml += `
      <div class="card case-card">
        <h4>${patient ? patient.name : "Unknown"}</h4>
        <p><strong>Summary:</strong> ${c.summary || ""}</p>
        <p><strong>Status:</strong> ${c.status || ""}</p>
        <p><strong>Assigned Nurse:</strong> ${c.nurse || ""}</p>
        <p><strong>File:</strong> ${c.attachedFileName || "No file attached"}</p>
      </div>
    `;
  });
  casePresentationsDiv.innerHTML = caseHtml;
}


list.forEach((p) => {
  html += `<tr>
    <td>${p.name}</td>
    <td>${p.age}</td>
    <td>${p.sex}</td>
    <td>
      <button onclick="editPatient(${p.id})">Edit</button>
      <button onclick="deletePatient(${p.id})">Delete</button>
    </td>
  </tr>`;
});

function editPatient(id) {
  const patient = patients.find(p => p.id === id);
  if (!patient) return alert("Patient not found");

  // Populate your form fields or create a popup
  document.getElementById("patientName").value = patient.name;
  document.getElementById("patientAge").value = patient.age;
  document.getElementById("patientSex").value = patient.sex;

  // Store id for update on form submit
  caseForm.dataset.editPatientId = id;
}

function deletePatient(id) {
  if (!confirm("Are you sure you want to delete this patient?")) return;

  // Remove patient
  const index = patients.findIndex(p => p.id === id);
  if (index > -1) {
    patients.splice(index, 1);

    // Remove all cases linked to this patient
    for(let i = cases.length - 1; i >= 0; i--) {
      if(cases[i].patientId === id) cases.splice(i, 1);
    }

    filteredPatients = [...patients];
    filteredCases = [...cases];
    renderPatientList();
    renderCaseList();
    render();

    // Reset form if editing this patient
    if(caseForm.dataset.editPatientId == id) {
      caseForm.reset();
      delete caseForm.dataset.editPatientId;
    }
  }
}

caseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const patientName = document.getElementById("patientName").value.trim();
  const patientAge = document.getElementById("patientAge").value.trim();
  const patientSex = document.getElementById("patientSex").value.trim();
  const caseSummary = document.getElementById("caseSummary").value.trim();
  const caseStatus = document.getElementById("caseStatus").value.trim();
  const assignedNurse = document.getElementById("assignedNurse").value.trim();
  const fileName = document.getElementById("fileUpload").files[0]?.name || null;

  if (!patientName || !patientAge || !patientSex) {
    alert("Please fill patient name, age and sex");
    return;
  }

  if (caseForm.dataset.editPatientId) {
    // Edit existing patient
    const patientId = parseInt(caseForm.dataset.editPatientId, 10);
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      alert("Patient not found for editing");
      return;
    }
    patient.name = patientName;
    patient.age = patientAge;
    patient.sex = patientSex;

    // Optional: You could allow editing existing case too, but for now we keep cases intact
    delete caseForm.dataset.editPatientId;
  } else {
    // Add or find patient id
    const patientId = findOrAddPatient(patientName, patientAge, patientSex);

    // Add case linked to patientId
    addCase(patientId, caseSummary, caseStatus, assignedNurse, fileName);
  }

  caseForm.reset();
  filteredPatients = [...patients];
  filteredCases = [...cases];
  renderPatientList();
  renderCaseList();
  render();
});


cases.forEach((c) => {
  const patient = getPatientById(c.patientId);

  // If file is image, show preview, else just filename
  let fileDisplay = c.attachedFileName || "No file attached";
  if (c.attachedFileName) {
    const ext = c.attachedFileName.split('.').pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
      fileDisplay = `<img src="uploads/${c.attachedFileName}" alt="Attachment" style="max-width:100px; max-height:100px;" />`;
    } else {
      fileDisplay = c.attachedFileName;
    }
  }

  caseHtml += `
    <div class="card case-card">
      <h4>${patient ? patient.name : "Unknown"}</h4>
      <p><strong>Summary:</strong> ${c.summary || ""}</p>
      <p><strong>Status:</strong> ${c.status || ""}</p>
      <p><strong>Assigned Nurse:</strong> ${c.nurse || ""}</p>
      <p><strong>File:</strong> ${fileDisplay}</p>
    </div>
  `;
});

function filterCases() {
  const searchQuery = document.getElementById("caseSearch").value.toLowerCase();
  const statusFilter = document.getElementById("caseStatusFilter").value;

  filteredCases = cases.filter((c) => {
    const patient = getPatientById(c.patientId);
    const matchesSearch =
      (patient && patient.name.toLowerCase().includes(searchQuery)) ||
      c.summary.toLowerCase().includes(searchQuery) ||
      c.status.toLowerCase().includes(searchQuery) ||
      c.nurse.toLowerCase().includes(searchQuery);

    const matchesStatus = statusFilter ? c.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  caseCurrentPage = 1;
  renderCaseList();
}

// Attach events:
document.getElementById("caseSearch").addEventListener("input", filterCases);
document.getElementById("caseStatusFilter").addEventListener("change", filterCases);

// Initial filter call on page load:
filterCases();


