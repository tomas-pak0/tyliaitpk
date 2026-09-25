// ==============================
// DARBO VALANDŲ APLIKACIJA
// ==============================


// ------------------------------
// ELEMENTAI
// ------------------------------

const projectSelect =
    document.getElementById("project");

const startButton =
    document.getElementById("startButton");

const statusElement =
    document.getElementById("status");

const workTimeElement =
    document.getElementById("workTime");

const finishCard =
    document.getElementById("finishCard");

const finishedTime =
    document.getElementById("finishedTime");

const lunchButton =
    document.getElementById("lunchButton");

const lunchOptions =
    document.getElementById("lunchOptions");

const lunchValue =
    document.getElementById("lunchValue");

const workTypeSelect =
    document.getElementById("workType");

const customWorkTypeContainer =
    document.getElementById(
        "customWorkTypeContainer"
    );

const customWorkType =
    document.getElementById("customWorkType");

const saveEntryButton =
    document.getElementById(
        "saveEntryButton"
    );


// ------------------------------
// DARBO DUOMENYS
// ------------------------------

let registeredStartTime = null;
let registeredEndTime = null;

let isWorking = false;


// ------------------------------
// NUMATYTIEJI PIETŪS
// ------------------------------

const DEFAULT_LUNCH = 45;


// ------------------------------
// LAIKRODIS
// ------------------------------

function updateClock() {

    const now = new Date();

    const hours =
        String(now.getHours())
            .padStart(2, "0");

    const minutes =
        String(now.getMinutes())
            .padStart(2, "0");

    document.getElementById("clock")
        .textContent =
        `${hours}:${minutes}`;
}


updateClock();

setInterval(
    updateClock,
    1000
);


// ------------------------------
// APVALINIMAS IKI ARTIMIAUSIŲ
// 15 MINUČIŲ
// ------------------------------

function roundToNearest15Minutes(date) {

    const result =
        new Date(date);

    const minutes =
        result.getMinutes();

    const roundedMinutes =
        Math.round(
            minutes / 15
        ) * 15;


    result.setMinutes(
        roundedMinutes
    );

    result.setSeconds(0);

    result.setMilliseconds(0);


    return result;
}


// ------------------------------
// LAIKO FORMATAS
// ------------------------------

function formatTime(date) {

    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");


    return `${hours}:${minutes}`;
}


// ------------------------------
// PIETŲ MYGTUKO TEKSTAS
// ------------------------------

function updateLunchButton() {

    const minutes =
        Number(
            lunchValue.value
        );


    if (minutes === 0) {

        lunchButton.textContent =
            "🍽️ BE PIETŲ";

        return;
    }


    lunchButton.textContent =
        `🍽️ PIETŪS: ${minutes} MIN.`;
}


// ------------------------------
// PIETŲ NUSTATYMAS IŠ NAUJO
// ------------------------------

function resetLunch() {

    lunchValue.value =
        DEFAULT_LUNCH;


    updateLunchButton();


    lunchOptions.style.display =
        "none";
}


// ------------------------------
// PIETŲ MYGTUKAS
// ------------------------------

lunchButton.addEventListener(
    "click",
    function () {

        if (
            lunchOptions.style.display ===
            "none"
        ) {

            lunchOptions.style.display =
                "flex";

        } else {

            lunchOptions.style.display =
                "none";
        }

    }
);


// ------------------------------
// PIETŲ PASIRINKIMAI
// ------------------------------

const lunchButtons =
    document.querySelectorAll(
        ".lunch-option"
    );


lunchButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const minutes =
                    button.dataset.minutes;


                lunchValue.value =
                    minutes;


                updateLunchButton();


                lunchOptions.style.display =
                    "none";
            }
        );

    }
);


// ------------------------------
// PRADĖTI / BAIGTI DARBĄ
// ------------------------------

startButton.addEventListener(
    "click",
    function () {


        // ==========================
        // PRADĖTI DARBĄ
        // ==========================

        if (!isWorking) {

            const project =
                projectSelect.value;


            if (!project) {

                alert(
                    "Pirmiausia pasirinkite projektą."
                );

                return;
            }


            // --------------------------
            // REGISTRUOJAMA PRADŽIA
            // --------------------------

            registeredStartTime =
                roundToNearest15Minutes(
                    new Date()
                );


            isWorking = true;


            statusElement.textContent =
                "🟢 Darbas vykdomas";


            workTimeElement.textContent =
                `Pradžia: ${
                    formatTime(
                        registeredStartTime
                    )
                }`;


            startButton.textContent =
                "■ BAIGTI DARBĄ";


            startButton.style.background =
                "#b91c1c";


            projectSelect.disabled =
                true;


            // --------------------------
            // PIETŪS
            // --------------------------

            resetLunch();


            lunchButton.style.display =
                "block";


            return;
        }


        // ==========================
        // BAIGTI DARBĄ
        // ==========================

        registeredEndTime =
            roundToNearest15Minutes(
                new Date()
            );


        isWorking = false;


        statusElement.textContent =
            "🔵 Darbas baigtas";


        workTimeElement.textContent =
            `${formatTime(
                registeredStartTime
            )} – ${formatTime(
                registeredEndTime
            )}`;


        finishedTime.textContent =
            `${formatTime(
                registeredStartTime
            )} – ${formatTime(
                registeredEndTime
            )}`;


        finishCard.style.display =
            "block";


        startButton.style.display =
            "none";


        lunchButton.style.display =
            "none";


        lunchOptions.style.display =
            "none";

    }
);


// ------------------------------
// „KITA“ DARBŲ PAVADINIMAS
// ------------------------------

workTypeSelect.addEventListener(
    "change",
    function () {

        if (
            workTypeSelect.value ===
            "Kita"
        ) {

            customWorkTypeContainer
                .style.display =
                "block";

        } else {

            customWorkTypeContainer
                .style.display =
                "none";

            customWorkType.value =
                "";
        }

    }
);


// ------------------------------
// PATVIRTINTI DARBO ĮRAŠĄ
// ------------------------------

saveEntryButton.addEventListener(
    "click",
    function () {

        const project =
            projectSelect.value;


        const lunch =
            Number(
                lunchValue.value
            );


        let workType =
            workTypeSelect.value;


        // --------------------------
        // DARBŲ PAVADINIMAS
        // --------------------------

        if (!workType) {

            alert(
                "Pasirinkite darbų pavadinimą."
            );

            return;
        }


        // --------------------------
        // „KITA“
        // --------------------------

        if (
            workType === "Kita"
        ) {

            workType =
                customWorkType.value
                    .trim();


            if (!workType) {

                alert(
                    "Įrašykite darbų pavadinimą."
                );

                return;
            }
        }


        // --------------------------
        // PIETŲ TEKSTAS
        // --------------------------

        let lunchText =
            "Be pietų";


        if (lunch > 0) {

            lunchText =
                `Pietūs: ${lunch} min.`;
        }


        // --------------------------
        // GALUTINIS DARBO ĮRAŠAS
        // --------------------------

        const workEntry = {

            project:
                project,

            date:
                new Date()
                    .toISOString()
                    .split("T")[0],

            start:
                formatTime(
                    registeredStartTime
                ),

            end:
                formatTime(
                    registeredEndTime
                ),

            lunch:
                lunchText,

            workType:
                workType
        };


        console.log(
            "GALUTINIS DARBO ĮRAŠAS:",
            workEntry
        );


        alert(
            `Darbo įrašas paruoštas.\n\n` +
            `Projektas: ${project}\n` +
            `Laikas: ${workEntry.start} – ${workEntry.end}\n` +
            `${workEntry.lunch}\n` +
            `Darbai: ${workEntry.workType}`
        );


        // --------------------------
        // EKRANO ATSTATYMAS
        // --------------------------

        finishCard.style.display =
            "none";


        projectSelect.disabled =
            false;


        projectSelect.value =
            "";


        startButton.style.display =
            "block";


        startButton.textContent =
            "▶ PRADĖTI DARBĄ";


        startButton.style.background =
            "#111827";


        lunchButton.style.display =
            "none";


        lunchOptions.style.display =
            "none";


        resetLunch();


        statusElement.textContent =
            "Darbas nepradėtas";


        workTimeElement.textContent =
            "0:00";


        workTypeSelect.value =
            "";


        customWorkType.value =
            "";


        customWorkTypeContainer
            .style.display =
            "none";


        registeredStartTime =
            null;


        registeredEndTime =
            null;

    }
);


// ------------------------------
// PRADINĖ BŪSENA
// ------------------------------

resetLunch();
