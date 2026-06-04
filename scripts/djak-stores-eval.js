async (args) => {
  const { centers, ajaxUrl } = args;
  const byId = new Map();

  const parseItem = (it) => {
    const html = it.popup_html || "";
    const urlM = html.match(/href=\\"([^\\"]+lokacije[^\\"]+)\\"/);
    const cityM = html.match(/Grad:\s*([^<]+)/);
    const zipM = html.match(/Zip:\s*([^<]+)/);
    const addrM = html.match(/Adresa:\s*([^<]+)/);
    byId.set(it.id, {
      id: it.id,
      name: it.name,
      lat: it.lat,
      lng: it.lng,
      storeUrl: urlM ? urlM[1].replace(/\\\//g, "/") : "",
      city: cityM ? cityM[1].trim() : "",
      zip: zipM ? zipM[1].trim() : "",
      address: addrM ? addrM[1].trim() : "",
    });
  };

  for (const script of document.scripts) {
    const t = script.textContent || "";
    const idx = t.indexOf("jsonLocations");
    if (idx < 0) continue;
    const start = t.indexOf("{", idx);
    let depth = 0;
    let end = start;
    for (let j = start; j < t.length; j++) {
      if (t[j] === "{") depth++;
      else if (t[j] === "}") {
        depth--;
        if (depth === 0) {
          end = j + 1;
          break;
        }
      }
    }
    try {
      const parsed = JSON.parse(t.slice(start, end));
      for (const it of parsed.items || []) parseItem(it);
    } catch {
      /* ignore */
    }
  }

  for (const [lat, lng] of centers) {
    try {
      const res = await fetch(ajaxUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json, text/javascript, */*; q=0.01",
        },
        body: `lat=${lat}&lng=${lng}&radius=500000&product=0&category=0`,
      });
      const text = await res.text();
      if (!text.trim().startsWith("{")) continue;
      const data = JSON.parse(text);
      for (const it of data.items || []) parseItem(it);
    } catch {
      /* ignore */
    }
  }

  if (byId.size === 0) {
    document.querySelectorAll('a[href*="/lokacije/"]').forEach((a, i) => {
      const href = a.href;
      if (!href || href.endsWith("/lokacije/") || href.endsWith("/lokacije")) return;
      const name = (a.textContent || "").trim();
      if (!name) return;
      const path = href.split("/lokacije/")[1]?.replace(/\/$/, "") || String(i);
      byId.set(path, {
        id: i,
        name,
        lat: null,
        lng: null,
        storeUrl: href,
        city: "",
        zip: "",
        address: "",
      });
    });
  }

  return [...byId.values()];
}
