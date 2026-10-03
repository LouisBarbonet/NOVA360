// Consigne et contexte du chat, sans dépendance Node : partagés par le serveur local (Vite) et le relais Cloudflare Worker.

export type ChatTurn = { role: "user" | "assistant"; content: string };
type Seg = { ref: string; text: string };
type Src = { id: string; path: string; segments: Seg[]; attachments: { filename: string; duplicateOf?: string }[] };
type UpdateDoc = { version: string; label: string };

export const RULES = `Tu es la mémoire opérationnelle du projet NOVA (projet fictif). Tu réponds en français, de façon concise et nuancée.
Règles impératives :
- N'utilise QUE les faits du corpus et de la mémoire fournis. Si une information manque, dis-le explicitement (« non documenté »). N'invente ni décision, ni échéance, ni approbation.
- Cite chaque fait avec le marqueur [[ID:repère]] où ID est l'identifiant de source (ex. E05, M04, SEC-210, Plan_Projet_NOVA_v3_12sept) et repère est L<n> ou L<a>-L<b> (lignes), p.<n> (page PDF), Feuille!<cellule> (Excel, ex. Plan projet!E7) ou « capture » (image). Exemple : [[M04:L17-L23]]. Un seul repère par marqueur : pour deux preuves, écris [[SEC-210:L25]] [[M06:L7]] (jamais [[A:x], [B:y]] ni [[ACC-303:L6,L14]]).
- Distingue toujours proposition / décision / livraison / validation. Un correctif « livré » ou « déployé » n'est pas « accepté ». Une proposition n'est pas une décision.
- Une date de fichier récente ne garantit pas l'exactitude : tranche par l'autorité (comité, responsable désigné, ticket) et la date des faits.
- Les pièces jointes identiques à un fichier séparé et Courriel_archive_17sept (copie d'E12) ne sont pas des confirmations indépendantes. INV-778 concerne un autre projet. Les notes personnelles anonymes n'ont aucune autorité.
- Montants en CAD hors taxes ; distingue autorisé, facturé et payé.
- Quand tu proposes des actions, indique si c'est un engagement documenté (avec preuve) ou une recommandation.
- Tu ne réponds qu'aux questions sur le projet NOVA ; pour tout autre sujet, réponds brièvement que ce n'est pas couvert par la mémoire du projet.`;

export function corpusText(corpus: { sources: Src[] }): string {
  return corpus.sources
    .filter((s) => s.id !== "README" && s.id !== "MANIFEST")
    .map((s) => {
      const pj = s.attachments.length ? ` [pièces jointes : ${s.attachments.map((a) => `${a.filename}${a.duplicateOf ? ` = ${a.duplicateOf}` : ""}`).join(", ")}]` : "";
      return `##### ${s.id} (${s.path})${pj}\n${s.segments.filter((g) => g.text.trim()).map((g) => `${g.ref}\t${g.text}`).join("\n")}`;
    })
    .join("\n\n");
}

/** Mémoire jusqu'à `version` incluse ; les mises à jour remplacent les éléments du baseline de même id. */
export function memoryText(baselineText: string, updates: UpdateDoc[], version: string): string {
  let out = `=== MÉMOIRE BASELINE (état au 30 sept. 2026 09:00) ===\n${baselineText}`;
  if (version === "baseline") return out;
  for (const u of updates) {
    out += `\n\n=== MISE À JOUR ${u.version} (${u.label}) — elle remplace les éléments du baseline de même id ===\n${JSON.stringify(u)}`;
    if (u.version === version) break;
  }
  return out;
}

export const knowledge = (memory: string, corpus: string) => `${memory}\n\n=== CORPUS COMPLET ===\n${corpus}`;

/** Conversation envoyée au modèle : 10 derniers tours + consigne de date dans le dernier message. */
export function chatTurns(messages: ChatTurn[], version: string): ChatTurn[] {
  const asOf =
    version === "baseline"
      ? "Réponds selon l'état au 30 septembre 2026 à 09:00 (baseline), sans tenir compte d'événements postérieurs."
      : `Réponds selon l'état après la mise à jour ${version} ; si c'est pertinent, signale ce qui a changé par rapport au baseline.`;
  return [...messages.slice(-10), { role: "user", content: `(${asOf})` }];
}

/** Fusionne les tours consécutifs du même rôle (les API exigent l'alternance). */
export function alternate(turns: ChatTurn[]): ChatTurn[] {
  return turns.reduce<ChatTurn[]>((acc, t) => {
    const last = acc[acc.length - 1];
    if (last && last.role === t.role) last.content = `${last.content}\n${t.content}`;
    else acc.push({ ...t });
    return acc;
  }, []);
}

/** Normalise une question, ligne par ligne : casse, espaces et ponctuation finale n'empêchent pas la correspondance. */
export const normalize = (s: string) =>
  s
    .normalize("NFC")
    .toLowerCase()
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").replace(/[\s?!.…]+$/u, "").trim())
    .filter(Boolean)
    .join("\n");
