document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const nutzerInput = document.querySelector("#nutzer");
  const nameInput = document.querySelector("#name");
  const kostenInput = document.querySelector("#kosten");
  const intervallInput = document.querySelector("#intervall");
  const liste = document.querySelector("#liste");
  const summenbereich = document.querySelector("#summenbereich");
  const ansichtButton = document.querySelector("#ansicht-wechseln");

  // === Ansicht merken & wiederherstellen ===
  const gespeicherterModus = localStorage.getItem("ansicht") || "mobile";
  document.body.classList.add(gespeicherterModus + "-mode");
  ansichtButton.textContent =
    gespeicherterModus === "mobile"
      ? "Auf Desktopansicht wechseln"
      : "Auf Mobilansicht wechseln";

  ansichtButton.addEventListener("click", () => {
    const istJetztMobil = document.body.classList.contains("mobile-mode");

    document.body.classList.toggle("mobile-mode", !istJetztMobil);
    document.body.classList.toggle("desktop-mode", istJetztMobil);

    const neuerModus = istJetztMobil ? "desktop" : "mobile";
    localStorage.setItem("ansicht", neuerModus);

    ansichtButton.textContent =
      neuerModus === "mobile"
        ? "Auf Desktopansicht wechseln"
        : "Auf Mobilansicht wechseln";
  });

  // === Benutzer merken & vorauswählen ===
  const gespeicherterNutzer = localStorage.getItem("nutzer");
  if (gespeicherterNutzer) {
    nutzerInput.value = gespeicherterNutzer;
  }

  nutzerInput.addEventListener("change", () => {
    localStorage.setItem("nutzer", nutzerInput.value);
    ladeVertraege();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nutzer = nutzerInput.value.trim();
    const name = nameInput.value.trim();
    const kosten = parseFloat(kostenInput.value);
    const intervall = intervallInput.value;

    if (!nutzer || !name || isNaN(kosten)) {
      alert("Bitte gültige Vertragsdaten eingeben.");
      return;
    }

    const vertrag = {
      nutzer,
      name,
      kosten,
      intervall,
      erstelltAm: new Date().toISOString()
    };

    try {
      await db.collection("vertraege").add(vertrag);
      form.reset();
      nutzerInput.value = nutzer;
      ladeVertraege();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Speichern fehlgeschlagen.");
    }
  });

  async function ladeVertraege() {
    liste.innerHTML = "";
    summenbereich.innerHTML = "";
    const nutzer = nutzerInput.value.trim();
    if (!nutzer) return;

    let summeMonatlich = 0;
    let summeHalbjaehrlich = 0;
    let summeJaehrlich = 0;

    try {
      const snapshot = await db.collection("vertraege").get();
      snapshot.forEach((doc) => {
        const v = doc.data();
        if (v.nutzer !== nutzer) return;

        const li = document.createElement("li");
li.innerHTML = `
  <div style="
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    font-size: 36px;
    width: 100%;
  ">
    <span>
      ${v.name} – ${v.kosten.toFixed(2)} € (${v.intervall})
    </span>
    <button data-id="${doc.id}" class="loeschen" style="
      font-size: 24px;
      background: none;
      border: none;
      color: #b00;
      cursor: pointer;
      margin-left: auto;
    ">🗑️ Löschen</button>
  </div>
`;

liste.appendChild(li);

        if (v.intervall === "monatlich") summeMonatlich += v.kosten;
        if (v.intervall === "halbjährlich") summeHalbjaehrlich += v.kosten;
        if (v.intervall === "jährlich") summeJaehrlich += v.kosten;
      });

      document.querySelectorAll(".loeschen").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = button.getAttribute("data-id");
          try {
            await db.collection("vertraege").doc(id).delete();
            ladeVertraege();
          } catch (error) {
            console.error("Fehler beim Löschen:", error);
          }
        });
      });

      summenbereich.innerHTML = `
        <br><br>
        <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr><th colspan="2">Gesamtkosten</th></tr>
          </thead>
          <tbody>
            <tr><td>monatlich</td><td>${summeMonatlich.toFixed(2)} €</td></tr>
            <tr><td>halbjährlich</td><td>${summeHalbjaehrlich.toFixed(2)} €</td></tr>
            <tr><td>jährlich</td><td>${summeJaehrlich.toFixed(2)} €</td></tr>
          </tbody>
        </table>
      `;
    } catch (error) {
      console.error("Fehler beim Laden der Verträge:", error);
    }
  }

  ladeVertraege(); // initialer Aufruf
});