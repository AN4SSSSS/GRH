function nomRouteParDefaut(role) {
  if (role === 'manager') return 'validations'
  if (role === 'rh-admin') return 'rh-admin-dashboard'
  return 'dashboard'
}

const LIBELLES_ROLES = {
  employe: 'Employé',
  manager: 'Manager',
  'rh-admin': 'RH-Admin',
}

function formaterRole(role) {
  return LIBELLES_ROLES[role] || role
}

export { nomRouteParDefaut, formaterRole }
