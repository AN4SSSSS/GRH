const typesConges = [
  { cle: 'paye', label: 'Congé payé', couleur: '#2563eb', couleurDark: '#60a5fa' },
  { cle: 'maladie', label: 'Congé maladie', couleur: '#ea580c', couleurDark: '#fb923c' },
  { cle: 'sans_solde', label: 'Congé sans solde', couleur: '#93528f', couleurDark: '#c08ebd' },
]

function couleurType(cle, sombre) {
  const info = typesConges.find((t) => t.cle === cle)
  if (!info) return '#6b7280'
  return sombre ? info.couleurDark : info.couleur
}

export { typesConges, couleurType }
