document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const nutzerInput = document.querySelector("#nutzer");
  const nameInput = document.querySelector("#name");
  const kostenInput = document.querySelector("#kosten");
  const intervallInput = document.querySelector("#intervall");
  const startdatumInput = document.querySelector("#startdatum");
  const laufzeitInput = document.querySelector("#laufzeit");
  const liste = document.querySelector("#liste");
  const summenbereich = document.querySelector("#summenbereich");
  const ansichtButton = document.querySelector("#ansicht-wechseln");

  const gespeicherterModus = localStorage.getItem("ansicht") || "mobile";
  document.body.classList.add(gespeicherterModus + "-mode");
  ansichtButton.textContent =
    gespeicherterModus === "mobile"
      ? "🖥️ Zur Desktopansicht wechseln"
      : "📱 Zur Mobilansicht wechseln";

  ansichtButton.addEventListener("click", () => {
    const istJetztMobil = document.body.classList.contains("mobile-mode");

    document.body.classList.toggle("mobile-mode", !istJetztMobil);
    document.body.classList.toggle("desktop-mode", istJetztMobil);

    const neuerModus = istJetztMobil ? "desktop" : "mobile";
    localStorage.setItem("ansicht", neuerModus);

    ansichtButton.textContent =
      neuerModus === "mobile"
        ? "🖥️ Zur Desktopansicht wechseln"
        : "📱 Zur Mobilansicht wechseln";
  });

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
    const startdatum = startdatumInput.value.trim();
    const laufzeit = laufzeitInput.value;

    // Ablaufdatum berechnen
    let ablaufdatum = "-";
    const datumParts = startdatum.split(".");
    if (datumParts.length === 3 && (laufzeit === "12" || laufzeit === "24")) {
      const tag = parseInt(datumParts[0]);
      const monat = parseInt(datumParts[1]) - 1;
      const jahr = parseInt("20" + datumParts[2]);
      const start = new Date(jahr, monat, tag);
      start.setMonth(start.getMonth() + parseInt(laufzeit));

      const tagStr = String(start.getDate()).padStart(2, "0");
      const monatStr = String(start.getMonth() + 1).padStart(2, "0");
      const jahrStr = String(start.getFullYear()).slice(-2);
      ablaufdatum = `${tagStr}.${monatStr}.${jahrStr}`;
    }

    if (!nutzer || !name || isNaN(kosten)) {
      alert("Bitte gültige Vertragsdaten eingeben.");
      return;
    }

    const vertrag = {
      nutzer,
      name,
      kosten,
      intervall,
      startdatum,
      laufzeit,
      ablaufdatum,
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
      if (snapshot.empty) return;

      const table = document.createElement("table");
      table.className = "vertraege";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Name</th>
            <th>Kosten</th>
            <th>Intervall</th>
            <th>Ende</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

      const tbody = table.querySelector("tbody");

      const rows = [];

      snapshot.forEach((doc) => {
        const v = doc.data();
        if (v.nutzer !== nutzer) return;

        const row = document.createElement("tr");
        row.classList.add("datenzeile");
        row.innerHTML = `
          <td>${v.name}</td>
          <td>${v.kosten.toFixed(2)} €</td>
          <td>${v.intervall}</td>
          <td>${v.ablaufdatum || "-"}</td>
          <td><button data-id="${doc.id}" class="loeschen">🗑️</button></td>
        `;
        tbody.appendChild(row);

        const detail = document.createElement("tr");
        detail.innerHTML = `
          <td colspan="5" style="display:none; font-size: 0.9em; color: #444;">
            Start: ${v.startdatum || "-"}<br>
            Laufzeit: ${v.laufzeit || "-"}<br>
            ${
              v.startdatum && v.laufzeit !== "monatlich"
                ? `Aktuelle Periode: ${berechnePeriode(v.startdatum, v.laufzeit)}`
                : ""
            }
          </td>
        `;
        tbody.appendChild(detail);

        row.addEventListener("click", () => {
          detail.firstChild.style.display =
            detail.firstChild.style.display === "none" ? "block" : "none";
        });

        if (v.intervall === "monatlich") summeMonatlich += v.kosten;
        if (v.intervall === "halbjährlich") summeHalbjaehrlich += v.kosten;
        if (v.intervall === "jährlich") summeJaehrlich += v.kosten;

        rows.push(row); // Speichern für Zebra-Stil
      });

      liste.appendChild(table);

      // Zebra-Stil manuell setzen
      rows.forEach((zeile, index) => {
        zeile.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8f8f8";
      });

      document.querySelectorAll(".loeschen").forEach((button) => {
        button.addEventListener("click", async (e) => {
          e.stopPropagation();
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

  function berechnePeriode(startdatum, laufzeit) {
    const parts = startdatum.split(".");
    if (parts.length !== 3) return "-";
    const tag = parseInt(parts[0]);
    const monat = parseInt(parts[1]) - 1;
    const jahr = parseInt("20" + parts[2]);
    const start = new Date(jahr, monat, tag);
    const now = new Date();

    while (start < now) {
      start.setMonth(start.getMonth() + parseInt(laufzeit));
    }

    const ende = new Date(start);
    ende.setMonth(ende.getMonth() + parseInt(laufzeit));

    const format = (d) =>
      `${String(d.getDate()).padStart(2, "0")}.${String(
        d.getMonth() + 1
      ).padStart(2, "0")}.${String(d.getFullYear()).slice(-2)}`;

    const von = format(start);
    const bis = format(ende);
    return `${von} – ${bis}`;
  }

  ladeVertraege();
});
