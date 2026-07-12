const libellesStatut = {
  en_attente: 'En attente',
  approuvee: 'Approuvée',
  refusee: 'Refusée',
  annulee: 'Annulée',
}

function formaterStatut(statut) {
  return libellesStatut[statut] || statut
}

export { formaterStatut }
