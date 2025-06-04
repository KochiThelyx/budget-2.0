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
  const speichernButton = form.querySelector("button[type='submit']");

  let editModus = false;
  let editID = null;
  let aktuelleSortierung = { spalte: "name", richtung: "asc" };

  // Immer mobile-mode aktiv, keine Umschaltlogik
  document.body.classList.add("mobile-mode");

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

    if (!nutzer || !name || isNaN(kosten)) {
      alert("Bitte gültige Vertragsdaten eingeben.");
      return;
    }

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

    const vertrag = {
      nutzer,
      name,
      kosten,
      intervall,
      startdatum,
      laufzeit,
      ablaufdatum,
      erstelltAm: new Date().toISOString(),
    };

    try {
      if (editModus && editID) {
        await db.collection("vertraege").doc(editID).set(vertrag);
      } else {
        await db.collection("vertraege").add(vertrag);
      }
      form.reset();
      speichernButton.textContent = "✚ Hinzufügen";
      editModus = false;
      editID = null;
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

      const vertraege = [];

      snapshot.forEach((doc) => {
        const v = doc.data();
        if (v.nutzer !== nutzer) return;
        vertraege.push({ id: doc.id, ...v });
      });

      vertraege.sort((a, b) => {
        const feld = aktuelleSortierung.spalte;
        let valA = a[feld];
        let valB = b[feld];
        if (feld === "kosten") {
          valA = parseFloat(valA);
          valB = parseFloat(valB);
        } else {
          valA = (valA || "").toString().toLowerCase();
          valB = (valB || "").toString().toLowerCase();
        }
        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        return aktuelleSortierung.richtung === "asc" ? cmp : -cmp;
      });

      const table = document.createElement("table");
      table.className = "vertraege";
      const sortPfeil = (feld) =>
        aktuelleSortierung.spalte === feld
          ? aktuelleSortierung.richtung === "asc"
            ? " ▲"
            : " ▼"
          : "";
      table.innerHTML = `
        <thead><tr>
          <th data-sort="name">Name${sortPfeil("name")}</th>
          <th data-sort="kosten">Kosten${sortPfeil("kosten")}</th>
          <th data-sort="intervall">Intervall${sortPfeil("intervall")}</th>
          <th data-sort="ablaufdatum">Ende${sortPfeil("ablaufdatum")}</th>
          <th></th>
        </tr></thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector("tbody");
      table.querySelectorAll("th[data-sort]").forEach((th) => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
          const feld = th.dataset.sort;
          if (aktuelleSortierung.spalte === feld) {
            aktuelleSortierung.richtung =
              aktuelleSortierung.richtung === "asc" ? "desc" : "asc";
          } else {
            aktuelleSortierung = { spalte: feld, richtung: "asc" };
          }
          ladeVertraege();
        });
      });

      vertraege.forEach((v) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${v.name}</td>
          <td>${v.kosten.toFixed(2)} €</td>
          <td>${v.intervall}</td>
          <td>${v.ablaufdatum || "-"}</td>
          <td style="padding: 0;">
            <div style="display: flex; gap: 0.4em; align-items: center;">
              <button class="btn-bearbeiten" data-id="${v.id}" style="font-size:18px; background:none; border:none; padding:0; margin:0; line-height:1; cursor:pointer;">✏️</button>
              <button class="btn-loeschen" data-id="${v.id}" style="font-size:18px; background:none; border:none; padding:0; margin:0; line-height:1; cursor:pointer;">🗑️</button>
            </div>
          </td>
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

        row.querySelector(".btn-loeschen").addEventListener("click", async (e) => {
          e.stopPropagation();
          const id = e.target.getAttribute("data-id");
          await db.collection("vertraege").doc(id).delete();
          ladeVertraege();
        });

        row.querySelector(".btn-bearbeiten").addEventListener("click", (e) => {
          e.stopPropagation();
          editModus = true;
          editID = v.id;
          nameInput.value = v.name;
          kostenInput.value = v.kosten;
          intervallInput.value = v.intervall;
          startdatumInput.value = v.startdatum;
          laufzeitInput.value = v.laufzeit;
          speichernButton.textContent = "💾 Speichern";
        });
      });

      liste.appendChild(table);

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
      console.error("Fehler beim Laden:", error);
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

    return `${format(start)} – ${format(ende)}`;
  }

  ladeVertraege();
});
