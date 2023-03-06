const REPORT_DATA = {
    individual: {
        name: "John",
        lastName: "Doe",
        birthDate: "20000711140653",
        age: "30",
        clinicalInfo: {
            socialSecurityNumber: "",
            cipa: ""
        }
    },
    clinicalAnalysis: {
        applicant: {
            name: "",
            center: "",
            unit: "",
            address: "",
            phone: "",
            email: ""
        },
        analysts: [],
        laboratory: {
            name: "Responsable Lab Genética Molecular:",
            responsible: "Dra. Arlinda Forrestor",
            facultive: ["Dra. Banky Osgarby, Dra. Nari Pollett", "Dr.Lynn Basnett", "Dr. Roger Sawers"],
            center: "",
            unit: "",
            address: "",
            phone: "",
            email: "mdumpletonb@genome.com",
            validation: "Dra. Arlinda Forrestor",
            date: "20220904140653"
        },
        numPetition: "",
        numHistoricalClinical: "",
    },
    report: {
        title: "",
        overview: "",
        methodology: "",
        result: "",
        discussion: "",
        notes: "",
        disclaimer: "",
        annex: [""]
    },
    sample: {
        type: "Blood",
        extractionDate: "20220904140653",
        reason: "Polycystic Kidney Disease"
    },
    request: {
        requestNumber: "60cc3667",
        requestDate: "20220904140653",
        requestingDoctor: {
            name: "Louisette Penni",
            specialization: "Nephrology",
            hospitalName: "Hosp. Gen. Sample",
            address: "61 Washington Parkway",
            city: "Vidovci",
            code: "34000",
        }
    },
    study: {
        reason: "Clinical diagnosis of autosomal dominant polycystic kidney disease (PQRAD)",
        project: "NGS_44129836-eee7-4769-9c88-9d2ac4bd596b",
        currentAnalysis: "Panel Genetics Test v.2 (Annex 1)",
        genePriority: ["COL4A1", "COL4A3", "COL4A4", "COL4A5", "MYH9"],
    },
    methodology: {
        description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
printer took a galley of type and scrambled it to make a type specimen book. It has survived not
only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.`,
    },
    results: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
printer took a galley of type and scrambled it to make a type specimen book.`,
    interpretations: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
printer took a galley of type and scrambled it to make a type specimen book.`,
    variantAnnotation: {},
    notes: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
printer took a galley of type and scrambled it to make a type specimen book.`,
    qcInfo: {
    },
    limitations: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
    printer took a galley of type and scrambled it to make a type specimen book.`,
    disclaimer: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
printer took a galley of type and scrambled it to make a type specimen book. It has survived not
only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
    appendix: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
printer took a galley of type and scrambled it to make a type specimen book. It has survived not
only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
printer took a galley of type and scrambled it to make a type specimen book. It has survived not
only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
};
